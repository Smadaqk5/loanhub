# Netlify Environment Variables Configuration

## Required Environment Variables for Netlify

Set these in your Netlify dashboard under Site Settings > Environment Variables:

### Core Application Settings
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### PesaPal Integration
```
PESAPAL_CONSUMER_KEY=your_production_consumer_key
PESAPAL_CONSUMER_SECRET=your_production_consumer_secret
PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api
```

### App URLs (Update with your actual Netlify URL)
```
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your_secure_random_string_here
```

### Supabase Configuration (if using)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Set Environment Variables in Netlify

1. **Go to Netlify Dashboard**
   - Select your site
   - Go to Site Settings > Environment Variables

2. **Add Each Variable**
   - Click "Add variable"
   - Enter variable name and value
   - Click "Save"

3. **Redeploy**
   - Go to Deploys tab
   - Click "Trigger deploy"

## Environment Variable Examples

### For Development Testing
```
NODE_ENV=development
PESAPAL_CONSUMER_KEY=x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL
PESAPAL_CONSUMER_SECRET=Q9twNwMHt8a03lFfODhnteP9fnY=
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalapi/api
```

### For Production
```
NODE_ENV=production
PESAPAL_CONSUMER_KEY=your_real_production_key
PESAPAL_CONSUMER_SECRET=your_real_production_secret
PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api
```

## Security Notes

- Never commit environment variables to version control
- Use Netlify's secure environment variable system
- Rotate secrets regularly
- Use different credentials for different environments

## Testing Environment Variables

After setting environment variables:

1. **Trigger a new deployment**
2. **Check build logs** for any errors
3. **Test payment flow** on the live site
4. **Verify console logs** show production mode (no mock service messages)

## Troubleshooting

### Environment Variables Not Loading
- Check variable names match exactly
- Ensure no trailing spaces
- Redeploy after adding variables

### Build Failures
- Check build logs for missing variables
- Verify all required variables are set
- Test build locally with same variables

### Payment Issues
- Verify PesaPal credentials are correct
- Check webhook URLs are updated
- Ensure HTTPS is enabled
