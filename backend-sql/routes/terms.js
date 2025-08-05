const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery, executeQuerySingle, executeQueryRun } = require('../config/database-sqlite');
const { authenticateToken, requireProfileComplete } = require('../middleware/auth');

const router = express.Router();

// Get current active terms and conditions
router.get('/current', async (req, res) => {
  try {
    const termsQuery = `
      SELECT id, version, title, content, effective_date, created_at
      FROM terms_versions 
      WHERE is_active = TRUE 
      ORDER BY effective_date DESC 
      LIMIT 1
    `;
    const termsResult = await executeQuery(termsQuery);

    if (!termsResult.success || termsResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active terms and conditions found'
      });
    }

    res.json({
      success: true,
      data: termsResult.data[0]
    });

  } catch (error) {
    console.error('Get terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all terms versions (for admin)
router.get('/versions', async (req, res) => {
  try {
    const termsQuery = `
      SELECT id, version, title, content, is_active, effective_date, created_at
      FROM terms_versions 
      ORDER BY effective_date DESC
    `;
    const termsResult = await executeQuery(termsQuery);

    if (!termsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch terms versions'
      });
    }

    res.json({
      success: true,
      data: termsResult.data
    });

  } catch (error) {
    console.error('Get terms versions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check if user has accepted current terms
router.get('/accepted', authenticateToken, async (req, res) => {
  try {
    const acceptedQuery = `
      SELECT ta.id, ta.terms_version, ta.accepted_at, tv.title, tv.content
      FROM terms_acceptance ta
      INNER JOIN terms_versions tv ON ta.terms_version = tv.version
      WHERE ta.student_id = ? AND tv.is_active = TRUE
      ORDER BY ta.accepted_at DESC
      LIMIT 1
    `;
    const acceptedResult = await executeQuery(acceptedQuery, [req.user.id]);

    if (acceptedResult.success && acceptedResult.data.length > 0) {
      res.json({
        success: true,
        data: {
          accepted: true,
          acceptance: acceptedResult.data[0]
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          accepted: false,
          acceptance: null
        }
      });
    }

  } catch (error) {
    console.error('Check terms acceptance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Accept terms and conditions
router.post('/accept', authenticateToken, requireProfileComplete, [
  body('termsVersion').notEmpty().withMessage('Terms version is required')
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

    const { termsVersion } = req.body;

    // Verify terms version exists and is active
    const termsQuery = `
      SELECT id, version, title 
      FROM terms_versions 
      WHERE version = ? AND is_active = TRUE
    `;
    const termsResult = await executeQuery(termsQuery, [termsVersion]);

    if (!termsResult.success || termsResult.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive terms version'
      });
    }

    // Check if already accepted
    const existingQuery = `
      SELECT id FROM terms_acceptance 
      WHERE student_id = ? AND terms_version = ?
    `;
    const existingResult = await executeQuery(existingQuery, [req.user.id, termsVersion]);

    if (existingResult.success && existingResult.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Terms already accepted'
      });
    }

    // Record acceptance
    const acceptQuery = `
      INSERT INTO terms_acceptance (student_id, terms_version, ip_address, user_agent) 
      VALUES (?, ?, ?, ?)
    `;
    const acceptResult = await executeQuery(acceptQuery, [
      req.user.id, 
      termsVersion, 
      req.ip, 
      req.get('User-Agent')
    ]);

    if (!acceptResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to record terms acceptance'
      });
    }

    // Update student status
    const updateStatusQuery = `
      INSERT INTO student_status (student_id, terms_accepted) 
      VALUES (?, TRUE)
      ON DUPLICATE KEY UPDATE terms_accepted = TRUE
    `;
    await executeQuery(updateStatusQuery, [req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Terms and conditions accepted successfully',
      data: {
        termsVersion,
        acceptedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Accept terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get terms acceptance history for a student
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const historyQuery = `
      SELECT ta.id, ta.terms_version, ta.accepted_at, ta.ip_address,
             tv.title, tv.content, tv.effective_date
      FROM terms_acceptance ta
      INNER JOIN terms_versions tv ON ta.terms_version = tv.version
      WHERE ta.student_id = ?
      ORDER BY ta.accepted_at DESC
    `;
    const historyResult = await executeQuery(historyQuery, [req.user.id]);

    if (!historyResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch acceptance history'
      });
    }

    res.json({
      success: true,
      data: historyResult.data
    });

  } catch (error) {
    console.error('Get terms history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Create new terms version
router.post('/create', [
  body('version').notEmpty().withMessage('Version is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('effectiveDate').isDate().withMessage('Valid effective date is required')
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

    const { version, title, content, effectiveDate } = req.body;

    // Check if version already exists
    const existingQuery = 'SELECT id FROM terms_versions WHERE version = ?';
    const existingResult = await executeQuery(existingQuery, [version]);

    if (existingResult.success && existingResult.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Terms version already exists'
      });
    }

    // Insert new terms version
    const insertQuery = `
      INSERT INTO terms_versions (version, title, content, effective_date) 
      VALUES (?, ?, ?, ?)
    `;
    const insertResult = await executeQuery(insertQuery, [
      version, title, content, effectiveDate
    ]);

    if (!insertResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create terms version'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Terms version created successfully',
      data: {
        id: insertResult.data.insertId,
        version,
        title,
        effectiveDate
      }
    });

  } catch (error) {
    console.error('Create terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Update terms version
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('effectiveDate').optional().isDate().withMessage('Valid effective date is required')
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

    const { id } = req.params;
    const { title, content, isActive, effectiveDate } = req.body;

    // Check if terms version exists
    const existingQuery = 'SELECT id FROM terms_versions WHERE id = ?';
    const existingResult = await executeQuery(existingQuery, [id]);

    if (!existingResult.success || existingResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Terms version not found'
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(isActive);
    }
    if (effectiveDate !== undefined) {
      updateFields.push('effective_date = ?');
      updateValues.push(effectiveDate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);
    const updateQuery = `UPDATE terms_versions SET ${updateFields.join(', ')} WHERE id = ?`;
    const updateResult = await executeQuery(updateQuery, updateValues);

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update terms version'
      });
    }

    res.json({
      success: true,
      message: 'Terms version updated successfully'
    });

  } catch (error) {
    console.error('Update terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 