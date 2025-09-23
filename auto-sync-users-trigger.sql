-- AUTO-SYNC USERS TRIGGER
-- This creates a trigger to automatically sync new auth.users to public.users

-- Step 1: Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '+254700000000'),
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

-- Step 2: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 3: Test the trigger by creating a test user
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

-- Step 4: Verify the trigger worked
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
  role
FROM public.users 
WHERE email = 'test-sync@loanhub.com';

-- Step 5: Clean up test user
DELETE FROM auth.users WHERE email = 'test-sync@loanhub.com';
DELETE FROM public.users WHERE email = 'test-sync@loanhub.com';

-- Step 6: Show current status
SELECT 
  'Current Status:' as info,
  'Auth users:' as auth_count,
  (SELECT COUNT(*) FROM auth.users) as auth_total,
  'Public users:' as public_count,
  (SELECT COUNT(*) FROM public.users) as public_total;
