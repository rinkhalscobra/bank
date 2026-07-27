/*
  Store one ISO 4217 display currency per customer's tax summary and publish
  summary changes through Supabase Realtime.
*/

ALTER TABLE public.tax_summary_cards
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

UPDATE public.tax_summary_cards
SET currency = upper(currency)
WHERE currency <> upper(currency);

ALTER TABLE public.tax_summary_cards
  DROP CONSTRAINT IF EXISTS tax_summary_cards_currency_check;

ALTER TABLE public.tax_summary_cards
  ADD CONSTRAINT tax_summary_cards_currency_check
  CHECK (currency ~ '^[A-Z]{3}$');

CREATE OR REPLACE FUNCTION public.set_tax_summary_card(
  target_user_id uuid,
  target_status text,
  target_amount numeric,
  target_currency text
)
RETURNS SETOF public.tax_summary_cards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_currency text := upper(trim(target_currency));
  summary_status text;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF target_status NOT IN ('pending', 'on_hold', 'paid') THEN
    RAISE EXCEPTION 'Invalid tax status';
  END IF;

  IF target_amount < 0 THEN
    RAISE EXCEPTION 'Tax amount cannot be negative';
  END IF;

  IF normalized_currency !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'Currency must be a three-letter ISO code';
  END IF;

  FOREACH summary_status IN ARRAY ARRAY['pending', 'on_hold', 'paid']
  LOOP
    INSERT INTO public.tax_summary_cards (user_id, status, amount, currency, updated_at)
    VALUES (
      target_user_id,
      summary_status,
      CASE WHEN summary_status = target_status THEN target_amount ELSE 0 END,
      normalized_currency,
      now()
    )
    ON CONFLICT (user_id, status) DO UPDATE
    SET
      amount = CASE
        WHEN tax_summary_cards.status = target_status THEN target_amount
        ELSE tax_summary_cards.amount
      END,
      currency = normalized_currency,
      updated_at = now();
  END LOOP;

  RETURN QUERY
  SELECT *
  FROM public.tax_summary_cards
  WHERE user_id = target_user_id
  ORDER BY status;
END;
$$;

REVOKE ALL ON FUNCTION public.set_tax_summary_card(uuid, text, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_tax_summary_card(uuid, text, numeric, text) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'tax_summary_cards'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tax_summary_cards;
  END IF;
END
$$;
