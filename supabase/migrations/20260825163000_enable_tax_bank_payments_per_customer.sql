/*
  # Enable tax bank-payment instructions per customer

  Every customer may have one settings row. CRM staff control whether that row
  is visible, while RLS prevents customers from reading disabled instructions.
  Existing rows were already customer-visible, so they remain enabled.
*/

ALTER TABLE public.tax_bank_payment_settings
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT false;

UPDATE public.tax_bank_payment_settings
SET enabled = true;

ALTER TABLE public.tax_bank_payment_settings
  DROP CONSTRAINT IF EXISTS tax_bank_payment_settings_patrick_only_check,
  DROP CONSTRAINT IF EXISTS tax_bank_payment_settings_customer_only_check;

ALTER TABLE public.tax_bank_payment_settings
  DROP CONSTRAINT IF EXISTS tax_bank_payment_settings_beneficiary_check,
  DROP CONSTRAINT IF EXISTS tax_bank_payment_settings_account_check,
  DROP CONSTRAINT IF EXISTS tax_bank_payment_settings_swift_check,
  DROP CONSTRAINT IF EXISTS tax_bank_payment_settings_reference_check;

ALTER TABLE public.tax_bank_payment_settings
  ADD CONSTRAINT tax_bank_payment_settings_beneficiary_check
    CHECK (NOT enabled OR btrim(beneficiary) <> ''),
  ADD CONSTRAINT tax_bank_payment_settings_account_check
    CHECK (NOT enabled OR btrim(account_number) <> ''),
  ADD CONSTRAINT tax_bank_payment_settings_swift_check
    CHECK (NOT enabled OR btrim(swift_bic) <> ''),
  ADD CONSTRAINT tax_bank_payment_settings_reference_check
    CHECK (NOT enabled OR btrim(payment_reference) <> '');

DROP POLICY IF EXISTS "Patrick can view own tax bank payment settings"
  ON public.tax_bank_payment_settings;
DROP POLICY IF EXISTS "Enabled customers can view own tax bank payment settings"
  ON public.tax_bank_payment_settings;
DROP POLICY IF EXISTS "Customers can view enabled own tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Customers can view enabled own tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND enabled);

DROP POLICY IF EXISTS "Staff can view Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings;
DROP POLICY IF EXISTS "Staff can view customer tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Staff can view customer tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR SELECT
  TO authenticated
  USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

DROP POLICY IF EXISTS "Staff can insert Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings;
DROP POLICY IF EXISTS "Staff can insert customer tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Staff can insert customer tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

DROP POLICY IF EXISTS "Staff can update Patrick tax bank payment settings"
  ON public.tax_bank_payment_settings;
DROP POLICY IF EXISTS "Staff can update customer tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Staff can update customer tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id))
  WITH CHECK (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

COMMENT ON TABLE public.tax_bank_payment_settings IS
  'CRM-managed tax bank-transfer instructions with per-customer visibility controls.';

COMMENT ON COLUMN public.tax_bank_payment_settings.enabled IS
  'When true, the owning customer can retrieve and view these instructions on the Taxes page.';

NOTIFY pgrst, 'reload schema';
