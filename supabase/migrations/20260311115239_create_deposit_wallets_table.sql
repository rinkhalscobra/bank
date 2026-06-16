/*
  # Create deposit wallets table

  Platform-managed wallet addresses shown to users when they want to deposit crypto.
  Admin can update these via the Supabase dashboard to change which wallet is displayed.

  1. New Tables
    - `deposit_wallets`
      - `id` (uuid, primary key)
      - `symbol` (text, unique) - crypto symbol like BTC, ETH, SOL, etc.
      - `wallet_address` (text) - the platform wallet address users send funds to
      - `network` (text) - the network name (e.g. Bitcoin, Ethereum, Solana)
      - `label` (text) - display label
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - RLS enabled
    - Authenticated users can SELECT (read-only)
    - No insert/update/delete for regular users (admin uses dashboard)

  3. Seed Data
    - One wallet per supported crypto: BTC, ETH, SOL, USDC, USDT
*/

CREATE TABLE IF NOT EXISTS deposit_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  wallet_address text NOT NULL DEFAULT '',
  network text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deposit_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deposit wallets"
  ON deposit_wallets
  FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO deposit_wallets (symbol, wallet_address, network, label) VALUES
  ('BTC', '3FZbGi9WByLBhZ9xqEgVNkMUKbUMJR7eYS', 'Bitcoin', 'Bitcoin Deposit'),
  ('ETH', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'Ethereum (ERC-20)', 'Ethereum Deposit'),
  ('SOL', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'Solana', 'Solana Deposit'),
  ('USDC', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'Ethereum (ERC-20)', 'USDC Deposit'),
  ('USDT', 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', 'Tron (TRC-20)', 'USDT Deposit')
ON CONFLICT (symbol) DO NOTHING;
