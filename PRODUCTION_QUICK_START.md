# Production Quick Start Guide

Get your Loan Hub application running in production with real PesaPal integration in just a few steps!

## 🚀 Quick Setup (5 minutes)

### Step 1: Get PesaPal Credentials
1. Login to [PesaPal Merchant Portal](https://merchant.pesapal.com)
2. Go to API Settings
3. Copy your **Consumer Key** and **Consumer Secret**

### Step 2: Setup Production Environment
```bash
# Run the production setup script
npm run setup:production

# Edit the generated .env.production file with your actual values
# Replace the placeholder values with your real credentials
```

### Step 3: Configure Environment Variables
Edit `.env.production`:
```env
NODE_ENV=production
PESAPAL_CONSUMER_KEY=your_actual_consumer_key
PESAPAL_CONSUMER_SECRET=your_actual_consumer_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_random_string
```

### Step 4: Test Configuration
```bash
# Test your production configuration
npm run test:production
```

### Step 5: Build for Production
```bash
# Build the application
npm run build:production

# Test the production build locally
npm run start:prod
```

### Step 6: Deploy
Deploy to your hosting platform (Netlify, Vercel, etc.) and set the environment variables.

## 🔧 Available Scripts

- `npm run setup:production` - Setup production configuration
- `npm run test:production` - Test production configuration
- `npm run build:production` - Build for production
- `npm run start:prod` - Start production server locally
- `npm run deploy:check` - Lint and build check

## 📋 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PESAPAL_CONSUMER_KEY` | PesaPal API key | `abc123...` |
| `PESAPAL_CONSUMER_SECRET` | PesaPal API secret | `xyz789...` |
| `NEXT_PUBLIC_APP_URL` | Your domain | `https://your-domain.com` |
| `NEXTAUTH_SECRET` | Random secret string | `random-string-here` |

## 🧪 Testing Production Mode

1. **Local Testing**
   ```bash
   npm run start:prod
   # Visit http://localhost:3000
   # Check console for "Using mock payment service" message should NOT appear
   ```

2. **Payment Flow Test**
   - Go to `/generate-payment`
   - Create a payment
   - Verify it uses real PesaPal (no mock messages)

## 🚨 Important Notes

- **HTTPS Required**: PesaPal requires HTTPS in production
- **Webhook URLs**: Update PesaPal webhook URLs to your production domain
- **Environment Variables**: Never commit `.env.production` to version control
- **Testing**: Test with small amounts first

## 🆘 Troubleshooting

### Mock Service Still Running
- Check `NODE_ENV=production` is set
- Verify environment variables are loaded
- Restart the application

### PesaPal API Errors
- Verify credentials are correct
- Check API endpoint URLs
- Ensure HTTPS is enabled

### Build Failures
- Run `npm run deploy:check` to identify issues
- Check for TypeScript errors
- Verify all dependencies are installed

## 📞 Support

- **PesaPal Support**: [support@pesapal.com](mailto:support@pesapal.com)
- **Documentation**: [PesaPal API Docs](https://developer.pesapal.com)

---

**Ready to go live?** Follow the detailed [Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md) for complete instructions.
