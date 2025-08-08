const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { executeQuery, executeQuerySingle, executeQueryRun } = require('../config/database-sqlite');
const { authenticateToken, requireProfileComplete, requireTermsAccepted } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
router.post('/create-order', authenticateToken, requireProfileComplete, requireTermsAccepted, [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('currency').optional().isIn(['INR', 'USD']).withMessage('Currency must be INR or USD'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, currency = 'INR', description = 'Test Access Fee' } = req.body;

    // Check if user already has a completed payment
    const existingPaymentQuery = `
      SELECT id FROM payments 
      WHERE student_id = ? AND status = 'completed'
      ORDER BY created_at DESC LIMIT 1
    `;
    const existingPaymentResult = await executeQuery(existingPaymentQuery, [req.user.id]);

    if (existingPaymentResult.success && existingPaymentResult.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Payment already completed for this user'
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}_${req.user.id}`,
      notes: {
        student_id: req.user.id.toString(),
        student_email: req.user.email,
        description: description
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save order to database
    const insertOrderQuery = `
      INSERT INTO payments (student_id, razorpay_order_id, amount, currency, description, status) 
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const insertOrderResult = await executeQuery(insertOrderQuery, [
      req.user.id,
      order.id,
      amount,
      currency,
      description
    ]);

    if (!insertOrderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// Verify payment
router.post('/verify', authenticateToken, [
  body('razorpayOrderId').notEmpty().withMessage('Order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Signature is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Update payment in database
    const updatePaymentQuery = `
      UPDATE payments 
      SET razorpay_payment_id = ?, 
          status = 'completed',
          payment_method = ?,
          receipt_url = ?
      WHERE razorpay_order_id = ? AND student_id = ?
    `;
    const updatePaymentResult = await executeQuery(updatePaymentQuery, [
      razorpayPaymentId,
      payment.method,
      payment.receipt,
      razorpayOrderId,
      req.user.id
    ]);

    if (!updatePaymentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update payment status'
      });
    }

    // Update student status to allow test access
    const updateStatusQuery = `
      INSERT INTO student_status (student_id, payment_completed, can_access_tests) 
      VALUES (?, TRUE, TRUE)
      ON DUPLICATE KEY UPDATE payment_completed = TRUE, can_access_tests = TRUE
    `;
    await executeQuery(updateStatusQuery, [req.user.id]);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        amount: payment.amount / 100,
        currency: payment.currency,
        method: payment.method,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// Get payment history for user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const historyQuery = `
      SELECT id, razorpay_order_id, razorpay_payment_id, amount, currency, 
             status, payment_method, description, receipt_url, created_at, updated_at
      FROM payments 
      WHERE student_id = ?
      ORDER BY created_at DESC
    `;
    const historyResult = await executeQuery(historyQuery, [req.user.id]);

    if (!historyResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history'
      });
    }

    res.json({
      success: true,
      data: historyResult.data
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get payment status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const statusQuery = `
      SELECT ss.payment_completed, ss.can_access_tests,
             p.id as payment_id, p.status as payment_status, p.amount, p.currency,
             p.created_at as payment_date
      FROM student_status ss
      LEFT JOIN payments p ON ss.student_id = p.student_id AND p.status = 'completed'
      WHERE ss.student_id = ?
    `;
    const statusResult = await executeQuery(statusQuery, [req.user.id]);

    if (!statusResult.success || statusResult.data.length === 0) {
      return res.json({
        success: true,
        data: {
          payment_completed: false,
          can_access_tests: false,
          payment_details: null
        }
      });
    }

    const status = statusResult.data[0];
    res.json({
      success: true,
      data: {
        payment_completed: status.payment_completed,
        can_access_tests: status.can_access_tests,
        payment_details: status.payment_id ? {
          id: status.payment_id,
          status: status.payment_status,
          amount: status.amount,
          currency: status.currency,
          date: status.payment_date
        } : null
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get pending payment (if any)
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const pendingQuery = `
      SELECT id, razorpay_order_id, amount, currency, description, created_at
      FROM payments 
      WHERE student_id = ? AND status = 'pending'
      ORDER BY created_at DESC LIMIT 1
    `;
    const pendingResult = await executeQuery(pendingQuery, [req.user.id]);

    if (!pendingResult.success || pendingResult.data.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: pendingResult.data[0]
    });

  } catch (error) {
    console.error('Get pending payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel pending payment
router.post('/cancel/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order belongs to user and is pending
    const orderQuery = `
      SELECT id FROM payments 
      WHERE razorpay_order_id = ? AND student_id = ? AND status = 'pending'
    `;
    const orderResult = await executeQuery(orderQuery, [orderId, req.user.id]);

    if (!orderResult.success || orderResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pending payment not found'
      });
    }

    // Update status to failed
    const updateQuery = `
      UPDATE payments 
      SET status = 'failed' 
      WHERE razorpay_order_id = ? AND student_id = ?
    `;
    const updateResult = await executeQuery(updateQuery, [orderId, req.user.id]);

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel payment'
      });
    }

    res.json({
      success: true,
      message: 'Payment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Get all payments
router.get('/admin/all', async (req, res) => {
  try {
    const allPaymentsQuery = `
      SELECT p.id, p.razorpay_order_id, p.razorpay_payment_id, p.amount, p.currency,
             p.status, p.payment_method, p.description, p.created_at, p.updated_at,
             s.name as student_name, s.email as student_email, s.college
      FROM payments p
      INNER JOIN students s ON p.student_id = s.id
      ORDER BY p.created_at DESC
    `;
    const allPaymentsResult = await executeQuery(allPaymentsQuery);

    if (!allPaymentsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payments'
      });
    }

    res.json({
      success: true,
      data: allPaymentsResult.data
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Get payment statistics
router.get('/admin/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
        AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_amount
      FROM payments
    `;
    const statsResult = await executeQuery(statsQuery);

    if (!statsResult.success || statsResult.data.length === 0) {
      return res.json({
        success: true,
        data: {
          total_payments: 0,
          completed_payments: 0,
          pending_payments: 0,
          failed_payments: 0,
          total_amount: 0,
          avg_amount: 0
        }
      });
    }

    res.json({
      success: true,
      data: statsResult.data[0]
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 