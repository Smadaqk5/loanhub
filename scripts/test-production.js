#!/usr/bin/env node

/**
 * Script to test production configuration
 * This script validates that all production settings are correct
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Production Configuration...\n');

// Check environment file
const envProductionPath = path.join(process.cwd(), '.env.production');
if (!fs.existsSync(envProductionPath)) {
  console.log('❌ .env.production file not found');
  console.log('💡 Run: npm run setup:production');
  process.exit(1);
}
console.log('✅ .env.production file exists');

// Read environment variables
const envContent = fs.readFileSync(envProductionPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Check required variables
const requiredVars = {
  'NODE_ENV': 'production',
  'PESAPAL_CONSUMER_KEY': 'your_production_consumer_key',
  'PESAPAL_CONSUMER_SECRET': 'your_production_consumer_secret',
  'NEXT_PUBLIC_APP_URL': 'https://your-domain.com',
  'NEXTAUTH_SECRET': 'your_random_secret_string'
};

let allGood = true;
console.log('\n🔍 Checking environment variables...');

Object.entries(requiredVars).forEach(([key, defaultValue]) => {
  const value = envVars[key];
  if (!value || value === defaultValue) {
    console.log(`❌ ${key}: ${value || 'not set'}`);
    allGood = false;
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  }
});

// Check PesaPal configuration
console.log('\n🔍 Checking PesaPal configuration...');
const pesapalKey = envVars['PESAPAL_CONSUMER_KEY'];
const pesapalSecret = envVars['PESAPAL_CONSUMER_SECRET'];

if (pesapalKey && pesapalKey !== 'your_production_consumer_key') {
  console.log('✅ PesaPal Consumer Key configured');
} else {
  console.log('❌ PesaPal Consumer Key not configured');
  allGood = false;
}

if (pesapalSecret && pesapalSecret !== 'your_production_consumer_secret') {
  console.log('✅ PesaPal Consumer Secret configured');
} else {
  console.log('❌ PesaPal Consumer Secret not configured');
  allGood = false;
}

// Check URL configuration
console.log('\n🔍 Checking URL configuration...');
const appUrl = envVars['NEXT_PUBLIC_APP_URL'];
if (appUrl && appUrl.startsWith('https://') && appUrl !== 'https://your-domain.com') {
  console.log('✅ App URL configured with HTTPS');
} else {
  console.log('❌ App URL not properly configured (must be HTTPS)');
  allGood = false;
}

// Check if build files exist
console.log('\n🔍 Checking build files...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('✅ Next.js build directory exists');
} else {
  console.log('⚠️  Next.js build directory not found');
  console.log('💡 Run: npm run build:production');
}

// Summary
console.log('\n📊 Summary:');
if (allGood) {
  console.log('🎉 All production configurations are correct!');
  console.log('\n🚀 Ready for deployment:');
  console.log('1. npm run build:production');
  console.log('2. Deploy to your hosting platform');
  console.log('3. Set environment variables in hosting platform');
  console.log('4. Test payment flow');
} else {
  console.log('❌ Some configurations need attention');
  console.log('\n🔧 Fix the issues above and run this script again');
  process.exit(1);
}
