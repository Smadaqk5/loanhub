# PesaPal Pass Key and Short Code Configuration Guide

## 🔑 Understanding PesaPal Credentials

### Required Credentials for Real PesaPal Payments:

1. **PESAPAL_CONSUMER_KEY** - Your API consumer key
2. **PESAPAL_CONSUMER_SECRET** - Your API consumer secret

## 📱 How to Get Your PesaPal Credentials

### Step 1: Access PesaPal Dashboard
1. **Go to**: https://developer.pesapal.com/
2. **Login** to your merchant account
3. **Navigate to**: API Settings or Developer Settings

### Step 2: Get Your Credentials
In your PesaPal dashboard, you'll find:

#### Consumer Key & Secret:
- **Consumer Key**: Usually starts with letters/numbers
- **Consumer Secret**: Usually ends with `=`
- These are for PesaPal API authentication

### Step 3: Production vs Sandbox
- **Sandbox**: Use test credentials for development
- **Production**: Use real credentials for live payments

## ⚙️ Configuration Examples

### Development (Sandbox):
```bash
PESAPAL_CONSUMER_KEY=x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL
PESAPAL_CONSUMER_SECRET=Q9twNwMHt8a03lFfODhnteP9fnY=
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalapi/api
NODE_ENV=development
```

### Production (Live):
```bash
PESAPAL_CONSUMER_KEY=your_real_consumer_key
PESAPAL_CONSUMER_SECRET=your_real_consumer_secret
PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api
NODE_ENV=production
```

## 🔧 Where to Configure

### Local Development (.env.local):
```bash
# Create .env.local file in your project root
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api
NODE_ENV=production
```

### Netlify Deployment:
Add these in Netlify dashboard under "Environment Variables":
- `PESAPAL_CONSUMER_KEY`
- `PESAPAL_CONSUMER_SECRET`
- `PESAPAL_BASE_URL`
- `NODE_ENV=production`

## 🧪 Testing Your Configuration

### 1. Check Service Mode:
Visit `/payment-demo` and look for:
- **Development Mode**: Mock payments (no real charges)
- **Production Mode**: Real STK Push (real charges)

### 2. Test STK Push:
1. **Use your own phone number**
2. **Start with small amounts** (KES 1-10)
3. **Check your phone** for STK Push notification
4. **Enter your M-Pesa PIN** to complete

### 3. Verify Credentials:
The system will automatically:
- ✅ **Use real service** if production credentials are valid
- ⚠️ **Fall back to mock** if credentials are missing/invalid
- 🔧 **Show clear indicators** of which mode is active

## 🚨 Important Notes

### Security:
- **Never commit** credentials to Git
- **Use environment variables** for all deployments
- **Rotate credentials** regularly
- **Test with small amounts** first

### Phone Number Format:
- **Recommended**: `+254700000000`
- **Alternative**: `254700000000`
- **Local**: `0700000000` (will be converted)

### Amount Limits:
- **Minimum**: Usually KES 1
- **Maximum**: Depends on your PesaPal account limits
- **Testing**: Use small amounts (KES 1-10)

## 🔍 Troubleshooting

### Common Issues:

#### "Invalid Credentials" Error:
- Check if credentials are correct
- Verify they're for the right environment (sandbox vs production)
- Ensure no extra spaces or characters

#### "No STK Push Received":
- Verify phone number format
- Check if amount meets minimum requirements
- Ensure PesaPal account is active
- Check if STK Push is enabled for your account

#### "Payment Failed":
- Check PesaPal dashboard for error details
- Verify callback URL is accessible
- Check if account has sufficient balance
- Ensure network connectivity

### Debug Steps:
1. **Check environment variables** are set correctly
2. **Verify PesaPal dashboard** shows active account
3. **Test with sandbox** credentials first
4. **Check browser console** for error messages
5. **Monitor Netlify logs** for API errors

## 📞 Getting Help

### PesaPal Support:
- **Email**: support@pesapal.com
- **Phone**: Check PesaPal website for contact details
- **Documentation**: https://developer.pesapal.com/

### Common Short Codes:
- **Safaricom**: `174379` (test), `174379` (live)
- **Airtel**: Check PesaPal dashboard
- **Equitel**: Check PesaPal dashboard

---

## 🎯 Quick Setup Checklist

- [ ] Get PesaPal merchant account
- [ ] Access developer dashboard
- [ ] Copy all 4 credentials
- [ ] Set up environment variables
- [ ] Test with small amounts
- [ ] Verify STK Push works
- [ ] Configure callback URL
- [ ] Deploy to production

Your STK Push system is ready to send real payments! 🚀
