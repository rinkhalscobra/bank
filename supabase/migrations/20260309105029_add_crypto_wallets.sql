/*
  # Add Crypto Wallets

  1. New Tables
    - `crypto_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `symbol` (text) - e.g. BTC, ETH, SOL
      - `name` (text) - e.g. Bitcoin, Ethereum, Solana
      - `wallet_address` (text) - unique wallet address per user per coin
      - `network` (text) - e.g. Bitcoin, Ethereum, Solana
      - `created_at` (timestamptz)

    - `crypto_transfers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `symbol` (text) - crypto symbol
      - `direction` (text) - 'send' or 'receive'
      - `amount` (numeric) - amount of crypto
      - `recipient_address` (text) - destination wallet address
      - `sender_address` (text) - source wallet address
      - `tx_hash` (text) - transaction hash
      - `status` (text) - pending, completed, failed
      - `fee` (numeric) - network fee
      - `note` (text) - optional note
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only read/insert their own wallets and transfers

  3. Functions
    - `generate_wallet_address` generates realistic-looking addresses per network
    - `create_crypto_wallets_for_user` creates wallets for all supported coins
    - Trigger auto-creates wallets for new users

  4. Backfill
    - Creates wallets for all existing users
*/

-- Helper function to generate realistic wallet addresses
CREATE OR REPLACE FUNCTION generate_wallet_address(network_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  hex_chars text := '0123456789abcdef';
  addr text := '';
  i int;
BEGIN
  CASE network_name
    WHEN 'Bitcoin' THEN
      addr := 'bc1q';
      FOR i IN 1..38 LOOP
        addr := addr || substr(hex_chars, floor(random() * 16 + 1)::int, 1);
      END LOOP;
    WHEN 'Ethereum' THEN
      addr := '0x';
      FOR i IN 1..40 LOOP
        addr := addr || substr(hex_chars, floor(random() * 16 + 1)::int, 1);
      END LOOP;
    WHEN 'Solana' THEN
      addr := '';
      FOR i IN 1..44 LOOP
        addr := addr || substr('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', floor(random() * 58 + 1)::int, 1);
      END LOOP;
    WHEN 'Dogecoin' THEN
      addr := 'D';
      FOR i IN 1..33 LOOP
        addr := addr || substr('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', floor(random() * 58 + 1)::int, 1);
      END LOOP;
    WHEN 'Tron' THEN
      addr := 'T';
      FOR i IN 1..33 LOOP
        addr := addr || substr(hex_chars || 'ABCDEF', floor(random() * 22 + 1)::int, 1);
      END LOOP;
    ELSE
      addr := '0x';
      FOR i IN 1..40 LOOP
        addr := addr || substr(hex_chars, floor(random() * 16 + 1)::int, 1);
      END LOOP;
  END CASE;
  RETURN addr;
END;
$$;

-- Create crypto_wallets table
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  symbol text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  wallet_address text NOT NULL DEFAULT '',
  network text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallets"
  ON crypto_wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
  ON crypto_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create crypto_transfers table
CREATE TABLE IF NOT EXISTS crypto_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  symbol text NOT NULL DEFAULT '',
  direction text NOT NULL DEFAULT 'send',
  amount numeric NOT NULL DEFAULT 0,
  recipient_address text NOT NULL DEFAULT '',
  sender_address text NOT NULL DEFAULT '',
  tx_hash text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  fee numeric NOT NULL DEFAULT 0,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crypto_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crypto transfers"
  ON crypto_transfers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto transfers"
  ON crypto_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto transfers"
  ON crypto_transfers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to create wallets for a user
CREATE OR REPLACE FUNCTION create_crypto_wallets_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coins text[][] := ARRAY[
    ARRAY['BTC', 'Bitcoin', 'Bitcoin'],
    ARRAY['ETH', 'Ethereum', 'Ethereum'],
    ARRAY['SOL', 'Solana', 'Solana'],
    ARRAY['DOGE', 'Dogecoin', 'Dogecoin'],
    ARRAY['USDT', 'Tether', 'Tron'],
    ARRAY['USDC', 'USD Coin', 'Ethereum']
  ];
  coin text[];
BEGIN
  FOREACH coin SLICE 1 IN ARRAY coins LOOP
    INSERT INTO crypto_wallets (user_id, symbol, name, wallet_address, network)
    VALUES (
      p_user_id,
      coin[1],
      coin[2],
      generate_wallet_address(coin[3]),
      coin[3]
    )
    ON CONFLICT (user_id, symbol) DO NOTHING;
  END LOOP;
END;
$$;

-- Trigger to auto-create wallets for new users
CREATE OR REPLACE FUNCTION handle_new_user_crypto_wallets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_crypto_wallets_for_user(NEW.id);
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_created_create_wallets'
  ) THEN
    CREATE TRIGGER on_profile_created_create_wallets
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user_crypto_wallets();
  END IF;
END $$;

-- Backfill wallets for existing users
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT id FROM profiles LOOP
    PERFORM create_crypto_wallets_for_user(u.id);
  END LOOP;
END $$;
