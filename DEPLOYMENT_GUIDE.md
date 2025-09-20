# 🚀 LoanHub Kenya - Complete Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **Required Accounts & Services**
- [ ] **Netlify Account** - [Sign up here](https://app.netlify.com/signup)
- [ ] **GitHub Account** - [Sign up here](https://github.com/signup)
- [ ] **Pesapal Account** - [Sign up here](https://developer.pesapal.com/)
- [ ] **Domain Name** (optional) - For custom domain

### ✅ **Development Environment**
- [ ] **Node.js 18+** installed
- [ ] **Git** installed
- [ ] **Code editor** (VS Code recommended)

---

## 🛠️ **Step 1: Prepare Your Code**

### **1.1 Clean Up for Production**
```bash
# Remove test files and development data
rm -rf src/app/test-*
rm -rf src/app/admin/create-admin
rm -rf src/app/admin/manage-admins

# Remove console.log statements (optional)
# You can use a tool like 'strip-console' for this
```

### **1.2 Update Environment Variables**
```bash
# Copy the example file
cp env.production.example .env.production

# Edit with your production values
# Use a secure text editor
```

### **1.3 Test Production Build**
```bash
# Install dependencies
npm install

# Test the build
npm run build

# Test locally
npm run start
```

---

## 🌐 **Step 2: Deploy to Netlify**

### **Method 1: Automatic Deployment (Recommended)**

#### **2.1 Push to GitHub**
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Production ready"

# Add GitHub remote
git remote add origin https://github.com/yourusername/loan-hub.git

# Push to GitHub
git push -u origin main
```

#### **2.2 Connect to Netlify**
1. **Go to [Netlify](https://app.netlify.com/)**
2. **Click "New site from Git"**
3. **Choose "GitHub"**
4. **Select your repository**
5. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
   - **Node version:** `18`

#### **2.3 Set Environment Variables**
In Netlify dashboard, go to **Site settings > Environment variables**:

```bash
# Required Variables
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
NEXT_PUBLIC_PESAPAL_BASE_URL=https://pay.pesapal.com/v3/api
NEXT_PUBLIC_PESAPAL_CONSUMER_KEY=your_production_key
PESAPAL_CONSUMER_SECRET=your_production_secret

# Optional Variables
NEXT_PUBLIC_APP_NAME=LoanHub Kenya
NEXT_PUBLIC_APP_DESCRIPTION=Secure Loan Lending Platform
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### **Method 2: Manual Deployment**

#### **2.1 Install Netlify CLI**
```bash
npm install -g netlify-cli
```

#### **2.2 Login to Netlify**
```bash
netlify login
```

#### **2.3 Deploy**
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

---

## 🔧 **Step 3: Configure Pesapal Integration**

### **3.1 Get Production Credentials**
1. **Login to [Pesapal Developer Portal](https://developer.pesapal.com/)**
2. **Create a new application**
3. **Get your Consumer Key and Secret**
4. **Set up webhook URLs:**
   - **Callback URL:** `https://your-site.netlify.app/pesapal/callback`
   - **IPN URL:** `https://your-site.netlify.app/pesapal/ipn`

### **3.2 Test Payment Integration**
1. **Use test credentials first**
2. **Test with small amounts**
3. **Verify webhook callbacks**
4. **Switch to production credentials**

---

## 🔒 **Step 4: Security Configuration**

### **4.1 Set Up Security Headers**
The `netlify.toml` file already includes security headers:
- **X-Frame-Options:** DENY
- **X-XSS-Protection:** 1; mode=block
- **Content-Security-Policy:** Restrictive policy
- **HTTPS:** Automatically enabled by Netlify

### **4.2 Environment Variables Security**
- ✅ **Never commit** `.env` files to Git
- ✅ **Use Netlify's** environment variable system
- ✅ **Rotate secrets** regularly
- ✅ **Use different keys** for development and production

---

## 📱 **Step 5: Domain & SSL Setup**

### **5.1 Custom Domain (Optional)**
1. **In Netlify dashboard:**
   - Go to **Domain settings**
   - Click **Add custom domain**
   - Enter your domain name
   - Follow DNS configuration instructions

### **5.2 SSL Certificate**
- ✅ **Automatically provided** by Netlify
- ✅ **Free Let's Encrypt** certificates
- ✅ **Automatic renewal**

---

## 🧪 **Step 6: Testing & Validation**

### **6.1 Functional Testing**
- [ ] **Homepage loads** correctly
- [ ] **User registration** works
- [ ] **Loan application** process works
- [ ] **Payment integration** functions
- [ ] **Admin panel** is accessible
- [ ] **Rate editing** is admin-only

### **6.2 Performance Testing**
- [ ] **Page load times** < 3 seconds
- [ ] **Mobile responsiveness** works
- [ ] **Cross-browser compatibility**
- [ ] **SSL certificate** is valid

### **6.3 Security Testing**
- [ ] **HTTPS** is enforced
- [ ] **Admin routes** are protected
- [ ] **Rate editing** is restricted
- [ ] **Environment variables** are secure

---

## 📊 **Step 7: Monitoring & Analytics**

### **7.1 Netlify Analytics**
- **Enable** in Netlify dashboard
- **Monitor** site performance
- **Track** visitor statistics

### **7.2 Error Monitoring**
- **Set up** error tracking (optional)
- **Monitor** payment failures
- **Track** user issues

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### **Environment Variables Not Working**
- ✅ **Check** variable names (case-sensitive)
- ✅ **Verify** they're set in Netlify dashboard
- ✅ **Redeploy** after adding variables

#### **Payment Integration Issues**
- ✅ **Verify** Pesapal credentials
- ✅ **Check** webhook URLs
- ✅ **Test** with sandbox first

#### **Admin Access Issues**
- ✅ **Check** user roles in database
- ✅ **Verify** authentication flow
- ✅ **Test** with admin credentials

---

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**
- [ ] **Update dependencies** monthly
- [ ] **Monitor** site performance
- [ ] **Backup** user data
- [ ] **Review** security logs
- [ ] **Test** payment integration

### **Emergency Procedures**
1. **Site down:** Check Netlify status page
2. **Payment issues:** Contact Pesapal support
3. **Security breach:** Change all credentials immediately
4. **Data loss:** Restore from backups

---

## 🎉 **Deployment Complete!**

### **Your Live Application**
- **URL:** `https://your-site-name.netlify.app`
- **Admin Panel:** `https://your-site-name.netlify.app/admin`
- **Status:** ✅ Live and secure

### **Next Steps**
1. **Test** all functionality
2. **Share** with stakeholders
3. **Monitor** for issues
4. **Plan** for scaling

---

## 📚 **Additional Resources**

- **Netlify Documentation:** [docs.netlify.com](https://docs.netlify.com/)
- **Pesapal API Docs:** [developer.pesapal.com](https://developer.pesapal.com/)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Security Best Practices:** [owasp.org](https://owasp.org/)

---

**🎊 Congratulations! Your LoanHub Kenya application is now live and ready to serve customers!**