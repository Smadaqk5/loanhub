# STK Push Payment Implementation

This document describes the complete STK Push payment implementation for processing fee payments in the LoanHub Kenya application.

## 🚀 Overview

The STK Push functionality allows users to pay processing fees directly from their mobile money accounts (M-Pesa, Airtel Money, Equitel) without leaving the application. The implementation includes real-time payment status updates, comprehensive error handling, and a seamless user experience.

## 📁 File Structure

```
src/
├── lib/
│   └── pesapal-service.ts          # Core Pesapal API service
├── components/
│   └── ProcessingFeePayment.tsx    # Payment form component
├── app/
│   ├── loans/apply/page.tsx        # Updated loan application page
│   ├── payment/
│   │   ├── callback/page.tsx       # Payment callback handler
│   │   └── status/page.tsx         # Payment status page
│   └── test-payment/page.tsx       # Test page for STK Push
└── app/layout.tsx                  # Updated with toast notifications
```

## 🔧 Implementation Details

### 1. Pesapal Service (`src/lib/pesapal-service.ts`)

The core service handles all Pesapal API interactions:

#### Key Features:
- **OAuth Authentication**: Automatic token management with refresh
- **STK Push Initiation**: Submit payment orders to Pesapal
- **Status Polling**: Real-time payment status updates
- **Error Handling**: Comprehensive error management
- **Validation**: Phone number and payment method validation

#### Key Methods:
```typescript
// Initiate STK Push payment
async initiateSTKPush(paymentRequest: PaymentRequest): Promise<PaymentResponse>

// Check payment status
async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null>

// Poll payment status until completion
async pollPaymentStatus(
  orderTrackingId: string,
  onStatusUpdate: (status: PaymentStatus) => void,
  timeoutMs: number = 300000
): Promise<PaymentStatus | null>
```

### 2. Processing Fee Payment Component (`src/components/ProcessingFeePayment.tsx`)

A comprehensive React component for handling processing fee payments:

#### Features:
- **Form Validation**: Zod schema validation for all inputs
- **Payment Method Selection**: M-Pesa, Airtel Money, Equitel
- **Real-time Status Updates**: Live payment status display
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during payment process
- **Toast Notifications**: Success/error notifications

#### Props:
```typescript
interface ProcessingFeePaymentProps {
  loanId: string
  userId: string
  processingFeeAmount: number
  onPaymentSuccess: (paymentData: any) => void
  onPaymentError: (error: string) => void
  onCancel: () => void
}
```

### 3. Loan Application Integration

The loan application page (`src/app/loans/apply/page.tsx`) has been updated to integrate the STK Push functionality:

#### Changes:
- Added `ProcessingFeePayment` component import
- Added payment state management
- Integrated payment success/error handlers
- Replaced old payment step with new STK Push component

#### Payment Flow:
1. User fills loan application form
2. Clicks "Submit Application"
3. Processing fee payment form appears
4. User selects payment method and enters phone number
5. STK Push is initiated
6. User receives payment prompt on phone
7. Payment status updates in real-time
8. On success, loan application is saved with "processing_fee_paid" status

### 4. Payment Callback Handler (`src/app/payment/callback/page.tsx`)

Handles Pesapal webhook callbacks:

#### Features:
- **URL Parameter Processing**: Extracts payment details from callback URL
- **Status Verification**: Checks payment status with Pesapal API
- **User Feedback**: Displays payment result to user
- **Error Handling**: Handles invalid callbacks gracefully

### 5. Toast Notifications

Added `react-hot-toast` for user feedback:

#### Configuration:
- Position: Top-right
- Success: Green theme with 3-second duration
- Error: Red theme with 5-second duration
- Default: Dark theme with 4-second duration

## 🔄 Payment Flow

### 1. Payment Initiation
```typescript
const paymentRequest: PaymentRequest = {
  loanId: 'loan-uuid',
  userId: 'user-uuid',
  amount: 500.00,
  phoneNumber: '+254700000000',
  paymentMethod: 'mpesa',
  description: 'Processing fee payment for loan ABC123'
}

const result = await pesapalService.initiateSTKPush(paymentRequest)
```

### 2. STK Push Processing
1. User receives STK Push notification on phone
2. User enters mobile money PIN
3. Payment is processed by Pesapal
4. Webhook callback is triggered

### 3. Status Updates
```typescript
await pesapalService.pollPaymentStatus(
  result.orderTrackingId,
  (status) => {
    // Update UI with payment status
    setCurrentPaymentStatus(status)
    
    if (status.status === 'completed') {
      // Handle successful payment
      onPaymentSuccess(paymentData)
    } else if (status.status === 'failed') {
      // Handle failed payment
      onPaymentError('Payment failed')
    }
  },
  300000 // 5 minutes timeout
)
```

## 🧪 Testing

### Test Page
Access the test page at `/test-payment` to test the STK Push functionality:

