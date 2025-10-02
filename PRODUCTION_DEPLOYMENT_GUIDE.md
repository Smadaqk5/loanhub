# Production Deployment Guide

This guide will help you deploy the Loan Hub application to production with real PesaPal integration.

## Prerequisites

1. **PesaPal Merchant Account**: You need a live PesaPal merchant account
2. **Domain**: A production domain (e.g., your-domain.com)
3. **Hosting Platform**: Netlify, Vercel, or similar

## Step 1: Get PesaPal Production Credentials

1. **Login to PesaPal Merchant Dashboard**
   - Go to [PesaPal Merchant Portal](https://merchant.pesapal.com)
   - Login with your merchant credentials

2. **Get API Credentials**
   - Navigate to "API Settings" or "Integration"
   - Copy your:
     - Consumer Key
     - Consumer Secret
   - Note: These are different from sandbox credentials

3. **Configure Webhooks**
   - Set callback URL: `https://your-domain.com/payment/callback`
   - Set IPN URL: `https://your-domain.com/api/pesapal/ipn`

## Step 2: Environment Configuration

1. **Create Production Environment File**
   ```bash
   cp env.production.template .env.production
   ```

2. **Fill in Production Values**
   ```env
   NODE_ENV=production
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXTAUTH_SECRET=your_secure_random_string
   NEXTAUTH_URL=https://your-domain.com
   
   # PesaPal Production Configuration
   PESAPAL_CONSUMER_KEY=your_production_consumer_key
   PESAPAL_CONSUMER_SECRET=your_production_consumer_secret
   PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api
   ```

## Step 3: Build for Production

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Test Production Build Locally**
   ```bash
   npm start
   ```

## Step 4: Deploy to Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `out` (for static export) or `.next` (for serverless)

3. **Set Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all variables from your `.env.production` file

4. **Deploy**
   - Trigger a new deployment
   - Your site will be available at `https://your-site-name.netlify.app`

## Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Site Settings > Domain Management
   - Add your custom domain
   - Configure DNS settings as instructed

2. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to your custom domain

## Step 6: Test Production Integration

1. **Test Payment Flow**
   - Navigate to your production site
   - Go to `/generate-payment`
   - Create a test payment
   - Verify PesaPal integration works

2. **Monitor Logs**
   - Check Netlify function logs
   - Monitor PesaPal webhook deliveries
   - Verify payment status updates

## Step 7: Security Considerations

1. **Environment Variables**
   - Never commit `.env.production` to version control
   - Use Netlify's environment variable system
   - Rotate secrets regularly

2. **HTTPS**
   - Ensure all URLs use HTTPS
   - PesaPal requires HTTPS for production

3. **Webhook Security**
   - Implement webhook signature verification
   - Validate all incoming webhook data

## Troubleshooting

### Common Issues

1. **PesaPal API Errors**
   - Verify credentials are correct
   - Check API endpoint URLs
   - Ensure HTTPS is enabled

2. **Webhook Failures**
   - Verify webhook URLs are accessible
   - Check webhook signature validation
   - Monitor webhook delivery logs

3. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no trailing spaces

### Debug Mode

To enable debug logging in production:

```env
DEBUG=true
```

This will show detailed logs for troubleshooting.

## Monitoring

1. **Payment Monitoring**
   - Monitor payment success rates
   - Track failed payments
   - Set up alerts for critical failures

2. **Performance Monitoring**
   - Monitor API response times
   - Track error rates
   - Monitor webhook delivery times

## Support

- **PesaPal Support**: [support@pesapal.com](mailto:support@pesapal.com)
- **Documentation**: [PesaPal API Docs](https://developer.pesapal.com)
- **Status Page**: [PesaPal Status](https://status.pesapal.com)

## Rollback Plan

If issues occur in production:

1. **Immediate Rollback**
   - Revert to previous deployment
   - Switch back to mock payments temporarily

2. **Investigation**
   - Check logs for errors
   - Verify PesaPal service status
   - Test with sandbox credentials

3. **Fix and Redeploy**
   - Fix identified issues
   - Test thoroughly
   - Deploy fix

---

## Quick Checklist

- [ ] PesaPal production credentials obtained
- [ ] Environment variables configured
- [ ] Application built successfully
- [ ] Deployed to hosting platform
- [ ] Environment variables set in hosting platform
- [ ] Custom domain configured (if applicable)
- [ ] Payment flow tested
- [ ] Webhooks configured
- [ ] Monitoring set up
- [ ] Security measures implemented
