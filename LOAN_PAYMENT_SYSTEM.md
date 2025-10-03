# 🏦 Loanhub PesaPal Payment System

## Complete Loan Payment Integration with PesaPal

A professional, production-ready loan payment system built specifically for **Loanhub** with PesaPal integration, mobile optimization, and comprehensive loan management features.

## 🔑 PesaPal Credentials

- **Consumer Key**: `x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL`
- **Consumer Secret**: `Q9twNwMHt8a03lFfODhnteP9fnY=`
- **Environment**: Production (`https://pay.pesapal.com/v3`)
- **Mobile Optimized**: Yes (`redirect_mode: "MOBILE"`)

## 🚀 Quick Start

### 1. Access the Demo
Visit: `/loan-payment-demo`

### 2. Test Authentication
The system automatically tests PesaPal authentication on page load.

### 3. Create Loan Payment
1. Fill in customer details
2. Enter loan amount in KES
3. Add loan reference number
4. Choose payment type
5. Click "Create Payment URL" or "Direct Mobile Payment"

### 4. Process Payment
1. Open payment URL on customer's mobile device
2. Customer completes M-PESA payment
3. Receive instant payment notification
4. Payment status updated in real-time

## 📁 File Structure

```
loan-hub/
├── src/
│   ├── lib/
│   │   └── loanhub-pesapal-service.ts    # Core PesaPal service
│   ├── components/
│   │   └── LoanPaymentForm.tsx            # Payment form component
│   └── app/
│       ├── api/loan-payment/
│       │   ├── route.ts                   # Main payment API
│       │   ├── direct/route.ts            # Direct mobile payment
│       │   ├── test-auth/route.ts         # Authentication test
│       │   ├── ipn/route.ts               # IPN handler
│       │   └── callback/route.ts          # Payment callback
│       ├── loan-payment-demo/
│       │   └── page.tsx                   # Demo page
│       └── loan-payment/
│           ├── success/page.tsx            # Success page
│           └── error/page.tsx             # Error page
└── LOAN_PAYMENT_SYSTEM.md                 # This documentation
```

## 🔧 API Endpoints

### 1. Standard Loan Payment
```http
POST /api/loan-payment
Content-Type: application/json

{
  "customerPhone": "+254700000000",
  "loanAmount": 5000,
  "loanReference": "LH001234",
  "paymentType": "repayment",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "description": "Monthly loan repayment"
}
```

### 2. Direct Mobile Payment
```http
POST /api/loan-payment/direct
Content-Type: application/json

{
  "customerPhone": "+254700000000",
  "loanAmount": 5000,
  "loanReference": "LH001234",
  "paymentType": "repayment",
  "customerName": "John Doe"
}
```

### 3. Test Authentication
```http
GET /api/loan-payment/test-auth
```

### 4. Check Payment Status
```http
GET /api/loan-payment?orderTrackingId={tracking_id}
```

### 5. IPN Notification
```http
GET /api/loan-payment/ipn?OrderTrackingId={tracking_id}
```

## 💳 Payment Types

| Type | Description | Use Case |
|------|-------------|----------|
| `repayment` | Loan Repayment | Regular monthly payments |
| `application_fee` | Application Fee | New loan application charges |
| `late_fee` | Late Payment Fee | Penalty for overdue payments |
| `processing_fee` | Processing Fee | Loan processing charges |

## 📱 Mobile Optimization

- **Mobile-First Design**: Optimized for mobile devices
- **M-PESA Integration**: Native M-PESA payment support
- **Responsive UI**: Works on all screen sizes
- **Touch-Friendly**: Large buttons and easy navigation
- **Fast Loading**: Optimized for mobile networks

## 🔒 Security Features

- **HTTPS**: All communications encrypted
- **Token Authentication**: Secure API access
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error messages
- **IPN Verification**: Payment notification verification

## 🏦 Loan-Specific Features

### 1. Loan Reference Generation
- Format: `LH{timestamp}_{random}`
- Example: `LH1704123456789_ABC123`
- Unique identifier for each loan payment

