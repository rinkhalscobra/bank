/*
  # Harden audit log access

  Uses administrator-only SECURITY DEFINER functions for paginated reads and
  bulk deletion. This avoids inconsistent direct-table grants while retaining
  the full administrator and IP-allowlist checks.
*/

CREATE OR REPLACE FUNCTION public.get_audit_logs(
  p_category text DEFAULT 'all',
  p_source text DEFAULT 'all',
  p_search text DEFAULT '',
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category text := lower(btrim(COALESCE(p_category, 'all')));
  v_source text := lower(btrim(COALESCE(p_source, 'all')));
  v_search text := btrim(COALESCE(p_search, ''));
  v_offset integer := GREATEST(COALESCE(p_offset, 0), 0);
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 30), 1), 100);
  v_total bigint;
  v_entries jsonb;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Your administrator session or network access could not be verified.' USING ERRCODE = '42501';
  END IF;

  IF v_category NOT IN (
    'all', 'auth', 'users', 'balances', 'transactions', 'transfers',
    'payments', 'loans', 'settings', 'other'
  ) THEN
    RAISE EXCEPTION 'Unsupported audit category.' USING ERRCODE = '22023';
  END IF;

  IF v_source NOT IN (
    'all', 'crm_admin', 'customer_dashboard', 'authentication',
    'public_site', 'system', 'unknown'
  ) THEN
    RAISE EXCEPTION 'Unsupported audit source.' USING ERRCODE = '22023';
  END IF;

  SELECT count(*)
  INTO v_total
  FROM public.audit_logs AS logs
  WHERE (v_category = 'all' OR logs.category = v_category)
    AND (v_source = 'all' OR logs.source_surface = v_source)
    AND (
      v_search = ''
      OR concat_ws(
        ' ',
        logs.actor_name,
        logs.actor_email,
        logs.actor_ip,
        logs.subject_name,
        logs.subject_email,
        logs.summary,
        logs.table_name,
        logs.record_id,
        logs.source_surface,
        logs.source_path
      ) ILIKE '%' || v_search || '%'
    );

  SELECT COALESCE(jsonb_agg(to_jsonb(page_rows) ORDER BY page_rows.occurred_at DESC), '[]'::jsonb)
  INTO v_entries
  FROM (
    SELECT logs.*
    FROM public.audit_logs AS logs
    WHERE (v_category = 'all' OR logs.category = v_category)
      AND (v_source = 'all' OR logs.source_surface = v_source)
      AND (
        v_search = ''
        OR concat_ws(
          ' ',
          logs.actor_name,
          logs.actor_email,
          logs.actor_ip,
          logs.subject_name,
          logs.subject_email,
          logs.summary,
          logs.table_name,
          logs.record_id,
          logs.source_surface,
          logs.source_path
        ) ILIKE '%' || v_search || '%'
      )
    ORDER BY logs.occurred_at DESC
    OFFSET v_offset
    LIMIT v_limit
  ) AS page_rows;

  RETURN jsonb_build_object('entries', v_entries, 'total', v_total);
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_audit_logs(p_ids bigint[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer := 0;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Your administrator session or network access could not be verified.' USING ERRCODE = '42501';
  END IF;

  IF COALESCE(cardinality(p_ids), 0) = 0 THEN
    RETURN 0;
  END IF;

  DELETE FROM public.audit_logs AS logs
  WHERE logs.id = ANY(p_ids);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.get_audit_logs(text, text, text, integer, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_audit_logs(bigint[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_audit_logs(text, text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_audit_logs(bigint[]) TO authenticated;

-- Reassert table privileges as a compatibility fallback for already-deployed clients.
GRANT SELECT, DELETE ON TABLE public.audit_logs TO authenticated;
