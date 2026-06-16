/*
  # Add balance availability statuses

  1. Schema changes
    - Adds `status` to `public.fiat_balances`
    - Adds `status` to `public.crypto_balances`
    - Allowed values: `available`, `pending`, `frozen`

  2. Behavior changes
    - Fiat exchange RPC rejects source or target balances unless available
    - Crypto swap RPC rejects source or target balances unless available
    - Bank transfer approval rejects non-available source/target balances
    - Crypto transfer approval rejects non-available source/target balances
    - Crypto deposit approval rejects non-available destination balances
*/

ALTER TABLE IF EXISTS public.fiat_balances
  ADD COLUMN IF NOT EXISTS status text;

UPDATE public.fiat_balances
SET status = 'available'
WHERE status IS NULL OR btrim(status) = '';

ALTER TABLE IF EXISTS public.fiat_balances
  ALTER COLUMN status SET DEFAULT 'available',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.fiat_balances
  DROP CONSTRAINT IF EXISTS fiat_balances_status_check;

ALTER TABLE public.fiat_balances
  ADD CONSTRAINT fiat_balances_status_check
  CHECK (status IN ('available', 'pending', 'frozen'));

ALTER TABLE IF EXISTS public.crypto_balances
  ADD COLUMN IF NOT EXISTS status text;

UPDATE public.crypto_balances
SET status = 'available'
WHERE status IS NULL OR btrim(status) = '';

ALTER TABLE IF EXISTS public.crypto_balances
  ALTER COLUMN status SET DEFAULT 'available',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.crypto_balances
  DROP CONSTRAINT IF EXISTS crypto_balances_status_check;

