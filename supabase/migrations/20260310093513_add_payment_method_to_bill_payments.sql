/*
  # Add payment method to bill payments

  1. Modified Tables
    - `bill_payments`
      - `payment_method` (text) - 'bank' or 'crypto', defaults to 'bank'
      - `crypto_symbol` (text) - crypto symbol used (e.g. BTC, ETH) when paying with crypto
      - `crypto_wallet_address` (text) - wallet address used for crypto payment
      - `bank_name` (text) - bank name for bank payments
      - `bank_account_number` (text) - account number for bank payments
      - `bank_routing_number` (text) - routing number for bank payments
      - `bank_swift_code` (text) - SWIFT/BIC code for bank payments

  2. Notes
    - Existing payments default to 'bank' method
    - No data is removed or altered
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_payments' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN payment_method text NOT NULL DEFAULT 'bank';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_payments' AND column_name = 'crypto_symbol'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN crypto_symbol text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_payments' AND column_name = 'crypto_wallet_address'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN crypto_wallet_address text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_payments' AND column_name = 'bank_name'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN bank_name text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_payments' AND column_name = 'bank_account_number'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN bank_account_number text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_payments' AND column_name = 'bank_routing_number'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN bank_routing_number text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_payments' AND column_name = 'bank_swift_code'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN bank_swift_code text NOT NULL DEFAULT '';
  END IF;
END $$;