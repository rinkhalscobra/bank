/*
  Treat a repeated KYC submission request as success when the profile has already
  reached submitted or approved. This handles stale browser tabs and safe retries.
*/

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

  IF v_current_status IN ('submitted', 'approved') THEN
    SELECT id
    INTO v_submission_id
    FROM public.kyc_submissions
    WHERE user_id = v_user_id
    ORDER BY submitted_at DESC
    LIMIT 1;

    RETURN v_submission_id;
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

NOTIFY pgrst, 'reload schema';
