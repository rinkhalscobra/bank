/*
  # Restore crypto_balances table

  The crypto_balances table was accidentally dropped along with
  crypto_transactions and staking_positions. This migration restores
  only the crypto_balances table (not trading or staking).

  1. Restored Tables
    - `crypto_balances`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `symbol` (text) - e.g. BTC, ETH, USDT, SOL, USDC
      - `name` (text) - full name of the cryptocurrency
      - `balance` (numeric, default 0)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `crypto_balances`
    - Users can only select, update, and insert their own crypto balances

  3. Notes
    - The handle_new_user() trigger function already seeds crypto_balances
      for new users, so no trigger changes are needed
    - crypto_transactions and staking_positions remain removed
*/

CREATE TABLE IF NOT EXISTS public.crypto_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crypto balances"
  ON public.crypto_balances
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto balances"
  ON public.crypto_balances
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto balances"
  ON public.crypto_balances
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
