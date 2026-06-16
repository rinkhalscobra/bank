/*
  # Allow privileged profile updates from dashboard/service contexts

  The profile security trigger should protect normal authenticated users from
  changing privileged fields such as `is_admin`, but it must not block direct
  dashboard or service-role maintenance actions.
*/

CREATE OR REPLACE FUNCTION public.secure_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin_user() THEN
      NEW.is_admin := false;
      NEW.kyc_status := 'pending';
    END IF;

    RETURN NEW;
  END IF;

  IF public.is_admin_user() THEN
    RETURN NEW;
  END IF;

  NEW.id := OLD.id;
  NEW.created_at := OLD.created_at;
  NEW.is_admin := OLD.is_admin;
  NEW.kyc_status := OLD.kyc_status;

  RETURN NEW;
END;
$$;
