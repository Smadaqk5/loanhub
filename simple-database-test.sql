-- SIMPLE DATABASE TEST
-- Run this to test basic database connectivity and identify issues

-- Test 1: Basic connection test
SELECT 'Database connection test' as test, NOW() as current_time;

-- Test 2: Check if we can access information_schema
SELECT 'Schema access test' as test, COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Test 3: Check if users table exists (simple version)
SELECT 'Users table check' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
        ) THEN 'users table EXISTS'
        ELSE 'users table DOES NOT EXIST'
    END as result;

-- Test 4: Check if we can query users table (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Users table exists - checking columns...';
    ELSE
        RAISE NOTICE 'Users table does not exist';
    END IF;
END $$;

-- Test 5: Simple column check (if table exists)
SELECT 'Column check' as test,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position
LIMIT 10;
