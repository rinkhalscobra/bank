/*
  # Add plain_password to profiles

  Keeps the local schema aligned with the CRM/password sync flow by storing
  the current plaintext password value on the profile row.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'plain_password'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN plain_password text;
  END IF;
END $$;
