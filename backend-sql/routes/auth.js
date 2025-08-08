const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { executeQuery, executeQuerySingle, executeQueryRun } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send OTP via email
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Login OTP - Student Authentication System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Login OTP</h2>
        <p>Your login OTP is:</p>
        <h1 style="color: #667eea; font-size: 48px; text-align: center; letter-spacing: 8px; margin: 20px 0;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Send verification email
async function sendVerificationEmail(email, token, name) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Student Authentication System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Welcome to Student Authentication System!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with us. Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Verification email sending error:', error);
    return false;
  }
}

// Send welcome email
async function sendWelcomeEmail(email, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Student Authentication System!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Welcome ${name}!</h2>
        <p>Your account has been successfully verified and activated.</p>
        <p>You can now:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Accept terms and conditions</li>
          <li>Make payment to access tests</li>
          <li>Start your learning journey</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return false;
  }
}

// Student Registration with Email Verification
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('college').optional().trim().isLength({ min: 2 }).withMessage('College name must be at least 2 characters')
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

    const { email, password, name, phone, college } = req.body;

    // Check if user already exists
    const existingUserQuery = 'SELECT id, email_verified FROM students WHERE email = ?';
    const existingUserResult = await executeQuery(existingUserQuery, [email]);

    if (existingUserResult.success && existingUserResult.data.length > 0) {
      const existingUser = existingUserResult.data[0];
      
      if (existingUser.email_verified) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists and is verified'
        });
      } else {
        return res.status(409).json({
          success: false,
          message: 'User with this email exists but is not verified. Please check your email for verification link.'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert new user
    const insertUserQuery = `
      INSERT INTO students (email, password, name, phone, college, profile_complete, email_verified, verification_token, verification_token_expiry) 
      VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, ?)
    `;
    const insertUserResult = await executeQuery(insertUserQuery, [
      email, hashedPassword, name, phone, college, 
      !!(name && phone && college), verificationToken, tokenExpiry
    ]);

    if (!insertUserResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    const userId = insertUserResult.data.insertId;

    // Create student status record
    const insertStatusQuery = `
      INSERT INTO student_status (student_id, profile_complete) 
      VALUES (?, ?)
    `;
    await executeQuery(insertStatusQuery, [userId, !!(name && phone && college)]);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, name);

    if (!emailSent) {
      // If email fails, still create account but inform user
      return res.status(201).json({
        success: true,
        message: 'Account created successfully, but verification email could not be sent. Please contact support.',
        data: {
          user: {
            id: userId,
            email,
            name,
            phone,
            college,
            profile_complete: !!(name && phone && college),
            email_verified: false
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        user: {
          id: userId,
          email,
          name,
          phone,
          college,
          profile_complete: !!(name && phone && college),
          email_verified: false
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Email Verification
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const userQuery = `
      SELECT id, email, name, verification_token, verification_token_expiry, email_verified 
      FROM students 
      WHERE verification_token = ?
    `;
    const userResult = await executeQuery(userQuery, [token]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    const user = userResult.data[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if token is expired
    if (new Date(user.verification_token_expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.'
      });
    }

    // Update user as verified
    const updateQuery = `
      UPDATE students 
      SET email_verified = TRUE, verification_token = NULL, verification_token_expiry = NULL 
      WHERE id = ?
    `;
    const updateResult = await executeQuery(updateQuery, [user.id]);

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify email'
      });
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to our platform.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          email_verified: true
        }
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Resend Verification Email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists and is not verified
    const userQuery = `
      SELECT id, email, name, email_verified 
      FROM students 
      WHERE email = ?
    `;
    const userResult = await executeQuery(userQuery, [email]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.data[0];

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update verification token
    const updateTokenQuery = `
      UPDATE students 
      SET verification_token = ?, verification_token_expiry = ? 
      WHERE id = ?
    `;
    const updateResult = await executeQuery(updateTokenQuery, [verificationToken, tokenExpiry, user.id]);

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate new verification token'
      });
    }

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, user.name);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send OTP for login
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
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

    const { email } = req.body;

    // Check if user exists
    const userQuery = `
      SELECT id, email, name, active, email_verified 
      FROM students 
      WHERE email = ?
    `;
    const userResult = await executeQuery(userQuery, [email]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    const user = userResult.data[0];

    // Check if account is active
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const updateOTPQuery = `
      UPDATE students 
      SET otp = ?, otp_expiry = ?, last_otp_sent = NOW() 
      WHERE id = ?
    `;
    const updateOTPResult = await executeQuery(updateOTPQuery, [otp, otpExpiry, user.id]);

    if (!updateOTPResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate OTP'
      });
    }

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: {
        email: user.email,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify OTP and Login
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
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

    const { email, otp } = req.body;

    // Get user with OTP
    const userQuery = `
      SELECT id, email, name, phone, college, profile_complete, 
             email_verified, active, otp, otp_expiry, login_attempts, lock_until 
      FROM students 
      WHERE email = ?
    `;
    const userResult = await executeQuery(userQuery, [email]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.data[0];

    // Check if account is locked
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts',
        lockUntil: user.lock_until
      });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in'
      });
    }

    // Check if OTP exists and is valid
    if (!user.otp || !user.otp_expiry) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP'
      });
    }

    // Check if OTP is expired
    if (new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      let lockUntil = null;
      
      if (newAttempts >= 5) {
        lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      }

      const updateAttemptsQuery = `
        UPDATE students 
        SET login_attempts = ?, lock_until = ? 
        WHERE id = ?
      `;
      await executeQuery(updateAttemptsQuery, [newAttempts, lockUntil, user.id]);

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Clear OTP and reset login attempts on successful verification
    const clearOTPQuery = `
      UPDATE students 
      SET otp = NULL, otp_expiry = NULL, login_attempts = 0, lock_until = NULL, last_login = NOW() 
      WHERE id = ?
    `;
    await executeQuery(clearOTPQuery, [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get student status
    const statusQuery = `
      SELECT terms_accepted, payment_completed, can_access_tests 
      FROM student_status 
      WHERE student_id = ?
    `;
    const statusResult = await executeQuery(statusQuery, [user.id]);
    const status = statusResult.success && statusResult.data.length > 0 
      ? statusResult.data[0] 
      : { terms_accepted: false, payment_completed: false, can_access_tests: false };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          college: user.college,
          profile_complete: user.profile_complete,
          email_verified: user.email_verified
        },
        status
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Traditional Password Login (keeping for backward compatibility)
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Get user with password
    const userQuery = `
      SELECT id, email, password, name, phone, college, profile_complete, 
             email_verified, active, login_attempts, lock_until 
      FROM students 
      WHERE email = ?
    `;
    const userResult = await executeQuery(userQuery, [email]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.data[0];

    // Check if account is locked
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts',
        lockUntil: user.lock_until
      });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.login_attempts + 1;
      let lockUntil = null;
      
      if (newAttempts >= 5) {
        lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      }

      const updateAttemptsQuery = `
        UPDATE students 
        SET login_attempts = ?, lock_until = ? 
        WHERE id = ?
      `;
      await executeQuery(updateAttemptsQuery, [newAttempts, lockUntil, user.id]);

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    const resetAttemptsQuery = `
      UPDATE students 
      SET login_attempts = 0, lock_until = NULL, last_login = NOW() 
      WHERE id = ?
    `;
    await executeQuery(resetAttemptsQuery, [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get student status
    const statusQuery = `
      SELECT terms_accepted, payment_completed, can_access_tests 
      FROM student_status 
      WHERE student_id = ?
    `;
    const statusResult = await executeQuery(statusQuery, [user.id]);
    const status = statusResult.success && statusResult.data.length > 0 
      ? statusResult.data[0] 
      : { terms_accepted: false, payment_completed: false, can_access_tests: false };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          college: user.college,
          profile_complete: user.profile_complete,
          email_verified: user.email_verified
        },
        status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Current User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userQuery = `
      SELECT id, email, name, phone, college, roll_number, branch, year_of_study,
             profile_complete, email_verified, created_at, last_login
      FROM students 
      WHERE id = ?
    `;
    const userResult = await executeQuery(userQuery, [req.user.id]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get student status
    const statusQuery = `
      SELECT terms_accepted, payment_completed, can_access_tests 
      FROM student_status 
      WHERE student_id = ?
    `;
    const statusResult = await executeQuery(statusQuery, [req.user.id]);
    const status = statusResult.success && statusResult.data.length > 0 
      ? statusResult.data[0] 
      : { terms_accepted: false, payment_completed: false, can_access_tests: false };

    res.json({
      success: true,
      data: {
        user: userResult.data[0],
        status
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update Profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('college').optional().trim().isLength({ min: 2 }).withMessage('College name must be at least 2 characters'),
  body('roll_number').optional().trim().isLength({ min: 1 }).withMessage('Roll number is required'),
  body('branch').optional().trim().isLength({ min: 2 }).withMessage('Branch must be at least 2 characters'),
  body('year_of_study').optional().isInt({ min: 1, max: 4 }).withMessage('Year of study must be between 1 and 4')
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

    const { name, phone, college, roll_number, branch, year_of_study } = req.body;

    // Update user profile
    const updateQuery = `
      UPDATE students 
      SET name = COALESCE(?, name), 
          phone = COALESCE(?, phone), 
          college = COALESCE(?, college),
          roll_number = COALESCE(?, roll_number),
          branch = COALESCE(?, branch),
          year_of_study = COALESCE(?, year_of_study),
          profile_complete = TRUE
      WHERE id = ?
    `;
    const updateResult = await executeQuery(updateQuery, [
      name, phone, college, roll_number, branch, year_of_study, req.user.id
    ]);

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    // Update student status
    const updateStatusQuery = `
      INSERT INTO student_status (student_id, profile_complete) 
      VALUES (?, TRUE)
      ON DUPLICATE KEY UPDATE profile_complete = TRUE
    `;
    await executeQuery(updateStatusQuery, [req.user.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change Password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;

    // Get current password
    const userQuery = 'SELECT password FROM students WHERE id = ?';
    const userResult = await executeQuery(userQuery, [req.user.id]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userResult.data[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const updateQuery = 'UPDATE students SET password = ? WHERE id = ?';
    const updateResult = await executeQuery(updateQuery, [hashedNewPassword, req.user.id]);

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const userQuery = 'SELECT id, email, name FROM students WHERE email = ?';
    const userResult = await executeQuery(userQuery, [email]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    const user = userResult.data[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save reset token
    const updateTokenQuery = `
      UPDATE students 
      SET reset_password_token = ?, reset_password_expires = ? 
      WHERE id = ?
    `;
    const updateResult = await executeQuery(updateTokenQuery, [resetToken, resetTokenExpiry, user.id]);

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate reset token'
      });
    }

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Student Authentication System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      console.error('Password reset email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, newPassword } = req.body;

    // Find user with reset token
    const userQuery = `
      SELECT id, reset_password_token, reset_password_expires 
      FROM students 
      WHERE reset_password_token = ?
    `;
    const userResult = await executeQuery(userQuery, [token]);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    const user = userResult.data[0];

    // Check if token is expired
    if (new Date(user.reset_password_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    const updateQuery = `
      UPDATE students 
      SET password = ?, reset_password_token = NULL, reset_password_expires = NULL 
      WHERE id = ?
    `;
    const updateResult = await executeQuery(updateQuery, [hashedPassword, user.id]);

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router; 