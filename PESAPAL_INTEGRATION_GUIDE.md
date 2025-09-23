# Pesapal Integration Guide

## 🔑 **New Pesapal Credentials**

You have received new Pesapal API credentials for Martim Enterprise:

- **Consumer Key:** `k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx`
- **Consumer Secret:** `Tjg4VodFyn1ur9aDMo1fsJvgHQQ=`
- **API Base URL:** `https://cybqa.pesapal.com/pesapalv3/api`

## 🚀 **Environment Variables Setup**

### **Local Development (.env.local)**
Create a `.env.local` file in your project root:

```bash
# Pesapal API Configuration
PESAPAL_CONSUMER_KEY=k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx
PESAPAL_CONSUMER_SECRET=Tjg4VodFyn1ur9aDMo1fsJvgHQQ=

# Pesapal API URLs
NEXT_PUBLIC_PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Production Environment (Netlify)**
Add these environment variables in your Netlify dashboard:

1. Go to **Site Settings** → **Environment Variables**
2. Add the following variables:

```
PESAPAL_CONSUMER_KEY = k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx
PESAPAL_CONSUMER_SECRET = Tjg4VodFyn1ur9aDMo1fsJvgHQQ=
NEXT_PUBLIC_PESAPAL_BASE_URL = https://cybqa.pesapal.com/pesapalv3/api
PESAPAL_BASE_URL = https://cybqa.pesapal.com/pesapalv3/api
```

## 🔧 **Updated Services**

The following services have been updated with the new credentials:

### **1. STK Push Service (`pesapal-service-prod.ts`)**
- ✅ Updated with new credentials
- ✅ Uses environment variables with fallback
- ✅ Supports direct STK push initiation

### **2. URL Payment Service (`pesapal-url-service.ts`)**
- ✅ Updated with new credentials
- ✅ Uses environment variables with fallback
- ✅ Supports payment URL generation

### **3. Enhanced Services**
- ✅ `pesapal-service-enhanced.ts` - Enhanced STK push with retry logic
- ✅ `pesapal-service-mock.ts` - Mock service for development
- ✅ `pesapal-service-mock-enhanced.ts` - Enhanced mock service

## 🧪 **Testing the Integration**

### **1. Test STK Push**
```javascript
// Test STK push payment
const pesapalService = new ProductionPesapalService()
const result = await pesapalService.initiateSTKPush({
  loanId: 'LOAN123',
  userId: 'USER123',
  amount: 1000,
  phoneNumber: '+254700000000',
  paymentMethod: 'mpesa',
  description: 'Loan processing fee'
})
```

### **2. Test URL Payment**
```javascript
// Test URL-based payment
const urlService = new PesapalURLService()
const result = await urlService.createPaymentURL({
  loanId: 'LOAN123',
  userId: 'USER123',
  amount: 1000,
  phoneNumber: '+254700000000',
  paymentMethod: 'mpesa',
  description: 'Loan processing fee'
})
```

## 📱 **Payment Methods Supported**

- ✅ **M-Pesa** - Safaricom mobile money
- ✅ **Airtel Money** - Airtel mobile money
- ✅ **Equitel** - Equity Bank mobile money

## 🔒 **Security Notes**

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Keep credentials secure** and only share with trusted parties
4. **Monitor API usage** for any suspicious activity

## 📋 **Required Contract**

⚠️ **Important:** Ensure you have signed a contract with Pesapal before commencing operations, as this is required before any settlement is done.

## 🆘 **Support**

If you have any questions:
- **Pesapal Support:** Contact through their official channels
- **Documentation:** Check Pesapal API documentation
- **Testing:** Use sandbox environment for testing

## 🚀 **Deployment Checklist**

- [ ] Environment variables configured
- [ ] Credentials tested in sandbox
- [ ] STK push functionality verified
- [ ] URL payment functionality verified
- [ ] Production deployment tested
- [ ] Contract signed with Pesapal
- [ ] Settlement process understood

## 📊 **Monitoring**

Monitor your integration for:
- ✅ Successful payment processing
- ✅ Failed payment handling
- ✅ API rate limits
- ✅ Settlement reports
- ✅ Error logging and debugging

Your Pesapal integration is now ready with the new Martim Enterprise credentials!
