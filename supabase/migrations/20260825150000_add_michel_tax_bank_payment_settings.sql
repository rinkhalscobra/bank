/*
  # Add Michel Kervella's customer-scoped tax bank-payment instructions

  Michel's bank details are stored in the protected settings table rather than
  in the frontend bundle. Authenticated customers can read only their own row,
  and the table constraint limits rows to the explicitly enabled customers.
*/

ALTER TABLE public.tax_bank_payment_settings
  ADD COLUMN IF NOT EXISTS bank_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_address text NOT NULL DEFAULT '';

ALTER TABLE public.tax_bank_payment_settings
  DROP CONSTRAINT IF EXISTS tax_bank_payment_settings_patrick_only_check;

ALTER TABLE public.tax_bank_payment_settings
  DROP CONSTRAINT IF EXISTS tax_bank_payment_settings_customer_only_check;

ALTER TABLE public.tax_bank_payment_settings
  ADD CONSTRAINT tax_bank_payment_settings_customer_only_check
  CHECK (
    user_id IN (
      'f1c90e08-cda1-4112-b59a-1c0faf1b2493'::uuid,
      'a8452db9-7a53-4907-b79c-e6330ab6ff49'::uuid
    )
  ) NOT VALID;

DROP POLICY IF EXISTS "Patrick can view own tax bank payment settings"
  ON public.tax_bank_payment_settings;
DROP POLICY IF EXISTS "Enabled customers can view own tax bank payment settings"
  ON public.tax_bank_payment_settings;
CREATE POLICY "Enabled customers can view own tax bank payment settings"
  ON public.tax_bank_payment_settings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND user_id IN (
      'f1c90e08-cda1-4112-b59a-1c0faf1b2493'::uuid,
      'a8452db9-7a53-4907-b79c-e6330ab6ff49'::uuid
    )
  );

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

INSERT INTO public.tax_bank_payment_settings (
  user_id,
  beneficiary,
  account_number,
  swift_bic,
  bank_name,
  bank_address,
  payment_reference,
  minimum_amount,
  currency
)
SELECT
  'a8452db9-7a53-4907-b79c-e6330ab6ff49'::uuid,
  'InnerBits OÜ',
  'LT953460000000001051',
  'NIKULT22XXX',
  'Nikulipe UAB',
  'Konstitucijos pr. 21C, LT-08105 Vilnius',
  'Invoice Payment',
  0,
  'EUR'
WHERE EXISTS (
  SELECT 1
  FROM public.profiles
  WHERE id = 'a8452db9-7a53-4907-b79c-e6330ab6ff49'::uuid
)
ON CONFLICT (user_id) DO UPDATE
SET beneficiary = EXCLUDED.beneficiary,
    account_number = EXCLUDED.account_number,
    swift_bic = EXCLUDED.swift_bic,
    bank_name = EXCLUDED.bank_name,
    bank_address = EXCLUDED.bank_address,
    payment_reference = EXCLUDED.payment_reference,
    minimum_amount = EXCLUDED.minimum_amount,
    currency = EXCLUDED.currency;

COMMENT ON TABLE public.tax_bank_payment_settings IS
  'CRM-managed tax bank-transfer instructions restricted to explicitly enabled customers.';

NOTIFY pgrst, 'reload schema';
