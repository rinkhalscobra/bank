/*
  # Add per-user balance card ordering

  Each fiat and crypto balance receives a display position scoped by its user.
  Existing balances retain a deterministic created-at order.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fiat_balances'
      AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.fiat_balances
      ADD COLUMN display_order integer NOT NULL DEFAULT 0;

    WITH ranked AS (
      SELECT
        id,
        row_number() OVER (PARTITION BY user_id ORDER BY created_at, id) - 1 AS position
      FROM public.fiat_balances
    )
    UPDATE public.fiat_balances AS balance
    SET display_order = ranked.position
    FROM ranked
    WHERE balance.id = ranked.id;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'crypto_balances'
      AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.crypto_balances
      ADD COLUMN display_order integer NOT NULL DEFAULT 0;

    WITH ranked AS (
      SELECT
        id,
        row_number() OVER (PARTITION BY user_id ORDER BY created_at, id) - 1 AS position
      FROM public.crypto_balances
    )
    UPDATE public.crypto_balances AS balance
    SET display_order = ranked.position
    FROM ranked
    WHERE balance.id = ranked.id;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fiat_balances_user_display_order
  ON public.fiat_balances(user_id, display_order);

CREATE INDEX IF NOT EXISTS idx_crypto_balances_user_display_order
  ON public.crypto_balances(user_id, display_order);
