export const CRM_ROLE_VALUES = ['customer', 'agent', 'superior_manager', 'admin'] as const;

export type CrmRole = typeof CRM_ROLE_VALUES[number];

export function normalizeCrmRole(value: unknown, fallback: CrmRole = 'customer'): CrmRole {
  if (typeof value !== 'string') return fallback;

  const normalized = value.trim().toLowerCase();
  if (CRM_ROLE_VALUES.includes(normalized as CrmRole)) {
    return normalized as CrmRole;
  }

  return fallback;
}

export function isStaffCrmRole(role: CrmRole | null | undefined) {
  return role === 'admin' || role === 'superior_manager' || role === 'agent';
}

export function getCrmRoleLabel(role: CrmRole) {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'superior_manager':
      return 'Superior Manager';
    case 'agent':
      return 'Agent';
    default:
      return 'Customer';
  }
}
