# Razorpay Integration Guide

## Overview
This document explains how to set up and use the Razorpay payment integration in the OnlyInternship.in platform.

## Features
- ✅ Secure payment processing with Razorpay
- ✅ GST-compliant billing (₹750 + 18% GST = ₹885)
- ✅ Multiple payment methods (Card, UPI, Net Banking)
- ✅ Payment verification and webhook handling
- ✅ Automatic test enablement after payment
- ✅ Payment history tracking
- ✅ Invoice generation

## Setup Instructions

### 1. Backend Configuration

#### Environment Variables
Create a `.env` file in the `backend/` directory:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE

# Database
MONGODB_URI=mongodb://localhost:27017/onlyinternship

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Get Razorpay Keys
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate a new key pair
4. Copy the Key ID and Key Secret

### 2. Frontend Configuration

#### Update Razorpay Config
Edit `src/config/razorpay.js`:

```javascript
export const RAZORPAY_CONFIG = {
  // Replace with your actual Razorpay keys
  KEY_ID: 'rzp_test_YOUR_ACTUAL_KEY',
  KEY_SECRET: 'YOUR_ACTUAL_SECRET',
  
  // Company Details
  COMPANY_NAME: 'OnlyInternship.in',
  COMPANY_ADDRESS: 'Yuga Yatra Retail (OPC) Private Limited',
  
  // Test Configuration
  TEST_FEE: 750,
  GST_RATE: 0.18, // 18%
  
  // API Endpoints
  API_BASE_URL: 'http://localhost:5000'
};
```

### 3. Database Setup

The Payment model includes these fields:
- `userId`: User who made the payment
- `orderId`: Razorpay order ID
- `paymentId`: Razorpay payment ID (after successful payment)
- `amount`: Total amount paid (₹885)
- `testFee`: Base test fee (₹750)
- `gst`: GST amount (₹135)
- `status`: Payment status (pending/completed/failed/refunded)
- `testEnabled`: Whether test is enabled for user
- `paymentMethod`: Method used (card/upi/netbanking)

## API Endpoints

### Create Payment Order
```http
POST /api/payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 88500,
  "currency": "INR",
  "receipt": "test_user_1234567890",
  "notes": {
    "userId": "user_id",
    "userEmail": "user@example.com",
    "testType": "internship_assessment"
  }
}
```

### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "razorpay_signature": "signature_xxx"
}
```

## Payment Flow

1. **User clicks "Pay" button**
   - Frontend creates payment order via backend API
   - Backend creates Razorpay order and stores in database

2. **Razorpay modal opens**
   - User selects payment method
   - User enters payment details
   - Razorpay processes payment

3. **Payment completion**
   - Razorpay returns payment response
   - Frontend verifies payment with backend
   - Backend verifies signature and updates payment status
   - Test is enabled for user

4. **Post-payment**
   - User accepts terms and conditions
   - User is redirected to dashboard
   - Payment info stored in localStorage

## Testing

### Test Cards
Use these test card numbers:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Security Features

1. **Signature Verification**: All payments are verified using Razorpay's signature
2. **HTTPS**: All API calls use HTTPS in production
3. **Token Authentication**: All payment endpoints require valid JWT token
4. **Rate Limiting**: API endpoints are rate-limited to prevent abuse
5. **Input Validation**: All inputs are validated and sanitized

## Error Handling

### Common Errors
- **Payment Failed**: User's card/bank declined the payment
- **Network Error**: Connection issues during payment
- **Verification Failed**: Payment signature verification failed
- **Order Expired**: Payment order expired (30 minutes)

### Error Recovery
- Failed payments can be retried
- Expired orders create new orders automatically
- Network errors show retry option
- Verification failures log detailed errors

## Production Deployment

### 1. Update Keys
- Replace test keys with live keys in both frontend and backend
- Update webhook URLs in Razorpay dashboard

### 2. Webhook Setup
Configure these webhooks in Razorpay dashboard:
- `payment.captured`: Payment successful
- `payment.failed`: Payment failed
- `refund.processed`: Refund completed

### 3. SSL Certificate
- Ensure HTTPS is enabled
- Update API URLs to use HTTPS

### 4. Monitoring
- Set up payment failure alerts
- Monitor webhook delivery
- Track payment success rates

## Troubleshooting

### Payment Not Processing
1. Check Razorpay keys are correct
2. Verify network connectivity
3. Check browser console for errors
4. Ensure user is authenticated

### Verification Failing
1. Check Razorpay secret key
2. Verify signature calculation
3. Check order ID format
4. Ensure payment is not expired

### Test Not Enabled
1. Check payment status in database
2. Verify payment verification response
3. Check user authentication
4. Ensure payment amount matches

## Support

For issues with:
- **Razorpay Integration**: Check Razorpay documentation
- **Payment Processing**: Check payment logs
- **Test Access**: Check user permissions
- **Technical Issues**: Check application logs

## Changelog

### v1.0.0
- Initial Razorpay integration
- Payment order creation and verification
- Test enablement after payment
- Basic error handling

### v1.1.0
- Added GST calculation
- Enhanced error handling
- Added payment history
- Improved security features 