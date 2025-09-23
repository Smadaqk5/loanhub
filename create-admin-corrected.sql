-- CREATE ADMIN USER - CORRECTED VERSION
-- This script creates an admin user properly in both auth.users and public.users

-- Step 1: Create admin user in auth.users table
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

-- Step 2: Create admin user profile in public.users table
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID from auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@loanhub.com';
  
  -- Check if the user already exists in public.users
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id) THEN
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
      crypt('Admin@LoanHub2024!', gen_salt('bf')),
      'admin',
      'active',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Admin user profile created in public.users with ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user profile already exists in public.users';
  END IF;
END $$;

-- Step 3: Verify admin user creation
SELECT 
  'Admin User Creation Verification' as status,
  u.email as auth_email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as public_role,
  p.full_name,
  p.status as public_status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@loanhub.com';

-- Step 4: Test if we can query the role column
SELECT 
  'Role Column Test' as test,
  role,
  status,
  full_name
FROM public.users 
WHERE email = 'admin@loanhub.com';
