/*
  # Expand CRM-managed site branding

  Adds every setting already exposed by the CRM branding editor. Defaults keep
  existing installations and cached branding records backward compatible.
*/

ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS favicon_ico_url text NOT NULL DEFAULT '/favicon.ico',
  ADD COLUMN IF NOT EXISTS favicon_16_url text NOT NULL DEFAULT '/favicon-16x16.png',
  ADD COLUMN IF NOT EXISTS favicon_32_url text NOT NULL DEFAULT '/favicon-32x32.png',
  ADD COLUMN IF NOT EXISTS apple_touch_icon_url text NOT NULL DEFAULT '/apple-touch-icon.png',
  ADD COLUMN IF NOT EXISTS favicon_192_url text NOT NULL DEFAULT '/android-chrome-192x192.png',
  ADD COLUMN IF NOT EXISTS favicon_512_url text NOT NULL DEFAULT '/android-chrome-512x512.png',
  ADD COLUMN IF NOT EXISTS mfi_id text NOT NULL DEFAULT 'PL10026',
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'PL',
  ADD COLUMN IF NOT EXISTS mfi_code text NOT NULL DEFAULT '10026',
  ADD COLUMN IF NOT EXISTS institutional_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS institutional_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mfi_id_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS depositor_protection_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS depositor_protection_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS depositor_protection_url text NOT NULL DEFAULT 'https://www.gov.pl/web/finance/protection-of-depositors',
  ADD COLUMN IF NOT EXISTS legal_contact_email text NOT NULL DEFAULT 'legal@skokwybrzeze.com';

COMMENT ON COLUMN public.site_branding.legal_contact_email IS
  'Public legal contact used by privacy, terms, and disclosure pages.';
