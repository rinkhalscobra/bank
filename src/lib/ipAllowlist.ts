import { supabase } from './supabase';

export type IpAllowlistConfig = {
  enabled: boolean;
  allowed: boolean;
  currentIp: string | null;
  allowedCidrs: string[];
  updatedAt: string | null;
};

type IpAllowlistRpcRow = {
  enabled?: boolean;
  allowed?: boolean;
  current_ip?: string | null;
  allowed_cidrs?: string[] | null;
  updated_at?: string | null;
};

function firstRow(data: unknown): IpAllowlistRpcRow {
  if (Array.isArray(data)) return (data[0] ?? {}) as IpAllowlistRpcRow;
  return (data ?? {}) as IpAllowlistRpcRow;
}

function normalizeConfig(data: unknown): IpAllowlistConfig {
  const row = firstRow(data);

  return {
    enabled: Boolean(row.enabled),
    allowed: row.allowed !== false,
    currentIp: typeof row.current_ip === 'string' && row.current_ip ? row.current_ip : null,
    allowedCidrs: Array.isArray(row.allowed_cidrs) ? row.allowed_cidrs : [],
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
  };
}

export async function checkCrmIpAccess(): Promise<IpAllowlistConfig> {
  const { data, error } = await supabase.rpc('check_crm_ip_access');
  if (error) throw new Error(error.message);
  return normalizeConfig(data);
}

export async function getIpAllowlistConfig(): Promise<IpAllowlistConfig> {
  const { data, error } = await supabase.rpc('get_crm_ip_allowlist_config');
  if (error) throw new Error(error.message);
  return normalizeConfig(data);
}

export async function saveIpAllowlistConfig(enabled: boolean, allowedCidrs: string[]): Promise<IpAllowlistConfig> {
  const { data, error } = await supabase.rpc('update_crm_ip_allowlist', {
    p_enabled: enabled,
    p_allowed_cidrs: allowedCidrs,
  });

  if (error) throw new Error(error.message);
  return normalizeConfig(data);
}
