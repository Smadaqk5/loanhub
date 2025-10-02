#!/usr/bin/env node

// Production STK Push Setup Script
const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up Real STK Push Configuration...\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExists = fs.existsSync(envPath)

if (!envExists) {
  console.log('📝 Creating .env.local file...')
  
  const envContent = `# Real STK Push Configuration
# Replace with your actual PesaPal production credentials

# PesaPal Production Credentials
PESAPAL_CONSUMER_KEY=your_real_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_real_consumer_secret_here
PESAPAL_PASS_KEY=your_real_pass_key_here
PESAPAL_SHORT_CODE=your_real_short_code_here
PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api

# Force Production Mode
NODE_ENV=production

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local file')
} else {
  console.log('⚠️ .env.local already exists')
}

console.log('\n📋 Next Steps:')
console.log('1. Get your PesaPal production credentials from: https://developer.pesapal.com/')
console.log('2. Update .env.local with your real credentials')
console.log('3. Set NODE_ENV=production')
console.log('4. Test with your own phone number')
console.log('5. Use small amounts for testing (KES 1-10)')

console.log('\n⚠️  Important:')
console.log('- Real STK Push will charge actual money')
console.log('- Test with your own phone number first')
console.log('- Never commit .env.local to version control')

console.log('\n🎯 To test real STK Push:')
console.log('1. npm run dev')
console.log('2. Go to http://localhost:3000/payment-demo')
console.log('3. Enter your phone number and small amount')
console.log('4. Click "Pay" - you should receive STK Push')
