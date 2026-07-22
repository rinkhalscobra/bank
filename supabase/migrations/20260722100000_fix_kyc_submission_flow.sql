/*
  Complete KYC submission and status transition as one protected operation.

  Customers may submit or resubmit their own verification, but they still cannot
  approve, reject, or otherwise change KYC status. Existing completed submissions
  that were left pending by the old profile trigger are repaired at the end.
*/

CREATE OR REPLACE FUNCTION public.secure_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text := public.current_crm_role();
  v_assigned_agent_manager_id uuid;
  v_kyc_submission_user_id text := current_setting('app.kyc_submission_user_id', true);
BEGIN
  NEW.crm_role := CASE
    WHEN lower(btrim(COALESCE(NEW.crm_role, ''))) IN ('customer', 'agent', 'superior_manager', 'admin') THEN lower(btrim(NEW.crm_role))
    WHEN COALESCE(NEW.is_admin, false) THEN 'admin'
    ELSE 'customer'
  END;

  IF auth.role() IS NULL OR auth.role() = 'service_role' THEN
    NULL;
  ELSIF TG_OP = 'INSERT' THEN
    IF v_actor_role <> 'admin' THEN
      NEW.crm_role := 'customer';
      NEW.is_admin := false;
      NEW.kyc_status := 'pending';
      NEW.account_iban := '';
      NEW.assigned_manager_id := null;
      NEW.assigned_agent_id := null;
    END IF;
  ELSIF v_actor_role = 'admin' THEN
    NULL;
  ELSIF v_actor_role = 'superior_manager' THEN
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
    NEW.crm_role := OLD.crm_role;
    NEW.is_admin := OLD.is_admin;
    NEW.assigned_manager_id := OLD.assigned_manager_id;

    IF OLD.crm_role <> 'customer' THEN
      NEW.assigned_agent_id := OLD.assigned_agent_id;
    ELSIF NEW.assigned_agent_id IS DISTINCT FROM OLD.assigned_agent_id AND NEW.assigned_agent_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1
        FROM public.profiles AS agent_profile
        WHERE agent_profile.id = NEW.assigned_agent_id
          AND public.get_crm_role(agent_profile.id) = 'agent'
          AND agent_profile.assigned_manager_id = auth.uid()
      ) THEN
        RAISE EXCEPTION 'Superior managers can assign only their own agents';
      END IF;
    END IF;
  ELSIF v_actor_role = 'agent' THEN
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
    NEW.crm_role := OLD.crm_role;
    NEW.is_admin := OLD.is_admin;
    NEW.assigned_manager_id := OLD.assigned_manager_id;
    NEW.assigned_agent_id := OLD.assigned_agent_id;
  ELSE
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
    NEW.crm_role := OLD.crm_role;
    NEW.is_admin := OLD.is_admin;
    NEW.account_iban := OLD.account_iban;
    NEW.assigned_manager_id := OLD.assigned_manager_id;
    NEW.assigned_agent_id := OLD.assigned_agent_id;

    IF OLD.id = auth.uid()
      AND OLD.kyc_status IN ('pending', 'rejected')
      AND NEW.kyc_status = 'submitted'
      AND v_kyc_submission_user_id = OLD.id::text
      AND EXISTS (
        SELECT 1
        FROM public.kyc_submissions
        WHERE user_id = OLD.id
      ) THEN
      NEW.kyc_status := 'submitted';
    ELSE
      NEW.kyc_status := OLD.kyc_status;
    END IF;
  END IF;

  IF NEW.id = NEW.assigned_manager_id OR NEW.id = NEW.assigned_agent_id THEN
    RAISE EXCEPTION 'Profiles cannot be assigned to themselves';
  END IF;

  IF NEW.crm_role IN ('admin', 'superior_manager') THEN
    NEW.assigned_manager_id := null;
    NEW.assigned_agent_id := null;
  ELSIF NEW.crm_role = 'agent' THEN
    NEW.assigned_agent_id := null;

    IF NEW.assigned_manager_id IS NOT NULL
      AND public.get_crm_role(NEW.assigned_manager_id) <> 'superior_manager' THEN
      RAISE EXCEPTION 'Agents can be assigned only to superior managers';
    END IF;
  ELSE
    IF NEW.assigned_manager_id IS NOT NULL
      AND public.get_crm_role(NEW.assigned_manager_id) <> 'superior_manager' THEN
      RAISE EXCEPTION 'Customers can be assigned only to superior managers';
    END IF;

    IF NEW.assigned_agent_id IS NOT NULL THEN
      SELECT assigned_manager_id
      INTO v_assigned_agent_manager_id
      FROM public.profiles
      WHERE id = NEW.assigned_agent_id
        AND public.get_crm_role(id) = 'agent';

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Assigned agent must have the agent role';
      END IF;

      IF NEW.assigned_manager_id IS NULL THEN
        NEW.assigned_manager_id := v_assigned_agent_manager_id;
      ELSIF v_assigned_agent_manager_id IS NOT NULL
        AND NEW.assigned_manager_id <> v_assigned_agent_manager_id THEN
        RAISE EXCEPTION 'Assigned agent belongs to a different superior manager';
      END IF;
    END IF;
  END IF;

  NEW.is_admin := (NEW.crm_role = 'admin');
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_kyc_verification(
  p_date_of_birth date,
  p_nationality text,
  p_id_type text,
  p_id_number text,
  p_id_front_url text,
  p_id_back_url text,
  p_selfie_url text,
  p_address_line1 text,
  p_address_line2 text,
  p_city text,
  p_state text,
  p_postal_code text,
  p_country text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_current_status text;
  v_submission_id uuid;
  v_storage_prefix text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;

  SELECT kyc_status
  INTO v_current_status
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_current_status = 'approved' THEN
    RAISE EXCEPTION 'Identity verification is already approved';
  END IF;

  IF v_current_status = 'submitted' THEN
    SELECT id
    INTO v_submission_id
    FROM public.kyc_submissions
    WHERE user_id = v_user_id
    ORDER BY submitted_at DESC
    LIMIT 1;

    IF v_submission_id IS NOT NULL THEN
      RETURN v_submission_id;
    END IF;
  END IF;

  IF v_current_status NOT IN ('pending', 'rejected') THEN
    RAISE EXCEPTION 'Identity verification cannot be submitted from status %', v_current_status;
  END IF;

  IF p_date_of_birth IS NULL
    OR p_date_of_birth > (current_date - interval '18 years')::date
    OR p_date_of_birth < (current_date - interval '120 years')::date THEN
    RAISE EXCEPTION 'A valid adult date of birth is required';
  END IF;

  IF btrim(COALESCE(p_nationality, '')) = ''
    OR btrim(COALESCE(p_id_number, '')) = ''
    OR btrim(COALESCE(p_address_line1, '')) = ''
    OR btrim(COALESCE(p_city, '')) = ''
    OR btrim(COALESCE(p_postal_code, '')) = ''
    OR btrim(COALESCE(p_country, '')) = '' THEN
    RAISE EXCEPTION 'All required identity and address fields must be provided';
  END IF;

  IF p_id_type NOT IN ('passport', 'drivers_license', 'national_id') THEN
    RAISE EXCEPTION 'Unsupported identity document type';
  END IF;

  v_storage_prefix := v_user_id::text || '/';

  IF COALESCE(p_id_front_url, '') NOT LIKE (v_storage_prefix || '%')
    OR COALESCE(p_selfie_url, '') NOT LIKE (v_storage_prefix || '%')
    OR (p_id_type <> 'passport' AND COALESCE(p_id_back_url, '') NOT LIKE (v_storage_prefix || '%'))
    OR (COALESCE(p_id_back_url, '') <> '' AND p_id_back_url NOT LIKE (v_storage_prefix || '%')) THEN
    RAISE EXCEPTION 'KYC document paths must belong to the authenticated user';
  END IF;

  INSERT INTO public.kyc_submissions (
    user_id,
    date_of_birth,
    nationality,
    id_type,
    id_number,
    id_front_url,
    id_back_url,
    selfie_url,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country
  )
  VALUES (
    v_user_id,
    p_date_of_birth,
    btrim(p_nationality),
    p_id_type,
    btrim(p_id_number),
    p_id_front_url,
    COALESCE(p_id_back_url, ''),
    p_selfie_url,
    btrim(p_address_line1),
    btrim(COALESCE(p_address_line2, '')),
    btrim(p_city),
    btrim(COALESCE(p_state, '')),
    btrim(p_postal_code),
    btrim(p_country)
  )
  RETURNING id INTO v_submission_id;

  PERFORM set_config('app.kyc_submission_user_id', v_user_id::text, true);

  UPDATE public.profiles
  SET kyc_status = 'submitted'
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Could not update identity verification status';
  END IF;

  RETURN v_submission_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_kyc_verification(
  date, text, text, text, text, text, text, text, text, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_kyc_verification(
  date, text, text, text, text, text, text, text, text, text, text, text, text
) TO authenticated;

COMMENT ON FUNCTION public.submit_kyc_verification(
  date, text, text, text, text, text, text, text, text, text, text, text, text
) IS 'Atomically creates the authenticated customer KYC submission and moves the profile to submitted.';

UPDATE public.profiles AS profile
SET
  kyc_status = 'submitted',
  updated_at = now()
WHERE profile.kyc_status = 'pending'
  AND EXISTS (
    SELECT 1
    FROM public.kyc_submissions AS submission
    WHERE submission.user_id = profile.id
  );

NOTIFY pgrst, 'reload schema';
