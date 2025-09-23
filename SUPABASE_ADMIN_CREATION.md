# 👑 Create Admin User Directly in Supabase

## 🚀 **Quick Admin Creation Methods**

### **Method 1: Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - Go to `Authentication` → `Users`
   - Click `Add user` or `Invite user`

3. **Create Admin User**
   ```
   Email: admin@loanhub.com
   Password: [strong password]
   ```

4. **Set Admin Role**
   - Go to `Authentication` → `Users`
   - Find your user and click the `...` menu
   - Select `Edit user`
   - In `Raw user meta data`, add:
   ```json
   {
     "role": "admin"
   }
   ```

### **Method 2: SQL Editor (Direct Database)**

1. **Open SQL Editor**
   - Go to `SQL Editor` in Supabase Dashboard
   - Create a new query

2. **Run Admin Creation SQL**
   ```sql
   -- Create admin user directly
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     invited_at,
     confirmation_token,
     confirmation_sent_at,
     recovery_token,
     recovery_sent_at,
     email_change_token_new,
     email_change,
     email_change_sent_at,
     last_sign_in_at,
     raw_app_meta_data,
     raw_user_meta_data,
     is_super_admin,
     created_at,
     updated_at,
     phone,
     phone_confirmed_at,
     phone_change,
     phone_change_token,
     phone_change_sent_at,
     confirmed_at,
     email_change_token_current,
     email_change_confirm_status,
     banned_until,
     reauthentication_token,
     reauthentication_sent_at,
     is_sso_user,
     deleted_at
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'admin@loanhub.com',
     crypt('admin123', gen_salt('bf')),
     NOW(),
     NOW(),
     '',
     NOW(),
     '',
     NULL,
     '',
     '',
     NULL,
     NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"role": "admin", "full_name": "System Administrator"}',
     false,
     NOW(),
     NOW(),
     NULL,
     NULL,
     '',
     '',
     NULL,
     NOW(),
     '',
     0,
     NULL,
     '',
     NULL,
     false,
     NULL
   );

   -- Create corresponding user profile
   INSERT INTO public.users (
     id,
     full_name,
     national_id,
     phone_number,
     email,
     kra_pin,
     password_hash,
     role,
     status,
     created_at,
     updated_at
   ) VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@loanhub.com'),
     'System Administrator',
     'ADMIN001',
     '+254700000000',
     'admin@loanhub.com',
     'ADMIN001',
     crypt('admin123', gen_salt('bf')),
     'admin',
     'active',
     NOW(),
     NOW()
   );
   ```

### **Method 3: Using Supabase CLI**

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Create Admin User**
   ```bash
   supabase db reset
   # Then run the SQL from Method 2
   ```

## 🔧 **Alternative: Create Admin via Application**

### **Using the Admin Creation Page**

1. **Access Admin Creation**
   - Go to: `http://localhost:3000/admin/create-admin`
   - Or: `http://localhost:3000/admin/manage-admins`

2. **Fill Admin Details**
   ```
   Full Name: System Administrator
   Email: admin@loanhub.com
   Phone: +254700000000
   National ID: ADMIN001
   KRA PIN: ADMIN001
   Password: [strong password]
   ```

3. **Submit and Verify**
   - Submit the form
   - Check Supabase Dashboard for the new user
   - Verify the role is set to 'admin'

## 🛠️ **Manual Database Setup**

### **Step 1: Enable Required Extensions**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable crypt extension for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### **Step 2: Create Admin User**
```sql
-- Insert admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@loanhub.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "full_name": "System Administrator"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
);
```

### **Step 3: Create User Profile**
```sql
-- Get the user ID
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@loanhub.com';
  
  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    full_name,
    national_id,
    phone_number,
    email,
    kra_pin,
    password_hash,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'System Administrator',
    'ADMIN001',
    '+254700000000',
    'admin@loanhub.com',
    'ADMIN001',
    crypt('admin123', gen_salt('bf')),
    'admin',
    'active',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
END $$;
```

## 🔐 **Security Considerations**

### **Strong Password Requirements**
```sql
-- Use a strong password (minimum 12 characters)
-- Include: uppercase, lowercase, numbers, special characters
-- Example: Admin@LoanHub2024!
```

### **Admin Role Verification**
```sql
-- Verify admin role is set correctly
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users 
WHERE email = 'admin@loanhub.com';
```

### **User Profile Verification**
```sql
-- Verify user profile exists
SELECT 
  id,
  full_name,
  email,
  role,
  status
FROM public.users 
WHERE email = 'admin@loanhub.com';
```

## 🧪 **Testing Admin Access**

### **1. Test Authentication**
```javascript
// Test admin login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@loanhub.com',
  password: 'admin123'
});

console.log('Admin login result:', data, error);
```

### **2. Test Admin Role**
```javascript
// Check if user is admin
const { data: { user } } = await supabase.auth.getUser();
const isAdmin = user?.user_metadata?.role === 'admin';
console.log('Is admin:', isAdmin);
```

### **3. Test Admin Functions**
```sql
-- Test admin functions
SELECT is_admin(); -- Should return true for admin user
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **User Not Created**
   - Check if email already exists
   - Verify all required fields are provided
   - Check for SQL syntax errors

2. **Role Not Set**
   - Verify `raw_user_meta_data` contains `{"role": "admin"}`
   - Check if the user profile has `role = 'admin'`

3. **Authentication Issues**
   - Verify password is correctly hashed
   - Check if email is confirmed
   - Ensure user is not banned

### **Debug Queries**
```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'admin@loanhub.com';

-- Check user profile
SELECT * FROM public.users WHERE email = 'admin@loanhub.com';

-- Check admin role
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as profile_role
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@loanhub.com';
```

## 📱 **Application Integration**

### **Admin Dashboard Access**
Once the admin user is created, they can:
- Access `/admin` dashboard
- Manage users and loans
- View system reports
- Configure system settings

### **Admin Features**
- User management
- Loan approval/rejection
- System monitoring
- Report generation
- Settings configuration

---

## ✅ **Quick Start Commands**

### **One-Line Admin Creation**
```sql
-- Complete admin user creation
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@loanhub.com', crypt('admin123', gen_salt('bf')), NOW(), '{"role": "admin", "full_name": "System Administrator"}', NOW(), NOW());
```

### **Verify Admin Creation**
```sql
-- Check admin user
SELECT email, raw_user_meta_data->>'role' as role FROM auth.users WHERE email = 'admin@loanhub.com';
```

This guide provides multiple methods to create an admin user directly in Supabase, from simple dashboard operations to advanced SQL commands.
