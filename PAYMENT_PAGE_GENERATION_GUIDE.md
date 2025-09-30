# PesaPal Payment Page Generation System

## 🚀 **Overview**

The Payment Page Generation System creates individual, secure payment pages for each PesaPal transaction. Each payment gets its own unique URL that customers can use to complete their payments.

## ✨ **Features**

### **Individual Payment Pages**
- ✅ Unique URL for each payment
- ✅ Secure payment processing
- ✅ Real-time status updates
- ✅ Mobile-optimized design
- ✅ Customizable branding
- ✅ Payment method selection (M-Pesa, Airtel Money, Equitel)
- ✅ Automatic retry logic
- ✅ Payment expiration handling

### **Payment Page Components**
- ✅ Payment amount display
- ✅ Payment method selection
- ✅ Phone number validation
- ✅ Payment instructions
- ✅ Countdown timer
- ✅ Progress tracking
- ✅ Status updates

## 🔧 **System Architecture**

### **Core Components**

1. **Payment Page Generator** (`src/lib/payment-page-generator.ts`)
   - Generates HTML for individual payment pages
   - Handles payment page customization
   - Manages payment page configuration

2. **Payment Page Service** (`src/lib/payment-page-service.ts`)
   - Creates payment pages
   - Manages payment data
   - Integrates with PesaPal services

3. **Dynamic Payment Routes** (`src/app/payment/[paymentId]/page.tsx`)
   - Individual payment page display
   - Payment status management
   - Real-time updates

4. **API Endpoints**
   - `/api/payment/[paymentId]` - Get payment page data
   - `/api/payment/initiate` - Initiate payments
   - `/api/payment/status/[paymentId]` - Check payment status

## 📱 **Usage Examples**

### **1. Generate Processing Fee Payment**

```typescript
import { paymentPageService } from '@/lib/payment-page-service'

const paymentRequest = {
  loanId: 'LOAN_123',
  userId: 'USER_456',
  amount: 500,
  phoneNumber: '+254700000000',
  paymentMethod: 'mpesa',
  description: 'Processing fee payment'
}

const response = await paymentPageService.createPaymentPage(paymentRequest)

if (response.success) {
  console.log('Payment URL:', response.paymentUrl)
  // Share this URL with the customer
}
```

### **2. Generate Loan Repayment**

```typescript
const repaymentRequest = {
  loanId: 'LOAN_123',
  userId: 'USER_456',
  amount: 5000,
  phoneNumber: '+254700000000',
  paymentMethod: 'mpesa',
  description: 'Loan repayment'
}

const response = await paymentPageService.createPaymentPage(repaymentRequest)
```

### **3. Using the React Components**

```tsx
import { PaymentPageGenerator, QuickPaymentPageGenerator } from '@/components/PaymentPageGenerator'

// Custom payment page generator
<PaymentPageGenerator
  onPaymentPageCreated={(paymentId, paymentUrl) => {
    console.log('Payment page created:', paymentId, paymentUrl)
  }}
  onError={(error) => {
    console.error('Error:', error)
  }}
/>

// Quick payment page generator
<QuickPaymentPageGenerator />
```

## 🎨 **Customization**

### **Payment Page Configuration**

```typescript
const config = {
  baseUrl: 'https://your-domain.com',
  theme: 'light', // or 'dark'
  branding: {
    companyName: 'Your Company',
    logo: 'https://your-domain.com/logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  },
  features: {
    showProgress: true,
    showTimer: true,
    allowRetry: true,
    showInstructions: true
  }
}
```

### **Payment Page Features**

- **Progress Bar**: Shows payment progress
- **Countdown Timer**: Shows time remaining for payment
- **Payment Instructions**: Step-by-step payment guidance
- **Retry Logic**: Automatic retry for failed payments
- **Status Updates**: Real-time payment status updates

## 🔒 **Security Features**

### **Payment Security**
- ✅ Unique payment IDs
- ✅ Encrypted payment data
- ✅ Secure API endpoints
- ✅ Payment expiration
- ✅ Signature verification

### **Data Protection**
- ✅ Local storage encryption
- ✅ Secure payment URLs
- ✅ Payment data validation
- ✅ Error handling

## 📊 **Payment Tracking**

