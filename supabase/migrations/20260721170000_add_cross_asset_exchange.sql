/*
  # Add atomic fiat/crypto cross-asset exchange

  Converts fiat to crypto or crypto to fiat, validates both balance statuses,
  updates both balances in one transaction, and records the completed exchange.
*/

CREATE OR REPLACE FUNCTION public.execute_cross_asset_exchange(
  p_user_id uuid,
  p_direction text,
  p_from_asset text,
  p_to_asset text,
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
  v_source_balance numeric;
  v_target_balance numeric;
  v_source_status text;
  v_target_status text;
  v_exchange_id uuid;
BEGIN
  IF NOT public.can_manage_user_scope(p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_direction NOT IN ('fiat_to_crypto', 'crypto_to_fiat') THEN
    RAISE EXCEPTION 'Unsupported cross-asset exchange direction';
  END IF;

  IF p_from_amount <= 0 OR p_to_amount <= 0 OR p_exchange_rate <= 0 THEN
    RAISE EXCEPTION 'Amounts and exchange rate must be positive';
  END IF;

  IF p_direction = 'fiat_to_crypto' THEN
    SELECT balance, status
    INTO v_source_balance, v_source_status
    FROM public.fiat_balances
    WHERE user_id = p_user_id AND currency = p_from_asset
    FOR UPDATE;

    SELECT balance, status
    INTO v_target_balance, v_target_status
    FROM public.crypto_balances
    WHERE user_id = p_user_id AND symbol = p_to_asset
    FOR UPDATE;
  ELSE
    -- Lock fiat before crypto in both directions to avoid opposite-direction deadlocks.
    SELECT balance, status
    INTO v_target_balance, v_target_status
    FROM public.fiat_balances
    WHERE user_id = p_user_id AND currency = p_to_asset
    FOR UPDATE;

    SELECT balance, status
    INTO v_source_balance, v_source_status
    FROM public.crypto_balances
    WHERE user_id = p_user_id AND symbol = p_from_asset
    FOR UPDATE;
  END IF;

  IF v_source_balance IS NULL THEN
    RAISE EXCEPTION 'Source balance not found';
  END IF;

  IF v_target_balance IS NULL THEN
    RAISE EXCEPTION 'Destination balance not found';
  END IF;

  IF COALESCE(v_source_status, 'available') <> 'available' THEN
    RAISE EXCEPTION 'Source balance is % and cannot be exchanged', v_source_status;
  END IF;

  IF COALESCE(v_target_status, 'available') <> 'available' THEN
    RAISE EXCEPTION 'Destination balance is % and cannot receive exchanged funds', v_target_status;
  END IF;

  IF v_source_balance < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_source_balance;
  END IF;

  IF p_direction = 'fiat_to_crypto' THEN
    UPDATE public.fiat_balances
    SET balance = balance - p_from_amount
    WHERE user_id = p_user_id AND currency = p_from_asset;

    UPDATE public.crypto_balances
    SET balance = balance + p_to_amount
    WHERE user_id = p_user_id AND symbol = p_to_asset;
  ELSE
    UPDATE public.crypto_balances
    SET balance = balance - p_from_amount
    WHERE user_id = p_user_id AND symbol = p_from_asset;

    UPDATE public.fiat_balances
    SET balance = balance + p_to_amount
    WHERE user_id = p_user_id AND currency = p_to_asset;
  END IF;

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
    p_from_asset,
    p_to_asset,
    p_from_amount,
    p_to_amount,
    p_exchange_rate,
    GREATEST(COALESCE(p_fee, 0), 0),
    'completed'
  )
  RETURNING id INTO v_exchange_id;

  RETURN v_exchange_id;
END;
$$;

REVOKE ALL ON FUNCTION public.execute_cross_asset_exchange(uuid, text, text, text, numeric, numeric, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_cross_asset_exchange(uuid, text, text, text, numeric, numeric, numeric, numeric) TO authenticated;
