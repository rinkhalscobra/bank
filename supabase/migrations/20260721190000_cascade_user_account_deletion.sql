/*
  # Make CRM user deletion complete and deterministic

  Deleting an Auth user removes the matching profile and every user-owned row.
  Global site branding is retained; only its audit reference is cleared.
*/

DO $$
DECLARE
  target_table text;
  target_relation regclass;
  user_id_attnum smallint;
  constraint_record record;
  user_tables text[] := ARRAY[
    'accounts',
    'balance_snapshots',
    'bank_transfers',
    'beneficiaries',
    'bill_payments',
    'cards',
    'crypto_balances',
    'crypto_deposits',
    'crypto_transactions',
    'crypto_transfers',
    'crypto_wallets',
    'currency_exchanges',
    'fiat_balances',
    'fixed_deposits',
    'kyc_submissions',
    'loans',
    'savings_goals',
    'scheduled_transfers',
    'staking_positions',
    'tax_summary_cards',
    'tax_wallet_addresses',
    'taxes',
    'transactions',
    'transfers'
  ];
BEGIN
  FOREACH target_table IN ARRAY user_tables
  LOOP
    target_relation := to_regclass(format('public.%I', target_table));
    IF target_relation IS NULL THEN
      CONTINUE;
    END IF;

    SELECT attnum
    INTO user_id_attnum
    FROM pg_attribute
    WHERE attrelid = target_relation
      AND attname = 'user_id'
      AND NOT attisdropped;

    IF user_id_attnum IS NULL THEN
      CONTINUE;
    END IF;

    FOR constraint_record IN
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = target_relation
        AND contype = 'f'
        AND user_id_attnum = ANY (conkey)
    LOOP
      EXECUTE format(
        'ALTER TABLE public.%I DROP CONSTRAINT %I',
        target_table,
        constraint_record.conname
      );
    END LOOP;

    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE',
      target_table,
      target_table || '_user_id_fkey'
    );

    user_id_attnum := NULL;
  END LOOP;
END $$;

DO $$
DECLARE
  profile_id_attnum smallint;
  constraint_record record;
BEGIN
  SELECT attnum
  INTO profile_id_attnum
  FROM pg_attribute
  WHERE attrelid = 'public.profiles'::regclass
    AND attname = 'id'
    AND NOT attisdropped;

  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'f'
      AND profile_id_attnum = ANY (conkey)
  LOOP
    EXECUTE format(
      'ALTER TABLE public.profiles DROP CONSTRAINT %I',
      constraint_record.conname
    );
  END LOOP;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
END $$;

DO $$
DECLARE
  updated_by_attnum smallint;
  constraint_record record;
BEGIN
  IF to_regclass('public.site_branding') IS NULL THEN
    RETURN;
  END IF;

  SELECT attnum
  INTO updated_by_attnum
  FROM pg_attribute
  WHERE attrelid = 'public.site_branding'::regclass
    AND attname = 'updated_by'
    AND NOT attisdropped;

  IF updated_by_attnum IS NULL THEN
    RETURN;
  END IF;

  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.site_branding'::regclass
      AND contype = 'f'
      AND updated_by_attnum = ANY (conkey)
  LOOP
    EXECUTE format(
      'ALTER TABLE public.site_branding DROP CONSTRAINT %I',
      constraint_record.conname
    );
  END LOOP;

  ALTER TABLE public.site_branding
    ADD CONSTRAINT site_branding_updated_by_fkey
    FOREIGN KEY (updated_by)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;
END $$;

COMMENT ON CONSTRAINT profiles_id_fkey ON public.profiles IS
  'Deleting a Supabase Auth user cascades through the profile and all user-owned records.';
