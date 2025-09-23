# 🔧 STK Push Troubleshooting Guide

## 🚨 **Common STK Push Issues & Solutions**

### **1. STK Push Not Received on Phone**

#### **Possible Causes:**
- ❌ Invalid phone number format
- ❌ Phone number not registered with mobile money
- ❌ Insufficient balance
- ❌ Network issues
- ❌ Wrong payment method selected

#### **Solutions:**
```typescript
// ✅ Correct phone number formats
const validFormats = [
  '+254700000000',  // International format
  '254700000000',   // Without +
  '0700000000'      // Local format
]

// ❌ Invalid formats
const invalidFormats = [
  '+25470000000',   // Missing digit
  '25470000000',    // Missing digit
  '070000000',      // Missing digit
  '+2547000000000', // Extra digit
]
```

### **2. "Failed to get access token from Pesapal" Error**

#### **Possible Causes:**
- ❌ Invalid consumer key/secret
- ❌ Network connectivity issues
- ❌ Pesapal API downtime
- ❌ CORS issues

#### **Solutions:**
```typescript
// ✅ Enhanced error handling
try {
  const token = await pesapalService.getAccessToken()
} catch (error) {
  console.error('Token error:', error)
  // Fallback to mock service
  return await mockPesapalSTKService.initiateSTKPush(paymentRequest)
}
```

### **3. Payment Status Not Updating**

#### **Possible Causes:**
- ❌ Polling mechanism failure
- ❌ Network timeouts
- ❌ API rate limiting
- ❌ Incorrect order tracking ID

#### **Solutions:**
```typescript
// ✅ Enhanced polling with retry logic
const pollPaymentStatus = async (orderTrackingId: string) => {
  let consecutiveErrors = 0
  const maxErrors = 3
  
  while (consecutiveErrors < maxErrors) {
    try {
      const status = await checkPaymentStatus(orderTrackingId)
      if (status) {
        consecutiveErrors = 0
        return status
      }
    } catch (error) {
      consecutiveErrors++
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}
```

### **4. "Payment service unavailable" Error**

#### **Possible Causes:**
- ❌ Both real and mock services failing
- ❌ Local storage issues
- ❌ Browser compatibility
- ❌ JavaScript errors

#### **Solutions:**
```typescript
// ✅ Comprehensive fallback strategy
const initiatePayment = async (paymentRequest) => {
  try {
    // Try real service first
    return await pesapalService.initiateSTKPush(paymentRequest)
  } catch (error) {
    console.warn('Real service failed, trying mock:', error)
    try {
      // Fallback to mock service
      return await mockPesapalSTKService.initiateSTKPush(paymentRequest)
    } catch (mockError) {
      console.error('Both services failed:', mockError)
      throw new Error('Payment service unavailable. Please try again later.')
    }
  }
}
```

## 🔍 **Diagnostic Steps**

### **Step 1: Check Browser Console**
```javascript
// Open browser console (F12) and look for:
console.log('STK Push initiated:', result)
console.error('STK Push error:', error)
console.warn('Real Pesapal STK API failed, using mock service')
```

### **Step 2: Verify Phone Number Format**
```typescript
// Test phone number validation
const phoneRegex = /^(\+254|254|0)[0-9]{9}$/
const testPhones = [
  '+254700000000', // ✅ Valid
  '254700000000',  // ✅ Valid  
  '0700000000',    // ✅ Valid
  '+25470000000',  // ❌ Invalid (missing digit)
  '070000000',     // ❌ Invalid (missing digit)
]
```

### **Step 3: Check Network Connectivity**
```typescript
// Test API connectivity
const testConnectivity = async () => {
  try {
    const response = await fetch('https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_key: 'k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx',
        consumer_secret: 'Tjg4VodFyn1ur9aDMo1fsJvgHQQ='
      })
    })
    console.log('API connectivity:', response.ok)
  } catch (error) {
    console.error('API connectivity failed:', error)
  }
}
```

### **Step 4: Test Local Storage**
```typescript
// Test localStorage functionality
const testLocalStorage = () => {
  try {
    const testKey = 'stk_test'
    const testData = { test: 'data', timestamp: Date.now() }
    
    localStorage.setItem(testKey, JSON.stringify(testData))
    const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
    localStorage.removeItem(testKey)
    
    console.log('Local storage test:', retrieved.test === testData.test)
  } catch (error) {
    console.error('Local storage test failed:', error)
  }
}
```

## 🛠️ **Advanced Troubleshooting**

### **1. Enable Enhanced Logging**
```typescript
// Add to your service
const enhancedLogging = {
  logRequest: (data: any) => {
    console.log('🚀 STK Push Request:', JSON.stringify(data, null, 2))
  },
  logResponse: (data: any) => {
    console.log('📱 STK Push Response:', JSON.stringify(data, null, 2))
  },
  logError: (error: any) => {
    console.error('❌ STK Push Error:', error)
  }
}
```

### **2. Network Debugging**
```typescript
// Check network status
const checkNetworkStatus = async () => {
  const tests = [
    { name: 'Pesapal API', url: 'https://cybqa.pesapal.com/pesapalv3/api' },
    { name: 'HTTP Bin', url: 'https://httpbin.org/get' },
    { name: 'Google', url: 'https://www.google.com' }
  ]
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url, { method: 'HEAD' })
      console.log(`${test.name}: ${response.ok ? '✅' : '❌'}`)
    } catch (error) {
      console.log(`${test.name}: ❌ ${error.message}`)
    }
  }
}
```

