-- CLEAN ADMIN RECREATION
-- This script completely removes and recreates the admin user to avoid all conflicts

-- Step 1: Show what exists before cleanup
SELECT 
  'Before cleanup - Auth users:' as info,
  COUNT(*) as count
FROM auth.users 
WHERE email = 'admin@loanhub.com';

SELECT 
  'Before cleanup - Public users:' as info,
  COUNT(*) as count
FROM public.users 
WHERE email = 'admin@loanhub.com';

-- Step 2: Complete cleanup - remove admin from both tables
DELETE FROM auth.users WHERE email = 'admin@loanhub.com';
DELETE FROM public.users WHERE email = 'admin@loanhub.com';

-- Step 3: Verify cleanup
SELECT 
  'After cleanup - Auth users:' as info,
  COUNT(*) as count
FROM auth.users 
WHERE email = 'admin@loanhub.com';

SELECT 
  'After cleanup - Public users:' as info,
  COUNT(*) as count
FROM public.users 
WHERE email = 'admin@loanhub.com';

-- Step 4: Create fresh admin user in auth.users
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

-- Step 5: Create fresh admin profile in public.users
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the new admin user ID
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
  
  RAISE NOTICE 'Fresh admin user created with ID: %', admin_user_id;
END $$;

-- Step 6: Final verification
SELECT 
  'Admin User Recreated Successfully!' as status,
  'Email: admin@loanhub.com' as email,
  'Password: Admin@LoanHub2024!' as password,
  'Role: admin' as role;

-- Step 7: Show final admin user details
SELECT 
  'Final Admin User Details:' as info,
  u.email as auth_email,
  u.id as auth_id,
  u.raw_user_meta_data->>'role' as auth_role,
  p.id as public_id,
  p.role as public_role,
  p.full_name,
  p.status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@loanhub.com';

-- Step 8: Verify everything is working
SELECT 
  'Verification:' as info,
  CASE 
    WHEN u.id = p.id AND p.role = 'admin' THEN 'SUCCESS: Admin user is properly configured'
    ELSE 'ERROR: Admin user configuration issue'
  END as verification_status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@loanhub.com';
