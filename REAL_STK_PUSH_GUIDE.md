# Real STK Push Configuration Guide

## 🚀 Setting Up Real STK Push Payments

To send real STK Push to actual phone numbers, you need to configure your PesaPal production credentials.

### 1. Get PesaPal Production Credentials

1. **Login to PesaPal Merchant Dashboard**: https://developer.pesapal.com/
2. **Go to API Settings** in your merchant account
3. **Copy your production credentials**:
   - Consumer Key
   - Consumer Secret  
   - Pass Key
   - Short Code

### 2. Environment Configuration

Create a `.env.local` file in your project root with:

```bash
# PesaPal Production Configuration
PESAPAL_CONSUMER_KEY=your_real_consumer_key
PESAPAL_CONSUMER_SECRET=your_real_consumer_secret
PESAPAL_PASS_KEY=your_real_pass_key
PESAPAL_SHORT_CODE=your_real_short_code
PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api

# Force Production Mode
NODE_ENV=production

# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.netlify.app
```

### 3. Update STK Push Service

The new STK Push service automatically detects the environment and uses:
- **Development**: Mock service (no real payments)
- **Production**: Real PesaPal API (real STK Push)

### 4. Test Real STK Push

1. **Set NODE_ENV=production** in your environment
2. **Add real PesaPal credentials** to `.env.local`
3. **Use a real phone number** (your own for testing)
4. **Initiate payment** - you'll receive real STK Push

### 5. Important Notes

⚠️ **Testing with Real Money**:
- Use small amounts for testing (KES 1-10)
- Test with your own phone number first
- Real STK Push will charge actual money

✅ **Production Checklist**:
- [ ] Valid PesaPal production credentials
- [ ] NODE_ENV=production
- [ ] Real phone numbers for testing
- [ ] Callback URL configured
- [ ] SSL certificate (HTTPS)

### 6. Phone Number Format

PesaPal accepts phone numbers in these formats:
- `+254700000000` (recommended)
- `254700000000` (without +)
- `0700000000` (local format - will be converted)

### 7. Testing Flow

1. **Development**: Uses mock service, no real charges
2. **Production**: Uses real PesaPal API, real charges
3. **Status Updates**: Real-time polling of payment status
4. **Callbacks**: PesaPal sends confirmation to your callback URL

### 8. Troubleshooting

**Common Issues**:
- **500 Error**: Invalid credentials or network issues
- **Invalid Phone**: Phone number format issues
- **No STK Push**: Check phone number and amount
- **Timeout**: Payment expires after 15 minutes

**Debug Steps**:
1. Check environment variables
2. Verify PesaPal credentials
3. Test with small amounts
4. Check phone number format
5. Monitor console logs

### 9. Security Notes

🔒 **Never commit credentials**:
- Add `.env.local` to `.gitignore`
- Use environment variables in production
- Rotate credentials regularly

### 10. Production Deployment

For Netlify deployment:
1. Add environment variables in Netlify dashboard
2. Set `NODE_ENV=production`
3. Configure callback URLs
4. Test with real phone numbers

---

## Quick Start for Real STK Push

1. **Get PesaPal credentials** from merchant dashboard
2. **Create `.env.local`** with production config
3. **Set NODE_ENV=production**
4. **Test with your phone number**
5. **Check for STK Push notification**

The system will automatically switch from mock to real payments when production credentials are detected!
