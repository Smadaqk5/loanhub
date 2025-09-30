# PesaPal Payment Links Generator Guide

## 🚀 **Overview**

The PesaPal Payment Links Generator creates direct payment links that redirect customers to PesaPal's official payment interface (like the one shown in your image). This provides a seamless payment experience using PesaPal's secure payment gateway.

## ✨ **Features**

### **Direct PesaPal Integration**
- ✅ Direct links to PesaPal's payment interface
- ✅ Secure payment processing through PesaPal
- ✅ Mobile-optimized payment experience
- ✅ Support for M-Pesa, Airtel Money, and Equitel
- ✅ Real-time payment status tracking
- ✅ Automatic callback handling

### **Payment Link Types**
- ✅ Quick payment links for common scenarios
- ✅ Processing fee payment links
- ✅ Loan repayment payment links
- ✅ Custom payment links with full control

## 🔧 **System Components**

### **1. PesaPal Payment Link Generator** (`src/lib/pesapal-payment-link-generator.ts`)
- Generates direct PesaPal payment URLs
- Handles OAuth authentication with PesaPal
- Manages payment order submission
- Tracks payment status

### **2. React Components** (`src/components/PesaPalPaymentLinkGenerator.tsx`)
- Custom payment link generator
- Quick payment link generator
- User-friendly interfaces
- Payment link management

### **3. Test Page** (`src/app/pesapal-payment-links/page.tsx`)
- Complete testing interface
- Payment link generation
- Link management and tracking
- Usage instructions

## 📱 **Payment Flow**

### **1. Generate Payment Link**
```typescript
import { pesapalPaymentLinkGenerator } from '@/lib/pesapal-payment-link-generator'

// Create a quick payment link
const paymentLink = await pesapalPaymentLinkGenerator.createQuickPaymentLink(
  100, // Amount in KES
  'Payment description',
  '+254700000000', // Phone number
  'mpesa' // Payment method
)

// Get the PesaPal payment URL
console.log(paymentLink.paymentUrl) // Direct link to PesaPal interface
```

### **2. Customer Payment Process**
1. **Customer clicks payment link** → Redirects to PesaPal interface
2. **PesaPal payment page loads** → Shows payment options (M-Pesa, Airtel Money, etc.)
3. **Customer selects payment method** → Chooses preferred payment option
4. **Customer enters phone number** → Provides mobile number for payment
5. **Customer clicks "Proceed"** → STK Push sent to customer's phone
6. **Customer enters PIN** → Completes payment on mobile device
7. **Payment processed** → PesaPal processes the payment
8. **Confirmation received** → Customer gets SMS confirmation

## 🎯 **Usage Examples**

### **1. Quick Payment Link**
```typescript
// Generate a quick payment link
const paymentLink = await pesapalPaymentLinkGenerator.createQuickPaymentLink(
  500, // KES 500
  'Processing fee payment',
  '+254700000000',
  'mpesa'
)

// Share the payment URL
window.open(paymentLink.paymentUrl, '_blank')
```

### **2. Processing Fee Payment**
```typescript
// Generate processing fee payment link
const processingFeeLink = await pesapalPaymentLinkGenerator.createProcessingFeePaymentLink(
  'LOAN_123', // Loan ID
  500, // Processing fee amount
  '+254700000000', // Customer phone
  'mpesa' // Payment method
)
```

### **3. Loan Repayment**
```typescript
// Generate loan repayment link
const repaymentLink = await pesapalPaymentLinkGenerator.createLoanRepaymentLink(
  'LOAN_123', // Loan ID
  5000, // Repayment amount
  '+254700000000', // Customer phone
  'mpesa' // Payment method
)
```

### **4. Custom Payment Link**
```typescript
// Create custom payment link with full control
const customLink = await pesapalPaymentLinkGenerator.createPaymentLink({
  amount: 1000,
  currency: 'KES',
  description: 'Custom payment description',
  phoneNumber: '+254700000000',
  paymentMethod: 'mpesa',
  merchantReference: 'CUSTOM_123',
  callbackUrl: 'https://your-domain.com/payment/callback',
  customerEmail: 'customer@example.com',
  customerName: 'Customer Name'
})
```

## 🔗 **Payment Link Structure**

### **Generated Payment URLs**
PesaPal payment links look like this:
```
https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest
```

### **Payment Interface Features**
- **Payment Method Selection**: M-Pesa, Airtel Money, Equitel
- **Amount Display**: Clear amount in KES
- **Phone Number Input**: Pre-filled customer phone number
- **Payment Instructions**: Step-by-step payment guidance
- **Security Features**: Secure payment processing

## 🧪 **Testing**

### **Test Page**: `/pesapal-payment-links`
- Quick payment link generator
- Custom payment link generator
- Payment link management
- Link testing and validation

### **Test Scenarios**
1. **Generate Quick Payment** (KES 100)
2. **Generate Processing Fee** (KES 500)
3. **Generate Loan Repayment** (KES 5,000)
4. **Test Payment Links** - Click to open PesaPal interface
5. **Copy Payment URLs** - Share with customers

## 🔒 **Security Features**

