-- VERIFY USER SYNC STATUS
-- Run this to check if users are properly synced between auth.users and public.users

-- Step 1: Count users in each table
SELECT 
  'User Count Comparison:' as info,
  'auth.users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'User Count Comparison:' as info,
  'public.users' as table_name,
  COUNT(*) as count
FROM public.users;

-- Step 2: Check for users in auth.users but not in public.users
SELECT 
  'Users in auth.users but NOT in public.users:' as info,
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'role' as role
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE p.id IS NULL;

-- Step 3: Check for users in public.users but not in auth.users
SELECT 
  'Users in public.users but NOT in auth.users:' as info,
  p.id,
  p.email,
  p.full_name,
  p.role
FROM public.users p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- Step 4: Check for role mismatches
SELECT 
  'Role Mismatches:' as info,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as public_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' != p.role THEN 'MISMATCH'
    ELSE 'MATCH'
  END as status
FROM auth.users u
JOIN public.users p ON u.id = p.id
WHERE u.raw_user_meta_data->>'role' != p.role;

-- Step 5: Show all users with their sync status
SELECT 
  'Complete User Sync Status:' as info,
  u.email,
  u.raw_user_meta_data->>'full_name' as auth_name,
  p.full_name as public_name,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as public_role,
  p.phone_number,
  CASE 
    WHEN p.id IS NOT NULL THEN 'SYNCED'
    ELSE 'NOT SYNCED'
  END as sync_status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
ORDER BY u.created_at;

-- Step 6: Check for duplicate phone numbers
SELECT 
  'Duplicate Phone Numbers:' as info,
  phone_number,
  COUNT(*) as count
FROM public.users
GROUP BY phone_number
HAVING COUNT(*) > 1;

-- Step 7: Check for duplicate emails
SELECT 
  'Duplicate Emails:' as info,
  email,
  COUNT(*) as count
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 8: Summary
SELECT 
  'Sync Summary:' as info,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users,
  (SELECT COUNT(*) FROM auth.users u JOIN public.users p ON u.id = p.id) as synced_users,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.users) 
    AND (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM auth.users u JOIN public.users p ON u.id = p.id)
    THEN 'ALL USERS SYNCED'
    ELSE 'SYNC INCOMPLETE'
  END as sync_status;
