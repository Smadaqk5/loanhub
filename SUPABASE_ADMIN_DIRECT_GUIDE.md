# How to Add Admin Directly from Supabase SQL

## 🎯 **Quick Method (Recommended)**

### **Step 1: Open Supabase SQL Editor**
1. Go to your Supabase Dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### **Step 2: Copy and Paste This Code**
```sql
-- Create admin user in auth.users
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@loanhub.com',
  crypt('Admin@LoanHub2024!', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "full_name": "System Administrator"}',
  NOW(),
  NOW()
);

-- Create admin profile in public.users
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@loanhub.com';
  
  INSERT INTO public.users (
    id, full_name, national_id, phone_number, email, kra_pin,
    password_hash, role, status, created_at, updated_at
  ) VALUES (
    admin_id, 'System Administrator', 'ADMIN001', '+254700000000',
    'admin@loanhub.com', 'ADMIN001', crypt('Admin@LoanHub2024!', gen_salt('bf')),
    'admin', 'active', NOW(), NOW()
  );
END $$;

-- Verify creation
SELECT 'Admin created! Login with admin@loanhub.com / Admin@LoanHub2024!' as result;
```

### **Step 3: Run the Query**
1. Click **"Run"** button
2. Wait for the query to complete
3. You should see "Admin created!" message

### **Step 4: Test Login**
- **Email:** `admin@loanhub.com`
- **Password:** `Admin@LoanHub2024!`

## 🔧 **Alternative: Use the Complete Script**

If you want more detailed logging and verification, use `add-admin-direct-supabase.sql`:

1. Copy the entire content of `add-admin-direct-supabase.sql`
2. Paste it into Supabase SQL Editor
3. Run the query
4. Check the detailed output

## ✅ **What This Creates:**

### **In `auth.users` table:**
- ✅ Admin user with email `admin@loanhub.com`
- ✅ Encrypted password
- ✅ Role metadata set to "admin"
- ✅ Email confirmed status

### **In `public.users` table:**
- ✅ Admin profile with `role = 'admin'`
- ✅ Full name: "System Administrator"
- ✅ Phone: `+254700000000`
- ✅ Status: `active`

## 🔍 **Verification Steps:**

### **Check auth.users:**
```sql
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'admin@loanhub.com';
```

### **Check public.users:**
```sql
SELECT email, role, full_name, status 
FROM public.users 
WHERE email = 'admin@loanhub.com';
```

## 🚨 **Troubleshooting:**

### **If you get "duplicate key" error:**
- The admin user already exists
- Delete existing admin first:
```sql
DELETE FROM auth.users WHERE email = 'admin@loanhub.com';
DELETE FROM public.users WHERE email = 'admin@loanhub.com';
```

### **If you get "table doesn't exist" error:**
- Run the database setup scripts first
- Use `complete-admin-setup.sql` to create tables

### **If login doesn't work:**
- Check if both records exist in both tables
- Verify the role is set to "admin" in public.users
- Check if your app is using real Supabase (not mock)

## 🎯 **Success Indicators:**

- ✅ Query runs without errors
- ✅ "Admin created!" message appears
- ✅ You can see the admin user in both tables
- ✅ You can login with admin credentials
- ✅ You're redirected to admin panel after login
