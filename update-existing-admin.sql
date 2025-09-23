-- UPDATE EXISTING ADMIN OR CREATE NEW ONE
-- This script handles existing admin users and creates/updates them properly

-- Step 1: Check if admin user already exists
SELECT 
  'Checking existing admin user:' as info,
  email,
  raw_user_meta_data->>'role' as auth_role,
  created_at
FROM auth.users 
WHERE email = 'admin@loanhub.com';

-- Step 2: Delete existing admin user if it exists
DELETE FROM auth.users WHERE email = 'admin@loanhub.com';
DELETE FROM public.users WHERE email = 'admin@loanhub.com';

-- Step 3: Create new admin user in auth.users
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

-- Step 4: Create admin profile in public.users
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@loanhub.com';
  
  -- Create admin profile
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
  
  RAISE NOTICE 'Admin user recreated successfully with ID: %', admin_user_id;
END $$;

-- Step 5: Verify admin user was created/updated
SELECT 
  'Admin User Updated Successfully!' as status,
  'Email: admin@loanhub.com' as email,
  'Password: Admin@LoanHub2024!' as password,
  'Role: admin' as role;

-- Step 6: Show final admin user details
SELECT 
  'Final Admin User Details:' as info,
  u.email as auth_email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as public_role,
  p.full_name,
  p.status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@loanhub.com';
