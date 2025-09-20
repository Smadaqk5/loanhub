# Production Configuration Guide

## Environment Variables for Netlify

Set these environment variables in your Netlify dashboard under Site Settings > Environment Variables:

### Required Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://loanke.netlify.app
NODE_ENV=production

# Pesapal Production API Configuration
NEXT_PUBLIC_PESAPAL_BASE_URL=https://www.pesapal.com/pesapalapi/api
NEXT_PUBLIC_PESAPAL_CONSUMER_KEY=your_production_consumer_key
PESAPAL_CONSUMER_SECRET=your_production_consumer_secret

# Supabase Configuration (if using)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://loanke.netlify.app
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## How to Set Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to Site Settings > Environment Variables
4. Click "Add Variable"
5. Add each variable with its value
6. Click "Save"

## Security Notes

- Never commit `.env` files to version control
- Use Netlify's environment variables for sensitive data
- Keep production credentials secure
- Rotate API keys regularly
