#!/usr/bin/env node

/**
 * Script to switch the application to production mode
 * This script helps configure the app for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Switching to Production Mode...\n');

// Check if .env.production exists
const envProductionPath = path.join(process.cwd(), '.env.production');
const envTemplatePath = path.join(process.cwd(), 'env.production.template');

if (!fs.existsSync(envProductionPath)) {
  if (fs.existsSync(envTemplatePath)) {
    console.log('📋 Creating .env.production from template...');
    fs.copyFileSync(envTemplatePath, envProductionPath);
    console.log('✅ Created .env.production file');
    console.log('⚠️  Please edit .env.production with your actual production values\n');
  } else {
    console.log('❌ env.production.template not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env.production already exists\n');
}

// Update package.json scripts for production
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add production scripts if they don't exist
  if (!packageJson.scripts['start:prod']) {
    packageJson.scripts['start:prod'] = 'NODE_ENV=production next start';
    console.log('📝 Added start:prod script');
  }
  
  if (!packageJson.scripts['build:prod']) {
    packageJson.scripts['build:prod'] = 'NODE_ENV=production next build';
    console.log('📝 Added build:prod script');
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json scripts\n');
}

// Check for required environment variables
console.log('🔍 Checking required environment variables...');
const requiredVars = [
  'PESAPAL_CONSUMER_KEY',
  'PESAPAL_CONSUMER_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'NEXTAUTH_SECRET'
];

let missingVars = [];
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('⚠️  Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please set these in your .env.production file\n');
} else {
  console.log('✅ All required environment variables are set\n');
}

// Create production build script
const buildScript = `#!/bin/bash

echo "🏗️  Building for production..."

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🚀 Ready for deployment"
else
    echo "❌ Build failed!"
    exit 1
fi
`;

const buildScriptPath = path.join(process.cwd(), 'build-production.sh');
fs.writeFileSync(buildScriptPath, buildScript);
fs.chmodSync(buildScriptPath, '755');
console.log('📝 Created build-production.sh script');

// Create deployment checklist
const checklist = `# Production Deployment Checklist

## Pre-Deployment
- [ ] PesaPal production credentials configured
- [ ] Environment variables set in hosting platform
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Webhook URLs updated

## Testing
- [ ] Payment creation works
- [ ] Payment initiation works
- [ ] Payment status updates work
- [ ] Webhooks are received
- [ ] Error handling works

## Post-Deployment
- [ ] Monitor payment success rates
- [ ] Check webhook delivery logs
- [ ] Verify all features work
- [ ] Set up monitoring alerts

## Rollback Plan
- [ ] Previous deployment available
- [ ] Rollback procedure documented
- [ ] Emergency contacts ready
`;

const checklistPath = path.join(process.cwd(), 'DEPLOYMENT_CHECKLIST.md');
fs.writeFileSync(checklistPath, checklist);
console.log('📝 Created DEPLOYMENT_CHECKLIST.md');

console.log('\n🎉 Production setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env.production with your actual values');
console.log('2. Run: npm run build:prod');
console.log('3. Deploy to your hosting platform');
console.log('4. Set environment variables in hosting platform');
console.log('5. Test the payment flow');
console.log('\n📖 See PRODUCTION_DEPLOYMENT_GUIDE.md for detailed instructions');
