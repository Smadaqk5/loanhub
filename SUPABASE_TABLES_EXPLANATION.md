# Supabase Tables Explanation

## Why Users Don't Appear in Both Tables

### 🔍 **The Two Different Tables:**

#### **`auth.users` (Authentication Table)**
- **Purpose:** Handles login/authentication
- **Managed by:** Supabase automatically
- **Contains:**
  - `id` (UUID)
  - `email`
  - `encrypted_password`
  - `raw_user_meta_data` (JSON)
  - `created_at`, `updated_at`
- **What it's missing:** Your app's custom fields

#### **`public.users` (Your App's Table)**
- **Purpose:** Your application's user profiles
- **Managed by:** You (the developer)
- **Contains:**
  - `id` (UUID - should match auth.users.id)
  - `full_name`
  - `national_id`
  - `phone_number`
  - `email`
  - `kra_pin`
  - `role` (user/admin)
  - `status` (active/suspended)
  - `created_at`, `updated_at`
- **What it's missing:** Authentication data

## 🔧 **The Solution: Sync Between Tables**

### **Option 1: Manual Sync**
Run `sync-auth-to-public-users.sql` to create public.users records for all existing auth.users.

### **Option 2: Auto-Sync Trigger**
Run `auto-sync-users-trigger.sql` to automatically create public.users records whenever a new user signs up.

### **Option 3: Application-Level Sync**
Handle the sync in your application code when users sign up.

## 📋 **How to Fix Your Current Issue:**

### **Step 1: Check What You Have**
```sql
-- See all auth.users
SELECT id, email, created_at FROM auth.users;

-- See all public.users  
SELECT id, email, role, created_at FROM public.users;
```

### **Step 2: Sync Existing Users**
```sql
-- Run the sync script to create public.users records
-- for all existing auth.users
```

### **Step 3: Set Up Auto-Sync**
```sql
-- Create trigger to automatically sync new users
```

## 🎯 **Why This Happens:**

1. **Supabase Auth** only manages authentication
2. **Your App** needs custom user data (role, profile info)
3. **No Automatic Sync** - you must create the connection
4. **Two Separate Systems** that need to be linked

## ✅ **After Syncing:**

- ✅ Users in `auth.users` will have corresponding records in `public.users`
- ✅ Your app can access both authentication and profile data
- ✅ Admin roles will work properly
- ✅ New users will automatically get public.users records

## 🔍 **Verification:**

After running the sync scripts, you should see:
- Same number of users in both tables
- Matching IDs between tables
- All users have proper role assignments
- Admin users have `role = 'admin'` in public.users
