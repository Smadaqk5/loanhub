-- SYNC AUTHENTICATION USERS TO WEBSITE DASHBOARD
-- This script ensures all auth.users appear in your website's user management

-- Step 1: Check current state of both tables
SELECT 
  'Authentication users count:' as info,
  COUNT(*) as count
FROM auth.users;

SELECT 
  'Dashboard users count:' as info,
  COUNT(*) as count
FROM public.users;

-- Step 2: Show users in authentication
SELECT 
  'Users in Authentication:' as info,
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
ORDER BY created_at;

-- Step 3: Show users in dashboard (public.users)
SELECT 
  'Users in Dashboard:' as info,
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM public.users
ORDER BY created_at;

-- Step 4: Sync all authentication users to dashboard
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
      
      -- Create public.users record for dashboard
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
      
      RAISE NOTICE 'Synced user to dashboard: % (role: %, phone: %)', 
        auth_user.email, user_role, unique_phone;
    ELSE
      -- Update existing user if role changed
      UPDATE public.users SET
        role = COALESCE(auth_user.raw_user_meta_data->>'role', role),
        full_name = COALESCE(auth_user.raw_user_meta_data->>'full_name', full_name),
        updated_at = NOW()
      WHERE id = auth_user.id;
      
      RAISE NOTICE 'Updated existing dashboard user: %', auth_user.email;
    END IF;
  END LOOP;
END $$;

-- Step 5: Create auto-sync trigger for future users
CREATE OR REPLACE FUNCTION sync_new_user_to_dashboard()
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
  
  -- Insert new user into public.users for dashboard
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

-- Step 6: Create trigger for auto-sync
DROP TRIGGER IF EXISTS sync_auth_to_dashboard ON auth.users;
CREATE TRIGGER sync_auth_to_dashboard
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_new_user_to_dashboard();

-- Step 7: Verify sync completed
SELECT 
  'Sync Verification - Auth Users:' as info,
  COUNT(*) as count
FROM auth.users;

SELECT 
  'Sync Verification - Dashboard Users:' as info,
  COUNT(*) as count
FROM public.users;

-- Step 8: Show final sync results
SELECT 
  'Dashboard Users After Sync:' as info,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as dashboard_role,
  p.phone_number,
  p.full_name,
  p.status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
ORDER BY u.created_at;

-- Step 9: Test the trigger with a test user
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
  'test-dashboard@loanhub.com',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "user", "full_name": "Test Dashboard User"}',
  NOW(),
  NOW()
);

-- Step 10: Verify trigger worked
SELECT 
  'Trigger Test - Auth User:' as info,
  email,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email = 'test-dashboard@loanhub.com';

SELECT 
  'Trigger Test - Dashboard User:' as info,
  email,
  full_name,
  role,
  phone_number
FROM public.users 
WHERE email = 'test-dashboard@loanhub.com';

-- Step 11: Clean up test user
DELETE FROM auth.users WHERE email = 'test-dashboard@loanhub.com';
DELETE FROM public.users WHERE email = 'test-dashboard@loanhub.com';

-- Step 12: Final status
SELECT 
  'Dashboard Sync Complete!' as status,
  'All authentication users now appear in your website dashboard' as message,
  'Future users will be automatically synced' as note;
