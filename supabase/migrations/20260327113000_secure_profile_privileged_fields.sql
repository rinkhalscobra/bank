/*
  # Secure privileged profile fields

  Prevents non-admin users from elevating their own permissions or changing
  protected profile state through broad profile update policies.

  1. Privileged fields
    - `is_admin`
    - `kyc_status`
    - immutable identifiers and timestamps

  2. Behavior
    - Non-admin inserts are forced to `is_admin = false` and `kyc_status = 'pending'`
    - Non-admin updates keep the previous `is_admin` and `kyc_status`
    - Admin users can still manage these fields through the CRM panel
*/

CREATE OR REPLACE FUNCTION public.secure_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

DROP TRIGGER IF EXISTS trg_secure_profile_privileged_fields ON public.profiles;

CREATE TRIGGER trg_secure_profile_privileged_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.secure_profile_privileged_fields();
