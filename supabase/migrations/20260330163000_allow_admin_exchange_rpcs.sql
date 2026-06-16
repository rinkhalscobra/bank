/*
  # Allow CRM admins to execute exchange RPCs for selected users

  1. Updated functions
    - `execute_currency_exchange`
    - `execute_crypto_swap`

  2. Behavior
    - Keeps normal users restricted to their own records
    - Allows authenticated admins to run the same exchange logic for another user from the CRM
*/

CREATE OR REPLACE FUNCTION public.execute_currency_exchange(
  p_user_id uuid,
  p_from_currency text,
  p_to_currency text,
  p_from_amount numeric,
  p_to_amount numeric,
  p_exchange_rate numeric,
  p_fee numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance numeric;
  v_exchange_id uuid;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_from_currency = p_to_currency THEN
    RAISE EXCEPTION 'Source and destination currencies must differ';
  END IF;

  IF p_from_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT balance INTO v_current_balance
  FROM fiat_balances
  WHERE user_id = p_user_id AND currency = p_from_currency
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Source currency balance not found';
  END IF;

  IF v_current_balance < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_current_balance;
  END IF;

  UPDATE fiat_balances
  SET balance = balance - p_from_amount
  WHERE user_id = p_user_id AND currency = p_from_currency;

  UPDATE fiat_balances
  SET balance = balance + p_to_amount
  WHERE user_id = p_user_id AND currency = p_to_currency;

  IF NOT FOUND THEN
    INSERT INTO fiat_balances (user_id, currency, balance)
    VALUES (p_user_id, p_to_currency, p_to_amount);
  END IF;

  INSERT INTO currency_exchanges (user_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, fee, status)
  VALUES (p_user_id, p_from_currency, p_to_currency, p_from_amount, p_to_amount, p_exchange_rate, p_fee, 'completed')
  RETURNING id INTO v_exchange_id;

  RETURN v_exchange_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.execute_crypto_swap(
  p_user_id uuid,
  p_from_symbol text,
  p_to_symbol text,
  p_from_amount numeric,
  p_to_amount numeric,
  p_from_price_usd numeric,
  p_to_price_usd numeric,
  p_fee_usd numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance numeric;
  v_tx_id uuid;
  v_from_name text;
  v_to_name text;
  v_total_value numeric;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_from_symbol = p_to_symbol THEN
    RAISE EXCEPTION 'Source and destination must differ';
  END IF;

  IF p_from_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT balance, name INTO v_current_balance, v_from_name
  FROM crypto_balances
  WHERE user_id = p_user_id AND symbol = p_from_symbol
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Source crypto balance not found';
  END IF;

  IF v_current_balance < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_current_balance;
  END IF;

  SELECT name INTO v_to_name
  FROM crypto_balances
  WHERE user_id = p_user_id AND symbol = p_to_symbol;

  v_total_value := p_from_amount * p_from_price_usd;

  UPDATE crypto_balances
  SET balance = balance - p_from_amount
  WHERE user_id = p_user_id AND symbol = p_from_symbol;

  UPDATE crypto_balances
  SET balance = balance + p_to_amount
  WHERE user_id = p_user_id AND symbol = p_to_symbol;

  IF NOT FOUND THEN
    INSERT INTO crypto_balances (user_id, symbol, name, balance)
    VALUES (p_user_id, p_to_symbol, COALESCE(v_to_name, p_to_symbol), p_to_amount);
  END IF;

  INSERT INTO crypto_transactions (
    user_id, type, symbol, name, amount, price_per_unit,
    total_value, fee, from_symbol, to_symbol, status, description
  )
  VALUES (
    p_user_id, 'swap', p_from_symbol, v_from_name, p_from_amount, p_from_price_usd,
    v_total_value, p_fee_usd, p_from_symbol, p_to_symbol, 'completed',
    'Swap ' || p_from_amount || ' ' || p_from_symbol || ' to ' || round(p_to_amount, 8) || ' ' || p_to_symbol
  )
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$$;
