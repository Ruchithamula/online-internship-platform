import { RAZORPAY_CONFIG, getGSTBreakdown } from '../config/razorpay';
import toast from 'react-hot-toast';

// Create payment order
export const createPaymentOrder = async (user) => {
  try {
    const response = await fetch(`${RAZORPAY_CONFIG.API_BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        amount: getGSTBreakdown().total,
        currency: 'INR'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }

    const result = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to create payment order');
    }
    return result.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (paymentResponse) => {
  try {
    const response = await fetch(`${RAZORPAY_CONFIG.API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpaySignature: paymentResponse.razorpay_signature
      })
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Direct payment function
export const initiateDirectPayment = async (user, onSuccess, onError) => {
  if (!user) {
    toast.error('Please login to proceed with payment');
    return false;
  }

  try {
    // Create payment order
    const order = await createPaymentOrder(user);
    const { testFee } = getGSTBreakdown();

    const options = {
      key: order.keyId || RAZORPAY_CONFIG.KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'OnlyInternship.in',
      description: `Internship Assessment Test Fee - ₹${testFee}`,
      image: '/logo.png',
      order_id: order.orderId || order.id,
      handler: async function (response) {
        try {
          const verified = await verifyPayment(response);
          
          if (verified) {
            // Store payment info in localStorage for reference
            localStorage.setItem('paymentInfo', JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: getGSTBreakdown().total,
              timestamp: new Date().toISOString()
            }));
            
            toast.success('Payment successful! You can now start your test.');
            if (onSuccess) onSuccess(response);
          } else {
            toast.error('Payment verification failed. Please contact support.');
            if (onError) onError('verification_failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed. Please contact support.');
          if (onError) onError('verification_error');
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      notes: {
        address: 'Yuga Yatra Retail (OPC) Private Limited',
        userId: user?.id,
        testType: 'internship_assessment'
      },
      theme: {
        color: '#2C3E50'
      },
      modal: {
        ondismiss: function() {
          toast.info('Payment cancelled');
          if (onError) onError('cancelled');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    return true;

  } catch (error) {
    console.error('Payment error:', error);
    toast.error('Payment initialization failed. Please try again.');
    if (onError) onError('initialization_failed');
    return false;
  }
};

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}; 