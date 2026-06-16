/*
  # Add transfer_type to crypto_transfers

  1. Modified Tables
    - `crypto_transfers`
      - Added `transfer_type` column (text, default 'external')
        - 'internal' = transfers between user's own crypto balances (e.g., BTC to ETH)
        - 'external' = transfers to/from external wallet addresses
      - Added `target_symbol` column (text, default '') for internal transfers to track the destination coin

  2. Notes
    - Existing rows default to 'external' as they represent wallet-based transfers
    - Internal transfers move value between a user's own crypto balances within the platform
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_transfers' AND column_name = 'transfer_type'
  ) THEN
    ALTER TABLE crypto_transfers ADD COLUMN transfer_type text NOT NULL DEFAULT 'external';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_transfers' AND column_name = 'target_symbol'
  ) THEN
    ALTER TABLE crypto_transfers ADD COLUMN target_symbol text NOT NULL DEFAULT '';
  END IF;
END $$;
