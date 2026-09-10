/* Allow full CRM administrators to delete audit records individually or in bulk. */

GRANT DELETE ON TABLE public.audit_logs TO authenticated;

DROP POLICY IF EXISTS "Admins can delete audit logs" ON public.audit_logs;
CREATE POLICY "Admins can delete audit logs"
  ON public.audit_logs
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user());
