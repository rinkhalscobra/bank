/*
  # Replace accounts table with fiat_balances

  1. New Tables
    - `fiat_balances`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `currency` (text, e.g. USD, EUR, CAD)
      - `balance` (numeric, default 0)
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, currency)

  2. Data Migration
    - Aggregates existing account balances by user + currency into fiat_balances
    - Only keeps USD, EUR, CAD currencies

  3. Schema Changes
    - Drops all foreign key constraints referencing accounts from:
      transactions, transfers, cards, bill_payments, savings_goals,
      fixed_deposits, currency_exchanges, loans, scheduled_transfers
    - Drops account_id columns from those tables
    - Drops the accounts table
    - Updates handle_new_user trigger to create fiat_balances instead of accounts

  4. Security
    - Enable RLS on fiat_balances
    - Policies for authenticated users to read/update their own balances
*/

-- 1. Create fiat_balances table
CREATE TABLE IF NOT EXISTS fiat_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USD',
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

ALTER TABLE fiat_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fiat balances"
  ON fiat_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own fiat balances"
  ON fiat_balances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own fiat balances"
  ON fiat_balances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Migrate existing account balances into fiat_balances (aggregate by user+currency)
INSERT INTO fiat_balances (user_id, currency, balance)
SELECT user_id, currency, SUM(balance)
FROM accounts
WHERE currency IN ('USD', 'EUR', 'CAD')
GROUP BY user_id, currency
ON CONFLICT (user_id, currency) DO UPDATE SET balance = EXCLUDED.balance;

-- 3. Drop FK constraints from related tables and remove account_id columns

-- transactions: drop FK and column
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_account_id_fkey;
ALTER TABLE transactions DROP COLUMN IF EXISTS account_id;

-- transfers: drop FKs and columns
ALTER TABLE transfers DROP CONSTRAINT IF EXISTS transfers_from_account_id_fkey;
ALTER TABLE transfers DROP CONSTRAINT IF EXISTS transfers_to_account_id_fkey;
ALTER TABLE transfers DROP COLUMN IF EXISTS from_account_id;
ALTER TABLE transfers DROP COLUMN IF EXISTS to_account_id;

-- cards: drop FK and column
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_account_id_fkey;
ALTER TABLE cards DROP COLUMN IF EXISTS account_id;

-- bill_payments: drop FK and column
ALTER TABLE bill_payments DROP CONSTRAINT IF EXISTS bill_payments_account_id_fkey;
ALTER TABLE bill_payments DROP COLUMN IF EXISTS account_id;

-- savings_goals: drop FK and column
ALTER TABLE savings_goals DROP CONSTRAINT IF EXISTS savings_goals_account_id_fkey;
ALTER TABLE savings_goals DROP COLUMN IF EXISTS account_id;

-- fixed_deposits: drop FK and column
ALTER TABLE fixed_deposits DROP CONSTRAINT IF EXISTS fixed_deposits_account_id_fkey;
ALTER TABLE fixed_deposits DROP COLUMN IF EXISTS account_id;

-- currency_exchanges: drop FKs and columns
ALTER TABLE currency_exchanges DROP CONSTRAINT IF EXISTS currency_exchanges_from_account_id_fkey;
ALTER TABLE currency_exchanges DROP CONSTRAINT IF EXISTS currency_exchanges_to_account_id_fkey;
ALTER TABLE currency_exchanges DROP COLUMN IF EXISTS from_account_id;
ALTER TABLE currency_exchanges DROP COLUMN IF EXISTS to_account_id;

-- loans: drop FK and column
ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_disbursement_account_id_fkey;
ALTER TABLE loans DROP COLUMN IF EXISTS disbursement_account_id;

