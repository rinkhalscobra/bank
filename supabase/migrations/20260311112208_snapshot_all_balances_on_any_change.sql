/*
  # Snapshot ALL user balances on any balance change

  1. Changes
    - Replace `snapshot_fiat_balance()` trigger function so it snapshots
      ALL fiat AND crypto balances for the user, not just the one that changed
    - Replace `snapshot_crypto_balance()` trigger function similarly
    - This ensures every asset has a data point at every timestamp,
      giving a complete timeline for per-asset charts

  2. Why
    - Previously only the changed asset got a snapshot row
    - Other assets had gaps in their timeline (e.g. BTC had no data point
      when a USD->EUR exchange happened)
    - Now every balance change produces a full set of snapshots for the user

  3. Security
    - No changes to RLS policies
    - Trigger functions remain SECURITY DEFINER
*/

CREATE OR REPLACE FUNCTION snapshot_fiat_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO balance_snapshots (user_id, asset_type, symbol, balance, balance_usd, snapshot_date)
  SELECT
    NEW.user_id,
    'fiat',
    fb.currency,
    fb.balance,
    fb.balance * CASE fb.currency
      WHEN 'USD' THEN 1
      WHEN 'EUR' THEN 1.08
      WHEN 'CAD' THEN 0.74
      ELSE 1
    END,
    CURRENT_DATE
  FROM fiat_balances fb
  WHERE fb.user_id = NEW.user_id;

  INSERT INTO balance_snapshots (user_id, asset_type, symbol, balance, balance_usd, snapshot_date)
  SELECT
    NEW.user_id,
    'crypto',
    cb.symbol,
    cb.balance,
    cb.balance * CASE cb.symbol
      WHEN 'BTC' THEN 62000
      WHEN 'ETH' THEN 3400
      WHEN 'SOL' THEN 145
      WHEN 'USDC' THEN 1
      WHEN 'USDT' THEN 1
      ELSE 1
    END,
    CURRENT_DATE
  FROM crypto_balances cb
  WHERE cb.user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION snapshot_crypto_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO balance_snapshots (user_id, asset_type, symbol, balance, balance_usd, snapshot_date)
  SELECT
    NEW.user_id,
    'fiat',
    fb.currency,
    fb.balance,
    fb.balance * CASE fb.currency
      WHEN 'USD' THEN 1
      WHEN 'EUR' THEN 1.08
      WHEN 'CAD' THEN 0.74
      ELSE 1
    END,
    CURRENT_DATE
  FROM fiat_balances fb
  WHERE fb.user_id = NEW.user_id;

  INSERT INTO balance_snapshots (user_id, asset_type, symbol, balance, balance_usd, snapshot_date)
  SELECT
    NEW.user_id,
    'crypto',
    cb.symbol,
    cb.balance,
    cb.balance * CASE cb.symbol
      WHEN 'BTC' THEN 62000
      WHEN 'ETH' THEN 3400
      WHEN 'SOL' THEN 145
      WHEN 'USDC' THEN 1
      WHEN 'USDT' THEN 1
      ELSE 1
    END,
    CURRENT_DATE
  FROM crypto_balances cb
  WHERE cb.user_id = NEW.user_id;

  RETURN NEW;
END;
$$;
