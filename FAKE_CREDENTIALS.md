# 🔐 Fake Credentials for Testing

This document contains fake credentials for testing the LoanHub Kenya application.

## 👑 Admin Account

**Email:** `admin@loanhubkenya.com`  
**Password:** `Admin123!`  
**Role:** Administrator  
**Access:** Full admin dashboard, user management, loan approvals

---

## 👥 User Accounts

### User 1
**Email:** `mary.wanjiku@email.com`  
**Password:** `Password123!`  
**Name:** Mary Wanjiku  
**Phone:** +254700234567

### User 2
**Email:** `peter.kamau@email.com`  
**Password:** `Password123!`  
**Name:** Peter Kamau  
**Phone:** +254700345678

### User 3
**Email:** `grace.akinyi@email.com`  
**Password:** `Password123!`  
**Name:** Grace Akinyi  
**Phone:** +254700456789

### User 4
**Email:** `david.otieno@email.com`  
**Password:** `Password123!`  
**Name:** David Otieno  
**Phone:** +254700567890

---

## 🚀 How to Use

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the sign-in page:**
   - Go to `http://localhost:3000/auth/signin`
   - You'll see a "Test Credentials" card with all the fake accounts

3. **Test Admin Features:**
   - Use the admin credentials to access the admin dashboard
   - Navigate to `/admin` to see admin features

4. **Test User Features:**
   - Use any user credentials to test regular user features
   - Apply for loans, view dashboard, etc.

## 📝 Notes

- All passwords follow the same pattern: `Password123!`
- Admin password is: `Admin123!`
- These are realistic Kenyan names and phone numbers
- National IDs and KRA PINs are formatted correctly
- The mock authentication system works entirely in-memory
- Sessions persist until the browser is refreshed or the server restarts

## 🎯 Testing Scenarios

### Admin Testing
- [ ] Sign in with admin credentials
- [ ] Access admin dashboard
- [ ] View all users
- [ ] Approve/reject loans
- [ ] View system settings

### User Testing
- [ ] Sign in with user credentials
- [ ] Apply for a loan
- [ ] View loan status
- [ ] Update profile
- [ ] View loan history

### Authentication Testing
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Password validation
- [ ] Email validation

---

**⚠️ Important:** These are fake credentials for development/testing only. Do not use in production!
