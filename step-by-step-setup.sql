-- STEP-BY-STEP DATABASE SETUP FOR SUPABASE
-- Run each step in order in Supabase SQL Editor

-- STEP 1: Check if users table exists and what columns it has
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 2: If users table doesn't exist, create it
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- STEP 3: If users table exists but missing columns, add them
DO $$
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
        RAISE NOTICE 'Added role column to users table';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended'));
        RAISE NOTICE 'Added status column to users table';
    END IF;

    -- Add other missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'national_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN national_id TEXT UNIQUE;
        RAISE NOTICE 'Added national_id column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone_number TEXT UNIQUE;
        RAISE NOTICE 'Added phone_number column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'kra_pin'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN kra_pin TEXT UNIQUE;
        RAISE NOTICE 'Added kra_pin column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN password_hash TEXT;
        RAISE NOTICE 'Added password_hash column to users table';
    END IF;
END $$;

-- STEP 4: Verify the users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 5: Create admin user in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@loanhub.com',
  crypt('Admin@LoanHub2024!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "full_name": "System Administrator"}',
  NOW(),
  NOW()
);

-- STEP 6: Create admin user profile in public.users table
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@loanhub.com';
  
  -- Insert into public.users table
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
    admin_user_id,
    'System Administrator',
    'ADMIN001',
    '+254700000000',
    'admin@loanhub.com',
    'ADMIN001',
    crypt('Admin@LoanHub2024!', gen_salt('bf')),
    'admin',
    'active',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
END $$;

-- STEP 7: Verify admin user creation
SELECT 
  'Admin User Created Successfully' as status,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as profile_role,
  p.full_name,
  p.status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@loanhub.com';
