/*
  # Bank Transfer Approval Trigger

  1. New Functions
    - `handle_bank_transfer_approved()` - Trigger function that fires on bank_transfers UPDATE
      - When status changes from non-approved to 'approved':
        - Internal transfer: deducts amount from source currency, adds amount to target currency
        - External transfer: deducts amount from source currency (money leaving the bank)
      - Validates sufficient balance before deduction
      - Uses the transfer's user_id, currency, target_currency, and amount fields

  2. New Triggers
    - `on_bank_transfer_approved` on `bank_transfers` table (BEFORE UPDATE)

  3. Important Notes
    - Trigger only fires when status changes TO 'approved'
    - Prevents double-processing by checking OLD.status != 'approved'
    - If balance is insufficient at approval time, the update is rejected
*/

CREATE OR REPLACE FUNCTION handle_bank_transfer_approved()
RETURNS TRIGGER AS $$
DECLARE
  source_balance numeric;
  target_balance numeric;
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN

    SELECT balance INTO source_balance
    FROM fiat_balances
    WHERE user_id = NEW.user_id AND currency = NEW.currency;

    IF source_balance IS NULL OR source_balance < NEW.amount THEN
      RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.currency;
    END IF;

    UPDATE fiat_balances
    SET balance = balance - NEW.amount
    WHERE user_id = NEW.user_id AND currency = NEW.currency;

    IF NEW.transfer_type = 'internal' AND NEW.target_currency IS NOT NULL AND NEW.target_currency != '' THEN
      SELECT balance INTO target_balance
      FROM fiat_balances
      WHERE user_id = NEW.user_id AND currency = NEW.target_currency;

      IF target_balance IS NOT NULL THEN
        UPDATE fiat_balances
        SET balance = balance + NEW.amount
        WHERE user_id = NEW.user_id AND currency = NEW.target_currency;
      END IF;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_bank_transfer_approved
  BEFORE UPDATE ON bank_transfers
  FOR EACH ROW
  EXECUTE FUNCTION handle_bank_transfer_approved();
