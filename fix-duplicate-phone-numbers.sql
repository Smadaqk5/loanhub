-- FIX DUPLICATE PHONE NUMBERS
-- This script fixes existing duplicate phone numbers in public.users

-- Step 1: Check for duplicate phone numbers
SELECT 
  'Duplicate phone numbers check:' as info,
  phone_number,
  COUNT(*) as count
FROM public.users
GROUP BY phone_number
HAVING COUNT(*) > 1;

-- Step 2: Update duplicate phone numbers to make them unique
DO $$
DECLARE
  user_record RECORD;
  new_phone TEXT;
  counter INTEGER := 1;
BEGIN
  -- Loop through users with duplicate phone numbers
  FOR user_record IN 
    SELECT id, email, phone_number
    FROM public.users
    WHERE phone_number IN (
      SELECT phone_number 
      FROM public.users 
      GROUP BY phone_number 
      HAVING COUNT(*) > 1
    )
    ORDER BY created_at
  LOOP
    -- Generate unique phone number
    new_phone := '+254700' || LPAD(counter::text, 6, '0');
    
    -- Update the phone number
    UPDATE public.users 
    SET phone_number = new_phone,
        updated_at = NOW()
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Updated phone for % from % to %', user_record.email, user_record.phone_number, new_phone;
    
    counter := counter + 1;
  END LOOP;
END $$;

-- Step 3: Verify no more duplicates
SELECT 
  'Final duplicate check:' as info,
  phone_number,
  COUNT(*) as count
FROM public.users
GROUP BY phone_number
HAVING COUNT(*) > 1;

-- Step 4: Show all users with their phone numbers
SELECT 
  'All users with phone numbers:' as info,
  email,
  phone_number,
  role,
  created_at
FROM public.users
ORDER BY created_at;
