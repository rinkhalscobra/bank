import { supabase } from './supabase';

export const LEGACY_INTERAC_CUSTOMER_ID = 'ba326e30-bd5d-4472-a5dc-18cf152bc1ae';

function isMissingAccessTableError(error: { code?: string; message?: string } | null) {
  return error?.code === 'PGRST205'
    || Boolean(error?.message?.includes("Could not find the table 'public.interac_access_settings'"));
}

export async function fetchInteracAccess(userId: string | null | undefined) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('interac_access_settings')
    .select('enabled')
    .eq('user_id', userId)
    .maybeSingle();

  // Preserve the original customer's access while the new migration is being
  // deployed. Once the table exists, its value is the only source of truth.
  if (isMissingAccessTableError(error)) {
    return userId === LEGACY_INTERAC_CUSTOMER_ID;
  }

  return !error && data?.enabled !== false;
}
