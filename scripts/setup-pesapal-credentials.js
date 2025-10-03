#!/usr/bin/env node

// PesaPal Credentials Setup Script
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🔑 PesaPal Credentials Setup\n')

console.log('This script will help you configure your PesaPal credentials for real STK Push.')
console.log('You can get these from: https://developer.pesapal.com/\n')

const questions = [
  {
    key: 'PESAPAL_CONSUMER_KEY',
    prompt: 'Enter your PesaPal Consumer Key: ',
    required: true
  },
  {
    key: 'PESAPAL_CONSUMER_SECRET', 
    prompt: 'Enter your PesaPal Consumer Secret: ',
    required: true
  }
]

const credentials = {}

function askQuestion(index) {
  if (index >= questions.length) {
    saveCredentials()
    return
  }

  const question = questions[index]
  rl.question(question.prompt, (answer) => {
    if (question.required && !answer.trim()) {
      console.log('❌ This field is required!')
      askQuestion(index)
      return
    }
    
    credentials[question.key] = answer.trim()
    askQuestion(index + 1)
  })
}

function saveCredentials() {
  const envPath = path.join(process.cwd(), '.env.local')
  
  let envContent = ''
  
  // Check if .env.local exists and read existing content
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }
  
  // Add or update PesaPal credentials
  const lines = envContent.split('\n')
  const newLines = []
  
  // Keep existing non-PesaPal lines
  for (const line of lines) {
    if (!line.startsWith('PESAPAL_') && !line.startsWith('NODE_ENV=')) {
      newLines.push(line)
    }
  }
  
  // Add PesaPal credentials
  newLines.push('')
  newLines.push('# PesaPal Production Credentials')
  newLines.push(`PESAPAL_CONSUMER_KEY=${credentials.PESAPAL_CONSUMER_KEY}`)
  newLines.push(`PESAPAL_CONSUMER_SECRET=${credentials.PESAPAL_CONSUMER_SECRET}`)
  newLines.push(`PESAPAL_BASE_URL=https://pay.pesapal.com/pesapalapi/api`)
  newLines.push('')
  newLines.push('# Force Production Mode')
  newLines.push('NODE_ENV=production')
  
  // Write to file
  fs.writeFileSync(envPath, newLines.join('\n'))
  
  console.log('\n✅ Credentials saved to .env.local')
  console.log('\n📋 Next Steps:')
  console.log('1. Restart your development server: npm run dev')
  console.log('2. Go to: http://localhost:3000/payment-demo')
  console.log('3. Check that it shows "Production Mode" with "Real STK Push"')
  console.log('4. Test with your phone number and small amount')
  console.log('5. You should receive a real STK Push notification!')
  
  console.log('\n⚠️  Important:')
  console.log('- Real STK Push will charge actual money')
  console.log('- Test with your own phone number first')
  console.log('- Use small amounts for testing (KES 1-10)')
  console.log('- Never commit .env.local to version control')
  
  rl.close()
}

// Start the process
askQuestion(0)
