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

COMMENT ON COLUMN public.crypto_wallets.payment_uri_scheme IS
  'Optional URI scheme override such as bitcoin, litecoin, monero, or a wallet-specific registered scheme.';
COMMENT ON COLUMN public.tax_wallet_addresses.payment_uri_scheme IS
  'Optional URI scheme override such as bitcoin, litecoin, monero, or a wallet-specific registered scheme.';

NOTIFY pgrst, 'reload schema';
