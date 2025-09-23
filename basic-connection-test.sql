-- BASIC CONNECTION TEST
-- Run this first to test if your database connection works

-- Test 1: Simple query
SELECT 'Hello Database!' as message;

-- Test 2: Current time
SELECT NOW() as current_time;

-- Test 3: Check if we can access tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
LIMIT 5;
