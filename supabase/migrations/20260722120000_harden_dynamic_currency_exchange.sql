/*
  # Harden dynamic fiat exchange and enable live balance updates

  - Keeps fiat exchange generic for every configured ISO currency.
  - Requires both CRM-managed balances to exist and be available.
  - Normalizes codes and verifies the credited amount matches the quoted rate.
  - Publishes fiat and crypto balance changes so open exchange screens refresh
    when CRM adds, edits, reorders, or deletes a balance.
*/

CREATE OR REPLACE FUNCTION public.execute_currency_exchange(
  p_user_id uuid,
  p_from_currency text,
  p_to_currency text,
  p_from_amount numeric,
  p_to_amount numeric,
  p_exchange_rate numeric,
  p_fee numeric DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_currency text := upper(trim(p_from_currency));
  v_to_currency text := upper(trim(p_to_currency));
  v_current_balance numeric;
  v_source_status text;
  v_target_status text;
  v_exchange_id uuid;
BEGIN
  IF NOT public.can_manage_user_scope(p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_from_currency !~ '^[A-Z]{3}$' OR v_to_currency !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'Fiat currencies must use 3-letter ISO codes';
  END IF;

  IF v_from_currency = v_to_currency THEN
    RAISE EXCEPTION 'Source and destination currencies must differ';
  END IF;

  IF p_from_amount <= 0 OR p_to_amount <= 0 OR p_exchange_rate <= 0 THEN
    RAISE EXCEPTION 'Amounts and exchange rate must be positive';
  END IF;

  IF COALESCE(p_fee, 0) < 0 THEN
    RAISE EXCEPTION 'Fee cannot be negative';
  END IF;

  IF abs(p_to_amount - round(p_from_amount * p_exchange_rate, 2)) > 0.011 THEN
    RAISE EXCEPTION 'Destination amount does not match the quoted exchange rate';
  END IF;

  -- Always lock a pair in currency order so opposite-direction exchanges cannot deadlock.
  PERFORM id
  FROM public.fiat_balances
  WHERE user_id = p_user_id
    AND currency IN (v_from_currency, v_to_currency)
  ORDER BY currency
  FOR UPDATE;

  SELECT balance, status
  INTO v_current_balance, v_source_status
  FROM public.fiat_balances
  WHERE user_id = p_user_id AND currency = v_from_currency;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source currency balance not found';
  END IF;

  SELECT status
  INTO v_target_status
  FROM public.fiat_balances
  WHERE user_id = p_user_id AND currency = v_to_currency;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Destination currency balance not found';
  END IF;

  IF COALESCE(v_source_status, 'available') <> 'available' THEN
    RAISE EXCEPTION 'Source currency balance is % and cannot be exchanged', v_source_status;
  END IF;

  IF COALESCE(v_target_status, 'available') <> 'available' THEN
    RAISE EXCEPTION 'Destination currency balance is % and cannot receive exchanged funds', v_target_status;
  END IF;

  IF v_current_balance < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_current_balance;
  END IF;

  UPDATE public.fiat_balances
  SET balance = balance - p_from_amount
  WHERE user_id = p_user_id AND currency = v_from_currency;

  UPDATE public.fiat_balances
  SET balance = balance + p_to_amount
  WHERE user_id = p_user_id AND currency = v_to_currency;

  INSERT INTO public.currency_exchanges (
    user_id,
    from_currency,
    to_currency,
    from_amount,
    to_amount,
    exchange_rate,
    fee,
    status
  )
  VALUES (
    p_user_id,
    v_from_currency,
    v_to_currency,
    p_from_amount,
    p_to_amount,
    p_exchange_rate,
    COALESCE(p_fee, 0),
    'completed'
  )
  RETURNING id INTO v_exchange_id;

  RETURN v_exchange_id;
END;
$$;

REVOKE ALL ON FUNCTION public.execute_currency_exchange(uuid, text, text, numeric, numeric, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_currency_exchange(uuid, text, text, numeric, numeric, numeric, numeric) TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'fiat_balances'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.fiat_balances;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'crypto_balances'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crypto_balances;
    END IF;
  END IF;
END $$;

