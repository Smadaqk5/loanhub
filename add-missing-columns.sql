-- SIMPLE SCRIPT TO ADD MISSING COLUMNS
-- Run this if you just want to add the missing columns

-- Add role column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add check constraint for role
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
    END IF;
END $$;

-- Add status column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add check constraint for status
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
    END IF;
END $$;

-- Verify columns were added
SELECT 
    'Columns added successfully!' as status,
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('role', 'status')
ORDER BY column_name;
