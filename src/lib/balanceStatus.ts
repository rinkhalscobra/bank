export type BalanceAvailabilityStatus = 'available' | 'pending' | 'frozen';

export function normalizeBalanceStatus(value: unknown): BalanceAvailabilityStatus {
  const normalized = String(value || 'available').trim().toLowerCase();

  if (normalized === 'pending' || normalized === 'frozen' || normalized === 'available') {
    return normalized;
  }

  return 'available';
}

export function isBalanceAvailable(value: unknown) {
  return normalizeBalanceStatus(value) === 'available';
}

export function getBalanceStatusLabel(value: unknown) {
  const status = normalizeBalanceStatus(value);

  if (status === 'pending') return 'Pending';
  if (status === 'frozen') return 'Frozen';
  return 'Available';
}

export function getBalanceStatusClasses(value: unknown) {
  const status = normalizeBalanceStatus(value);

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (status === 'frozen') {
    return 'border-slate-200 bg-slate-100 text-slate-600';
  }

  return 'border-[#006446]/15 bg-[#006446]/10 text-[#006446]';
}

export function getHiddenBalanceLabel(value: unknown) {
  const status = normalizeBalanceStatus(value);

  if (status === 'pending') return 'Under review';
  if (status === 'frozen') return 'Temporarily unavailable';
  return 'Available';
}

export function getHiddenBalanceDescription(value: unknown) {
  const status = normalizeBalanceStatus(value);

  if (status === 'pending') {
    return 'This balance will appear automatically once the review is complete.';
  }

  if (status === 'frozen') {
    return 'This balance is hidden until access is restored for this account.';
  }

  return 'This balance is available for transfers and exchanges.';
}

export function getBalanceActionError(assetCode: string, value: unknown) {
  const label = getBalanceStatusLabel(value).toLowerCase();
  return `${assetCode} balance is ${label} and cannot be used right now.`;
}
