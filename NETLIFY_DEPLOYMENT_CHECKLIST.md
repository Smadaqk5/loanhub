# Netlify Deployment Checklist

Use this checklist to ensure your Loan Hub application deploys successfully to Netlify.

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to GitHub
- [ ] No uncommitted changes
- [ ] Build tested locally (`npm run build:netlify`)
- [ ] No TypeScript errors
- [ ] No linting errors

### Environment Configuration
- [ ] PesaPal production credentials obtained
- [ ] Environment variables documented
- [ ] `.env.production` file created (for reference)
- [ ] All required variables identified

### Netlify Setup
- [ ] Netlify account created
- [ ] GitHub repository accessible
- [ ] Build settings configured
- [ ] Environment variables ready to set

## 🚀 Deployment Steps

### 1. Connect Repository
- [ ] Go to [Netlify Dashboard](https://app.netlify.com)
- [ ] Click "New site from Git"
- [ ] Connect GitHub account
- [ ] Select `loan-hub` repository
- [ ] Choose main branch

### 2. Configure Build Settings
- [ ] Build command: `npm run build:netlify`
- [ ] Publish directory: `.next`
- [ ] Node version: `18`
- [ ] Environment: `production`

### 3. Set Environment Variables
Go to Site Settings > Environment Variables and add:

#### Core Settings
- [ ] `NODE_ENV` = `production`
- [ ] `NEXT_TELEMETRY_DISABLED` = `1`

#### PesaPal Configuration
- [ ] `PESAPAL_CONSUMER_KEY` = `your_production_key`
- [ ] `PESAPAL_CONSUMER_SECRET` = `your_production_secret`
- [ ] `PESAPAL_BASE_URL` = `https://pay.pesapal.com/pesapalapi/api`

#### App URLs
- [ ] `NEXT_PUBLIC_APP_URL` = `https://your-site.netlify.app`
- [ ] `NEXTAUTH_URL` = `https://your-site.netlify.app`
- [ ] `NEXTAUTH_SECRET` = `secure_random_string`

#### Supabase (if using)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `your_supabase_url`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `your_service_key`

### 4. Deploy
- [ ] Click "Deploy site"
- [ ] Monitor build logs
- [ ] Wait for "Build completed successfully"
- [ ] Note the deployment URL

## 🧪 Post-Deployment Testing

### Basic Functionality
- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] No console errors
- [ ] Responsive design works

### Payment Flow Testing
- [ ] Navigate to `/generate-payment`
- [ ] Create a test payment
- [ ] Verify payment page loads
- [ ] Check console for production mode (no mock messages)
- [ ] Test payment initiation

### API Testing
- [ ] API routes respond correctly
- [ ] Payment initiation works
- [ ] Error handling works
- [ ] Webhook endpoints accessible

## 🔧 Configuration Updates

### PesaPal Webhooks
- [ ] Update callback URL: `https://your-site.netlify.app/payment/callback`
- [ ] Update IPN URL: `https://your-site.netlify.app/api/pesapal/ipn`
- [ ] Test webhook delivery

### Custom Domain (Optional)
- [ ] Add custom domain in Netlify
- [ ] Configure DNS settings
- [ ] Update environment variables with new domain
- [ ] Test SSL certificate

## 📊 Monitoring Setup

### Netlify Analytics
- [ ] Enable Netlify Analytics
- [ ] Monitor site performance
- [ ] Track user behavior

### Error Monitoring
- [ ] Check function logs regularly
- [ ] Monitor payment success rates
- [ ] Set up alerts for failures

### Performance Monitoring
- [ ] Monitor build times
- [ ] Track deployment frequency
- [ ] Monitor function execution times

## 🚨 Troubleshooting

### Build Failures
- [ ] Check build logs for errors
- [ ] Verify all dependencies installed
- [ ] Ensure environment variables set
- [ ] Test build locally

### Runtime Errors
- [ ] Check function logs
- [ ] Verify API routes work
- [ ] Test payment flow
- [ ] Check console for errors

### Payment Issues
- [ ] Verify PesaPal credentials
- [ ] Check webhook configuration
- [ ] Test with small amounts
- [ ] Monitor payment status

## ✅ Success Criteria

Your deployment is successful when:

- [ ] Site loads without errors
- [ ] Payment creation works
- [ ] Payment initiation works
- [ ] No mock service messages in console
- [ ] Real PesaPal integration active
- [ ] Webhooks configured and working
- [ ] SSL certificate active
- [ ] Performance is acceptable

## 🔄 Rollback Plan

If issues occur:

- [ ] Identify the problem
- [ ] Check previous deployment
- [ ] Rollback to last working version
- [ ] Fix issues in development
- [ ] Redeploy when ready

## 📞 Support Contacts

- **Netlify Support**: [support.netlify.com](https://support.netlify.com)
- **PesaPal Support**: [support@pesapal.com](mailto:support@pesapal.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## 🎯 Quick Commands

```bash
# Test build locally
npm run build:netlify

# Check environment
npm run test:production

# Run deployment helper
npm run deploy:netlify
```

**Deployment URL**: `https://your-site-name.netlify.app`

**Status**: Ready for deployment! 🚀
