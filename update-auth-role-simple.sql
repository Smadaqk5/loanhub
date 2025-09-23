-- UPDATE ADMIN ROLE IN AUTHENTICATION - SIMPLE METHOD
-- This script just updates the role in auth.users table

-- Step 1: Check current user roles
SELECT 
  'Current user roles:' as info,
  email,
  raw_user_meta_data->>'role' as current_role,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at;

-- Step 2: Update specific user to admin (replace email with your user's email)
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "admin", "full_name": "System Administrator"}',
    updated_at = NOW()
WHERE email = 'admin@loanhub.com';

-- Step 3: Or update any user by email (change the email below)
-- UPDATE auth.users 
-- SET raw_user_meta_data = '{"role": "admin", "full_name": "Your Name"}',
--     updated_at = NOW()
-- WHERE email = 'your-email@example.com';

-- Step 4: Verify the update worked
SELECT 
  'Updated user roles:' as info,
  email,
  raw_user_meta_data->>'role' as new_role,
  raw_user_meta_data->>'full_name' as full_name,
  updated_at
FROM auth.users
WHERE email = 'admin@loanhub.com';

-- Step 5: Show all admin users
SELECT 
  'All admin users:' as info,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
