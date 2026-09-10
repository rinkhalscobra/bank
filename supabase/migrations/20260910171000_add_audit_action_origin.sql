/*
  # Add application origin to audit events

  Records whether each request came from the customer dashboard, CRM Admin,
  online-banking authentication, the public site, or an automated system.
*/

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS source_surface text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS source_path text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'audit_logs_source_surface_check'
      AND conrelid = 'public.audit_logs'::regclass
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_source_surface_check
      CHECK (source_surface IN (
        'crm_admin', 'customer_dashboard', 'authentication',
        'public_site', 'system', 'unknown'
      ));
  END IF;
END;
$$;

UPDATE public.audit_logs AS logs
SET source_surface = CASE
  WHEN logs.category = 'auth' THEN 'authentication'
  WHEN logs.actor_role IN ('admin', 'superior_manager', 'agent') THEN 'crm_admin'
  WHEN logs.actor_role = 'customer' THEN 'customer_dashboard'
  WHEN logs.actor_role = 'system' THEN 'system'
  ELSE 'unknown'
END
WHERE logs.source_surface = 'unknown';

CREATE INDEX IF NOT EXISTS audit_logs_source_surface_occurred_at_idx
  ON public.audit_logs (source_surface, occurred_at DESC);

CREATE OR REPLACE FUNCTION public.set_audit_log_request_origin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_headers jsonb := '{}'::jsonb;
  v_client_info text;
  v_surface text;
  v_path text;
BEGIN
  BEGIN
    v_headers := COALESCE(NULLIF(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN
    v_headers := '{}'::jsonb;
  END;

  v_client_info := COALESCE(v_headers ->> 'x-client-info', '');
  v_surface := substring(v_client_info FROM 'bank-surface=([a-z_]+)');
  v_path := substring(v_client_info FROM 'bank-path=([^; ]+)');

  IF v_surface IS NULL OR v_surface NOT IN ('crm_admin', 'customer_dashboard', 'authentication', 'public_site') THEN
    v_surface := CASE
      WHEN NEW.category = 'auth' THEN 'authentication'
      WHEN NEW.actor_role IN ('admin', 'superior_manager', 'agent') THEN 'crm_admin'
      WHEN NEW.actor_role = 'customer' THEN 'customer_dashboard'
      WHEN NEW.actor_role = 'system' THEN 'system'
      ELSE 'unknown'
    END;
  END IF;

  NEW.source_surface := v_surface;
  NEW.source_path := NULLIF(left(COALESCE(v_path, ''), 300), '');
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_audit_log_request_origin() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS set_audit_log_request_origin ON public.audit_logs;
CREATE TRIGGER set_audit_log_request_origin
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_audit_log_request_origin();

COMMENT ON COLUMN public.audit_logs.source_surface IS
  'Application surface that initiated the audited request.';
COMMENT ON COLUMN public.audit_logs.source_path IS
  'Sanitized frontend pathname that initiated the audited request.';
