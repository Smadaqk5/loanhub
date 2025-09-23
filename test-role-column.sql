-- TEST ROLE COLUMN IN PUBLIC.USERS
-- Run this to test if the role column works properly

-- Step 1: Check if role column exists and is accessible
SELECT 
    'Testing role column access:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'role';

-- Step 2: Try to insert a test record with role
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

-- Step 3: Verify the test record was inserted
SELECT 
    'Test record verification:' as info,
    full_name,
    email,
    role,
    status
FROM public.users 
WHERE email = 'test@loanhub.com';

-- Step 4: Clean up test record
DELETE FROM public.users WHERE email = 'test@loanhub.com';

-- Step 5: Confirm cleanup
SELECT 
    'Cleanup verification:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'test@loanhub.com') 
        THEN 'Test record still exists'
        ELSE 'Test record cleaned up successfully'
    END as cleanup_status;
