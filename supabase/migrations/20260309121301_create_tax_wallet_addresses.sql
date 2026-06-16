/*
  # Create tax wallet addresses table

  1. New Tables
    - `tax_wallet_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique per user)
      - `wallet_address` (text, unique generated address for tax payments)
      - `label` (text, optional friendly label)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `tax_wallet_addresses`
    - Authenticated users can only read their own wallet address
    - Authenticated users can insert their own wallet address
    - Authenticated users can update their own wallet address

  3. Notes
    - Each user gets one unique wallet address for tax payments
    - Wallet address is auto-generated on insert via trigger if not provided
*/

CREATE TABLE IF NOT EXISTS tax_wallet_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT 'Tax Payment Wallet',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_wallet UNIQUE (user_id)
);

ALTER TABLE tax_wallet_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax wallet"
  ON tax_wallet_addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax wallet"
  ON tax_wallet_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax wallet"
  ON tax_wallet_addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION generate_tax_wallet_address()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.wallet_address = '' OR NEW.wallet_address IS NULL THEN
    NEW.wallet_address := 'TX-' || upper(substr(md5(NEW.user_id::text || now()::text || random()::text), 1, 8))
      || '-' || upper(substr(md5(random()::text), 1, 4))
      || '-' || upper(substr(md5(random()::text || NEW.user_id::text), 1, 4))
      || '-' || upper(substr(md5(now()::text || random()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_tax_wallet_address
  BEFORE INSERT ON tax_wallet_addresses
  FOR EACH ROW
  EXECUTE FUNCTION generate_tax_wallet_address();
