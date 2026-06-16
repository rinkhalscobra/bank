/*
  # Allow CRM admins to insert and delete managed records

  Extends the CRM admin permissions so authenticated admin users can
  create and delete rows across the same tables they can already view
  and update from the CRM panel.
*/

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
  FOREACH scoped_table IN ARRAY scoped_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins can insert all rows" ON public.%I', scoped_table);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can delete all rows" ON public.%I', scoped_table);

    EXECUTE format(
      'CREATE POLICY "Admins can insert all rows" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin_user())',
      scoped_table
    );

    EXECUTE format(
      'CREATE POLICY "Admins can delete all rows" ON public.%I FOR DELETE TO authenticated USING (public.is_admin_user())',
      scoped_table
    );
  END LOOP;

  EXECUTE 'DROP POLICY IF EXISTS "Admins can insert deposit wallets" ON public.deposit_wallets';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can delete deposit wallets" ON public.deposit_wallets';

  EXECUTE '
    CREATE POLICY "Admins can insert deposit wallets"
    ON public.deposit_wallets
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_user())
  ';

  EXECUTE '
    CREATE POLICY "Admins can delete deposit wallets"
    ON public.deposit_wallets
    FOR DELETE
    TO authenticated
    USING (public.is_admin_user())
  ';
END $$;
