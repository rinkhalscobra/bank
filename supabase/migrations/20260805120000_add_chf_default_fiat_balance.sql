/*
  # Add CHF as a default fiat balance

  - Seeds USD, EUR, CAD, and CHF for every new user.
  - Backfills any missing default fiat balance for existing profiles.
  - Exposes an authenticated, idempotent repair function used at login.
  - Never overwrites an existing balance, name, status, or display order.
*/

CREATE OR REPLACE FUNCTION public.seed_default_fiat_balances(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'A user id is required';
  END IF;

  WITH defaults(currency, name, sort_order) AS (
    VALUES
      ('USD'::text, 'US Dollar'::text, 0),
      ('EUR'::text, 'Euro'::text, 1),
      ('CAD'::text, 'Canadian Dollar'::text, 2),
      ('CHF'::text, 'Swiss Franc'::text, 3)
  ),
  current_position AS (
    SELECT COALESCE(MAX(display_order), -1) AS max_order
    FROM public.fiat_balances
    WHERE user_id = p_user_id
  ),
  missing AS (
    SELECT
      defaults.currency,
      defaults.name,
      ROW_NUMBER() OVER (ORDER BY defaults.sort_order) - 1 AS position_offset
    FROM defaults
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.fiat_balances AS existing
      WHERE existing.user_id = p_user_id
        AND existing.currency = defaults.currency
    )
  )
  INSERT INTO public.fiat_balances (
    user_id,
    currency,
    name,
    balance,
    status,
    display_order
  )
  SELECT
    p_user_id,
    missing.currency,
    missing.name,
    0,
    'available',
    (current_position.max_order + missing.position_offset + 1)::integer
  FROM missing
  CROSS JOIN current_position
  ON CONFLICT (user_id, currency) DO NOTHING;
END;
$$;

-- This helper accepts an arbitrary user id, so only database-owned routines may call it.
REVOKE ALL ON FUNCTION public.seed_default_fiat_balances(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.seed_default_fiat_balances(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.seed_default_fiat_balances(uuid) FROM authenticated;

CREATE OR REPLACE FUNCTION public.ensure_default_fiat_balances()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  PERFORM public.seed_default_fiat_balances(current_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_default_fiat_balances() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_default_fiat_balances() FROM anon;
GRANT EXECUTE ON FUNCTION public.ensure_default_fiat_balances() TO authenticated;

-- Repair all existing users now, including accounts missing CHF.
DO $$
DECLARE
  profile_user_id uuid;
BEGIN
  FOR profile_user_id IN
    SELECT id FROM public.profiles
  LOOP
    PERFORM public.seed_default_fiat_balances(profile_user_id);
  END LOOP;
END;
$$;

-- Keep the current signup behavior while adding CHF to the default fiat balances.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  btc_id uuid := gen_random_uuid();
  eth_id uuid := gen_random_uuid();
  sol_id uuid := gen_random_uuid();
  usdt_id uuid := gen_random_uuid();
  usdc_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );

  PERFORM public.seed_default_fiat_balances(NEW.id);

  INSERT INTO public.crypto_balances (id, user_id, symbol, name, balance)
  VALUES
    (btc_id, NEW.id, 'BTC', 'Bitcoin', 0),
    (eth_id, NEW.id, 'ETH', 'Ethereum', 0),
    (sol_id, NEW.id, 'SOL', 'Solana', 0),
    (usdt_id, NEW.id, 'USDT', 'Tether', 0),
    (usdc_id, NEW.id, 'USDC', 'USD Coin', 0);

  RETURN NEW;
END;
$$;