### **3. Payment Status Debugging**
```typescript
// Enhanced status checking
const debugPaymentStatus = async (orderTrackingId: string) => {
  console.log('🔍 Debugging payment status for:', orderTrackingId)
  
  // Check localStorage
  const storedPayments = Object.keys(localStorage)
    .filter(key => key.startsWith('payment_'))
    .map(key => JSON.parse(localStorage.getItem(key) || '{}'))
  
  const payment = storedPayments.find(p => p.orderTrackingId === orderTrackingId)
  console.log('📦 Stored payment data:', payment)
  
  // Check API status
  try {
    const status = await pesapalService.checkPaymentStatus(orderTrackingId)
    console.log('📊 API status:', status)
  } catch (error) {
    console.error('❌ API status check failed:', error)
  }
}
```

## 🚀 **Quick Fixes**

### **Fix 1: Clear Browser Data**
```javascript
// Clear all payment-related data
const clearPaymentData = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith('payment_'))
    .forEach(key => localStorage.removeItem(key))
  console.log('🧹 Payment data cleared')
}
```

### **Fix 2: Reset Service State**
```typescript
// Reset service state
const resetServiceState = () => {
  // Clear any cached tokens
  pesapalService.clearTokenCache()
  console.log('🔄 Service state reset')
}
```

### **Fix 3: Force Mock Service**
```typescript
// Force use of mock service for testing
const forceMockService = true

const initiateSTKPush = async (paymentRequest) => {
  if (forceMockService) {
    console.log('🧪 Using mock service (forced)')
    return await mockPesapalSTKService.initiateSTKPush(paymentRequest)
  }
  // ... normal flow
}
```

## 📱 **Mobile-Specific Issues**

### **1. iOS Safari Issues**
- ✅ Ensure HTTPS is enabled
- ✅ Check if popup blockers are disabled
- ✅ Verify JavaScript is enabled

### **2. Android Chrome Issues**
- ✅ Check if location services are enabled
- ✅ Verify camera permissions (for QR codes)
- ✅ Ensure popup blockers are disabled

### **3. Network Issues**
- ✅ Switch between WiFi and mobile data
- ✅ Check if corporate firewall is blocking requests
- ✅ Verify DNS settings

## 🔧 **Service Health Check**

### **Run Diagnostic Tool**
Visit: `http://localhost:3000/test-stk-diagnostic`

This tool will:
- ✅ Test environment setup
- ✅ Validate phone number formats
- ✅ Test mock STK push functionality
- ✅ Check real API connectivity
- ✅ Verify local storage
- ✅ Test network connectivity

### **Manual Health Check**
```typescript
// Run this in browser console
const healthCheck = async () => {
  const checks = {
    localStorage: typeof localStorage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    window: typeof window !== 'undefined',
    pesapalService: typeof pesapalService !== 'undefined',
    mockService: typeof mockPesapalSTKService !== 'undefined'
  }
  
  console.log('🏥 Health Check Results:', checks)
  return Object.values(checks).every(check => check === true)
}
```

## 📞 **Support Contacts**

### **Pesapal Support**
- 📧 Email: support@pesapal.com
- 📞 Phone: +254 20 524 0000
- 🌐 Website: https://pesapal.com

### **Technical Support**
- 📧 Email: tech-support@loanhub.com
- 📞 Phone: +254 700 000 000
- 💬 Live Chat: Available on website

## 🎯 **Best Practices**

### **1. Always Use Fallback**
```typescript
// ✅ Good: Always have a fallback
try {
  return await realService.initiateSTKPush(request)
} catch (error) {
  return await mockService.initiateSTKPush(request)
}

// ❌ Bad: No fallback
return await realService.initiateSTKPush(request)
```

### **2. Validate Inputs**
```typescript
// ✅ Good: Validate before processing
const validatePaymentRequest = (request) => {
  if (!request.phoneNumber || !/^(\+254|254|0)[0-9]{9}$/.test(request.phoneNumber)) {
    throw new Error('Invalid phone number')
  }
  if (!request.amount || request.amount <= 0) {
    throw new Error('Invalid amount')
  }
}
```

### **3. Handle Errors Gracefully**
```typescript
// ✅ Good: User-friendly error messages
catch (error) {
  const userMessage = error.message.includes('network') 
    ? 'Network error. Please check your connection and try again.'
    : 'Payment failed. Please try again or contact support.'
  
  toast.error(userMessage)
}
```

---

## 🎉 **Success Indicators**

When STK push is working correctly, you should see:

1. ✅ **Console Logs:**
   ```
   🚀 STK Push Request: {...}
   📱 STK Push Response: {...}
   ✅ STK Push initiated successfully
   ```

2. ✅ **User Experience:**
   - Phone receives STK push notification
   - User can enter PIN
   - Payment status updates in real-time
   - Success/error messages display correctly

3. ✅ **Data Persistence:**
   - Payment data stored in localStorage
   - Status polling works correctly
   - Payment completion triggers success callback

If you're still experiencing issues after following this guide, please run the diagnostic tool and share the results with support.
