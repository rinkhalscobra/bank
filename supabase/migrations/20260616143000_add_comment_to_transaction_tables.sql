/*
  # Add comment fields to transaction tables

  1. Changes
    - Adds `comment` to `public.transactions`
    - Adds `comment` to `public.crypto_transactions`
    - Backfills existing null values to empty strings

  2. Notes
    - Existing insert paths keep working because the new column defaults to `''`
*/

ALTER TABLE IF EXISTS public.transactions
  ADD COLUMN IF NOT EXISTS comment text;

UPDATE public.transactions
SET comment = ''
WHERE comment IS NULL;

ALTER TABLE IF EXISTS public.transactions
  ALTER COLUMN comment SET DEFAULT '',
  ALTER COLUMN comment SET NOT NULL;

ALTER TABLE IF EXISTS public.crypto_transactions
  ADD COLUMN IF NOT EXISTS comment text;

UPDATE public.crypto_transactions
SET comment = ''
WHERE comment IS NULL;

ALTER TABLE IF EXISTS public.crypto_transactions
  ALTER COLUMN comment SET DEFAULT '',
  ALTER COLUMN comment SET NOT NULL;
