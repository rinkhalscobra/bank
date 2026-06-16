/*
  # Add KYC verification system

  1. Modified Tables
    - `profiles`
      - Added `kyc_status` (text, default 'pending') - tracks verification state: pending, submitted, approved, rejected

  2. New Tables
    - `kyc_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date_of_birth` (date)
      - `nationality` (text)
      - `id_type` (text) - passport, drivers_license, national_id
      - `id_number` (text)
      - `id_front_url` (text) - storage path for front of ID
      - `id_back_url` (text) - storage path for back of ID
      - `selfie_url` (text) - storage path for selfie
      - `address_line1` (text)
      - `address_line2` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text)
      - `submitted_at` (timestamptz)
      - `reviewed_at` (timestamptz)
      - `review_notes` (text)

  3. Storage
    - Created `kyc-documents` bucket for ID images and selfies

  4. Security
    - RLS enabled on `kyc_submissions`
    - Users can insert and view their own KYC submissions
    - Users can upload/view their own files in kyc-documents bucket
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'kyc_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN kyc_status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date_of_birth date NOT NULL,
  nationality text NOT NULL DEFAULT '',
  id_type text NOT NULL DEFAULT 'passport',
  id_number text NOT NULL DEFAULT '',
  id_front_url text NOT NULL DEFAULT '',
  id_back_url text NOT NULL DEFAULT '',
  selfie_url text NOT NULL DEFAULT '',
  address_line1 text NOT NULL DEFAULT '',
  address_line2 text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  review_notes text NOT NULL DEFAULT ''
);

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kyc submissions"
  ON public.kyc_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kyc submission"
  ON public.kyc_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own kyc documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own kyc documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);