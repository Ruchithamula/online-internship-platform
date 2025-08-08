const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database-sqlite');

// Simple token authentication
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // For development, create a simple user object
    // In production, you would verify the JWT token
    req.user = {
      id: 1,
      student_id: 1,
      userType: 'student',
      email: 'test@example.com'
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Check if profile is complete
const requireProfileComplete = async (req, res, next) => {
  try {
    // For development, always allow
    next();
  } catch (error) {
    console.error('Profile check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile check failed'
    });
  }
};

// Check if terms are accepted
const requireTermsAccepted = async (req, res, next) => {
  try {
    // For development, always allow
    next();
  } catch (error) {
    console.error('Terms check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terms check failed'
    });
  }
};

// Check if payment is completed
const requirePaymentCompleted = async (req, res, next) => {
  try {
    // For development, always allow
    next();
  } catch (error) {
    console.error('Payment check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment check failed'
    });
  }
};

module.exports = {
  authenticateToken,
  requireProfileComplete,
  requireTermsAccepted,
  requirePaymentCompleted
}; 