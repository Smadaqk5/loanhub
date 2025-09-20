# Manual Deployment Guide

## Issue: Directory Path with Special Characters

Your current directory path `C:\Users\File!!\Desktop\loan hub` contains exclamation marks (`!!`) which are reserved characters in Webpack and cause build failures.

## Solutions

### Solution 1: Move Project to Clean Directory (Recommended)

1. **Move the project to a clean directory:**
   ```powershell
   # Navigate to Desktop
   cd C:\Users\File!!\Desktop
   
   # Copy the project to a clean directory
   Copy-Item "loan hub" "loan-hub-clean" -Recurse
   
   # Navigate to the clean directory
   cd loan-hub-clean\loan-hub
   ```

2. **Deploy from the clean directory:**
   ```powershell
   # Install dependencies
   npm install
   
   # Build the application
   npm run build
   
   # Deploy to Netlify
   netlify deploy --prod --dir=out
   ```

### Solution 2: Use the Deployment Script

Run the deployment script from the current location:

```powershell
# From the current directory
.\loan-hub\deploy-to-netlify.ps1
```

### Solution 3: Deploy via Netlify Web Interface

1. **Push to GitHub:**
   ```powershell
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create a GitHub repository and push
   git remote add origin https://github.com/yourusername/loan-hub.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `out`
   - Add environment variables in Netlify dashboard

## Environment Variables for Netlify

Add these environment variables in your Netlify dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
NEXT_PUBLIC_PESAPAL_BASE_URL=https://pay.pesapal.com/v3/api
NEXT_PUBLIC_BASE_URL=https://your-site-name.netlify.app
```

## Next Steps

1. Choose one of the solutions above
2. Set up your environment variables
3. Deploy your application
4. Test the deployed application

## Troubleshooting

- If build fails due to path issues, use Solution 1 (move to clean directory)
- If you get authentication errors, ensure your environment variables are set correctly
- If deployment fails, check the Netlify build logs for specific error messages
