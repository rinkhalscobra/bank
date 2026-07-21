/*
  # Add display names to fiat balances

  Stores the asset name entered in CRM instead of deriving every fiat balance
  from the three originally supported currencies.
*/

ALTER TABLE IF EXISTS public.fiat_balances
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.fiat_balances.name IS
  'Customer-facing fiat asset name configured in CRM.';
