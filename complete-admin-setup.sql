-- COMPLETE ADMIN SETUP - STEP BY STEP
-- Run this entire script to set up admin login from scratch

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Drop and recreate users table to ensure clean state
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 3: Create users table with all required columns
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    national_id TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    kra_pin TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_national_id ON public.users(national_id);
CREATE INDEX idx_users_phone_number ON public.users(phone_number);

-- Step 5: Create is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the current user has admin role
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (is_admin());

-- Step 8: Delete existing admin user if it exists
DELETE FROM auth.users WHERE email = 'admin@loanhub.com';
DELETE FROM public.users WHERE email = 'admin@loanhub.com';

-- Step 9: Create admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@loanhub.com',
  crypt('Admin@LoanHub2024!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "full_name": "System Administrator"}',
  NOW(),
  NOW()
);

-- Step 10: Create admin profile in public.users
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@loanhub.com';
  
  -- Insert admin profile
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
    crypt('Admin@LoanHub2024!', gen_salt('bf')),
    'admin',
    'active',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
END $$;

-- Step 11: Verify admin user creation
SELECT 
  'Admin User Verification' as status,
  u.email as auth_email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as public_role,
  p.status as public_status,
  p.full_name
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@loanhub.com';

-- Step 12: Test is_admin function
SELECT 
  'Admin Function Test' as test,
  is_admin() as is_admin_working;

-- Step 13: Show table structure
SELECT 
  'Table Structure' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
