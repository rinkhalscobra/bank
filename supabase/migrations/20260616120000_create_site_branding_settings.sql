/*
  # Create site branding settings

  1. New table
    - `site_branding` stores the public brand word, full brand name, and logo URLs.

  2. Storage
    - Creates a public `site-branding` bucket for CRM-admin uploaded logo images.

  3. Security
    - Anyone can read the active branding settings and public logo files.
    - Only authenticated CRM admins can insert, update, or delete branding settings and logo files.
*/

CREATE TABLE IF NOT EXISTS public.site_branding (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  brand_name text NOT NULL DEFAULT 'SKOK Bank',
  brand_keyword text NOT NULL DEFAULT 'SKOK',
  navbar_logo_url text NOT NULL DEFAULT '/skok7.svg',
  footer_logo_url text NOT NULL DEFAULT '/skok7.svg',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site branding" ON public.site_branding;
DROP POLICY IF EXISTS "Admins can insert site branding" ON public.site_branding;
DROP POLICY IF EXISTS "Admins can update site branding" ON public.site_branding;
DROP POLICY IF EXISTS "Admins can delete site branding" ON public.site_branding;

CREATE POLICY "Anyone can view site branding"
  ON public.site_branding
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site branding"
  ON public.site_branding
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update site branding"
  ON public.site_branding
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can delete site branding"
  ON public.site_branding
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user());

INSERT INTO public.site_branding (id, brand_name, brand_keyword, navbar_logo_url, footer_logo_url)
VALUES ('default', 'SKOK Bank', 'SKOK', '/skok7.svg', '/skok7.svg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-branding', 'site-branding', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

DROP POLICY IF EXISTS "Anyone can view site branding files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload site branding files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site branding files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site branding files" ON storage.objects;

CREATE POLICY "Anyone can view site branding files"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-branding');

CREATE POLICY "Admins can upload site branding files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-branding' AND public.is_admin_user());

CREATE POLICY "Admins can update site branding files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-branding' AND public.is_admin_user())
  WITH CHECK (bucket_id = 'site-branding' AND public.is_admin_user());

CREATE POLICY "Admins can delete site branding files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-branding' AND public.is_admin_user());
