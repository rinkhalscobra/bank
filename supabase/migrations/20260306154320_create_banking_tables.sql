/*
  # Create Banking Tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `account_name` (text)
      - `account_type` (text: checking, savings, credit)
      - `account_number` (text)
      - `balance` (numeric)
      - `currency` (text, default USD)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
    - `transactions`
      - `id` (uuid, primary key)
      - `account_id` (uuid, references accounts)
      - `user_id` (uuid, references profiles)
      - `type` (text: credit, debit)
      - `category` (text)
      - `description` (text)
      - `amount` (numeric)
      - `balance_after` (numeric)
      - `reference_number` (text)
      - `created_at` (timestamptz)
    - `transfers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `from_account_id` (uuid, references accounts)
      - `to_account_id` (uuid, references accounts)
      - `amount` (numeric)
      - `description` (text)
      - `status` (text: pending, completed, failed)
      - `created_at` (timestamptz)
    - `beneficiaries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `bank_name` (text)
      - `account_number` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - `handle_new_user()` trigger to auto-create profile and default accounts
    - `process_transfer()` function for internal transfers
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_name text NOT NULL DEFAULT '',
  account_type text NOT NULL DEFAULT 'checking',
  account_number text NOT NULL DEFAULT '',
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'debit',
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  balance_after numeric NOT NULL DEFAULT 0,
  reference_number text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfers"
  ON transfers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transfers"
  ON transfers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transfers"
  ON transfers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Beneficiaries table
CREATE TABLE IF NOT EXISTS beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  bank_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own beneficiaries"
  ON beneficiaries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own beneficiaries"
  ON beneficiaries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own beneficiaries"
  ON beneficiaries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function: auto-create profile and default accounts on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  checking_id uuid := gen_random_uuid();
  savings_id uuid := gen_random_uuid();
  checking_num text;
  savings_num text;
BEGIN
  checking_num := '4821' || lpad(floor(random() * 100000000)::text, 8, '0');
  savings_num := '7392' || lpad(floor(random() * 100000000)::text, 8, '0');

  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );

  INSERT INTO accounts (id, user_id, account_name, account_type, account_number, balance)
  VALUES
    (checking_id, NEW.id, 'Primary Checking', 'checking', checking_num, 5240.75),
    (savings_id, NEW.id, 'Savings Account', 'savings', savings_num, 12850.00);

  INSERT INTO transactions (account_id, user_id, type, category, description, amount, balance_after, reference_number, created_at)
  VALUES
    (checking_id, NEW.id, 'credit', 'deposit', 'Initial Deposit', 5000.00, 5000.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '30 days'),
    (checking_id, NEW.id, 'debit', 'utilities', 'Electric Company Payment', 145.50, 4854.50, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '25 days'),
    (checking_id, NEW.id, 'debit', 'dining', 'Restaurant - The Italian Place', 67.80, 4786.70, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '20 days'),
    (checking_id, NEW.id, 'credit', 'income', 'Payroll Deposit', 3200.00, 7986.70, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '15 days'),
    (checking_id, NEW.id, 'debit', 'shopping', 'Online Shopping - Electronics', 299.95, 7686.75, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '10 days'),
    (checking_id, NEW.id, 'debit', 'groceries', 'Grocery Store', 156.00, 7530.75, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '7 days'),
    (checking_id, NEW.id, 'debit', 'transport', 'Gas Station', 45.00, 7485.75, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '5 days'),
    (checking_id, NEW.id, 'debit', 'subscription', 'Streaming Service', 15.99, 7469.76, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '3 days'),
    (checking_id, NEW.id, 'credit', 'transfer', 'Transfer from Savings', 1200.00, 8669.76, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '2 days'),
    (checking_id, NEW.id, 'debit', 'bills', 'Insurance Premium', 3429.01, 5240.75, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '1 day'),
    (savings_id, NEW.id, 'credit', 'deposit', 'Initial Savings Deposit', 15000.00, 15000.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '30 days'),
    (savings_id, NEW.id, 'credit', 'interest', 'Monthly Interest', 50.00, 15050.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '15 days'),
    (savings_id, NEW.id, 'debit', 'transfer', 'Transfer to Checking', 1200.00, 13850.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '2 days'),
    (savings_id, NEW.id, 'debit', 'withdrawal', 'ATM Withdrawal', 1000.00, 12850.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '1 day');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Function: process internal transfer
CREATE OR REPLACE FUNCTION process_transfer(
  p_user_id uuid,
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Internal Transfer'
)
RETURNS uuid AS $$
DECLARE
  v_transfer_id uuid;
  v_from_balance numeric;
  v_to_balance numeric;
  v_ref text;
BEGIN
  SELECT balance INTO v_from_balance FROM accounts WHERE id = p_from_account_id AND user_id = p_user_id;
  IF v_from_balance IS NULL THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;
  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  SELECT balance INTO v_to_balance FROM accounts WHERE id = p_to_account_id AND user_id = p_user_id;
  IF v_to_balance IS NULL THEN
    RAISE EXCEPTION 'Destination account not found';
  END IF;

  UPDATE accounts SET balance = balance - p_amount WHERE id = p_from_account_id AND user_id = p_user_id;
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_to_account_id AND user_id = p_user_id;

  v_from_balance := v_from_balance - p_amount;
  v_to_balance := v_to_balance + p_amount;
  v_ref := 'TRF' || lpad(floor(random() * 1000000)::text, 6, '0');

  INSERT INTO transactions (account_id, user_id, type, category, description, amount, balance_after, reference_number)
  VALUES
    (p_from_account_id, p_user_id, 'debit', 'transfer', p_description, p_amount, v_from_balance, v_ref),
    (p_to_account_id, p_user_id, 'credit', 'transfer', p_description, p_amount, v_to_balance, v_ref);

  INSERT INTO transfers (id, user_id, from_account_id, to_account_id, amount, description, status)
  VALUES (gen_random_uuid(), p_user_id, p_from_account_id, p_to_account_id, p_amount, p_description, 'completed')
  RETURNING id INTO v_transfer_id;

  RETURN v_transfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;