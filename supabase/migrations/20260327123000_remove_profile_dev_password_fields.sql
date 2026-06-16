/*
  # Remove temporary profile password metadata fields

  Drops:
    - `last_password_set_at`
    - `dev_password_note`
*/

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS last_password_set_at,
  DROP COLUMN IF EXISTS dev_password_note;
