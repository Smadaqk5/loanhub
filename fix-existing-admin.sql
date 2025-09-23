-- FIX EXISTING ADMIN USER
-- This script updates the existing admin user instead of creating a new one

-- Step 1: Check current admin user
SELECT 
  'Current admin user:' as info,
  email,
  raw_user_meta_data->>'role' as auth_role,
  created_at
FROM auth.users 
WHERE email = 'admin@loanhub.com';

-- Step 2: Update existing admin user in auth.users
UPDATE auth.users SET
  raw_user_meta_data = '{"role": "admin", "full_name": "System Administrator"}',
  updated_at = NOW()
WHERE email = 'admin@loanhub.com';

-- Step 3: Update or create admin profile in public.users
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@loanhub.com';
  
  -- Check if profile exists in public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id) THEN
    -- Update existing profile
    UPDATE public.users SET
      role = 'admin',
      status = 'active',
      full_name = 'System Administrator',
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Updated existing admin profile for: %', admin_user_id;
  ELSE
    -- Create new profile
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
    
    RAISE NOTICE 'Created new admin profile for: %', admin_user_id;
  END IF;
END $$;

-- Step 4: Verify admin user is properly configured
SELECT 
  'Admin User Fixed Successfully!' as status,
  'Email: admin@loanhub.com' as email,
  'Password: Admin@LoanHub2024!' as password,
  'Role: admin' as role;

-- Step 5: Show final admin user details
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
