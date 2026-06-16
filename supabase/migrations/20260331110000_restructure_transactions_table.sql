/*
  # Restructure banking transactions schema

  1. Changes
    - Reshape `public.transactions` to use:
      - `id`
      - `user_id`
      - `type`
      - `details`
      - `poi`
      - `status`
      - `created_at`
    - Preserve existing text data by mapping:
      - `description` -> `details`
      - `reference_number` -> `poi`
    - Remove old banking-only fields:
      - `category`
      - `amount`
      - `balance_after`

  2. Notes
    - Existing rows are preserved.
    - Existing RLS policies stay in place.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'description'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'details'
  ) THEN
    ALTER TABLE public.transactions RENAME COLUMN description TO details;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'reference_number'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'poi'
  ) THEN
    ALTER TABLE public.transactions RENAME COLUMN reference_number TO poi;
  END IF;
END $$;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS details text,
  ADD COLUMN IF NOT EXISTS poi text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed';

UPDATE public.transactions
SET details = COALESCE(NULLIF(details, ''), '')
WHERE details IS NULL OR details = '';

UPDATE public.transactions
SET poi = COALESCE(NULLIF(poi, ''), '')
WHERE poi IS NULL OR poi = '';

UPDATE public.transactions
SET status = 'completed'
WHERE status IS NULL OR btrim(status) = '';

ALTER TABLE public.transactions
  ALTER COLUMN details SET DEFAULT '',
  ALTER COLUMN details SET NOT NULL,
  ALTER COLUMN poi SET DEFAULT '',
  ALTER COLUMN poi SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'completed',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.transactions DROP COLUMN IF EXISTS category;
ALTER TABLE public.transactions DROP COLUMN IF EXISTS amount;
ALTER TABLE public.transactions DROP COLUMN IF EXISTS balance_after;
ALTER TABLE public.transactions DROP COLUMN IF EXISTS reference_number;
ALTER TABLE public.transactions DROP COLUMN IF EXISTS description;
