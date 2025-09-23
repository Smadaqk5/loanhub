-- QUICK DATABASE CHECK
-- Run this to see what's currently in your database

-- Check if users table exists
SELECT 
    'Table Status:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
        ) THEN 'users table EXISTS'
        ELSE 'users table DOES NOT EXIST'
    END as result;

-- Show all columns in users table
SELECT 
    'Current columns in users table:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for specific columns we need
SELECT 
    'Required columns check:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role'
            AND table_schema = 'public'
        ) THEN '✅ role column EXISTS'
        ELSE '❌ role column MISSING'
    END as role_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'status'
            AND table_schema = 'public'
        ) THEN '✅ status column EXISTS'
        ELSE '❌ status column MISSING'
    END as status_status;
