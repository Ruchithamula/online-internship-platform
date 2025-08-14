// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Expose only the publishable key on the frontend
  KEY_ID: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_lpv28BMDD8bT0M',
  // Do not use or set secret on frontend
  KEY_SECRET: 'DO_NOT_PUT_SECRET_IN_FRONTEND',
  
  // Company Details
  COMPANY_NAME: 'OnlyInternship.in',
  COMPANY_ADDRESS: 'Yuga Yatra Retail (OPC) Private Limited',
  
  // Test Configuration
  TEST_FEE: 750,
  GST_RATE: 0.18, // 18%
  
  // API Endpoints
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Payment Options
  PAYMENT_METHODS: [
    { id: 'card', name: 'Credit/Debit Card', description: 'Visa, MasterCard, RuPay' },
    { id: 'upi', name: 'UPI', description: 'Google Pay, PhonePe, Paytm' },
    { id: 'netbanking', name: 'Net Banking', description: 'All major banks' }
  ]
};

// Calculate total amount with GST
export const calculateTotalAmount = () => {
  const gstAmount = Math.round(RAZORPAY_CONFIG.TEST_FEE * RAZORPAY_CONFIG.GST_RATE);
  return RAZORPAY_CONFIG.TEST_FEE + gstAmount;
};

// Get GST breakdown
export const getGSTBreakdown = () => {
  const gstAmount = Math.round(RAZORPAY_CONFIG.TEST_FEE * RAZORPAY_CONFIG.GST_RATE);
  return {
    testFee: RAZORPAY_CONFIG.TEST_FEE,
    gstRate: RAZORPAY_CONFIG.GST_RATE * 100, // 18%
    gstAmount: gstAmount,
    total: RAZORPAY_CONFIG.TEST_FEE + gstAmount
  };
}; 