### 2. Phone Number Formatting
- Auto-formats Kenyan phone numbers
- Supports: `+254XXXXXXXXX`, `0XXXXXXXXX`
- Validates phone number format

### 3. Payment Descriptions
- Auto-generates payment descriptions
- Format: `Loan Repayment - Reference: LH001234`
- Customizable descriptions

### 4. Payment History
- Tracks all loan payments
- Real-time status updates
- Payment method tracking
- Amount and date logging

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Loan payment URL created successfully",
  "data": {
    "orderTrackingId": "2fdb26dc-2e4f-4ce5-a1d1-db4c6cc7e4e6",
    "redirectUrl": "https://pay.pesapal.com/iframe/PesapalIframe3/Index?OrderTrackingId=...",
    "loanReference": "LH001234",
    "paymentMethod": "Mobile M-PESA Loan Payment",
    "mobileOptimized": true,
    "amount": 5000,
    "currency": "KES",
    "status": "PENDING"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Missing required fields: customerPhone, loanAmount, loanReference",
  "loanReference": "LH001234"
}
```

## 🧪 Testing

### 1. Authentication Test
```bash
curl -X GET "https://your-domain.com/api/loan-payment/test-auth"
```

### 2. Create Test Payment
```bash
curl -X POST "https://your-domain.com/api/loan-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+254700000000",
    "loanAmount": 100,
    "loanReference": "TEST001",
    "paymentType": "repayment",
    "customerName": "Test Customer"
  }'
```

### 3. Check Payment Status
```bash
curl -X GET "https://your-domain.com/api/loan-payment?orderTrackingId={tracking_id}"
```

## 🎯 Customer Experience Flow

1. **Enter Details**: Customer fills loan payment form
2. **Validation**: System validates phone number and amount
3. **Payment URL**: System creates mobile-optimized payment URL
4. **Mobile Payment**: Customer opens URL on mobile device
5. **M-PESA Payment**: Customer completes M-PESA payment
6. **Confirmation**: Customer receives payment confirmation
7. **Notification**: System receives IPN notification
8. **Status Update**: Payment status updated in real-time

## 🔧 Configuration

### Environment Variables
```bash
# PesaPal Configuration (Already set in service)
PESAPAL_CONSUMER_KEY=x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL
PESAPAL_CONSUMER_SECRET=Q9twNwMHt8a03lFfODhnteP9fnY=
PESAPAL_BASE_URL=https://pay.pesapal.com/v3
```

### Callback URLs
- **Success**: `/loan-payment/success`
- **Error**: `/loan-payment/error`
- **IPN**: `/api/loan-payment/ipn`
- **Callback**: `/api/loan-payment/callback`

## 📈 Features Overview

✅ **Production Ready**: Real PesaPal credentials configured  
✅ **Mobile Optimized**: Mobile-first design with M-PESA integration  
✅ **Loan Specific**: Built specifically for loan payments  
✅ **Real-time Tracking**: Instant payment status updates  
✅ **Professional UI**: Clean, modern loan payment interface  
✅ **Error Handling**: Comprehensive error handling and user feedback  
✅ **Payment History**: Complete payment tracking and history  
✅ **Security**: Secure token-based authentication  
✅ **Validation**: Input validation and phone number formatting  
✅ **IPN Support**: Instant payment notifications  

## 🚀 Deployment

The system is ready for production deployment on Netlify:

1. **Automatic Deployment**: Changes pushed to GitHub auto-deploy
2. **Environment Variables**: PesaPal credentials already configured
3. **HTTPS**: Secure communication enabled
4. **Mobile Ready**: Optimized for mobile devices
5. **Production API**: Using PesaPal production environment

## 📞 Support

For technical support or questions:
- **Email**: support@loanhub.com
- **Phone**: +254 700 000 000
- **Documentation**: This file and inline code comments

## 🎉 Success!

Your Loanhub PesaPal payment system is now fully implemented and ready for production use! 

**Test it now**: Visit `/loan-payment-demo` to see the complete system in action.
