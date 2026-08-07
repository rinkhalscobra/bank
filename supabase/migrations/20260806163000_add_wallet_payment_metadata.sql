/*
  Wallet payment metadata allows the QR generator to build the correct payment
  request for arbitrary admin-configured assets and networks. Empty metadata is
  intentionally supported: the UI then encodes the raw address, which remains
  scannable by wallet applications without inventing an incompatible URI.
*/

ALTER TABLE public.crypto_wallets
  ADD COLUMN IF NOT EXISTS chain_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS token_contract text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS token_decimals integer,
  ADD COLUMN IF NOT EXISTS payment_uri_scheme text NOT NULL DEFAULT '';

ALTER TABLE public.tax_wallet_addresses
  ADD COLUMN IF NOT EXISTS symbol text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS network text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS chain_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS token_contract text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS token_decimals integer,
  ADD COLUMN IF NOT EXISTS payment_uri_scheme text NOT NULL DEFAULT '';

ALTER TABLE public.crypto_wallets
  DROP CONSTRAINT IF EXISTS crypto_wallets_user_id_symbol_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.crypto_wallets'::regclass
      AND conname = 'crypto_wallets_user_id_symbol_network_key'
  ) THEN
    ALTER TABLE public.crypto_wallets
      ADD CONSTRAINT crypto_wallets_user_id_symbol_network_key
      UNIQUE (user_id, symbol, network);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.create_crypto_wallets_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coins text[][] := ARRAY[
    ARRAY['BTC', 'Bitcoin', 'Bitcoin'],
    ARRAY['ETH', 'Ethereum', 'Ethereum'],
    ARRAY['SOL', 'Solana', 'Solana'],
    ARRAY['DOGE', 'Dogecoin', 'Dogecoin'],
    ARRAY['USDT', 'Tether', 'Tron'],
    ARRAY['USDC', 'USD Coin', 'Ethereum']
  ];
  coin text[];
BEGIN
  FOREACH coin SLICE 1 IN ARRAY coins LOOP
    INSERT INTO public.crypto_wallets (user_id, symbol, name, wallet_address, network)
    VALUES (
      p_user_id,
      coin[1],
      coin[2],
      public.generate_wallet_address(coin[3]),
      coin[3]
    )
    ON CONFLICT (user_id, symbol, network) DO NOTHING;
  END LOOP;
END;
$$;

COMMENT ON COLUMN public.crypto_wallets.payment_uri_scheme IS
  'Optional URI scheme override such as bitcoin, litecoin, monero, or a wallet-specific registered scheme.';
COMMENT ON COLUMN public.tax_wallet_addresses.payment_uri_scheme IS
  'Optional URI scheme override such as bitcoin, litecoin, monero, or a wallet-specific registered scheme.';

NOTIFY pgrst, 'reload schema';
