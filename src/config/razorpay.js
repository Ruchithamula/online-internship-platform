// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Test Keys - Replace with your actual Razorpay keys
  KEY_ID: 'rzp_test_YOUR_KEY_HERE',
  KEY_SECRET: 'YOUR_SECRET_HERE',
  
  // Production Keys (uncomment when going live)
  // KEY_ID: 'rzp_live_YOUR_LIVE_KEY',
  // KEY_SECRET: 'YOUR_LIVE_SECRET',
  
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