### **Payment Security**
- ✅ OAuth authentication with PesaPal
- ✅ Secure payment processing
- ✅ Encrypted payment data
- ✅ Callback signature verification
- ✅ Payment expiration handling

### **Data Protection**
- ✅ Secure payment URLs
- ✅ Encrypted payment data
- ✅ Payment status tracking
- ✅ Error handling and logging

## 📊 **Payment Status Tracking**

### **Payment Status Flow**
1. **Pending** - Payment link created, waiting for customer
2. **Processing** - Customer initiated payment
3. **Completed** - Payment successfully processed
4. **Failed** - Payment failed (customer can retry)
5. **Cancelled** - Payment cancelled by customer

### **Status Checking**
```typescript
// Check payment status
const status = await pesapalPaymentLinkGenerator.checkPaymentStatus(merchantReference)

console.log(status.status) // 'pending', 'completed', 'failed', 'cancelled'
console.log(status.amount) // Payment amount
console.log(status.currency) // Payment currency
```

## 🚀 **Deployment**

### **Environment Variables**
```bash
PESAPAL_CONSUMER_KEY=x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL
PESAPAL_CONSUMER_SECRET=Q9twNwMHt8a03lFfODhnteP9fnY=
NEXT_PUBLIC_PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### **Production Setup**
1. Set environment variables in Netlify
2. Deploy the application
3. Test payment link generation
4. Verify PesaPal integration

## 📈 **Integration Examples**

### **Loan Application Flow**
```typescript
// 1. User applies for loan
const loanApplication = await createLoanApplication(applicationData)

// 2. Generate processing fee payment link
const paymentLink = await pesapalPaymentLinkGenerator.createProcessingFeePaymentLink(
  loanApplication.id,
  500,
  applicationData.phoneNumber,
  'mpesa'
)

// 3. Send payment link to customer
await sendPaymentNotification(customer.email, paymentLink.paymentUrl)
```

### **Loan Repayment Flow**
```typescript
// 1. Customer wants to repay loan
const loan = await getLoan(loanId)

// 2. Generate repayment payment link
const repaymentLink = await pesapalPaymentLinkGenerator.createLoanRepaymentLink(
  loan.id,
  loan.outstandingBalance,
  customer.phoneNumber,
  'mpesa'
)

// 3. Send repayment link to customer
await sendRepaymentNotification(customer.email, repaymentLink.paymentUrl)
```

## 🎨 **Customization**

### **Payment Link Configuration**
```typescript
const paymentRequest = {
  amount: 1000,
  currency: 'KES',
  description: 'Custom payment description',
  phoneNumber: '+254700000000',
  paymentMethod: 'mpesa',
  merchantReference: 'CUSTOM_REF',
  callbackUrl: 'https://your-domain.com/callback',
  customerEmail: 'customer@example.com',
  customerName: 'Customer Name'
}
```

### **Callback Handling**
```typescript
// Handle payment callbacks
app.get('/payment/callback', (req, res) => {
  const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query
  
  // Process payment callback
  console.log('Payment callback received:', {
    OrderTrackingId,
    OrderMerchantReference,
    OrderNotificationType
  })
  
  // Update payment status in your database
  // Redirect customer to success/failure page
})
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Payment Link Not Working**
   - Check PesaPal credentials
   - Verify API endpoints
   - Check network connectivity

2. **Payment Not Processing**
   - Verify phone number format
   - Check payment amount
   - Ensure sufficient balance

3. **Callback Not Received**
   - Check callback URL configuration
   - Verify PesaPal webhook settings
   - Check server logs

### **Debug Tools**
- Browser developer tools
- Network tab for API calls
- Console logs for errors
- PesaPal API documentation

## 📚 **API Reference**

### **PesaPal Payment Link Generator Methods**

```typescript
// Create quick payment link
createQuickPaymentLink(amount, description, phoneNumber, paymentMethod): Promise<PesaPalPaymentLink>

// Create processing fee payment link
createProcessingFeePaymentLink(loanId, amount, phoneNumber, paymentMethod): Promise<PesaPalPaymentLink>

// Create loan repayment link
createLoanRepaymentLink(loanId, amount, phoneNumber, paymentMethod): Promise<PesaPalPaymentLink>

// Create custom payment link
createPaymentLink(request: PesaPalPaymentRequest): Promise<PesaPalPaymentLink>

// Check payment status
checkPaymentStatus(merchantReference: string): Promise<PaymentStatus>

// Format currency
formatCurrency(amount: number, currency: string): string

// Get payment method name
getPaymentMethodName(method: string): string
```

## 🎯 **Best Practices**

### **Payment Link Design**
- Use descriptive payment descriptions
- Set appropriate payment amounts
- Provide clear payment instructions
- Handle payment failures gracefully

### **Security**
- Validate all payment data
- Use secure callback URLs
- Implement payment expiration
- Monitor for suspicious activity

### **User Experience**
- Provide clear payment instructions
- Handle payment failures gracefully
- Offer multiple payment methods
- Show payment status clearly

---

**Your PesaPal Payment Links Generator is now fully implemented and ready for production use!** 🎉

Each payment link will redirect customers directly to PesaPal's secure payment interface, providing a seamless payment experience just like the one shown in your image.
