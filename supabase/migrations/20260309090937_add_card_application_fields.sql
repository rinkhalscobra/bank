/*
  # Add card application fields

  1. Modified Tables
    - `cards`
      - `billing_address` (text) - full billing/mailing address
      - `city` (text) - city of residence
      - `state_province` (text) - state or province
      - `postal_code` (text) - postal / zip code
      - `country` (text) - country of residence
      - `phone_number` (text) - contact phone number
      - `employment_status` (text) - employed, self-employed, student, retired, other
      - `annual_income` (numeric) - reported annual income
      - `currency` (text) - preferred card currency (USD, EUR, CAD)
      - `purpose` (text) - primary card purpose: everyday, travel, business, online

  2. Notes
    - All new columns have sensible defaults so existing cards are unaffected
    - No destructive changes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE cards ADD COLUMN billing_address text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'city'
  ) THEN
    ALTER TABLE cards ADD COLUMN city text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'state_province'
  ) THEN
    ALTER TABLE cards ADD COLUMN state_province text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE cards ADD COLUMN postal_code text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'country'
  ) THEN
    ALTER TABLE cards ADD COLUMN country text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE cards ADD COLUMN phone_number text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'employment_status'
  ) THEN
    ALTER TABLE cards ADD COLUMN employment_status text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'annual_income'
  ) THEN
    ALTER TABLE cards ADD COLUMN annual_income numeric NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'currency'
  ) THEN
    ALTER TABLE cards ADD COLUMN currency text NOT NULL DEFAULT 'USD';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'purpose'
  ) THEN
    ALTER TABLE cards ADD COLUMN purpose text NOT NULL DEFAULT 'everyday';
  END IF;
END $$;