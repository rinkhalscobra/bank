/*
  # Crypto Transfer Approval Trigger

  1. New Functions
    - `handle_crypto_transfer_approved()` - Trigger function that fires on crypto_transfers UPDATE
      - When status changes from non-approved to 'approved':
        - Internal transfer (direction=send): deducts amount from source symbol, adds amount to target symbol
        - External send: deducts amount from source symbol (crypto leaving the platform)
        - External receive: adds amount to source symbol (crypto coming into the platform)
      - Validates sufficient balance before any deduction
      - Uses the transfer's user_id, symbol, target_symbol, direction, and amount fields

  2. New Triggers
    - `on_crypto_transfer_approved` on `crypto_transfers` table (BEFORE UPDATE)

  3. Important Notes
    - Trigger only fires when status changes TO 'approved'
    - Prevents double-processing by checking OLD.status != 'approved'
    - For receive transfers, no balance check is needed (funds are being added)
    - For send transfers, insufficient balance at approval time causes rejection
*/

CREATE OR REPLACE FUNCTION handle_crypto_transfer_approved()
RETURNS TRIGGER AS $$
DECLARE
  source_balance numeric;
  target_balance numeric;
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN

    IF NEW.direction = 'receive' THEN
      UPDATE crypto_balances
      SET balance = balance + NEW.amount
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

    ELSIF NEW.transfer_type = 'internal' THEN
      SELECT balance INTO source_balance
      FROM crypto_balances
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF source_balance IS NULL OR source_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.symbol;
      END IF;

      UPDATE crypto_balances
      SET balance = balance - NEW.amount
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF NEW.target_symbol IS NOT NULL AND NEW.target_symbol != '' THEN
        SELECT balance INTO target_balance
        FROM crypto_balances
        WHERE user_id = NEW.user_id AND symbol = NEW.target_symbol;

        IF target_balance IS NOT NULL THEN
          UPDATE crypto_balances
          SET balance = balance + NEW.amount
          WHERE user_id = NEW.user_id AND symbol = NEW.target_symbol;
        END IF;
      END IF;

    ELSIF NEW.direction = 'send' THEN
      SELECT balance INTO source_balance
      FROM crypto_balances
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

      IF source_balance IS NULL OR source_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient % balance for transfer approval', NEW.symbol;
      END IF;

      UPDATE crypto_balances
      SET balance = balance - NEW.amount
      WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_crypto_transfer_approved
  BEFORE UPDATE ON crypto_transfers
  FOR EACH ROW
  EXECUTE FUNCTION handle_crypto_transfer_approved();
