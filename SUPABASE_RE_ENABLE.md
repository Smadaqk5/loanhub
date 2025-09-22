# Re-enable Supabase - Step by Step Guide

## 🚀 **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** to your account
3. **Click "New Project"**
4. **Choose your organization**
5. **Enter project details:**
   - Name: `loan-hub-kenya`
   - Database Password: (choose a strong password)
   - Region: (choose closest to Kenya)
6. **Click "Create new project"**
7. **Wait for project to be ready** (2-3 minutes)

## 🔑 **Step 2: Get Your Credentials**

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy the following:**
   - Project URL (looks like: `https://abcdefgh.supabase.co`)
   - Anon public key (starts with `eyJ...`)
   - Service role key (starts with `eyJ...`)

## 📝 **Step 3: Create Environment File**

Create a file called `.env.local` in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Pesapal Configuration (for payments)
PESAPAL_CONSUMER_KEY=k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx
PESAPAL_CONSUMER_SECRET=Tjg4VodFyn1ur9aDMo1fsJvgHQQ=
NEXT_PUBLIC_PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api

# Next.js Configuration
NEXTAUTH_SECRET=your-random-secret-string-here
NEXTAUTH_URL=http://localhost:3000
```

## 🗄️ **Step 4: Set Up Database Schema**

1. **Go to SQL Editor** in your Supabase dashboard
2. **Click "New query"**
3. **Copy and paste** the contents of `src/lib/database-schema.sql`
4. **Click "Run"** to execute the SQL

## ⚙️ **Step 5: Configure Authentication**

1. **Go to Authentication > Settings** in Supabase
2. **Enable email confirmations** (optional for development)
3. **Add redirect URLs:**
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/loans/apply`

## 🔄 **Step 6: Switch to Real Supabase**

The system will automatically detect your environment variables and use real Supabase instead of the mock system.

## ✅ **Step 7: Test the Setup**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test user registration:**
   - Go to `/auth/signup`
   - Create a new account
   - Check if user appears in Supabase dashboard

3. **Test user login:**
   - Go to `/auth/signin`
   - Login with the account you created
   - Verify you're logged in

## 🎯 **What Changes:**

- ✅ **Real Database**: User data stored in Supabase database
- ✅ **Real Authentication**: Supabase handles auth sessions
- ✅ **Real-time Updates**: Database changes sync automatically
- ✅ **Production Ready**: Can be deployed to production
- ✅ **Scalable**: Handles multiple users and concurrent access

## 🆘 **If Something Goes Wrong:**

1. **Check environment variables** are correct
2. **Verify database schema** was created successfully
3. **Check Supabase logs** in the dashboard
4. **Restart development server** after changes

## 🔄 **Revert to Mock System:**

If you want to go back to mock system temporarily:
- Comment out the environment variables
- The system will automatically fall back to mock

---

**Ready to proceed?** Let me know when you've completed these steps and I'll help you test the setup!
