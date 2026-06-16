/*
  # Create crypto deposits table

  Replaces the fiat fixed_deposits concept with crypto staking deposits.
  Users can lock crypto assets for a term to earn yield.

  1. New Tables
    - `crypto_deposits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `symbol` (text) - crypto symbol e.g. BTC, ETH
      - `crypto_name` (text) - full name e.g. Bitcoin, Ethereum
      - `amount` (numeric) - amount of crypto deposited
      - `apy` (numeric) - annual percentage yield
      - `term_days` (integer) - lock period in days
      - `start_date` (date) - deposit start date
      - `maturity_date` (date) - when deposit matures
      - `estimated_reward` (numeric) - projected yield in same crypto
      - `status` (text) - active, matured, withdrawn
      - `auto_renew` (boolean) - whether to auto-renew at maturity
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `crypto_deposits`
    - Policies for authenticated users to manage their own deposits
*/

CREATE TABLE IF NOT EXISTS crypto_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  symbol text NOT NULL DEFAULT '',
  crypto_name text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  apy numeric NOT NULL DEFAULT 0,
  term_days integer NOT NULL DEFAULT 30,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  maturity_date date NOT NULL DEFAULT (CURRENT_DATE + interval '30 days'),
  estimated_reward numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  auto_renew boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crypto_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crypto deposits"
  ON crypto_deposits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto deposits"
  ON crypto_deposits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto deposits"
  ON crypto_deposits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own crypto deposits"
  ON crypto_deposits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
