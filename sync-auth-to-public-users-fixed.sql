-- SYNC AUTH.USERS TO PUBLIC.USERS - FIXED VERSION
-- This script creates public.users records for all auth.users with unique phone numbers

-- Step 1: Check what users exist in auth.users
SELECT 
  'Users in auth.users:' as info,
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users
ORDER BY created_at;

-- Step 2: Check what users exist in public.users
SELECT 
  'Users in public.users:' as info,
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users
ORDER BY created_at;

-- Step 3: Create public.users records for all auth.users with unique phone numbers
DO $$
DECLARE
  auth_user RECORD;
  user_counter INTEGER := 0;
  unique_phone TEXT;
BEGIN
  -- Loop through all users in auth.users
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data, created_at
    FROM auth.users
    ORDER BY created_at
  LOOP
    -- Check if user already exists in public.users
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
      -- Generate unique phone number
      user_counter := user_counter + 1;
      unique_phone := '+254700' || LPAD(user_counter::text, 6, '0');
      
      -- Create public.users record
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
      
      RAISE NOTICE 'Created public.users record for: % with phone: %', auth_user.email, unique_phone;
    ELSE
      RAISE NOTICE 'User already exists in public.users: %', auth_user.email;
    END IF;
  END LOOP;
END $$;

-- Step 4: Verify sync completed
SELECT 
  'Sync Verification:' as info,
  COUNT(*) as total_auth_users
FROM auth.users;

SELECT 
  'Sync Verification:' as info,
  COUNT(*) as total_public_users
FROM public.users;

-- Step 5: Show all users in public.users after sync
SELECT 
  'All users in public.users after sync:' as info,
  id,
  email,
  full_name,
  phone_number,
  role,
  status,
  created_at
FROM public.users
ORDER BY created_at;
