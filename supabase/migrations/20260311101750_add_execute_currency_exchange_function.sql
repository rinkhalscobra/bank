/*
  # Add execute_currency_exchange database function

  1. New Functions
    - `execute_currency_exchange(p_user_id, p_from_currency, p_to_currency, p_from_amount, p_to_amount, p_exchange_rate, p_fee)`
      - Atomically deducts from source fiat balance
      - Credits destination fiat balance
      - Inserts a record into currency_exchanges
      - Validates sufficient balance before proceeding
      - Returns the new exchange record id

  2. Security
    - Function runs as SECURITY DEFINER to update balances
    - Validates that the calling user matches p_user_id via auth.uid()
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
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
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
