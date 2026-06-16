/*
  # Add Savings Goals, Fixed Deposits, Currency Exchange, Loans, and Scheduled Transfers

  1. New Tables
    - `savings_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `account_id` (uuid, references accounts)
      - `name` (text) - goal name e.g. "Vacation Fund"
      - `target_amount` (numeric) - target savings amount
      - `current_amount` (numeric) - amount saved so far
      - `currency` (text) - USD/EUR/CAD
      - `target_date` (date) - goal target date
      - `icon` (text) - icon identifier
      - `status` (text: active/completed/cancelled)
      - `created_at` (timestamptz)

    - `fixed_deposits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `account_id` (uuid, references accounts)
      - `principal` (numeric) - deposit amount
      - `interest_rate` (numeric) - annual rate
      - `term_months` (integer) - lock period in months
      - `maturity_date` (date) - when deposit matures
      - `interest_earned` (numeric) - projected interest
      - `currency` (text)
      - `status` (text: active/matured/withdrawn)
      - `auto_renew` (boolean)
      - `created_at` (timestamptz)

    - `currency_exchanges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `from_account_id` (uuid, references accounts)
      - `to_account_id` (uuid, references accounts)
      - `from_currency` (text)
      - `to_currency` (text)
      - `from_amount` (numeric)
      - `to_amount` (numeric)
      - `exchange_rate` (numeric)
      - `fee` (numeric)
      - `status` (text: completed/pending/failed)
      - `created_at` (timestamptz)

    - `loans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `loan_type` (text: personal/mortgage/auto/education/business)
      - `principal` (numeric)
      - `interest_rate` (numeric)
      - `term_months` (integer)
      - `monthly_payment` (numeric)
      - `remaining_balance` (numeric)
      - `total_paid` (numeric)
      - `next_payment_date` (date)
      - `status` (text: active/paid_off/defaulted/pending_approval)
      - `disbursement_account_id` (uuid, references accounts)
      - `created_at` (timestamptz)

    - `scheduled_transfers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `from_account_id` (uuid, references accounts)
      - `to_account_id` (uuid, references accounts, nullable for external)
      - `beneficiary_id` (uuid, references beneficiaries, nullable)
      - `amount` (numeric)
      - `currency` (text)
      - `frequency` (text: once/daily/weekly/biweekly/monthly)
      - `next_run_date` (date)
      - `end_date` (date, nullable)
      - `description` (text)
      - `status` (text: active/paused/completed/cancelled)
      - `last_run_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Policies for authenticated users to manage their own data only
*/

-- Savings Goals
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  name text NOT NULL DEFAULT '',
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  target_date date,
  icon text NOT NULL DEFAULT 'piggy-bank',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings goals"
  ON savings_goals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals"
  ON savings_goals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals"
  ON savings_goals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fixed Deposits
CREATE TABLE IF NOT EXISTS fixed_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  principal numeric NOT NULL DEFAULT 0,
  interest_rate numeric NOT NULL DEFAULT 0,
  term_months integer NOT NULL DEFAULT 3,
  maturity_date date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '3 months'),
  interest_earned numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'active',
  auto_renew boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fixed_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fixed deposits"
  ON fixed_deposits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fixed deposits"
  ON fixed_deposits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fixed deposits"
  ON fixed_deposits FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Currency Exchanges
CREATE TABLE IF NOT EXISTS currency_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  from_account_id uuid NOT NULL REFERENCES accounts(id),
  to_account_id uuid NOT NULL REFERENCES accounts(id),
  from_currency text NOT NULL DEFAULT '',
  to_currency text NOT NULL DEFAULT '',
  from_amount numeric NOT NULL DEFAULT 0,
  to_amount numeric NOT NULL DEFAULT 0,
  exchange_rate numeric NOT NULL DEFAULT 0,
  fee numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE currency_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own currency exchanges"
  ON currency_exchanges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own currency exchanges"
  ON currency_exchanges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Loans
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  loan_type text NOT NULL DEFAULT 'personal',
  principal numeric NOT NULL DEFAULT 0,
  interest_rate numeric NOT NULL DEFAULT 0,
  term_months integer NOT NULL DEFAULT 12,
  monthly_payment numeric NOT NULL DEFAULT 0,
  remaining_balance numeric NOT NULL DEFAULT 0,
  total_paid numeric NOT NULL DEFAULT 0,
  next_payment_date date,
  status text NOT NULL DEFAULT 'pending_approval',
  disbursement_account_id uuid REFERENCES accounts(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loans"
  ON loans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans"
  ON loans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
  ON loans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Scheduled Transfers
CREATE TABLE IF NOT EXISTS scheduled_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  from_account_id uuid NOT NULL REFERENCES accounts(id),
  to_account_id uuid REFERENCES accounts(id),
  beneficiary_id uuid REFERENCES beneficiaries(id),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  frequency text NOT NULL DEFAULT 'once',
  next_run_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scheduled_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled transfers"
  ON scheduled_transfers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled transfers"
  ON scheduled_transfers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled transfers"
  ON scheduled_transfers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