-- scheduled_transfers: drop FKs and columns
ALTER TABLE scheduled_transfers DROP CONSTRAINT IF EXISTS scheduled_transfers_from_account_id_fkey;
ALTER TABLE scheduled_transfers DROP CONSTRAINT IF EXISTS scheduled_transfers_to_account_id_fkey;
ALTER TABLE scheduled_transfers DROP COLUMN IF EXISTS from_account_id;
ALTER TABLE scheduled_transfers DROP COLUMN IF EXISTS to_account_id;

-- 4. Drop the process_transfer function (depends on accounts)
DROP FUNCTION IF EXISTS process_transfer(uuid, uuid, uuid, numeric, text);

-- 5. Drop the accounts table
DROP TABLE IF EXISTS accounts;

-- 6. Update handle_new_user trigger to create fiat_balances instead of accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usd_id uuid := gen_random_uuid();
  eur_id uuid := gen_random_uuid();
  cad_id uuid := gen_random_uuid();
  btc_id uuid := gen_random_uuid();
  eth_id uuid := gen_random_uuid();
  sol_id uuid := gen_random_uuid();
  usdt_id uuid := gen_random_uuid();
  usdc_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );

  INSERT INTO public.fiat_balances (id, user_id, currency, balance)
  VALUES
    (usd_id, NEW.id, 'USD', 5240.75),
    (eur_id, NEW.id, 'EUR', 3420.50),
    (cad_id, NEW.id, 'CAD', 7815.30);

  INSERT INTO public.crypto_balances (id, user_id, symbol, name, balance)
  VALUES
    (btc_id, NEW.id, 'BTC', 'Bitcoin', 0.0845),
    (eth_id, NEW.id, 'ETH', 'Ethereum', 1.2500),
    (sol_id, NEW.id, 'SOL', 'Solana', 15.7500),
    (usdt_id, NEW.id, 'USDT', 'Tether', 2500.00),
    (usdc_id, NEW.id, 'USDC', 'USD Coin', 1800.00);

  INSERT INTO public.cards (user_id, card_type, card_brand, card_number, cardholder_name, expiry_date, cvv, status)
  VALUES (
    NEW.id,
    'virtual',
    'visa',
    '4' || lpad(floor(random() * 1000000000000000)::text, 15, '0'),
    UPPER(COALESCE(NEW.raw_user_meta_data->>'full_name', 'CARDHOLDER')),
    to_char(now() + interval '3 years', 'MM') || '/' || to_char(now() + interval '3 years', 'YY'),
    lpad(floor(random() * 1000)::text, 3, '0'),
    'active'
  );

  INSERT INTO public.transactions (user_id, type, category, description, amount, balance_after, reference_number)
  VALUES
    (NEW.id, 'credit', 'deposit',   'Initial Deposit - USD',          5240.75, 5240.75,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'credit', 'deposit',   'Initial Deposit - EUR',          3420.50, 3420.50,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'credit', 'deposit',   'Initial Deposit - CAD',          7815.30, 7815.30,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'credit', 'income',    'Salary Deposit',                 4200.00, 9440.75,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'utilities', 'Electric Company',                185.40, 9255.35,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'groceries', 'Whole Foods Market',               67.23, 9188.12,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'credit', 'interest',  'Savings Interest',                  12.50, 9200.62,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'dining',    'Restaurant Le Petit',               89.00, 9111.62,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'transport', 'Uber Rides',                        34.50, 9077.12,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'shopping',  'Amazon Purchase',                  156.99, 8920.13,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'credit', 'income',    'Freelance Payment',                850.00, 9770.13,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'subscription','Netflix Subscription',            15.99, 9754.14,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'bills',     'Internet Service',                  79.99, 9674.15,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'groceries', 'Trader Joe''s',                     42.17, 9631.98,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'debit',  'utilities', 'Water & Sewage',                    45.00, 9586.98,  'TXN-' || substr(gen_random_uuid()::text, 1, 8)),
    (NEW.id, 'credit', 'transfer',  'Transfer from External',           500.00, 10086.98, 'TXN-' || substr(gen_random_uuid()::text, 1, 8));

  RETURN NEW;
END;
$$;
