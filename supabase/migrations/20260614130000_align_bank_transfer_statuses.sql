/*
  # Align bank transfer statuses with CRM and approval trigger

  The app and approval trigger use `approved`, while the original
  bank_transfers constraint only allowed pending/completed/failed.
  Keep completed for backwards compatibility and allow approved too.
*/

ALTER TABLE public.bank_transfers
  DROP CONSTRAINT IF EXISTS bank_transfers_status_check;

ALTER TABLE public.bank_transfers
  ADD CONSTRAINT bank_transfers_status_check
  CHECK (status IN ('pending', 'approved', 'completed', 'failed'));

CREATE OR REPLACE FUNCTION public.handle_bank_transfer_approved()
RETURNS TRIGGER AS $$
DECLARE
  source_balance numeric;
  target_balance numeric;
BEGIN
  IF NEW.status IN ('approved', 'completed')
    AND OLD.status IS DISTINCT FROM 'approved'
    AND OLD.status IS DISTINCT FROM 'completed'
  THEN

    SELECT balance INTO source_balance
    FROM public.fiat_balances
    WHERE user_id = NEW.user_id AND currency = NEW.currency;

    IF source_balance IS NULL OR source_balance < NEW.amount THEN
      RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.currency;
    END IF;

    UPDATE public.fiat_balances
    SET balance = balance - NEW.amount
    WHERE user_id = NEW.user_id AND currency = NEW.currency;

    IF NEW.transfer_type = 'internal' AND NEW.target_currency IS NOT NULL AND NEW.target_currency != '' THEN
      SELECT balance INTO target_balance
      FROM public.fiat_balances
      WHERE user_id = NEW.user_id AND currency = NEW.target_currency;

      IF target_balance IS NOT NULL THEN
        UPDATE public.fiat_balances
        SET balance = balance + NEW.amount
        WHERE user_id = NEW.user_id AND currency = NEW.target_currency;
      END IF;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
