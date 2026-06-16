/*
  # Add profile password metadata fields

  1. New fields on profiles
    - `last_password_set_at` for safe password-change metadata
    - `dev_password_note` for test labels only
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'last_password_set_at'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN last_password_set_at timestamptz DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'dev_password_note'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN dev_password_note text NOT NULL DEFAULT '';
  END IF;
END $$;

UPDATE public.profiles
SET last_password_set_at = COALESCE(last_password_set_at, created_at, now())
WHERE last_password_set_at IS NULL;
