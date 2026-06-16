/*
  # Remove automatic card creation for new users

  1. Changes
    - Update `handle_new_user()` to no longer create a virtual card on registration
    - New users start with zero cards
    - Cards are only created when the user explicitly applies for one

  2. Notes
    - Existing users and their cards are NOT affected
    - Only applies to users who register after this migration
*/

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
    (usd_id, NEW.id, 'USD', 0),
    (eur_id, NEW.id, 'EUR', 0),
    (cad_id, NEW.id, 'CAD', 0);

  INSERT INTO public.crypto_balances (id, user_id, symbol, name, balance)
  VALUES
    (btc_id, NEW.id, 'BTC', 'Bitcoin', 0),
    (eth_id, NEW.id, 'ETH', 'Ethereum', 0),
    (sol_id, NEW.id, 'SOL', 'Solana', 0),
    (usdt_id, NEW.id, 'USDT', 'Tether', 0),
    (usdc_id, NEW.id, 'USDC', 'USD Coin', 0);

  RETURN NEW;
END;
$$;