#### Test Features:
- **Mock Payment**: KES 500.00 processing fee
- **All Payment Methods**: M-Pesa, Airtel Money, Equitel
- **Phone Validation**: Accepts any valid Kenyan phone number
- **Real-time Updates**: Live payment status display
- **Console Logging**: Detailed logs for debugging

### Test Credentials
- **Environment**: Pesapal Sandbox
- **Consumer Key**: `k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx`
- **Consumer Secret**: `Tjg4VodFyn1ur9aDMo1fsJvgHQQ=`
- **Base URL**: `https://cybqa.pesapal.com/pesapalv3/api`

### Test Phone Numbers
Use any valid Kenyan phone number format:
- `+254700000000`
- `0700000000`
- `+254712345678`
- `0712345678`

## 🔐 Security Features

### 1. Input Validation
- **Phone Number**: Regex validation for Kenyan phone numbers
- **Payment Method**: Enum validation for supported methods
- **Amount**: Numeric validation with min/max limits

### 2. Error Handling
- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: Clear error messages for invalid inputs
- **Timeout Handling**: Automatic timeout for long-running payments

### 3. Data Protection
- **Local Storage**: Payment data stored locally for tracking
- **No Sensitive Data**: No sensitive information in URLs or logs
- **Secure API Calls**: All API calls use HTTPS

## 📱 Mobile Money Integration

### Supported Payment Methods

#### M-Pesa (Safaricom)
- **Provider**: Safaricom
- **Phone Format**: `+254700000000` or `0700000000`
- **STK Push**: ✅ Supported
- **Real-time**: ✅ Supported

#### Airtel Money
- **Provider**: Airtel Kenya
- **Phone Format**: `+254700000000` or `0700000000`
- **STK Push**: ✅ Supported
- **Real-time**: ✅ Supported

#### Equitel
- **Provider**: Equity Bank
- **Phone Format**: `+254700000000` or `0700000000`
- **STK Push**: ✅ Supported
- **Real-time**: ✅ Supported

### Payment Limits
- **Minimum**: KES 1.00
- **Maximum**: KES 150,000.00 (varies by provider)
- **Daily Limit**: KES 300,000.00 (varies by provider)

## 🎨 User Experience

### Visual Feedback
- **Loading States**: Spinner animations during API calls
- **Status Icons**: Color-coded icons for different payment states
- **Progress Indicators**: Clear indication of payment progress
- **Toast Notifications**: Non-intrusive success/error messages

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large buttons and touch targets
- **Accessible**: Proper ARIA labels and keyboard navigation

### Error Messages
- **User-Friendly**: Clear, actionable error messages
- **Contextual**: Specific to the error type
- **Recovery Options**: Clear next steps for users

## 🔧 Configuration

### Environment Variables
```env
# Pesapal Configuration
PESAPAL_CONSUMER_KEY=k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx
PESAPAL_CONSUMER_SECRET=Tjg4VodFyn1ur9aDMo1fsJvgHQQ=
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api
PESAPAL_CALLBACK_URL=http://localhost:3000/payment/callback

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### Dependencies
```json
{
  "react-hot-toast": "^2.4.1",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.8",
  "react-hook-form": "^7.62.0"
}
```

## 🚀 Deployment

### Production Configuration
1. **Update Environment Variables**:
   - Use production Pesapal credentials
   - Update callback URLs to production domain
   - Set secure JWT secrets

2. **SSL Certificate**:
   - Ensure HTTPS is enabled
   - Update callback URLs to use HTTPS

3. **Domain Configuration**:
   - Update `PESAPAL_CALLBACK_URL` to production domain
   - Configure CORS settings

### Monitoring
- **Payment Success Rate**: Track successful payments
- **Error Rates**: Monitor failed payments
- **Response Times**: Track API response times
- **User Experience**: Monitor user completion rates

## 🆘 Troubleshooting

### Common Issues

#### 1. STK Push Not Received
- **Check**: Phone number format
- **Verify**: Mobile money account status
- **Ensure**: Sufficient balance

#### 2. Payment Timeout
- **Check**: Network connectivity
- **Verify**: Pesapal API status
- **Retry**: Payment after timeout

#### 3. Invalid Phone Number
- **Format**: Use `+254` or `0` prefix
- **Length**: Must be 10 digits after prefix
- **Example**: `+254700000000` or `0700000000`

#### 4. API Errors
- **Check**: Consumer key and secret
- **Verify**: API endpoint URLs
- **Monitor**: Rate limiting

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 📞 Support

For technical support:
- **Email**: support@loanhubkenya.com
- **Documentation**: [Pesapal API Docs](https://developer.pesapal.com/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

This implementation provides a complete, production-ready STK Push payment system for processing fee payments in the LoanHub Kenya application. The system includes comprehensive error handling, real-time status updates, and a seamless user experience.
