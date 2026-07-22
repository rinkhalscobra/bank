/*
  # Add a real processing state to bank and crypto transfers

  Processing is an intermediate, non-financial state. Moving a transfer from
  pending/processing/failed into approved or completed settles its balances
  exactly once. Finalized transfers cannot return to an intermediate state.
*/

ALTER TABLE public.bank_transfers
  DROP CONSTRAINT IF EXISTS bank_transfers_status_check;

ALTER TABLE public.bank_transfers
  ADD CONSTRAINT bank_transfers_status_check
  CHECK (status IN ('pending', 'processing', 'approved', 'completed', 'failed'));

ALTER TABLE public.crypto_transfers
  DROP CONSTRAINT IF EXISTS crypto_transfers_status_check;

ALTER TABLE public.crypto_transfers
  ADD CONSTRAINT crypto_transfers_status_check
  CHECK (status IN ('pending', 'processing', 'approved', 'completed', 'failed'));

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
  previous_status text;
BEGIN
  previous_status := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END;

  IF NEW.status IS DISTINCT FROM previous_status
    AND auth.uid() = NEW.user_id
    AND NOT public.is_crm_staff()
    AND (TG_OP <> 'INSERT' OR NEW.status <> 'pending')
  THEN
    RAISE EXCEPTION 'Only authorized CRM staff can change transfer status';
  END IF;

  IF TG_OP = 'UPDATE'
    AND previous_status IN ('approved', 'completed')
    AND NEW.status NOT IN ('approved', 'completed')
  THEN
    RAISE EXCEPTION 'A finalized transfer cannot return to a non-final status';
  END IF;

  IF TG_OP = 'UPDATE'
    AND previous_status IN ('approved', 'completed')
    AND ROW(NEW.user_id, NEW.transfer_type, NEW.amount, NEW.currency, NEW.target_currency)
      IS DISTINCT FROM
      ROW(OLD.user_id, OLD.transfer_type, OLD.amount, OLD.currency, OLD.target_currency)
  THEN
    RAISE EXCEPTION 'Finalized transfer financial details cannot be changed';
  END IF;

  IF NEW.status IN ('approved', 'completed')
    AND (previous_status IS NULL OR previous_status NOT IN ('approved', 'completed'))
  THEN
    IF NEW.transfer_type = 'internal' THEN
      IF NEW.target_currency IS NULL OR NEW.target_currency = '' THEN
        RAISE EXCEPTION 'Internal bank transfer requires a target currency';
      END IF;

      IF NEW.target_currency = NEW.currency THEN
        RAISE EXCEPTION 'Internal bank transfer currencies must differ';
      END IF;

      PERFORM id
      FROM public.fiat_balances
      WHERE user_id = NEW.user_id
        AND currency IN (NEW.currency, NEW.target_currency)
      ORDER BY currency
      FOR UPDATE;
    ELSE
      PERFORM id
      FROM public.fiat_balances
      WHERE user_id = NEW.user_id AND currency = NEW.currency
      FOR UPDATE;
    END IF;

    SELECT balance, status
    INTO source_balance, source_status
    FROM public.fiat_balances
    WHERE user_id = NEW.user_id AND currency = NEW.currency;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Source % balance not found', NEW.currency;
    END IF;

    IF COALESCE(source_status, 'available') <> 'available' THEN
      RAISE EXCEPTION 'Source % balance is % and cannot be approved for transfer', NEW.currency, source_status;
    END IF;

    IF source_balance < NEW.amount THEN
      RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.currency;
    END IF;

    IF NEW.transfer_type = 'internal' THEN
      SELECT balance, status
      INTO target_balance, target_status
      FROM public.fiat_balances
      WHERE user_id = NEW.user_id AND currency = NEW.target_currency;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Target % balance not found', NEW.target_currency;
      END IF;

      IF COALESCE(target_status, 'available') <> 'available' THEN
        RAISE EXCEPTION 'Target % balance is % and cannot receive transfer funds', NEW.target_currency, target_status;
      END IF;
    END IF;

    UPDATE public.fiat_balances
    SET balance = balance - NEW.amount
    WHERE user_id = NEW.user_id AND currency = NEW.currency;

    IF NEW.transfer_type = 'internal' THEN
      UPDATE public.fiat_balances
      SET balance = balance + NEW.amount
      WHERE user_id = NEW.user_id AND currency = NEW.target_currency;
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
  previous_status text;
