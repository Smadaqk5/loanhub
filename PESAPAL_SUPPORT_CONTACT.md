# Pesapal Support Contact Template

## 📧 **Email to Pesapal Support**

**To:** support@pesapal.com  
**Subject:** API Integration Issue - Martim Enterprise Credentials  
**Priority:** High - Production Integration Blocked

---

**Dear Pesapal Support Team,**

I am writing to request assistance with API integration for **Martim Enterprise**. We received the following credentials but are unable to authenticate with your API system.

## 🔑 **Credentials Received:**
- **Consumer Key:** `x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL`
- **Consumer Secret:** `Q9twNwMHt8a03lFfODhnteP9fnY=`
- **Environment:** Sandbox/Testing (please confirm)

## 🚨 **Issues Encountered:**

### **1. Authentication Failures**
- All API endpoints return **404 Not Found** errors
- `/Auth/RequestToken` endpoint not responding
- Multiple base URLs tested without success

### **2. API Endpoints Tested:**
```
❌ https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken (404)
❌ https://demo.pesapal.com/pesapalv3/api/Auth/RequestToken (SSL expired)
❌ https://api.pesapal.com/pesapalv3/api/Auth/RequestToken (302 redirect)
```

### **3. Error Responses:**
- **404:** "The resource cannot be found"
- **500:** "Runtime Error" 
- **SSL:** Certificate expired on demo.pesapal.com
- **302:** Redirects to notfound pages

## 🔧 **Requested Assistance:**

### **1. Account Verification**
- [ ] Confirm account activation status
- [ ] Verify API access permissions
- [ ] Check for any pending approvals
- [ ] Confirm sandbox vs production environment

### **2. API Documentation**
- [ ] Provide correct API endpoints for authentication
- [ ] Share latest API v3 documentation
- [ ] Confirm authentication method (OAuth 1.0a vs OAuth 2.0)
- [ ] Provide working example requests

### **3. Technical Support**
- [ ] Test credentials on your end
- [ ] Provide working base URL
- [ ] Confirm request format and headers
- [ ] Share sample authentication code

## 📋 **Integration Details:**

### **Application Information:**
- **Platform:** Next.js web application
- **Deployment:** Netlify hosting
- **Payment Methods:** M-Pesa, Airtel Money, Equitel
- **Integration Type:** STK Push + URL-based payments

### **Current Implementation:**
```javascript
// Current authentication attempt
const response = await fetch(`${baseUrl}/Auth/RequestToken`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    consumer_key: 'k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx',
    consumer_secret: 'Tjg4VodFyn1ur9aDMo1fsJvgHQQ='
  })
});
```

## ⏰ **Urgency:**
This is blocking our production deployment. We need to:
1. Complete integration testing
2. Deploy to production
3. Begin processing real payments
4. Meet client requirements

## 📞 **Contact Information:**
- **Company:** Martim Enterprise
- **Project:** Loan Hub Payment Integration
- **Timeline:** Immediate resolution needed
- **Follow-up:** Please provide timeline for resolution

## 📎 **Attachments:**
- Diagnostic report
- Test results documentation
- Error logs and responses

**Thank you for your prompt assistance. Please let me know if you need any additional information.**

**Best regards,**  
**Development Team**  
**Martim Enterprise**

---

## 📋 **Follow-up Actions:**

### **After Sending Email:**
1. **Monitor email** for response (check spam folder)
2. **Follow up** if no response within 24 hours
3. **Document** any responses received
4. **Update integration** based on support feedback
5. **Test** new endpoints provided
6. **Deploy** once integration is working

### **Alternative Contact Methods:**
- **Phone:** Check Pesapal website for support number
- **Live Chat:** Available on Pesapal website
- **Developer Community:** https://developer.pesapal.com/
- **Documentation:** https://developer.pesapal.com/integration

### **Backup Plan:**
If Pesapal support is slow, consider:
1. **Alternative payment providers** (M-Pesa Direct, Flutterwave)
2. **Manual payment processing** temporarily
3. **Escalation** to Pesapal management
4. **Legal review** of contract terms
