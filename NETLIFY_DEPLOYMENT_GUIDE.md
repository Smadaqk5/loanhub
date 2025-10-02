# Netlify Deployment Guide

Complete guide to deploy your Loan Hub application to Netlify with PesaPal integration.

## 🚀 Quick Deploy (5 minutes)

### Step 1: Connect to Netlify
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Select your `loan-hub` repository

### Step 2: Configure Build Settings
```yaml
Build command: npm run build:netlify
Publish directory: .next
```

### Step 3: Set Environment Variables
Go to Site Settings > Environment Variables and add:

```env
NODE_ENV=production
PESAPAL_CONSUMER_KEY=your_production_consumer_key
PESAPAL_CONSUMER_SECRET=your_production_consumer_secret
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your_secure_random_string
NEXTAUTH_URL=https://your-site-name.netlify.app
```

### Step 4: Deploy
Click "Deploy site" and wait for the build to complete.

## 📋 Detailed Steps

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Netlify Site Configuration

#### Build Settings
- **Build command**: `npm run build:netlify`
- **Publish directory**: `.next`
- **Node version**: `18` (or latest)

#### Environment Variables
Set these in Netlify Dashboard > Site Settings > Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PESAPAL_CONSUMER_KEY` | `your_key` | PesaPal API key |
| `PESAPAL_CONSUMER_SECRET` | `your_secret` | PesaPal API secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-site.netlify.app` | Your Netlify URL |
| `NEXTAUTH_SECRET` | `random_string` | Secure random string |
| `NEXTAUTH_URL` | `https://your-site.netlify.app` | Same as APP_URL |

### 3. Domain Configuration

#### Custom Domain (Optional)
1. Go to Site Settings > Domain Management
2. Add your custom domain
3. Update environment variables with new domain
4. Configure DNS as instructed

#### SSL Certificate
- Automatically provided by Netlify
- HTTPS is required for PesaPal production

### 4. Webhook Configuration

Update PesaPal webhook URLs:
- **Callback URL**: `https://your-site.netlify.app/payment/callback`
- **IPN URL**: `https://your-site.netlify.app/api/pesapal/ipn`

## 🔧 Netlify Configuration Files

### netlify.toml
```toml
[build]
  command = "npm run build:netlify"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

### _redirects
```
/api/* /.netlify/functions/:splat 200
/* /index.html 200
```

## 🧪 Testing Your Deployment

### 1. Check Build Logs
- Go to Deploys tab
- Check build logs for errors
- Ensure "Build completed successfully"

### 2. Test Payment Flow
1. Visit your Netlify site
2. Go to `/generate-payment`
3. Create a test payment
4. Verify it works (no mock service messages)

### 3. Monitor Function Logs
- Go to Functions tab
- Check API route logs
- Monitor payment initiation

## 🚨 Troubleshooting

### Build Failures
```bash
# Check build locally
npm run build:netlify

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues
```

### Function Errors
- Check Netlify Functions logs
- Verify API routes are working
- Test endpoints individually

### PesaPal Integration Issues
- Verify credentials are correct
- Check webhook URLs
- Ensure HTTPS is enabled
- Test with small amounts first

## 📊 Monitoring

### Netlify Analytics
- Enable Netlify Analytics
- Monitor site performance
- Track user behavior

### Function Monitoring
- Monitor API call success rates
- Track payment completion rates
- Set up alerts for failures

## 🔄 Continuous Deployment

### Automatic Deploys
- Push to main branch triggers deploy
- Preview deploys for pull requests
- Rollback to previous deployments

### Environment Management
- Use Netlify's environment variable system
- Different values for different branches
- Secure credential management

## 🆘 Support Resources

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Next.js on Netlify**: [docs.netlify.com/integrations/frameworks/nextjs](https://docs.netlify.com/integrations/frameworks/nextjs)
- **PesaPal Support**: [support@pesapal.com](mailto:support@pesapal.com)

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] PesaPal credentials obtained
- [ ] Build tested locally

### Post-Deployment
- [ ] Site loads correctly
- [ ] Payment flow works
- [ ] Webhooks configured
- [ ] SSL certificate active
- [ ] Custom domain (if applicable)

### Monitoring
- [ ] Analytics enabled
- [ ] Error tracking set up
- [ ] Performance monitoring
- [ ] Payment success rates tracked

---

## 🎯 Quick Commands

```bash
# Test build locally
npm run build:netlify

# Check environment
npm run test:production

# Deploy to Netlify
# (Done through Netlify dashboard)
```

Your Loan Hub application is now ready for Netlify deployment! 🚀