BEGIN
  previous_status := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END;

  IF NEW.status IS DISTINCT FROM previous_status
    AND auth.uid() = NEW.user_id
    AND NOT public.is_crm_staff()
    AND (TG_OP <> 'INSERT' OR NEW.status <> 'pending')
  THEN
    RAISE EXCEPTION 'Only authorized CRM staff can change transfer status';
  END IF;

  IF TG_OP = 'UPDATE'
    AND previous_status IN ('approved', 'completed')
    AND NEW.status NOT IN ('approved', 'completed')
  THEN
    RAISE EXCEPTION 'A finalized transfer cannot return to a non-final status';
  END IF;

  IF TG_OP = 'UPDATE'
    AND previous_status IN ('approved', 'completed')
    AND ROW(NEW.user_id, NEW.transfer_type, NEW.direction, NEW.amount, NEW.symbol, NEW.target_symbol)
      IS DISTINCT FROM
      ROW(OLD.user_id, OLD.transfer_type, OLD.direction, OLD.amount, OLD.symbol, OLD.target_symbol)
  THEN
    RAISE EXCEPTION 'Finalized transfer financial details cannot be changed';
  END IF;

  IF NEW.status IN ('approved', 'completed')
    AND (previous_status IS NULL OR previous_status NOT IN ('approved', 'completed'))
  THEN
    IF NEW.amount <= 0 THEN
      RAISE EXCEPTION 'Transfer amount must be positive';
    END IF;

    IF NEW.direction = 'receive' THEN
      PERFORM id
      FROM public.crypto_balances
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol
      FOR UPDATE;

      SELECT balance, status
      INTO target_balance, target_status
      FROM public.crypto_balances
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Target % balance not found', NEW.symbol;
      END IF;

      IF COALESCE(target_status, 'available') <> 'available' THEN
        RAISE EXCEPTION 'Target % balance is % and cannot receive transfer funds', NEW.symbol, target_status;
      END IF;

      UPDATE public.crypto_balances
      SET balance = balance + NEW.amount
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

    ELSE
      IF NEW.transfer_type = 'internal' THEN
        IF NEW.target_symbol IS NULL OR NEW.target_symbol = '' THEN
          RAISE EXCEPTION 'Internal crypto transfer requires a target symbol';
        END IF;

        IF NEW.target_symbol = NEW.symbol THEN
          RAISE EXCEPTION 'Internal crypto transfer symbols must differ';
        END IF;

        PERFORM id
        FROM public.crypto_balances
        WHERE user_id = NEW.user_id
          AND symbol IN (NEW.symbol, NEW.target_symbol)
        ORDER BY symbol
        FOR UPDATE;
      ELSE
        PERFORM id
        FROM public.crypto_balances
        WHERE user_id = NEW.user_id AND symbol = NEW.symbol
        FOR UPDATE;
      END IF;

      SELECT balance, status
      INTO source_balance, source_status
      FROM public.crypto_balances
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Source % balance not found', NEW.symbol;
      END IF;

      IF COALESCE(source_status, 'available') <> 'available' THEN
        RAISE EXCEPTION 'Source % balance is % and cannot be approved for transfer', NEW.symbol, source_status;
      END IF;

      IF source_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.symbol;
      END IF;

      IF NEW.transfer_type = 'internal' THEN
        SELECT balance, status
        INTO target_balance, target_status
        FROM public.crypto_balances
        WHERE user_id = NEW.user_id AND symbol = NEW.target_symbol;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Target % balance not found', NEW.target_symbol;
        END IF;

        IF COALESCE(target_status, 'available') <> 'available' THEN
          RAISE EXCEPTION 'Target % balance is % and cannot receive transfer funds', NEW.target_symbol, target_status;
        END IF;
      END IF;

      UPDATE public.crypto_balances
      SET balance = balance - NEW.amount
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF NEW.transfer_type = 'internal' THEN
        UPDATE public.crypto_balances
        SET balance = balance + NEW.amount
        WHERE user_id = NEW.user_id AND symbol = NEW.target_symbol;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_bank_transfer_approved ON public.bank_transfers;
CREATE TRIGGER on_bank_transfer_approved
  BEFORE INSERT OR UPDATE ON public.bank_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_bank_transfer_approved();

DROP TRIGGER IF EXISTS on_crypto_transfer_approved ON public.crypto_transfers;
CREATE TRIGGER on_crypto_transfer_approved
  BEFORE INSERT OR UPDATE ON public.crypto_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crypto_transfer_approved();

COMMENT ON COLUMN public.bank_transfers.status IS
  'Transfer lifecycle: pending, processing, approved/completed, or failed.';

COMMENT ON COLUMN public.crypto_transfers.status IS
  'Transfer lifecycle: pending, processing, approved/completed, or failed.';
