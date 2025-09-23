-- TEST ADMIN LOGIN
-- Run this to verify admin login is working

-- Step 1: Check if admin user exists in auth.users
SELECT 
  'Auth Users Check:' as test,
  COUNT(*) as count,
  email,
  raw_user_meta_data->>'role' as auth_role
FROM auth.users 
WHERE email = 'admin@loanhub.com'
GROUP BY email, raw_user_meta_data;

-- Step 2: Check if admin profile exists in public.users
SELECT 
  'Public Users Check:' as test,
  COUNT(*) as count,
  email,
  role,
  status,
  full_name
FROM public.users 
WHERE email = 'admin@loanhub.com'
GROUP BY email, role, status, full_name;

-- Step 3: Test is_admin function
SELECT 
  'Is Admin Function Test:' as test,
  is_admin() as result;

-- Step 4: Check RLS policies
SELECT 
  'RLS Policies:' as test,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'users'
AND schemaname = 'public';

-- Step 5: Test direct query to users table
SELECT 
  'Direct Query Test:' as test,
  role,
  status,
  email
FROM public.users 
WHERE email = 'admin@loanhub.com';

-- Step 6: Check if we can insert a test user
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
  gen_random_uuid(),
  'Test User',
  'TEST001',
  '+254700000001',
  'test@loanhub.com',
  'TEST001',
  crypt('TestPassword123!', gen_salt('bf')),
  'user',
  'active',
  NOW(),
  NOW()
);

-- Step 7: Verify test user was inserted
SELECT 
  'Test User Insert:' as test,
  email,
  role,
  status
FROM public.users 
WHERE email = 'test@loanhub.com';

-- Step 8: Clean up test user
DELETE FROM public.users WHERE email = 'test@loanhub.com';

-- Step 9: Final verification
SELECT 
  'Final Status:' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@loanhub.com') 
    AND EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@loanhub.com' AND role = 'admin')
    THEN 'Admin setup is COMPLETE and ready for login'
    ELSE 'Admin setup is INCOMPLETE - check the errors above'
  END as status;
