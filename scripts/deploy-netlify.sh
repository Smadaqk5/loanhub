#!/bin/bash

# Netlify Deployment Script
# This script helps prepare and deploy your Loan Hub application to Netlify

echo "🚀 Netlify Deployment Script"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Pre-deployment checks..."

# Check if environment variables are set
echo "🔍 Checking environment variables..."

required_vars=("NODE_ENV" "PESAPAL_CONSUMER_KEY" "PESAPAL_CONSUMER_SECRET" "NEXT_PUBLIC_APP_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "⚠️  Missing environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "💡 Set these in your Netlify dashboard under Site Settings > Environment Variables"
    echo ""
else
    echo "✅ All required environment variables are set"
fi

# Check if git is clean
echo ""
echo "🔍 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Consider committing them first."
    echo "   git add ."
    echo "   git commit -m 'Ready for deployment'"
    echo ""
else
    echo "✅ Git working directory is clean"
fi

# Test build locally
echo ""
echo "🏗️  Testing build locally..."
if npm run build:netlify; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed. Please fix errors before deploying."
    exit 1
fi

# Check if netlify.toml exists
echo ""
echo "🔍 Checking Netlify configuration..."
if [ -f "netlify.toml" ]; then
    echo "✅ netlify.toml found"
else
    echo "⚠️  netlify.toml not found. Creating basic configuration..."
    cat > netlify.toml << EOF
[build]
  command = "npm run build:netlify"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NODE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
    echo "✅ Created netlify.toml"
fi

# Display deployment instructions
echo ""
echo "🎯 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. 📤 Push your code to GitHub:"
echo "   git push origin main"
echo ""
echo "2. 🌐 Go to Netlify Dashboard:"
echo "   https://app.netlify.com"
echo ""
echo "3. 🔗 Connect your repository:"
echo "   - Click 'New site from Git'"
echo "   - Connect your GitHub repository"
echo "   - Select your loan-hub repository"
echo ""
echo "4. ⚙️  Configure build settings:"
echo "   - Build command: npm run build:netlify"
echo "   - Publish directory: .next"
echo ""
echo "5. 🔐 Set environment variables:"
echo "   - Go to Site Settings > Environment Variables"
echo "   - Add all variables from NETLIFY_ENVIRONMENT_VARIABLES.md"
echo ""
echo "6. 🚀 Deploy:"
echo "   - Click 'Deploy site'"
echo "   - Wait for build to complete"
echo ""
echo "7. 🧪 Test your deployment:"
echo "   - Visit your Netlify URL"
echo "   - Test the payment flow"
echo "   - Verify no mock service messages appear"
echo ""

# Check if Netlify CLI is installed
if command -v netlify &> /dev/null; then
    echo "🔧 Netlify CLI detected. You can also deploy using:"
    echo "   netlify deploy --prod"
    echo ""
fi

echo "📚 For detailed instructions, see:"
echo "   - NETLIFY_DEPLOYMENT_GUIDE.md"
echo "   - NETLIFY_ENVIRONMENT_VARIABLES.md"
echo ""
echo "🎉 Ready for Netlify deployment!"