### **Payment Status Flow**
1. **Pending** - Payment initiated, waiting for user action
2. **Processing** - Payment being processed by PesaPal
3. **Completed** - Payment successfully completed
4. **Failed** - Payment failed (user can retry)
5. **Cancelled** - Payment cancelled by user
6. **Expired** - Payment expired (time limit reached)

### **Real-time Updates**
- Automatic status polling
- WebSocket connections (optional)
- Push notifications
- Email notifications

## 🧪 **Testing**

### **Test Payment Pages**
1. Navigate to `/generate-payment`
2. Use the quick generator for common scenarios
3. Test with different payment methods
4. Verify payment status updates

### **Test Scenarios**
- ✅ Processing fee payments
- ✅ Loan repayments
- ✅ Different payment methods
- ✅ Payment failures and retries
- ✅ Payment expiration
- ✅ Mobile responsiveness

## 🚀 **Deployment**

### **Environment Variables**
```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
NEXT_PUBLIC_PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api
```

### **Production Setup**
1. Update environment variables
2. Deploy to your hosting platform
3. Test payment page generation
4. Monitor payment success rates

## 📈 **Analytics & Monitoring**

### **Payment Metrics**
- Payment success rates
- Payment failure reasons
- Average payment completion time
- Payment method preferences
- User behavior analytics

### **Monitoring Tools**
- Payment status tracking
- Error logging
- Performance monitoring
- User feedback collection

## 🔄 **Integration Examples**

### **Loan Application Flow**
```typescript
// 1. User applies for loan
const loanApplication = await createLoanApplication(applicationData)

// 2. Generate processing fee payment page
const paymentPage = await paymentPageService.createPaymentPage({
  loanId: loanApplication.id,
  userId: applicationData.userId,
  amount: 500,
  phoneNumber: applicationData.phoneNumber,
  paymentMethod: 'mpesa',
  description: 'Processing fee payment'
})

// 3. Redirect user to payment page
window.location.href = paymentPage.paymentUrl
```

### **Loan Repayment Flow**
```typescript
// 1. User wants to repay loan
const repaymentRequest = {
  loanId: loan.id,
  userId: user.id,
  amount: loan.outstandingBalance,
  phoneNumber: user.phoneNumber,
  paymentMethod: 'mpesa',
  description: 'Loan repayment'
}

// 2. Generate repayment payment page
const paymentPage = await paymentPageService.createPaymentPage(repaymentRequest)

// 3. Send payment URL to user
await sendPaymentNotification(user.email, paymentPage.paymentUrl)
```

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Payment Page Not Loading**
   - Check if payment ID exists
   - Verify payment data in localStorage
   - Check API endpoint responses

2. **Payment Initiation Fails**
   - Verify PesaPal credentials
   - Check phone number format
   - Ensure sufficient balance

3. **Status Updates Not Working**
   - Check payment polling interval
   - Verify PesaPal API responses
   - Check network connectivity

### **Debug Tools**
- Browser developer tools
- Network tab for API calls
- Console logs for errors
- Payment status monitoring

## 📚 **API Reference**

### **Payment Page Service Methods**

```typescript
// Create payment page
createPaymentPage(request: PaymentPageRequest): Promise<PaymentPageResponse>

// Initiate payment
initiatePayment(paymentId: string): Promise<PaymentPageResponse>

// Get payment status
getPaymentStatus(paymentId: string): Promise<PaymentPageData | null>

// Get user payments
getUserPaymentPages(userId: string): Promise<PaymentPageData[]>

// Clean up expired payments
cleanupExpiredPayments(): Promise<void>
```

### **Payment Page Generator Methods**

```typescript
// Generate payment page URL
generatePaymentPageUrl(paymentData: PaymentPageData): string

// Generate payment page HTML
generatePaymentPageHTML(paymentData: PaymentPageData): string
```

## 🎯 **Best Practices**

### **Payment Page Design**
- Keep payment pages simple and focused
- Use clear call-to-action buttons
- Provide clear payment instructions
- Show payment progress
- Handle errors gracefully

### **Security**
- Validate all payment data
- Use secure payment URLs
- Implement payment expiration
- Monitor for suspicious activity
- Encrypt sensitive data

### **User Experience**
- Optimize for mobile devices
- Provide clear feedback
- Handle payment failures gracefully
- Offer multiple payment methods
- Show payment status clearly

---

**Your PesaPal Payment Page Generation System is now fully implemented and ready for production use!** 🎉

Each payment will have its own unique, secure page that customers can use to complete their transactions with PesaPal.
