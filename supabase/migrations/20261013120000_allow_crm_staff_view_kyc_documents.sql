/*
  Allow CRM staff to preview KYC files for customers inside their managed scope.

  The bucket remains private. Authenticated staff can read and download an object
  only when they pass both the CRM role/IP check and the existing hierarchy scope
  check for the user folder that owns the object.
*/

DROP POLICY IF EXISTS "Staff can view managed kyc documents" ON storage.objects;

CREATE POLICY "Staff can view managed kyc documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND public.is_crm_staff()
    AND EXISTS (
      SELECT 1
      FROM public.profiles AS profile
      WHERE profile.id::text = split_part(storage.objects.name, '/', 1)
        AND public.can_manage_user_scope(profile.id)
    )
  );
