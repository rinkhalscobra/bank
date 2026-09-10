import { supabase } from './supabase';

export async function recordCrmAuditEvent(
  eventType: 'user_created' | 'user_deleted',
  subjectUserId: string,
  summary: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await supabase.rpc('record_crm_audit_event', {
    p_event_type: eventType,
    p_subject_user_id: subjectUserId,
    p_summary: summary,
    p_metadata: metadata,
  });

  if (error) {
    console.warn('Could not record CRM audit event:', error.message);
  }
}
