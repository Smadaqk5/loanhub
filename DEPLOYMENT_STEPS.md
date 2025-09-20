# 🚀 Loan Hub - Netlify Deployment Guide

## 📋 **Prerequisites**

1. **GitHub Account** - You need a GitHub account
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Git Installed** - Make sure Git is installed on your computer

## 🎯 **Deployment Options**

### **Option 1: Deploy via GitHub (Recommended)**

#### **Step 1: Push to GitHub**

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Loan Hub ready for deployment"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it: `loan-hub-kenya`
   - Make it **Public** (for free Netlify hosting)
   - Don't initialize with README (we already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/loan-hub-kenya.git
   git branch -M main
   git push -u origin main
   ```

#### **Step 2: Deploy to Netlify**

1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign in with your GitHub account
   - Click "New site from Git"
   - Choose "GitHub" as your Git provider
   - Select your `loan-hub-kenya` repository

2. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

3. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add these variables:
     ```
     NEXT_PUBLIC_PESAPAL_BASE_URL=https://pay.pesapal.com/v3/api
     NEXT_PUBLIC_PESAPAL_CONSUMER_KEY=your_production_consumer_key
     PESAPAL_CONSUMER_SECRET=your_production_consumer_secret
     NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
     ```

4. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete (5-10 minutes)
   - Your site will be live at `https://your-site-name.netlify.app`

---

### **Option 2: Deploy via Netlify CLI**

#### **Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

#### **Step 2: Login to Netlify**
```bash
netlify login
```

#### **Step 3: Deploy**
```bash
netlify deploy --prod --dir=.next
```

---

### **Option 3: Drag & Drop Deployment**

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Zip the .next folder**:
   - Navigate to your project folder
   - Zip the `.next` folder
   - Also include `netlify.toml` and `netlify/` folder

3. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your zip file to the deploy area
   - Your site will be live immediately

---

## 🔧 **Post-Deployment Configuration**

### **1. Set Up Custom Domain (Optional)**
- Go to Site settings → Domain management
- Add your custom domain
- Configure DNS settings as instructed

### **2. Configure Environment Variables**
- Go to Site settings → Environment variables
- Add production Pesapal credentials:
  ```
  NEXT_PUBLIC_PESAPAL_BASE_URL=https://pay.pesapal.com/v3/api
  NEXT_PUBLIC_PESAPAL_CONSUMER_KEY=your_production_key
  PESAPAL_CONSUMER_SECRET=your_production_secret
  NEXT_PUBLIC_SITE_URL=https://your-domain.com
  ```

### **3. Test Payment Integration**
- Visit your deployed site
- Test the STK Push functionality
- Verify Pesapal callbacks are working

### **4. Set Up Monitoring**
- Enable Netlify Analytics
- Set up error tracking
- Monitor performance metrics

---

## 🚨 **Important Notes**

### **Security**
- ✅ Never commit sensitive credentials to Git
- ✅ Use Netlify Environment Variables for secrets
- ✅ Enable HTTPS (automatic with Netlify)
- ✅ Configure proper CORS settings

### **Performance**
- ✅ Static files are automatically cached
- ✅ Images are optimized
- ✅ Code is minified and compressed
- ✅ CDN is enabled globally

### **Pesapal Integration**
- ✅ Callback URLs are configured
- ✅ IPN endpoints are set up
- ✅ Environment variables are properly set
- ✅ Production API endpoints are used

---

## 🎉 **Your Site is Live!**

Once deployed, your Loan Hub will be available at:
- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

### **Test Your Deployment**
1. Visit your live site
2. Test user registration/login
3. Test loan application flow
4. Test STK Push payments
5. Test admin dashboard

### **Quick Access Credentials**
- **Admin**: `admin@loanhubkenya.com` / `Admin123!`
- **User**: `mary.wanjiku@email.com` / `Password123!`

---

## 🔄 **Updating Your Site**

### **Automatic Updates (GitHub Integration)**
- Push changes to your GitHub repository
- Netlify will automatically rebuild and deploy
- Updates go live in 2-5 minutes

### **Manual Updates**
- Make changes locally
- Run `npm run build`
- Deploy the new `.next` folder

---

## 📞 **Support**

If you encounter any issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test locally first
4. Contact Netlify support if needed

**Happy Deploying! 🚀**
