/*
  # Create balance_snapshots table and auto-snapshot triggers

  1. New Tables
    - `balance_snapshots`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `asset_type` (text, 'fiat' or 'crypto')
      - `symbol` (text, e.g. 'USD', 'BTC')
      - `balance` (numeric, raw balance)
      - `balance_usd` (numeric, approximate USD value)
      - `snapshot_date` (date, the day of the snapshot)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `balance_snapshots`
    - Users can only read their own snapshots

  3. Triggers
    - On INSERT or UPDATE to `fiat_balances`, insert a snapshot
    - On INSERT or UPDATE to `crypto_balances`, insert a snapshot
    - Uses approximate USD conversion rates

  4. Notes
    - One snapshot per user/asset/day (upserts on conflict)
    - Provides historical data for analytics charts
*/

CREATE TABLE IF NOT EXISTS balance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('fiat', 'crypto')),
  symbol text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  balance_usd numeric NOT NULL DEFAULT 0,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_balance_snapshots_unique
  ON balance_snapshots (user_id, asset_type, symbol, snapshot_date);

CREATE INDEX IF NOT EXISTS idx_balance_snapshots_user_date
  ON balance_snapshots (user_id, snapshot_date);

ALTER TABLE balance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own balance snapshots"
  ON balance_snapshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balance snapshots"
  ON balance_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION snapshot_fiat_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usd_rate numeric;
BEGIN
  CASE NEW.currency
    WHEN 'USD' THEN usd_rate := 1;
    WHEN 'EUR' THEN usd_rate := 1.08;
    WHEN 'CAD' THEN usd_rate := 0.74;
    ELSE usd_rate := 1;
  END CASE;

  INSERT INTO balance_snapshots (user_id, asset_type, symbol, balance, balance_usd, snapshot_date)
  VALUES (NEW.user_id, 'fiat', NEW.currency, NEW.balance, NEW.balance * usd_rate, CURRENT_DATE)
  ON CONFLICT (user_id, asset_type, symbol, snapshot_date)
  DO UPDATE SET balance = EXCLUDED.balance, balance_usd = EXCLUDED.balance_usd, created_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_fiat_balance ON fiat_balances;
CREATE TRIGGER trg_snapshot_fiat_balance
  AFTER INSERT OR UPDATE ON fiat_balances
  FOR EACH ROW EXECUTE FUNCTION snapshot_fiat_balance();

CREATE OR REPLACE FUNCTION snapshot_crypto_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usd_rate numeric;
BEGIN
  CASE NEW.symbol
    WHEN 'BTC' THEN usd_rate := 62000;
    WHEN 'ETH' THEN usd_rate := 3400;
    WHEN 'SOL' THEN usd_rate := 145;
    WHEN 'USDC' THEN usd_rate := 1;
    WHEN 'USDT' THEN usd_rate := 1;
    ELSE usd_rate := 1;
  END CASE;

  INSERT INTO balance_snapshots (user_id, asset_type, symbol, balance, balance_usd, snapshot_date)
  VALUES (NEW.user_id, 'crypto', NEW.symbol, NEW.balance, NEW.balance * usd_rate, CURRENT_DATE)
  ON CONFLICT (user_id, asset_type, symbol, snapshot_date)
  DO UPDATE SET balance = EXCLUDED.balance, balance_usd = EXCLUDED.balance_usd, created_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_crypto_balance ON crypto_balances;
CREATE TRIGGER trg_snapshot_crypto_balance
  AFTER INSERT OR UPDATE ON crypto_balances
  FOR EACH ROW EXECUTE FUNCTION snapshot_crypto_balance();

-- Seed snapshots for existing balances so analytics has data immediately
INSERT INTO balance_snapshots (user_id, asset_type, symbol, balance, balance_usd, snapshot_date)
SELECT
  user_id,
  'fiat',
  currency,
  balance,
  balance * CASE currency WHEN 'USD' THEN 1 WHEN 'EUR' THEN 1.08 WHEN 'CAD' THEN 0.74 ELSE 1 END,
  CURRENT_DATE
FROM fiat_balances
ON CONFLICT (user_id, asset_type, symbol, snapshot_date) DO NOTHING;

INSERT INTO balance_snapshots (user_id, asset_type, symbol, balance, balance_usd, snapshot_date)
SELECT
  user_id,
  'crypto',
  symbol,
  balance,
  balance * CASE symbol WHEN 'BTC' THEN 62000 WHEN 'ETH' THEN 3400 WHEN 'SOL' THEN 145 WHEN 'USDC' THEN 1 WHEN 'USDT' THEN 1 ELSE 1 END,
  CURRENT_DATE
FROM crypto_balances
WHERE balance > 0
ON CONFLICT (user_id, asset_type, symbol, snapshot_date) DO NOTHING;
