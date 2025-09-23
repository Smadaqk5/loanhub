# Pesapal Account Verification Checklist

## 🔍 **Account Status Verification**

### **1. Login to Pesapal Dashboard**
- [ ] **Access Dashboard:** https://www.pesapal.com/dashboard
- [ ] **Login Credentials:** Use the email associated with Martim Enterprise
- [ ] **Password:** Ensure you have the correct password
- [ ] **Two-Factor Authentication:** Complete if required

### **2. Account Activation Status**
- [ ] **Account Status:** Check if account is "Active" or "Pending"
- [ ] **Email Verification:** Confirm email address is verified
- [ ] **Phone Verification:** Check if phone number is verified
- [ ] **Document Verification:** Ensure all required documents are uploaded

### **3. API Access Permissions**
- [ ] **API Access:** Verify API access is enabled
- [ ] **Sandbox Access:** Check if sandbox environment is available
- [ ] **Production Access:** Confirm production access status
- [ ] **Rate Limits:** Check API rate limits and quotas

### **4. Credentials Verification**
- [ ] **Consumer Key:** Verify the key matches what we received
- [ ] **Consumer Secret:** Confirm the secret is correct
- [ ] **Environment:** Check if credentials are for sandbox or production
- [ ] **Expiration:** Check if credentials have expiration dates

## 📊 **Dashboard Sections to Check**

### **1. Account Settings**
```
Dashboard → Account Settings
├── Profile Information
├── Contact Details
├── Business Information
└── Verification Status
```

### **2. API Management**
```
Dashboard → API Management
├── API Credentials
├── Webhook Settings
├── IP Whitelist
└── Rate Limits
```

### **3. Payment Settings**
```
Dashboard → Payment Settings
├── Supported Methods
├── Transaction Limits
├── Currency Settings
└── Settlement Options
```

### **4. Integration Status**
```
Dashboard → Integration
├── API Documentation
├── Test Environment
├── Production Environment
└── Support Resources
```

## 🚨 **Common Issues to Check**

### **1. Account Not Fully Activated**
- **Issue:** Account created but not fully verified
- **Solution:** Complete all verification steps
- **Required:** Upload documents, verify email/phone

### **2. API Access Not Enabled**
- **Issue:** Account active but API access disabled
- **Solution:** Enable API access in dashboard
- **Required:** Contact support to enable API access

### **3. Wrong Environment**
- **Issue:** Credentials for wrong environment (sandbox vs production)
- **Solution:** Get correct credentials for your environment
- **Required:** Confirm which environment you need

### **4. Credentials Expired**
- **Issue:** API credentials have expiration dates
- **Solution:** Generate new credentials
- **Required:** Create new consumer key/secret

### **5. IP Restrictions**
- **Issue:** API access restricted to specific IP addresses
- **Solution:** Add your server IP to whitelist
- **Required:** Update IP whitelist in dashboard

## 📋 **Verification Steps**

### **Step 1: Login to Dashboard**
1. Go to https://www.pesapal.com/dashboard
2. Enter Martim Enterprise login credentials
3. Complete any required authentication steps

### **Step 2: Check Account Status**
1. Navigate to "Account Settings"
2. Verify account status is "Active"
3. Check all verification requirements are met
4. Ensure no pending approvals

### **Step 3: Verify API Access**
1. Go to "API Management" section
2. Check if API access is enabled
3. Verify consumer key and secret match
4. Check if there are any restrictions

### **Step 4: Test API Access**
1. Look for "Test API" or "API Testing" section
2. Try to generate a test token
3. Check if there are any error messages
4. Verify the correct API endpoints

### **Step 5: Contact Support if Needed**
1. If account is not fully activated
2. If API access is not enabled
3. If credentials don't match
4. If there are any error messages

## 📞 **Support Contact Information**

### **Pesapal Support Channels:**
- **Email:** support@pesapal.com
- **Phone:** Check website for current number
- **Live Chat:** Available on Pesapal website
- **Documentation:** https://developer.pesapal.com/

### **When Contacting Support:**
1. **Account Email:** Use the email associated with Martim Enterprise
2. **Business Name:** Martim Enterprise
3. **Issue Description:** API authentication failures
4. **Credentials:** Provide the consumer key and secret
5. **Error Messages:** Include any error messages received

## ✅ **Success Criteria**

### **Account Must Be:**
- [ ] **Fully Activated:** All verification steps completed
- [ ] **API Access Enabled:** Can access API endpoints
- [ ] **Credentials Valid:** Consumer key/secret working
- [ ] **Environment Correct:** Sandbox or production as needed
- [ ] **No Restrictions:** IP whitelist and rate limits appropriate

### **Next Steps After Verification:**
1. **Test API Authentication:** Verify token generation works
2. **Test Payment Methods:** Ensure STK push and URL payments work
3. **Update Integration:** Use correct endpoints and methods
4. **Deploy to Production:** Once testing is successful
5. **Monitor Transactions:** Track payment processing

## 📝 **Documentation to Keep**

### **Important Information to Record:**
- **Dashboard Login:** Username and password
- **API Credentials:** Consumer key and secret
- **Environment URLs:** Sandbox and production endpoints
- **Support Contacts:** Email and phone numbers
- **Account Status:** Current verification status
- **API Limits:** Rate limits and quotas
- **Webhook URLs:** For payment notifications

### **Files to Update:**
- **Environment Variables:** Update with correct credentials
- **API Documentation:** Record working endpoints
- **Integration Code:** Update with correct methods
- **Test Scripts:** Update with working endpoints
- **Deployment Config:** Update production settings
