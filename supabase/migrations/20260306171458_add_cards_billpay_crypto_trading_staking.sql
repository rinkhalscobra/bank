/*
  # Add Cards, Bill Payments, Crypto Trading, and Staking tables

  1. New Tables
    - `cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `account_id` (uuid, references accounts)
      - `card_type` (text: virtual/physical)
      - `card_brand` (text: visa/mastercard)
      - `card_number` (text, masked)
      - `cardholder_name` (text)
      - `expiry_date` (text)
      - `cvv` (text)
      - `status` (text: active/frozen/cancelled)
      - `daily_limit` (numeric)
      - `monthly_limit` (numeric)
      - `created_at` (timestamptz)

    - `bill_payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `account_id` (uuid, references accounts)
      - `biller_name` (text)
      - `biller_category` (text: utilities/internet/phone/insurance/rent/other)
      - `biller_account` (text)
      - `amount` (numeric)
      - `status` (text: completed/pending/failed)
      - `scheduled_date` (date, nullable)
      - `is_recurring` (boolean)
      - `recurring_frequency` (text, nullable: monthly/weekly/biweekly)
      - `created_at` (timestamptz)

    - `crypto_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text: buy/sell/convert)
      - `from_symbol` (text)
      - `to_symbol` (text)
      - `from_amount` (numeric)
      - `to_amount` (numeric)
      - `price_per_unit` (numeric)
      - `fee` (numeric)
      - `status` (text: completed/pending/failed)
      - `created_at` (timestamptz)

    - `staking_positions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `symbol` (text)
      - `name` (text)
      - `staked_amount` (numeric)
      - `apy` (numeric)
      - `earned_rewards` (numeric)
      - `lock_period_days` (integer)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz, nullable)
      - `status` (text: active/completed/cancelled)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Policies for authenticated users to manage their own data
*/

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  card_type text NOT NULL DEFAULT 'virtual',
  card_brand text NOT NULL DEFAULT 'visa',
  card_number text NOT NULL DEFAULT '',
  cardholder_name text NOT NULL DEFAULT '',
  expiry_date text NOT NULL DEFAULT '',
  cvv text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  daily_limit numeric NOT NULL DEFAULT 5000,
  monthly_limit numeric NOT NULL DEFAULT 25000,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bill Payments table
CREATE TABLE IF NOT EXISTS bill_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  biller_name text NOT NULL DEFAULT '',
  biller_category text NOT NULL DEFAULT 'other',
  biller_account text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  scheduled_date date,
  is_recurring boolean NOT NULL DEFAULT false,
  recurring_frequency text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bill payments"
  ON bill_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bill payments"
  ON bill_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Crypto Transactions table
CREATE TABLE IF NOT EXISTS crypto_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  type text NOT NULL DEFAULT 'buy',
  from_symbol text NOT NULL DEFAULT '',
  to_symbol text NOT NULL DEFAULT '',
  from_amount numeric NOT NULL DEFAULT 0,
  to_amount numeric NOT NULL DEFAULT 0,
  price_per_unit numeric NOT NULL DEFAULT 0,
  fee numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crypto transactions"
  ON crypto_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto transactions"
  ON crypto_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Staking Positions table
CREATE TABLE IF NOT EXISTS staking_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  symbol text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  staked_amount numeric NOT NULL DEFAULT 0,
  apy numeric NOT NULL DEFAULT 0,
  earned_rewards numeric NOT NULL DEFAULT 0,
  lock_period_days integer NOT NULL DEFAULT 30,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staking_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own staking positions"
  ON staking_positions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own staking positions"
  ON staking_positions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own staking positions"
  ON staking_positions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
