/*
  # Revert snapshot triggers to only capture the changed asset

  1. Changes
    - Revert `snapshot_fiat_balance()` to only snapshot the changed fiat row
    - Revert `snapshot_crypto_balance()` to only snapshot the changed crypto row
    - The previous migration caused N*M duplicate rows per transaction
    - Forward-fill logic is handled in the frontend hook instead

  2. Why
    - Snapshotting ALL balances on every single row change creates excessive
      duplicate data (an exchange updating 2 rows would write 2 * total_assets rows)
    - The frontend hook now forward-fills the last known value for each asset
      across all timestamps, giving a complete timeline without DB bloat

  3. Security
    - No changes to RLS policies
*/

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
