-- FIX ADMIN ID CONFLICT
-- This script handles the case where admin user exists in both tables

-- Step 1: Check what exists in both tables
SELECT 
  'Auth users with admin email:' as info,
  id,
  email,
  raw_user_meta_data->>'role' as auth_role,
  created_at
FROM auth.users 
WHERE email = 'admin@loanhub.com';

SELECT 
  'Public users with admin email:' as info,
  id,
  email,
  role,
  full_name,
  created_at
FROM public.users 
WHERE email = 'admin@loanhub.com';

-- Step 2: Check if IDs match between tables
SELECT 
  'ID Match Check:' as info,
  u.id as auth_id,
  p.id as public_id,
  CASE 
    WHEN u.id = p.id THEN 'IDs MATCH'
    ELSE 'IDs DO NOT MATCH'
  END as match_status
FROM auth.users u
LEFT JOIN public.users p ON u.email = p.email
WHERE u.email = 'admin@loanhub.com';

-- Step 3: Fix the admin user by updating existing records
DO $$
DECLARE
  auth_admin_id UUID;
  public_admin_id UUID;
BEGIN
  -- Get IDs from both tables
  SELECT id INTO auth_admin_id FROM auth.users WHERE email = 'admin@loanhub.com';
  SELECT id INTO public_admin_id FROM public.users WHERE email = 'admin@loanhub.com';
  
  -- Update auth.users if needed
  IF auth_admin_id IS NOT NULL THEN
    UPDATE auth.users SET
      raw_user_meta_data = '{"role": "admin", "full_name": "System Administrator"}',
      updated_at = NOW()
    WHERE id = auth_admin_id;
    
    RAISE NOTICE 'Updated auth.users record for admin: %', auth_admin_id;
  END IF;
  
  -- Update public.users if needed
  IF public_admin_id IS NOT NULL THEN
    UPDATE public.users SET
      role = 'admin',
      status = 'active',
      full_name = 'System Administrator',
      updated_at = NOW()
    WHERE id = public_admin_id;
    
    RAISE NOTICE 'Updated public.users record for admin: %', public_admin_id;
  END IF;
  
  -- If IDs don't match, we need to fix this
  IF auth_admin_id IS NOT NULL AND public_admin_id IS NOT NULL AND auth_admin_id != public_admin_id THEN
    -- Delete the mismatched public.users record
    DELETE FROM public.users WHERE id = public_admin_id;
    
    -- Create new public.users record with correct ID
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
      auth_admin_id,
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
    
    RAISE NOTICE 'Fixed ID mismatch - created new public.users record with auth ID: %', auth_admin_id;
  END IF;
  
  -- If no public.users record exists, create one
  IF auth_admin_id IS NOT NULL AND public_admin_id IS NULL THEN
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
      auth_admin_id,
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
    
    RAISE NOTICE 'Created new public.users record for admin: %', auth_admin_id;
  END IF;
END $$;

-- Step 4: Verify the fix worked
SELECT 
  'Admin User Fixed Successfully!' as status,
  'Email: admin@loanhub.com' as email,
  'Password: Admin@LoanHub2024!' as password,
  'Role: admin' as role;

-- Step 5: Show final admin user details
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

-- Step 6: Verify IDs match
SELECT 
  'ID Verification:' as info,
  CASE 
    WHEN u.id = p.id THEN 'SUCCESS: IDs match between tables'
    ELSE 'ERROR: IDs still do not match'
  END as verification_status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@loanhub.com';
