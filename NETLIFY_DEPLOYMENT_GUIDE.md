# Netlify Deployment Guide for STK Push Payment System

## 🚀 Quick Deployment Steps

### 1. Connect to Netlify

1. **Go to Netlify**: https://app.netlify.com/
2. **Click "New site from Git"**
3. **Connect GitHub** and select your repository: `Smadaqk5/loanhub`
4. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

### 2. Environment Variables

Add these environment variables in Netlify dashboard:

#### Required Variables:
```bash
# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your_secure_random_string_here
NEXTAUTH_URL=https://your-site-name.netlify.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Production Environment
NODE_ENV=production
```

#### For Real STK Push (Optional):
```bash
# PesaPal Production Credentials
PESAPAL_CONSUMER_KEY=your_real_consumer_key
PESAPAL_CONSUMER_SECRET=your_real_consumer_secret
PESAPAL_PASS_KEY=your_real_pass_key
PESAPAL_SHORT_CODE=your_real_short_code
PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api
```

### 3. Deploy

1. **Click "Deploy site"**
2. **Wait for build to complete** (usually 2-3 minutes)
3. **Your site will be live** at `https://your-site-name.netlify.app`

## 🔧 Configuration Details

### Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: `18`
- **Environment**: `production`

### Domain Configuration
- **Custom Domain**: Optional (you can add your own domain)
- **SSL**: Automatically enabled by Netlify
- **HTTPS**: Required for PesaPal production

### API Routes
- **Payment API**: `/api/payments`
- **PesaPal API**: `/api/pesapal/*`
- **Callback URL**: `https://your-site.netlify.app/api/payments/callback`

## 🧪 Testing After Deployment

### 1. Test Basic Functionality
1. **Visit your site**: `https://your-site-name.netlify.app`
2. **Go to payment demo**: `/payment-demo`
3. **Check service mode**: Should show "Development Mode" (mock payments)

### 2. Test Real STK Push (Optional)
1. **Add PesaPal credentials** to environment variables
2. **Redeploy** the site
3. **Test with your phone number** and small amount
4. **Verify STK Push** is received

### 3. Test Payment Flow
1. **Create a payment** with small amount
2. **Check status updates** in real-time
3. **Verify callbacks** are working
4. **Test error handling**

## 🔒 Security Considerations

### Environment Variables
- ✅ **Never commit** `.env.local` to Git
- ✅ **Use Netlify dashboard** for environment variables
- ✅ **Rotate credentials** regularly
- ✅ **Use strong secrets** for NEXTAUTH_SECRET

### HTTPS Requirements
- ✅ **SSL enabled** by default on Netlify
- ✅ **HTTPS required** for PesaPal production
- ✅ **Secure headers** configured in netlify.toml

### API Security
- ✅ **CORS configured** properly
- ✅ **Rate limiting** recommended
- ✅ **Input validation** implemented
- ✅ **Error handling** secure

## 📱 PesaPal Configuration

### Callback URL
Set this in your PesaPal merchant dashboard:
```
https://your-site-name.netlify.app/api/payments/callback
```

### Webhook URL (Optional)
For real-time notifications:
```
https://your-site-name.netlify.app/api/payments/webhook
```

### Test Credentials
For testing, use PesaPal sandbox:
- **Base URL**: `https://cybqa.pesapal.com/pesapalapi/api`
- **Test credentials** from PesaPal dashboard

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
- **Check Node version**: Must be 18+
- **Check dependencies**: All packages installed
- **Check environment variables**: Required vars set

#### API Routes Not Working
- **Check redirects**: API routes properly configured
- **Check functions**: Netlify Functions enabled
- **Check logs**: Monitor function execution

#### Payment Issues
- **Check credentials**: PesaPal credentials valid
- **Check callback URL**: Properly configured
- **Check phone format**: Use +254 format
- **Check amount**: Minimum amount requirements

### Debug Steps
1. **Check Netlify logs** for build errors
2. **Check function logs** for API errors
3. **Test locally** with same environment
4. **Verify credentials** in PesaPal dashboard
5. **Check network requests** in browser dev tools

## 📊 Monitoring

### Netlify Analytics
- **Site visits** and performance
- **Function execution** logs
- **Error rates** and debugging
- **Build status** and history

### Payment Monitoring
- **Payment success rates**
- **Error patterns**
- **Callback processing**
- **User experience**

## 🔄 Updates and Maintenance

### Deploying Updates
1. **Push changes** to GitHub
2. **Netlify auto-deploys** from main branch
3. **Monitor build** and deployment
4. **Test functionality** after deployment

### Environment Updates
1. **Update variables** in Netlify dashboard
2. **Redeploy** if needed
3. **Test changes** thoroughly
4. **Monitor logs** for issues

---

## 🎯 Quick Checklist

- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Site deployed successfully
- [ ] Payment demo accessible
- [ ] API routes working
- [ ] PesaPal credentials configured (optional)
- [ ] Callback URL set in PesaPal dashboard
- [ ] SSL certificate active
- [ ] Domain configured (optional)

Your STK Push payment system is now ready for production! 🚀