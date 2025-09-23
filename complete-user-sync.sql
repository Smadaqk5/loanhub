-- COMPLETE USER SYNC - AUTHENTICATION TO PUBLIC USERS
-- This script syncs all auth.users to public.users and handles all edge cases

-- Step 1: Check current state of both tables
SELECT 
  'Current auth.users count:' as info,
  COUNT(*) as count
FROM auth.users;

SELECT 
  'Current public.users count:' as info,
  COUNT(*) as count
FROM public.users;

-- Step 2: Show users in auth.users
SELECT 
  'Users in auth.users:' as info,
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
ORDER BY created_at;

-- Step 3: Show users in public.users
SELECT 
  'Users in public.users:' as info,
  id,
  email,
  full_name,
  role,
  phone_number,
  created_at
FROM public.users
ORDER BY created_at;

-- Step 4: Clean up any existing duplicates or conflicts
DELETE FROM public.users WHERE email IN (
  SELECT email FROM auth.users WHERE email NOT IN (
    SELECT DISTINCT email FROM public.users WHERE id IN (
      SELECT id FROM auth.users
    )
  )
);

-- Step 5: Sync all auth.users to public.users with proper handling
DO $$
DECLARE
  auth_user RECORD;
  user_counter INTEGER := 0;
  unique_phone TEXT;
  user_role TEXT;
  user_full_name TEXT;
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
      
      -- Extract role and full name from metadata
      user_role := COALESCE(auth_user.raw_user_meta_data->>'role', 'user');
      user_full_name := COALESCE(auth_user.raw_user_meta_data->>'full_name', 'User');
      
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
        user_full_name,
        'USER_' || SUBSTRING(auth_user.id::text, 1, 8),
        unique_phone,
        auth_user.email,
        'KRA_' || SUBSTRING(auth_user.id::text, 1, 8),
        'password_hash_placeholder',
        user_role,
        'active',
        auth_user.created_at,
        NOW()
      );
      
      RAISE NOTICE 'Created public.users record for: % (role: %, phone: %)', 
        auth_user.email, user_role, unique_phone;
    ELSE
      -- Update existing user if needed
      UPDATE public.users SET
        role = COALESCE(auth_user.raw_user_meta_data->>'role', role),
        full_name = COALESCE(auth_user.raw_user_meta_data->>'full_name', full_name),
        updated_at = NOW()
      WHERE id = auth_user.id;
      
      RAISE NOTICE 'Updated existing public.users record for: %', auth_user.email;
    END IF;
  END LOOP;
END $$;

-- Step 6: Create auto-sync trigger for future users
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  unique_phone TEXT;
  user_counter INTEGER;
BEGIN
  -- Get next phone number
  SELECT COALESCE(MAX(CAST(SUBSTRING(phone_number, 8) AS INTEGER)), 0) + 1
  INTO user_counter
  FROM public.users;
  
  unique_phone := '+254700' || LPAD(user_counter::text, 6, '0');
  
  -- Insert new user into public.users
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
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'USER_' || SUBSTRING(NEW.id::text, 1, 8),
    unique_phone,
    NEW.email,
    'KRA_' || SUBSTRING(NEW.id::text, 1, 8),
    'password_hash_placeholder',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    NEW.created_at,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- Step 8: Verify sync completed
SELECT 
  'Sync Verification - Auth Users:' as info,
  COUNT(*) as count
FROM auth.users;

SELECT 
  'Sync Verification - Public Users:' as info,
  COUNT(*) as count
FROM public.users;

-- Step 9: Show final sync results
SELECT 
  'Final Sync Results:' as info,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as public_role,
  p.phone_number,
  p.full_name
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
ORDER BY u.created_at;

-- Step 10: Test the trigger with a test user
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
  'test-sync@loanhub.com',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "user", "full_name": "Test Sync User"}',
  NOW(),
  NOW()
);

-- Step 11: Verify trigger worked
SELECT 
  'Trigger Test - Auth User:' as info,
  email,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email = 'test-sync@loanhub.com';

SELECT 
  'Trigger Test - Public User:' as info,
  email,
  full_name,
  role,
  phone_number
FROM public.users 
WHERE email = 'test-sync@loanhub.com';

-- Step 12: Clean up test user
DELETE FROM auth.users WHERE email = 'test-sync@loanhub.com';
DELETE FROM public.users WHERE email = 'test-sync@loanhub.com';

-- Step 13: Final status
SELECT 
  'Sync Complete!' as status,
  'All auth.users now have corresponding public.users records' as message,
  'Future users will be automatically synced' as note;
