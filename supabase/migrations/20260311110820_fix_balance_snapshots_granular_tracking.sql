/*
  # Fix balance snapshots to track every balance change

  1. Changes
    - Drop the unique index on (user_id, asset_type, symbol, snapshot_date) 
      that was collapsing all same-day changes into one data point
    - Recreate trigger functions to INSERT a new row for every balance change
      instead of upserting (overwriting) within the same day
    - Each balance change now produces a distinct snapshot row with its own created_at timestamp
    - Within a single database transaction (e.g. one currency exchange), 
      all triggered snapshots share the same created_at value from now()

  2. Why
    - Previously the chart showed at most one data point per calendar day
    - Users could not see how their balances evolved throughout the day
    - After this change, every exchange/transfer/deposit creates visible chart points

  3. Security
    - No changes to RLS policies
    - Trigger functions remain SECURITY DEFINER to write snapshots from exchange functions
*/

DROP INDEX IF EXISTS idx_balance_snapshots_unique;

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
  VALUES (NEW.user_id, 'fiat', NEW.currency, NEW.balance, NEW.balance * usd_rate, CURRENT_DATE);

  RETURN NEW;
END;
$$;

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
  VALUES (NEW.user_id, 'crypto', NEW.symbol, NEW.balance, NEW.balance * usd_rate, CURRENT_DATE);

  RETURN NEW;
END;
$$;
