-- DEBUG ADMIN LOGIN ISSUE
-- Run this to see what's wrong with admin login

-- Step 1: Check if auth.users has admin user
SELECT 
  'Auth users check:' as info,
  email,
  raw_user_meta_data->>'role' as auth_role,
  email_confirmed_at
FROM auth.users 
WHERE email = 'admin@loanhub.com';

-- Step 2: Check if public.users has admin profile
SELECT 
  'Public users check:' as info,
  email,
  role,
  status,
  full_name
FROM public.users 
WHERE email = 'admin@loanhub.com';

-- Step 3: Check if is_admin function exists
SELECT 
  'Function check:' as info,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'is_admin'
AND routine_schema = 'public';

-- Step 4: Test is_admin function
SELECT 
  'Function test:' as info,
  is_admin() as result;

-- Step 5: Check RLS policies
SELECT 
  'RLS policies check:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
AND schemaname = 'public';

-- Step 6: Check table structure
SELECT 
  'Table structure:' as info,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
