/*
  # Add account IBAN to profiles

  Stores the dashboard IBAN label shown to each customer and edited from CRM admin.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'account_iban'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN account_iban text NOT NULL DEFAULT '';
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.account_iban IS 'Customer account IBAN shown on the dashboard overview.';
