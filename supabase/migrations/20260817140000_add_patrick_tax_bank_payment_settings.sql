/*
  # Customer-scoped tax bank-payment settings

  The tax bank-transfer panel is available exclusively to Patrick Chenaux.
  This singleton settings table lets authorized CRM staff update the displayed
  payment instructions while the database prevents records for other users.
*/

CREATE TABLE IF NOT EXISTS public.tax_bank_payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  beneficiary text NOT NULL,
  account_number text NOT NULL,
  swift_bic text NOT NULL,
  payment_reference text NOT NULL,
  minimum_amount numeric(18, 2) NOT NULL DEFAULT 5000,
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tax_bank_payment_settings_patrick_only_check
    CHECK (user_id = 'f1c90e08-cda1-4112-b59a-1c0faf1b2493'::uuid),
  CONSTRAINT tax_bank_payment_settings_beneficiary_check
    CHECK (btrim(beneficiary) <> ''),
  CONSTRAINT tax_bank_payment_settings_account_check
    CHECK (btrim(account_number) <> ''),
  CONSTRAINT tax_bank_payment_settings_swift_check
    CHECK (btrim(swift_bic) <> ''),
  CONSTRAINT tax_bank_payment_settings_reference_check
    CHECK (btrim(payment_reference) <> ''),
  CONSTRAINT tax_bank_payment_settings_minimum_check
    CHECK (minimum_amount >= 0),
  CONSTRAINT tax_bank_payment_settings_currency_check
    CHECK (currency ~ '^[A-Z]{3}$')
);

ALTER TABLE public.tax_bank_payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patrick can view own tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Patrick can view own tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND user_id = 'f1c90e08-cda1-4112-b59a-1c0faf1b2493'::uuid
  );

DROP POLICY IF EXISTS "Staff can view Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Staff can view Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR SELECT
  TO authenticated
  USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

DROP POLICY IF EXISTS "Staff can insert Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Staff can insert Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

DROP POLICY IF EXISTS "Staff can update Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Staff can update Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id))
  WITH CHECK (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

INSERT INTO public.tax_bank_payment_settings (
  user_id,
  beneficiary,
  account_number,
  swift_bic,
  payment_reference,
  minimum_amount,
  currency
)
SELECT
  'f1c90e08-cda1-4112-b59a-1c0faf1b2493'::uuid,
  'PATRICK CHENAUX',
  'FR7617478000010005139965333',
  'HRSAFR22XXX',
  '013641566',
  5000,
  'EUR'
WHERE EXISTS (
  SELECT 1
  FROM public.profiles
  WHERE id = 'f1c90e08-cda1-4112-b59a-1c0faf1b2493'::uuid
)
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.touch_tax_bank_payment_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_tax_bank_payment_settings_updated_at'
      AND tgrelid = 'public.tax_bank_payment_settings'::regclass
  ) THEN
    CREATE TRIGGER set_tax_bank_payment_settings_updated_at
      BEFORE UPDATE ON public.tax_bank_payment_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.touch_tax_bank_payment_settings_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'tax_bank_payment_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tax_bank_payment_settings;
  END IF;
END $$;

COMMENT ON TABLE public.tax_bank_payment_settings IS
  'CRM-managed tax bank-transfer instructions available only to Patrick Chenaux.';