ALTER TABLE public.crypto_balances
  ADD CONSTRAINT crypto_balances_status_check
  CHECK (status IN ('available', 'pending', 'frozen'));

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
  v_source_status text;
  v_target_status text;
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

  SELECT balance, status
  INTO v_current_balance, v_source_status
  FROM public.fiat_balances
  WHERE user_id = p_user_id AND currency = p_from_currency
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Source currency balance not found';
  END IF;

  IF COALESCE(v_source_status, 'available') <> 'available' THEN
    RAISE EXCEPTION 'Source currency balance is % and cannot be exchanged', v_source_status;
  END IF;

  SELECT status
  INTO v_target_status
  FROM public.fiat_balances
  WHERE user_id = p_user_id AND currency = p_to_currency
  FOR UPDATE;

  IF v_target_status IS NOT NULL AND v_target_status <> 'available' THEN
    RAISE EXCEPTION 'Destination currency balance is % and cannot receive exchanged funds', v_target_status;
  END IF;

  IF v_current_balance < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_current_balance;
  END IF;

  UPDATE public.fiat_balances
  SET balance = balance - p_from_amount
  WHERE user_id = p_user_id AND currency = p_from_currency;

  UPDATE public.fiat_balances
  SET balance = balance + p_to_amount
  WHERE user_id = p_user_id AND currency = p_to_currency;

  IF NOT FOUND THEN
    INSERT INTO public.fiat_balances (user_id, currency, balance, status)
    VALUES (p_user_id, p_to_currency, p_to_amount, 'available');
  END IF;

  INSERT INTO public.currency_exchanges (user_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, fee, status)
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
  v_source_status text;
  v_target_status text;
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

  SELECT balance, name, status
  INTO v_current_balance, v_from_name, v_source_status
  FROM public.crypto_balances
  WHERE user_id = p_user_id AND symbol = p_from_symbol
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Source crypto balance not found';
  END IF;

  IF COALESCE(v_source_status, 'available') <> 'available' THEN
    RAISE EXCEPTION 'Source crypto balance is % and cannot be swapped', v_source_status;
  END IF;

  SELECT name, status
  INTO v_to_name, v_target_status
  FROM public.crypto_balances
  WHERE user_id = p_user_id AND symbol = p_to_symbol
  FOR UPDATE;

  IF v_target_status IS NOT NULL AND v_target_status <> 'available' THEN
    RAISE EXCEPTION 'Destination crypto balance is % and cannot receive swapped funds', v_target_status;
  END IF;

  IF v_current_balance < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_current_balance;
  END IF;

  v_total_value := p_from_amount * p_from_price_usd;

  UPDATE public.crypto_balances
  SET balance = balance - p_from_amount
  WHERE user_id = p_user_id AND symbol = p_from_symbol;

  UPDATE public.crypto_balances
  SET balance = balance + p_to_amount
  WHERE user_id = p_user_id AND symbol = p_to_symbol;

  IF NOT FOUND THEN
    INSERT INTO public.crypto_balances (user_id, symbol, name, balance, status)
    VALUES (p_user_id, p_to_symbol, COALESCE(v_to_name, p_to_symbol), p_to_amount, 'available');
  END IF;

  INSERT INTO public.crypto_transactions (
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

CREATE OR REPLACE FUNCTION public.handle_bank_transfer_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_balance numeric;
  source_status text;
  target_balance numeric;
  target_status text;
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    SELECT balance, status
    INTO source_balance, source_status
    FROM public.fiat_balances
    WHERE user_id = NEW.user_id AND currency = NEW.currency;

    IF COALESCE(source_status, 'available') <> 'available' THEN
      RAISE EXCEPTION 'Source % balance is % and cannot be approved for transfer', NEW.currency, source_status;
    END IF;

    IF source_balance IS NULL OR source_balance < NEW.amount THEN
      RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.currency;
    END IF;

    UPDATE public.fiat_balances
    SET balance = balance - NEW.amount
    WHERE user_id = NEW.user_id AND currency = NEW.currency;

    IF NEW.transfer_type = 'internal' AND NEW.target_currency IS NOT NULL AND NEW.target_currency <> '' THEN
      SELECT balance, status
      INTO target_balance, target_status
      FROM public.fiat_balances
      WHERE user_id = NEW.user_id AND currency = NEW.target_currency;

      IF target_status IS NOT NULL AND target_status <> 'available' THEN
        RAISE EXCEPTION 'Target % balance is % and cannot receive transfer funds', NEW.target_currency, target_status;
      END IF;

      IF target_balance IS NOT NULL THEN
        UPDATE public.fiat_balances
        SET balance = balance + NEW.amount
        WHERE user_id = NEW.user_id AND currency = NEW.target_currency;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_crypto_transfer_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_balance numeric;
  source_status text;
  target_balance numeric;
  target_status text;
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    IF NEW.direction = 'receive' THEN
      SELECT status
      INTO source_status
      FROM public.crypto_balances
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF source_status IS NOT NULL AND source_status <> 'available' THEN
        RAISE EXCEPTION 'Target % balance is % and cannot receive transfer funds', NEW.symbol, source_status;
      END IF;

      UPDATE public.crypto_balances
      SET balance = balance + NEW.amount
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

    ELSIF NEW.transfer_type = 'internal' THEN
      SELECT balance, status
      INTO source_balance, source_status
      FROM public.crypto_balances
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF COALESCE(source_status, 'available') <> 'available' THEN
        RAISE EXCEPTION 'Source % balance is % and cannot be approved for transfer', NEW.symbol, source_status;
      END IF;

      IF source_balance IS NULL OR source_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.symbol;
      END IF;

      UPDATE public.crypto_balances
      SET balance = balance - NEW.amount
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF NEW.target_symbol IS NOT NULL AND NEW.target_symbol <> '' THEN
        SELECT balance, status
        INTO target_balance, target_status
        FROM public.crypto_balances
        WHERE user_id = NEW.user_id AND symbol = NEW.target_symbol;

        IF target_status IS NOT NULL AND target_status <> 'available' THEN
          RAISE EXCEPTION 'Target % balance is % and cannot receive transfer funds', NEW.target_symbol, target_status;
        END IF;

        IF target_balance IS NOT NULL THEN
          UPDATE public.crypto_balances
          SET balance = balance + NEW.amount
          WHERE user_id = NEW.user_id AND symbol = NEW.target_symbol;
        END IF;
      END IF;

    ELSIF NEW.direction = 'send' THEN
      SELECT balance, status
      INTO source_balance, source_status
      FROM public.crypto_balances
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF COALESCE(source_status, 'available') <> 'available' THEN
        RAISE EXCEPTION 'Source % balance is % and cannot be approved for transfer', NEW.symbol, source_status;
      END IF;

      IF source_balance IS NULL OR source_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.symbol;
      END IF;

      UPDATE public.crypto_balances
      SET balance = balance - NEW.amount
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_deposit_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance_status text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    SELECT status
    INTO v_balance_status
    FROM public.crypto_balances
    WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

    IF v_balance_status IS NOT NULL AND v_balance_status <> 'available' THEN
      RAISE EXCEPTION 'Target % balance is % and cannot receive deposit funds', NEW.symbol, v_balance_status;
    END IF;

    UPDATE public.crypto_balances
    SET balance = balance + NEW.amount
    WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

    IF NOT FOUND THEN
      INSERT INTO public.crypto_balances (user_id, symbol, name, balance, status)
      VALUES (NEW.user_id, NEW.symbol, NEW.crypto_name, NEW.amount, 'available');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
