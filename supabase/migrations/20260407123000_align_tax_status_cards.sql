/*
  # Store tax cards separately from tax records

  The dashboard now uses exactly three tax amount cards:
  pending, on_hold, and paid.

  Existing tax records are rolled into those three cards before the old
  record rows are cleared, so the removed "Tax Records" card no longer has
  row data behind it.
*/

CREATE TABLE IF NOT EXISTS public.tax_summary_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tax_summary_cards_status_check CHECK (status IN ('pending', 'on_hold', 'paid')),
  CONSTRAINT tax_summary_cards_user_status_key UNIQUE (user_id, status)
);

ALTER TABLE public.tax_summary_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tax summary cards" ON public.tax_summary_cards;
CREATE POLICY "Users can view own tax summary cards"
  ON public.tax_summary_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all tax summary cards" ON public.tax_summary_cards;
CREATE POLICY "Admins can view all tax summary cards"
  ON public.tax_summary_cards FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can insert tax summary cards" ON public.tax_summary_cards;
CREATE POLICY "Admins can insert tax summary cards"
  ON public.tax_summary_cards FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can update tax summary cards" ON public.tax_summary_cards;
CREATE POLICY "Admins can update tax summary cards"
  ON public.tax_summary_cards FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can delete tax summary cards" ON public.tax_summary_cards;
CREATE POLICY "Admins can delete tax summary cards"
  ON public.tax_summary_cards FOR DELETE
  TO authenticated
  USING (public.is_admin_user());

WITH normalized_taxes AS (
  SELECT
    id,
    user_id,
    CASE
      WHEN lower(regexp_replace(status, '[- ]+', '_', 'g')) IN ('paid', 'completed') THEN 'paid'
      WHEN lower(regexp_replace(status, '[- ]+', '_', 'g')) IN ('on_hold', 'hold', 'held') THEN 'on_hold'
      ELSE 'pending'
    END AS normalized_status,
    GREATEST(COALESCE(amount_owed, 0), 0) AS owed,
    GREATEST(COALESCE(amount_paid, 0), 0) AS paid
  FROM public.taxes
),
tax_card_totals AS (
  SELECT
    user_id,
    normalized_status AS status,
    SUM(
      CASE
        WHEN normalized_status = 'paid' THEN
          CASE WHEN paid > 0 THEN paid ELSE owed END
        ELSE GREATEST(owed - paid, 0)
      END
    ) AS amount
  FROM normalized_taxes
  GROUP BY user_id, normalized_status
)
INSERT INTO public.tax_summary_cards (user_id, status, amount, updated_at)
SELECT user_id, status, amount, now()
FROM tax_card_totals
ON CONFLICT (user_id, status)
DO UPDATE SET
  amount = EXCLUDED.amount,
  updated_at = now();

DELETE FROM public.taxes;

ALTER TABLE public.taxes
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.taxes
  DROP CONSTRAINT IF EXISTS taxes_status_check;

ALTER TABLE public.taxes
  ADD CONSTRAINT taxes_status_check
  CHECK (status IN ('pending', 'on_hold', 'paid'));
