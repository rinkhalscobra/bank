/*
  # Add execute_crypto_swap database function

  1. New Functions
    - `execute_crypto_swap(p_user_id, p_from_symbol, p_to_symbol, p_from_amount, p_to_amount, p_from_price_usd, p_to_price_usd, p_fee_usd)`
      - Atomically deducts from source crypto balance
      - Credits destination crypto balance
      - Records the swap in crypto_transactions table
      - Validates sufficient balance before proceeding
      - Returns the new transaction record id

  2. Security
    - Function runs as SECURITY DEFINER to update balances
    - Validates that the calling user matches p_user_id via auth.uid()
*/

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
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
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
