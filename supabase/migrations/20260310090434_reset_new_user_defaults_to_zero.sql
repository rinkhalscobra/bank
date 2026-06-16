/*
  # Reset new user defaults to zero

  1. Changes
    - Update `handle_new_user()` trigger function so that newly registered users start with zero balances
    - Fiat balances (USD, EUR, CAD) initialized to 0.00
    - Crypto balances (BTC, ETH, SOL, USDT, USDC) initialized to 0
    - Virtual card still created for the user
    - No sample transactions are inserted

  2. Notes
    - Existing users are NOT affected
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

  RETURN NEW;
END;
$$;