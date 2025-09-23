-- MAKE ANY USER ADMIN - SIMPLE METHOD
-- Replace 'your-email@example.com' with the actual email you want to make admin

-- Step 1: Show all users first
SELECT 
  'All users in auth.users:' as info,
  email,
  raw_user_meta_data->>'role' as current_role,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users
ORDER BY created_at;

-- Step 2: Update specific user to admin
-- CHANGE THE EMAIL BELOW TO THE USER YOU WANT TO MAKE ADMIN
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "admin", "full_name": "System Administrator"}',
    updated_at = NOW()
WHERE email = 'your-email@example.com';

-- Step 3: Verify the change
SELECT 
  'User updated to admin:' as info,
  email,
  raw_user_meta_data->>'role' as new_role,
  raw_user_meta_data->>'full_name' as full_name,
  updated_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- Step 4: Show all admin users
SELECT 
  'All admin users:' as info,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
