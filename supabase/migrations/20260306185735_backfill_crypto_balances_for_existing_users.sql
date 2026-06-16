/*
  # Backfill crypto balances for existing users

  1. Changes
    - Inserts default crypto balances (BTC, ETH, USDT, SOL, USDC) for any
      existing user in `profiles` who does not yet have rows in `crypto_balances`

  2. Important Notes
    - Only affects users who signed up before the crypto seeding was added
      to the `handle_new_user` trigger
    - Users who already have crypto balances are not touched
    - Future users are handled automatically by the trigger
*/

INSERT INTO public.crypto_balances (user_id, symbol, name, balance)
SELECT p.id, v.symbol, v.name, v.balance
FROM public.profiles p
CROSS JOIN (
  VALUES
    ('BTC', 'Bitcoin',   0.4825),
    ('ETH', 'Ethereum',  3.2150),
    ('USDT', 'Tether',   2500.00),
    ('SOL', 'Solana',    45.750),
    ('USDC', 'USD Coin', 1800.00)
) AS v(symbol, name, balance)
WHERE NOT EXISTS (
  SELECT 1 FROM public.crypto_balances cb
  WHERE cb.user_id = p.id
);