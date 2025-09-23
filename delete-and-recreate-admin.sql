-- DELETE AND RECREATE ADMIN USER
-- Simple script to handle existing admin user

-- Delete existing admin user
DELETE FROM auth.users WHERE email = 'admin@loanhub.com';
DELETE FROM public.users WHERE email = 'admin@loanhub.com';

-- Create new admin user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@loanhub.com',
  crypt('Admin@LoanHub2024!', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "full_name": "System Administrator"}',
  NOW(),
  NOW()
);

-- Create admin profile
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@loanhub.com';
  
  INSERT INTO public.users (
    id, full_name, national_id, phone_number, email, kra_pin,
    password_hash, role, status, created_at, updated_at
  ) VALUES (
    admin_id, 'System Administrator', 'ADMIN001', '+254700000000',
    'admin@loanhub.com', 'ADMIN001', crypt('Admin@LoanHub2024!', gen_salt('bf')),
    'admin', 'active', NOW(), NOW()
  );
END $$;

-- Verify
SELECT 'Admin recreated! Login with admin@loanhub.com / Admin@LoanHub2024!' as result;
