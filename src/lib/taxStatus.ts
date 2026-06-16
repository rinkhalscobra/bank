export type TaxStatus = 'pending' | 'on_hold' | 'paid';

export const TAX_STATUS_OPTIONS: { value: TaxStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'paid', label: 'Paid' },
];

function toNumber(value: unknown) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function readTaxValue(tax: unknown, key: string) {
  if (!tax || typeof tax !== 'object') return undefined;
  return (tax as Record<string, unknown>)[key];
}

export function normalizeTaxStatus(value: unknown): TaxStatus {
  const normalizedValue = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (normalizedValue === 'paid' || normalizedValue === 'completed') return 'paid';
  if (normalizedValue === 'on_hold' || normalizedValue === 'hold' || normalizedValue === 'held') return 'on_hold';
  return 'pending';
}

export function getTaxAmountSummary(tax: unknown) {
  const status = normalizeTaxStatus(readTaxValue(tax, 'status'));
  const owed = Math.max(toNumber(readTaxValue(tax, 'amount_owed')), 0);
  const paid = Math.max(toNumber(readTaxValue(tax, 'amount_paid')), 0);
  const outstanding = status === 'paid' ? 0 : Math.max(owed - paid, 0);
  const paidTotal = status === 'paid' ? (paid > 0 ? paid : owed) : paid;

  return {
    status,
    owed,
    paid,
    outstanding,
    paidTotal,
  };
}

export function summarizeTaxAmounts(taxes: unknown[]) {
  const totals: Record<TaxStatus, number> = {
    pending: 0,
    on_hold: 0,
    paid: 0,
  };
  const counts: Record<TaxStatus, number> = {
    pending: 0,
    on_hold: 0,
    paid: 0,
  };

  taxes.forEach((tax) => {
    const summary = getTaxAmountSummary(tax);
    totals[summary.status] += summary.status === 'paid' ? summary.paidTotal : summary.outstanding;
    counts[summary.status] += 1;
  });

  return { totals, counts };
}
