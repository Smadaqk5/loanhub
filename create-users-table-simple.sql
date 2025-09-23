-- CREATE USERS TABLE - SIMPLE VERSION
-- Run this if the users table doesn't exist or has issues

-- Step 1: Drop users table if it exists (be careful!)
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Create users table with all required columns
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    national_id TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    kra_pin TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_national_id ON public.users(national_id);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);

-- Step 4: Verify table was created
SELECT 'Users table created successfully' as status,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
