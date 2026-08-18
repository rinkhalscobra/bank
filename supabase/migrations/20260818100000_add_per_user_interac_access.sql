/*
  # Per-user Interac e-Transfer access

  Replaces the original single-customer UUID restriction with a CRM-managed
  access setting. Interac is disabled for existing and future customers by
  default, while CRM staff can enable or disable it for any individual.
  Lariviere Jocelyne keeps the access granted by the original implementation.
*/

CREATE TABLE IF NOT EXISTS public.interac_access_settings (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interac_access_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own Interac access" ON public.interac_access_settings;
CREATE POLICY "Users can view own Interac access"
  ON public.interac_access_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view managed Interac access" ON public.interac_access_settings;
CREATE POLICY "Staff can view managed Interac access"
  ON public.interac_access_settings
  FOR SELECT
  TO authenticated
  USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

DROP POLICY IF EXISTS "Staff can insert managed Interac access" ON public.interac_access_settings;
CREATE POLICY "Staff can insert managed Interac access"
  ON public.interac_access_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

DROP POLICY IF EXISTS "Staff can update managed Interac access" ON public.interac_access_settings;
CREATE POLICY "Staff can update managed Interac access"
  ON public.interac_access_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id))
  WITH CHECK (public.is_crm_staff() AND public.can_manage_user_scope(user_id));

CREATE OR REPLACE FUNCTION public.touch_interac_access_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_interac_access_settings_updated_at
  ON public.interac_access_settings;
CREATE TRIGGER set_interac_access_settings_updated_at
  BEFORE UPDATE ON public.interac_access_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_interac_access_settings_updated_at();

CREATE OR REPLACE FUNCTION public.user_has_interac_access(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT enabled
    FROM public.interac_access_settings
    WHERE user_id = target_user_id
  ), false);
$$;

REVOKE ALL ON FUNCTION public.user_has_interac_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_has_interac_access(uuid) TO authenticated;

INSERT INTO public.interac_access_settings (user_id, enabled)
SELECT id, id = 'ba326e30-bd5d-4472-a5dc-18cf152bc1ae'::uuid
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.bank_transfers
  DROP CONSTRAINT IF EXISTS bank_transfers_interac_customer_check;

DROP POLICY IF EXISTS "Users can insert own transfers" ON public.bank_transfers;
CREATE POLICY "Users can insert own transfers"
  ON public.bank_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      transfer_channel <> 'interac'
      OR public.user_has_interac_access(auth.uid())
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'interac_access_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.interac_access_settings;
  END IF;
END $$;

COMMENT ON TABLE public.interac_access_settings IS
  'CRM-managed per-user visibility and submission access for Interac e-Transfer.';
