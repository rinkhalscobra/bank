/*
  # Add configurable CRM IP allowlist

  - Stores a single global list of allowed IPv4/IPv6 addresses and CIDR ranges.
  - Exposes a fail-closed access check to authenticated CRM users.
  - Lets only full CRM administrators view or update the configuration.
  - Prevents an administrator from enabling a policy that excludes their current IP.
*/

CREATE TABLE IF NOT EXISTS public.crm_ip_allowlist_settings (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  enabled boolean NOT NULL DEFAULT false,
  allowed_cidrs cidr[] NOT NULL DEFAULT ARRAY[]::cidr[],
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO public.crm_ip_allowlist_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.crm_ip_allowlist_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.crm_ip_allowlist_settings FROM anon, authenticated;
GRANT SELECT ON TABLE public.crm_ip_allowlist_settings TO authenticated;

DROP POLICY IF EXISTS "Admins can view the CRM IP allowlist" ON public.crm_ip_allowlist_settings;
CREATE POLICY "Admins can view the CRM IP allowlist"
  ON public.crm_ip_allowlist_settings
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

CREATE OR REPLACE FUNCTION public.request_client_ip()
RETURNS inet
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_headers jsonb := '{}'::jsonb;
  v_ip_text text;
BEGIN
  BEGIN
    v_headers := COALESCE(NULLIF(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN
    v_headers := '{}'::jsonb;
  END;

  v_ip_text := btrim(COALESCE(
    NULLIF(v_headers ->> 'cf-connecting-ip', ''),
    NULLIF(split_part(v_headers ->> 'x-forwarded-for', ',', 1), ''),
    NULLIF(v_headers ->> 'x-real-ip', '')
  ));

  IF v_ip_text IS NULL OR v_ip_text = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    RETURN v_ip_text::inet;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN NULL;
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.request_client_ip() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_crm_ip_allowed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT
        NOT settings.enabled
        OR (
          public.request_client_ip() IS NOT NULL
          AND public.request_client_ip() <<= ANY(settings.allowed_cidrs)
        )
      FROM public.crm_ip_allowlist_settings AS settings
      WHERE settings.id = 'default'
    ),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_crm_ip_allowed() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_crm_ip_allowed() TO authenticated;

-- Existing CRM policies use these helpers. Including the network decision here
-- makes the allowlist apply to the underlying Data API as well as the UI route.
CREATE OR REPLACE FUNCTION public.current_crm_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.get_crm_role(auth.uid()) = 'customer' THEN 'customer'
    WHEN public.is_crm_ip_allowed() THEN public.get_crm_role(auth.uid())
    ELSE 'customer'
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_crm_role() = 'admin' AND public.is_crm_ip_allowed();
$$;

CREATE OR REPLACE FUNCTION public.is_crm_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.current_crm_role() IN ('admin', 'superior_manager', 'agent')
    AND public.is_crm_ip_allowed();
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_crm_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_crm_staff() TO authenticated;

CREATE OR REPLACE FUNCTION public.check_crm_ip_access()
RETURNS TABLE (
  enabled boolean,
  allowed boolean,
  current_ip text,
  allowed_cidrs text[],
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.crm_ip_allowlist_settings%ROWTYPE;
  v_client_ip inet := public.request_client_ip();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING ERRCODE = '42501';
  END IF;

  IF public.get_crm_role(auth.uid()) NOT IN ('admin', 'superior_manager', 'agent') THEN
    RAISE EXCEPTION 'CRM staff access is required.' USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO v_settings
  FROM public.crm_ip_allowlist_settings AS settings
  WHERE settings.id = 'default';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The CRM IP allowlist is not configured.';
  END IF;

  RETURN QUERY
  SELECT
    v_settings.enabled,
    NOT v_settings.enabled OR (
      v_client_ip IS NOT NULL
      AND v_client_ip <<= ANY(v_settings.allowed_cidrs)
    ),
    CASE WHEN v_client_ip IS NULL THEN NULL ELSE host(v_client_ip) END,
    CASE
      WHEN public.is_admin_user()
        THEN ARRAY(
          SELECT entry::text
          FROM unnest(v_settings.allowed_cidrs) AS entries(entry)
        )
      ELSE ARRAY[]::text[]
    END,
    v_settings.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.check_crm_ip_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_crm_ip_access() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_crm_ip_allowlist_config()
RETURNS TABLE (
  enabled boolean,
  allowed boolean,
  current_ip text,
  allowed_cidrs text[],
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Only CRM administrators can view the IP allowlist.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY SELECT * FROM public.check_crm_ip_access();
END;
$$;

REVOKE ALL ON FUNCTION public.get_crm_ip_allowlist_config() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_crm_ip_allowlist_config() TO authenticated;

CREATE OR REPLACE FUNCTION public.update_crm_ip_allowlist(
  p_enabled boolean,
  p_allowed_cidrs text[]
)
RETURNS TABLE (
  enabled boolean,
  allowed boolean,
  current_ip text,
  allowed_cidrs text[],
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry text;
  v_network cidr;
  v_networks cidr[] := ARRAY[]::cidr[];
  v_client_ip inet := public.request_client_ip();
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Only CRM administrators can update the IP allowlist.' USING ERRCODE = '42501';
  END IF;

  FOREACH v_entry IN ARRAY COALESCE(p_allowed_cidrs, ARRAY[]::text[])
  LOOP
    v_entry := btrim(v_entry);
    IF v_entry = '' THEN
      CONTINUE;
    END IF;

    BEGIN
      v_network := network(v_entry::inet);
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Invalid IP address or CIDR range: %', v_entry USING ERRCODE = '22023';
    END;

    IF NOT (v_network = ANY(v_networks)) THEN
      v_networks := array_append(v_networks, v_network);
    END IF;
  END LOOP;

  IF COALESCE(p_enabled, false) AND cardinality(v_networks) = 0 THEN
    RAISE EXCEPTION 'Add at least one IP address or CIDR range before enabling the allowlist.' USING ERRCODE = '22023';
  END IF;

  IF COALESCE(p_enabled, false) AND v_client_ip IS NULL THEN
    RAISE EXCEPTION 'Your current IP could not be detected, so the allowlist cannot be enabled safely.' USING ERRCODE = '22023';
  END IF;

  IF COALESCE(p_enabled, false) AND NOT (v_client_ip <<= ANY(v_networks)) THEN
    RAISE EXCEPTION 'Your current IP (%) must be included before the allowlist can be enabled.', host(v_client_ip) USING ERRCODE = '22023';
  END IF;

  UPDATE public.crm_ip_allowlist_settings AS settings
  SET
    enabled = COALESCE(p_enabled, false),
    allowed_cidrs = v_networks,
    updated_at = now(),
    updated_by = auth.uid()
  WHERE settings.id = 'default';

  RETURN QUERY SELECT * FROM public.check_crm_ip_access();
END;
$$;

REVOKE ALL ON FUNCTION public.update_crm_ip_allowlist(boolean, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_crm_ip_allowlist(boolean, text[]) TO authenticated;

-- The user-management Edge Function runs its database queries from a Supabase
-- egress address. This service-only helper checks the original browser IP and
-- the same CRM hierarchy rules before the function may use its service role.
CREATE OR REPLACE FUNCTION public.can_crm_user_manage_profile_from_ip(
  p_actor_id uuid,
  p_target_id uuid,
  p_client_ip text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text;
  v_client_ip inet;
  v_ip_allowed boolean;
  v_target_role text;
  v_target_manager_id uuid;
  v_target_agent_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'This function is restricted to the service role.' USING ERRCODE = '42501';
  END IF;

  IF p_actor_id IS NULL OR p_target_id IS NULL THEN
    RETURN false;
  END IF;

  BEGIN
    v_client_ip := NULLIF(btrim(p_client_ip), '')::inet;
  EXCEPTION WHEN invalid_text_representation THEN
    v_client_ip := NULL;
  END;

  SELECT
    NOT settings.enabled
    OR (
      v_client_ip IS NOT NULL
      AND v_client_ip <<= ANY(settings.allowed_cidrs)
    )
  INTO v_ip_allowed
  FROM public.crm_ip_allowlist_settings AS settings
  WHERE settings.id = 'default';

  IF NOT COALESCE(v_ip_allowed, false) THEN
    RETURN false;
  END IF;

  v_actor_role := public.get_crm_role(p_actor_id);

  IF v_actor_role = 'admin' THEN
    RETURN true;
  END IF;

  IF p_actor_id = p_target_id THEN
    RETURN v_actor_role IN ('superior_manager', 'agent');
  END IF;

  SELECT
    public.get_crm_role(profile.id),
    profile.assigned_manager_id,
    profile.assigned_agent_id
  INTO
    v_target_role,
    v_target_manager_id,
    v_target_agent_id
  FROM public.profiles AS profile
  WHERE profile.id = p_target_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_actor_role = 'superior_manager' THEN
    IF v_target_role = 'agent' AND v_target_manager_id = p_actor_id THEN
      RETURN true;
    END IF;

    IF v_target_role = 'customer' THEN
      IF v_target_manager_id = p_actor_id THEN
        RETURN true;
      END IF;

      IF v_target_agent_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.profiles AS agent_profile
        WHERE agent_profile.id = v_target_agent_id
          AND public.get_crm_role(agent_profile.id) = 'agent'
          AND agent_profile.assigned_manager_id = p_actor_id
      ) THEN
        RETURN true;
      END IF;
    END IF;
  END IF;

  IF v_actor_role = 'agent' THEN
    RETURN v_target_role = 'customer' AND v_target_agent_id = p_actor_id;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.can_crm_user_manage_profile_from_ip(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_crm_user_manage_profile_from_ip(uuid, uuid, text)
  TO service_role;
