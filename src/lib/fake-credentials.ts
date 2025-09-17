// Fake credentials for testing the loan hub application
// These are realistic Kenyan data examples for development/testing purposes

export const FAKE_CREDENTIALS = {
  // Admin Account
  admin: {
    email: 'admin@loanhubkenya.com',
    password: 'Admin123!',
    full_name: 'John Mwangi',
    national_id: '12345678',
    phone_number: '+254700123456',
    kra_pin: 'A123456789B',
    role: 'admin'
  },
  
  // Regular User Accounts
  users: [
    {
      email: 'mary.wanjiku@email.com',
      password: 'Password123!',
      full_name: 'Mary Wanjiku',
      national_id: '23456789',
      phone_number: '+254700234567',
      kra_pin: 'B234567890C',
      role: 'user'
    },
    {
      email: 'peter.kamau@email.com',
      password: 'Password123!',
      full_name: 'Peter Kamau',
      national_id: '34567890',
      phone_number: '+254700345678',
      kra_pin: 'C345678901D',
      role: 'user'
    },
    {
      email: 'grace.akinyi@email.com',
      password: 'Password123!',
      full_name: 'Grace Akinyi',
      national_id: '45678901',
      phone_number: '+254700456789',
      kra_pin: 'D456789012E',
      role: 'user'
    },
    {
      email: 'david.otieno@email.com',
      password: 'Password123!',
      full_name: 'David Otieno',
      national_id: '56789012',
      phone_number: '+254700567890',
      kra_pin: 'E567890123F',
      role: 'user'
    }
  ]
}

// Sample loan data for testing
export const SAMPLE_LOANS = [
  {
    amount_requested: 25000,
    repayment_period_days: 90,
    loan_purpose: 'Business expansion - purchasing new equipment for my small shop',
    status: 'pending'
  },
  {
    amount_requested: 15000,
    repayment_period_days: 60,
    loan_purpose: 'Emergency medical expenses for family member',
    status: 'approved'
  },
  {
    amount_requested: 50000,
    repayment_period_days: 180,
    loan_purpose: 'Home improvement and renovation project',
    status: 'disbursed'
  },
  {
    amount_requested: 10000,
    repayment_period_days: 30,
    loan_purpose: 'School fees for children',
    status: 'repaid'
  }
]

// Instructions for using these credentials
export const CREDENTIALS_INSTRUCTIONS = `
🔐 FAKE CREDENTIALS FOR TESTING

📧 ADMIN ACCOUNT:
Email: admin@loanhubkenya.com
Password: Admin123!
Role: Administrator (can access admin dashboard)

👥 USER ACCOUNTS:
1. Email: mary.wanjiku@email.com
   Password: Password123!

2. Email: peter.kamau@email.com
   Password: Password123!

3. Email: grace.akinyi@email.com
   Password: Password123!

4. Email: david.otieno@email.com
   Password: Password123!

📝 NOTES:
- All passwords follow the same pattern: "Password123!"
- Admin password is: "Admin123!"
- These are realistic Kenyan names and phone numbers
- National IDs and KRA PINs are formatted correctly
- Use these for testing the application functionality

🚀 HOW TO USE:
1. Go to /auth/signin
2. Enter any of the email/password combinations above
3. For admin features, use the admin account
4. For regular user features, use any of the user accounts
`
