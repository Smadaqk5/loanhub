-- DIAGNOSE DATABASE ISSUES
-- Run this first to see what's wrong with your database

-- Check if users table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
        ) THEN 'users table EXISTS'
        ELSE 'users table DOES NOT EXIST'
    END as table_status;

-- Check users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if role column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role'
            AND table_schema = 'public'
        ) THEN 'role column EXISTS'
        ELSE 'role column DOES NOT EXIST'
    END as role_column_status;

-- Check if status column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'status'
            AND table_schema = 'public'
        ) THEN 'status column EXISTS'
        ELSE 'status column DOES NOT EXIST'
    END as status_column_status;

-- Check auth.users table structure
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;
