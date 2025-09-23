-- CHECK AND FIX ROLE COLUMN ISSUE
-- Run this in Supabase SQL Editor to diagnose and fix the role column

-- Step 1: Check if users table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
        ) THEN '✅ users table EXISTS'
        ELSE '❌ users table DOES NOT EXIST'
    END as table_status;

-- Step 2: Show all columns in users table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check specifically for role column
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role'
            AND table_schema = 'public'
        ) THEN '✅ role column EXISTS'
        ELSE '❌ role column DOES NOT EXIST'
    END as role_column_status;

-- Step 4: If role column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        -- Add role column
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';
        
        -- Add check constraint
        ALTER TABLE public.users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('user', 'admin'));
        
        RAISE NOTICE '✅ Added role column to users table';
    ELSE
        RAISE NOTICE '✅ role column already exists';
    END IF;
END $$;

-- Step 5: Check specifically for status column
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'status'
            AND table_schema = 'public'
        ) THEN '✅ status column EXISTS'
        ELSE '❌ status column DOES NOT EXIST'
    END as status_column_status;

-- Step 6: If status column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        -- Add status column
        ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active';
        
        -- Add check constraint
        ALTER TABLE public.users ADD CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'suspended'));
        
        RAISE NOTICE '✅ Added status column to users table';
    ELSE
        RAISE NOTICE '✅ status column already exists';
    END IF;
END $$;

-- Step 7: Verify the columns now exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('role', 'status')
ORDER BY column_name;

-- Step 8: Show final table structure
SELECT 
    'Final users table structure:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
