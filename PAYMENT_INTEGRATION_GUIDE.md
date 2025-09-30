# Pesapal Payment Integration Guide

This guide provides comprehensive instructions for integrating Pesapal payment gateway into your LoanHub Kenya application.

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd loan-hub/backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your credentials
PESAPAL_CONSUMER_KEY=x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL
PESAPAL_CONSUMER_SECRET=Q9twNwMHt8a03lFfODhnteP9fnY=
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api
PESAPAL_CALLBACK_URL=http://localhost:3001/pesapal/callback
PESAPAL_IPN_URL=http://localhost:3001/pesapal/ipn

# Start the backend server
npm run dev
```

### 2. Database Setup

```sql
-- Run the migration script
mysql -u root -p loanhub_kenya < database/migrations/001_create_payments_table.sql
```

### 3. Frontend Integration

```bash
# The frontend components are already created in:
# - src/components/PaymentForm.tsx
# - src/components/AdminTransactionTable.tsx
# - src/app/payment/status/page.tsx
```

## 📋 API Endpoints

### Authentication
```http
GET /pesapal/token
```
Get OAuth access token from Pesapal.

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### Payment Initiation
```http
POST /pesapal/pay
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "loan_id": "uuid",
  "user_id": "uuid",
  "amount": 1000.00,
  "phone_number": "+254700000000",
  "payment_method": "mpesa",
  "description": "Loan repayment"
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "uuid",
  "order_tracking_id": "pesapal_order_id",
  "merchant_reference": "REPAY_1234567890_ABC123",
  "redirect_url": "https://cybqa.pesapal.com/pesapalv3/api/...",
  "message": "Payment initiated successfully. Please complete payment on your mobile device."
}
```

### Payment Status Check
```http
GET /pesapal/status/{payment_id}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "amount": 1000.00,
    "currency": "KES",
    "status": "completed",
    "pesapal_status": "COMPLETED",
    "payment_method": "mpesa",
    "phone_number": "+254700000000",
    "created_at": "2024-01-15T10:30:00Z",
    "paid_at": "2024-01-15T10:32:00Z",
    "expires_at": "2024-01-15T10:45:00Z"
  }
}
```

## 🔄 Payment Flow

### 1. User Initiates Payment

```typescript
// Frontend: PaymentForm.tsx
const handlePayment = async (paymentData) => {
  const response = await fetch('/api/pesapal/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      loan_id: 'loan-uuid',
      user_id: 'user-uuid',
      amount: 1000.00,
      phone_number: '+254700000000',
      payment_method: 'mpesa',
      description: 'Loan repayment'
    })
  });

  const result = await response.json();
  
  if (result.success) {
    // Payment initiated successfully
    // User will receive STK Push on their phone
    setPaymentStatus('processing');
  }
};
```

### 2. User Completes Payment

1. User receives STK Push notification on their phone
2. User enters their mobile money PIN
3. Payment is processed by Pesapal
4. Webhook is triggered to update payment status

### 3. Webhook Processing

```typescript
// Backend: routes/pesapal.js
router.get('/callback', async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference } = req.query;
  
  // Get payment status from Pesapal
  const statusResponse = await pesapalService.getPaymentStatus(OrderTrackingId);
  
  // Update payment record
  await payment.update({
    pesapal_status: statusResponse.payment_status_description,
    status: statusResponse.payment_status_description === 'COMPLETED' ? 'completed' : 'failed'
  });
  
  // If completed, update loan balance
  if (statusResponse.payment_status_description === 'COMPLETED') {
    await updateLoanBalance(payment.loan_id, payment.amount);
  }
  
  // Redirect to frontend status page
  res.redirect(`${process.env.FRONTEND_URL}/payment/status?status=${payment.status}`);
});
```

## 🎯 Frontend Components

### PaymentForm Component

```typescript
import { PaymentForm } from '@/components/PaymentForm';

function LoanRepaymentPage() {
  const handlePaymentInitiated = (paymentData) => {
    console.log('Payment initiated:', paymentData);
    // Show loading state
  };

  const handlePaymentCompleted = (paymentData) => {
    console.log('Payment completed:', paymentData);
    // Show success message
    // Redirect to dashboard
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    // Show error message
  };

  return (
    <PaymentForm
      loanId="loan-uuid"
      userId="user-uuid"
      maxAmount={5000.00}
      onPaymentInitiated={handlePaymentInitiated}
      onPaymentCompleted={handlePaymentCompleted}
      onError={handlePaymentError}
    />
  );
}
```

### Admin Transaction Management

```typescript
import { AdminTransactionTable } from '@/components/AdminTransactionTable';

