-- FIX PUBLIC.USERS ROLE COLUMN
-- This script ensures the role column exists and works properly in public.users

-- Step 1: Check if role column exists in public.users
SELECT 
    'Checking public.users table:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'role';

-- Step 2: If role column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Added role column to public.users table';
    ELSE
        RAISE NOTICE 'role column already exists in public.users';
    END IF;
END $$;

-- Step 3: Add check constraint for role column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_role_check' 
        AND table_name = 'users'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('user', 'admin'));
        RAISE NOTICE 'Added role constraint to public.users';
    ELSE
        RAISE NOTICE 'role constraint already exists in public.users';
    END IF;
END $$;

-- Step 4: Check if status column exists
SELECT 
    'Checking status column:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'status';

-- Step 5: Add status column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to public.users table';
    ELSE
        RAISE NOTICE 'status column already exists in public.users';
    END IF;
END $$;

-- Step 6: Add status constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_status_check' 
        AND table_name = 'users'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'suspended'));
        RAISE NOTICE 'Added status constraint to public.users';
    ELSE
        RAISE NOTICE 'status constraint already exists in public.users';
    END IF;
END $$;

-- Step 7: Verify the columns now exist
SELECT 
    'Final verification - public.users columns:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('role', 'status')
ORDER BY column_name;

-- Step 8: Show all columns in public.users
SELECT 
    'All columns in public.users:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
