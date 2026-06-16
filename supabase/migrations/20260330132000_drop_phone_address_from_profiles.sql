/*
  # Drop phone and address from profiles

  Removes legacy contact fields from the profiles table so profile data
  is reduced to the remaining supported CRM fields.
*/

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS address;
