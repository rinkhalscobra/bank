/*
  # Add CRM admin access

  1. Profiles
    - Adds `is_admin` to `profiles`
    - Adds `is_admin_user()` helper for RLS checks

  2. Policies
    - Allows admin users to read and update every user-scoped table
    - Allows admin users to read and update all profiles
    - Allows admin users to update global `deposit_wallets`
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

DO $$
DECLARE
  scoped_table text;
  scoped_tables text[] := ARRAY[
    'transactions',
    'transfers',
    'kyc_submissions',
    'crypto_balances',
    'cards',
    'bill_payments',
    'fixed_deposits',
    'currency_exchanges',
    'loans',
    'scheduled_transfers',
    'fiat_balances',
    'crypto_transactions',
    'crypto_wallets',
    'crypto_transfers',
    'taxes',
    'tax_wallet_addresses',
    'bank_transfers',
    'crypto_deposits',
    'balance_snapshots'
  ];
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles';

  EXECUTE '
    CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_admin_user())
  ';

  EXECUTE '
    CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin_user())
    WITH CHECK (public.is_admin_user())
  ';

  FOREACH scoped_table IN ARRAY scoped_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins can view all rows" ON public.%I', scoped_table);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can update all rows" ON public.%I', scoped_table);

    EXECUTE format(
      'CREATE POLICY "Admins can view all rows" ON public.%I FOR SELECT TO authenticated USING (public.is_admin_user())',
      scoped_table
    );

    EXECUTE format(
      'CREATE POLICY "Admins can update all rows" ON public.%I FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user())',
      scoped_table
    );
  END LOOP;

  EXECUTE 'DROP POLICY IF EXISTS "Admins can update deposit wallets" ON public.deposit_wallets';

  EXECUTE '
    CREATE POLICY "Admins can update deposit wallets"
    ON public.deposit_wallets
    FOR UPDATE
    TO authenticated
    USING (public.is_admin_user())
    WITH CHECK (public.is_admin_user())
  ';
END $$;
