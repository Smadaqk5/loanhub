-- ENSURE DASHBOARD SYNC - SIMPLE VERSION
-- This script makes sure all auth users appear in your website dashboard

-- Step 1: Check current sync status
SELECT 
  'Authentication users:' as info,
  COUNT(*) as count
FROM auth.users;

SELECT 
  'Dashboard users:' as info,
  COUNT(*) as count
FROM public.users;

-- Step 2: Show users missing from dashboard
SELECT 
  'Users missing from dashboard:' as info,
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'role' as role
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE p.id IS NULL;

-- Step 3: Sync missing users to dashboard
DO $$
DECLARE
  auth_user RECORD;
  user_counter INTEGER := 0;
  unique_phone TEXT;
BEGIN
  -- Loop through users missing from dashboard
  FOR auth_user IN 
    SELECT u.id, u.email, u.raw_user_meta_data, u.created_at
    FROM auth.users u
    LEFT JOIN public.users p ON u.id = p.id
    WHERE p.id IS NULL
    ORDER BY u.created_at
  LOOP
    -- Generate unique phone number
    user_counter := user_counter + 1;
    unique_phone := '+254700' || LPAD(user_counter::text, 6, '0');
    
    -- Create dashboard user
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
      auth_user.id,
      COALESCE(auth_user.raw_user_meta_data->>'full_name', 'User'),
      'USER_' || SUBSTRING(auth_user.id::text, 1, 8),
      unique_phone,
      auth_user.email,
      'KRA_' || SUBSTRING(auth_user.id::text, 1, 8),
      'password_hash_placeholder',
      COALESCE(auth_user.raw_user_meta_data->>'role', 'user'),
      'active',
      auth_user.created_at,
      NOW()
    );
    
    RAISE NOTICE 'Added to dashboard: %', auth_user.email;
  END LOOP;
END $$;

-- Step 4: Verify sync
SELECT 
  'Final sync status:' as info,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as dashboard_users,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.users) 
    THEN 'SYNC COMPLETE'
    ELSE 'SYNC INCOMPLETE'
  END as status;

-- Step 5: Show all dashboard users
SELECT 
  'All dashboard users:' as info,
  email,
  full_name,
  role,
  phone_number,
  status,
  created_at
FROM public.users
ORDER BY created_at;
