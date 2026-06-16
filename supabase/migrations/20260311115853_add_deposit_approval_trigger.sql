/*
  # Add deposit approval trigger

  When a crypto deposit's status changes from 'pending' to 'approved',
  automatically credit the deposited amount to the user's corresponding
  crypto balance.

  1. New Functions
    - `handle_deposit_approval()` - trigger function that increments the
      matching crypto_balances row when a deposit is approved

  2. New Triggers
    - `on_deposit_approved` on `crypto_deposits` AFTER UPDATE
      fires only when status changes from 'pending' to 'approved'

  3. Important Notes
    - Uses SECURITY DEFINER so the function can update crypto_balances
      regardless of RLS policies
    - If no matching crypto_balances row exists for the user/symbol,
      a new row is inserted
    - The trigger only fires on UPDATE, not INSERT, so deposits must
      first be created as 'pending' then explicitly approved
*/

CREATE OR REPLACE FUNCTION handle_deposit_approval()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    UPDATE public.crypto_balances
    SET balance = balance + NEW.amount
    WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

    IF NOT FOUND THEN
      INSERT INTO public.crypto_balances (user_id, symbol, name, balance)
      VALUES (NEW.user_id, NEW.symbol, NEW.crypto_name, NEW.amount);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_deposit_approved ON crypto_deposits;

CREATE TRIGGER on_deposit_approved
  AFTER UPDATE ON crypto_deposits
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_deposit_approval();