function AdminTransactionsPage() {
  const handleTransactionSelect = (transaction) => {
    console.log('Transaction selected:', transaction);
    // Show transaction details modal
  };

  const handleRetryTransaction = (transactionId) => {
    console.log('Retrying transaction:', transactionId);
    // Retry failed transaction
  };

  return (
    <AdminTransactionTable
      onTransactionSelect={handleTransactionSelect}
      onRetryTransaction={handleRetryTransaction}
    />
  );
}
```

## 🔐 Security Features

### 1. Input Validation

```typescript
// Backend: utils/validation.js
const validatePaymentInitiation = [
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000'),
  
  body('phone_number')
    .matches(/^(\+254|0)[0-9]{9}$/)
    .withMessage('Please enter a valid Kenyan phone number'),
  
  body('payment_method')
    .isIn(['mpesa', 'airtel_money', 'equitel'])
    .withMessage('Payment method must be mpesa, airtel_money, or equitel')
];
```

### 2. Rate Limiting

```typescript
// Backend: server.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);
```

### 3. Webhook Signature Verification

```typescript
// Backend: services/pesapalService.js
verifyCallbackSignature(params, signature) {
  const sortedParams = Object.keys(params)
    .filter(key => key !== 'pesapal_signature')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const expectedSignature = crypto
    .createHmac('sha1', this.consumerSecret)
    .update(sortedParams)
    .digest('base64');
  
  return signature === expectedSignature;
}
```

## 📊 Database Schema

### Payments Table

```sql
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    loan_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    pesapal_order_tracking_id VARCHAR(255) UNIQUE,
    pesapal_merchant_reference VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    payment_method ENUM('mpesa', 'airtel_money', 'equitel', 'visa', 'mastercard'),
    phone_number VARCHAR(20),
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'expired'),
    pesapal_status VARCHAR(100),
    payment_reference VARCHAR(255),
    failure_reason TEXT,
    callback_data JSON,
    paid_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Test Payment Flow

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test Payment Initiation**
   ```bash
   curl -X POST http://localhost:3001/pesapal/pay \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-jwt-token" \
     -d '{
       "loan_id": "test-loan-uuid",
       "user_id": "test-user-uuid",
       "amount": 100.00,
       "phone_number": "+254700000000",
       "payment_method": "mpesa",
       "description": "Test payment"
     }'
   ```

3. **Test Payment Status**
   ```bash
   curl -X GET http://localhost:3001/pesapal/status/payment-uuid \
     -H "Authorization: Bearer your-jwt-token"
   ```

### Test Webhook

```bash
curl -X GET "http://localhost:3001/pesapal/callback?OrderTrackingId=test-id&OrderMerchantReference=test-ref&OrderNotificationType=CHANGE"
```

## 🚨 Error Handling

### Common Error Scenarios

1. **Invalid Phone Number**
   ```json
   {
     "success": false,
     "error": "Validation failed",
     "details": [
       {
         "field": "phone_number",
         "message": "Please enter a valid Kenyan phone number",
         "value": "invalid-phone"
       }
     ]
   }
   ```

2. **Insufficient Balance**
   ```json
   {
     "success": false,
     "error": "Payment failed",
     "message": "Insufficient balance in mobile money account"
   }
   ```

3. **Payment Timeout**
   ```json
   {
     "success": false,
     "error": "Payment timeout",
     "message": "Payment was not completed within the allowed time"
   }
   ```

## 📱 Mobile Money Integration

### Supported Payment Methods

1. **M-Pesa (Safaricom)**
   - Phone format: `+254700000000` or `0700000000`
   - STK Push supported
   - Real-time notifications

2. **Airtel Money**
   - Phone format: `+254700000000` or `0700000000`
   - STK Push supported
   - Real-time notifications

3. **Equitel (Equity Bank)**
   - Phone format: `+254700000000` or `0700000000`
   - STK Push supported
   - Real-time notifications

### Payment Limits

- **Minimum Amount**: KES 1.00
- **Maximum Amount**: KES 150,000.00 (varies by provider)
- **Daily Limit**: KES 300,000.00 (varies by provider)

## 🔧 Configuration

### Environment Variables

```env
# Pesapal Configuration
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api
PESAPAL_CALLBACK_URL=http://localhost:3001/pesapal/callback
PESAPAL_IPN_URL=http://localhost:3001/pesapal/ipn

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=loanhub_kenya
DB_USER=root
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📈 Monitoring & Logging

### Payment Logs

All payment activities are logged in:
- `logs/pesapal.log` - Payment-specific logs
- `logs/app.log` - General application logs
- `logs/auth.log` - Authentication logs

### Key Metrics to Monitor

1. **Payment Success Rate**
2. **Average Payment Processing Time**
3. **Failed Payment Reasons**
4. **Webhook Response Times**
5. **API Response Times**

## 🆘 Troubleshooting

### Common Issues

1. **Payment Not Initiated**
   - Check Pesapal credentials
   - Verify network connectivity
   - Check API endpoint URLs

2. **STK Push Not Received**
   - Verify phone number format
   - Check mobile money account status
   - Ensure sufficient balance

3. **Webhook Not Triggered**
   - Check callback URL configuration
   - Verify webhook signature validation
   - Check server logs for errors

4. **Payment Status Not Updated**
   - Check database connection
   - Verify payment record exists
   - Check webhook processing logic

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 📞 Support

For technical support:
- **Email**: support@loanhubkenya.com
- **Documentation**: [Pesapal API Docs](https://developer.pesapal.com/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## 🔄 Updates & Maintenance

### Regular Tasks

1. **Monitor Payment Success Rates**
2. **Update Pesapal API Credentials**
3. **Review and Update Security Policies**
4. **Backup Payment Data**
5. **Update Dependencies**

### Version Updates

When updating Pesapal API:
1. Test in sandbox environment
2. Update API endpoints if needed
3. Test all payment flows
4. Deploy to production
5. Monitor for issues

---

This integration provides a complete, production-ready payment system with Pesapal for your LoanHub Kenya application. The system includes comprehensive error handling, security measures, and monitoring capabilities.
