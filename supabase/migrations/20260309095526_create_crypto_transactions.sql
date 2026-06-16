/*
  # Create crypto transactions table

  1. New Tables
    - `crypto_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text) - buy, sell, send, receive, swap
      - `symbol` (text) - crypto symbol like BTC, ETH
      - `name` (text) - full name like Bitcoin, Ethereum
      - `amount` (numeric) - quantity of crypto
      - `price_per_unit` (numeric) - price at time of transaction in USD
      - `total_value` (numeric) - total USD value of the transaction
      - `fee` (numeric) - transaction fee in USD
      - `from_symbol` (text) - for swaps, the source crypto
      - `to_symbol` (text) - for swaps, the destination crypto
      - `wallet_address` (text) - external wallet address for send/receive
      - `tx_hash` (text) - blockchain transaction hash
      - `status` (text) - completed, pending, failed
      - `description` (text) - human-readable description
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `crypto_transactions` table
    - Users can only read their own transactions
    - Users can insert their own transactions

  3. Seed data
    - Trigger function to create sample crypto transactions for new users
*/

CREATE TABLE IF NOT EXISTS crypto_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL DEFAULT 'buy',
  symbol text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  price_per_unit numeric NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  fee numeric NOT NULL DEFAULT 0,
  from_symbol text NOT NULL DEFAULT '',
  to_symbol text NOT NULL DEFAULT '',
  wallet_address text NOT NULL DEFAULT '',
  tx_hash text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'completed',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own crypto transactions"
  ON crypto_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto transactions"
  ON crypto_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.seed_crypto_transactions_for_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO crypto_transactions (user_id, type, symbol, name, amount, price_per_unit, total_value, fee, status, description, tx_hash, created_at)
  VALUES
    (target_user_id, 'buy',     'BTC',  'Bitcoin',   0.15,    62450.00,  9367.50,   14.05, 'completed', 'Bought 0.15 BTC',               'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', now() - interval '45 days'),
    (target_user_id, 'buy',     'ETH',  'Ethereum',  2.5,     3420.00,   8550.00,   12.82, 'completed', 'Bought 2.5 ETH',                'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', now() - interval '40 days'),
    (target_user_id, 'buy',     'SOL',  'Solana',    25.0,    142.50,    3562.50,   5.34,  'completed', 'Bought 25 SOL',                  'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', now() - interval '35 days'),
    (target_user_id, 'receive', 'BTC',  'Bitcoin',   0.05,    63100.00,  3155.00,   0.00,  'completed', 'Received 0.05 BTC from wallet',  'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', now() - interval '30 days'),
    (target_user_id, 'sell',    'ETH',  'Ethereum',  1.0,     3510.00,   3510.00,   5.27,  'completed', 'Sold 1 ETH',                     'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', now() - interval '25 days'),
    (target_user_id, 'swap',    'SOL',  'Solana',    10.0,    148.00,    1480.00,   2.96,  'completed', 'Swapped 10 SOL for 0.43 ETH',    'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', now() - interval '20 days'),
    (target_user_id, 'buy',     'DOGE', 'Dogecoin',  5000.0,  0.165,     825.00,    1.24,  'completed', 'Bought 5000 DOGE',               'a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0', now() - interval '18 days'),
    (target_user_id, 'send',    'BTC',  'Bitcoin',   0.02,    64200.00,  1284.00,   3.50,  'completed', 'Sent 0.02 BTC to external wallet','b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1', now() - interval '15 days'),
    (target_user_id, 'buy',     'ETH',  'Ethereum',  0.75,    3580.00,   2685.00,   4.03,  'completed', 'Bought 0.75 ETH',                'c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2', now() - interval '10 days'),
    (target_user_id, 'sell',    'DOGE', 'Dogecoin',  2500.0,  0.172,     430.00,    0.65,  'completed', 'Sold 2500 DOGE',                 'd0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7', now() - interval '7 days'),
    (target_user_id, 'buy',     'BTC',  'Bitcoin',   0.08,    65100.00,  5208.00,   7.81,  'completed', 'Bought 0.08 BTC',                'e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', now() - interval '3 days'),
    (target_user_id, 'receive', 'ETH',  'Ethereum',  0.25,    3640.00,   910.00,    0.00,  'completed', 'Received 0.25 ETH from wallet',  'f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9', now() - interval '1 day');
END;
$$;

DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT id FROM auth.users
  LOOP
    PERFORM public.seed_crypto_transactions_for_user(u.id);
  END LOOP;
END $$;