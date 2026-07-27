export const DEFAULT_TAX_CURRENCY = 'USD';

export function normalizeTaxCurrency(value: unknown) {
  const currency = String(value || DEFAULT_TAX_CURRENCY).trim().toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : DEFAULT_TAX_CURRENCY;
}

export function formatTaxCurrency(amount: number, currency: string, locale = 'en-US') {
  const normalizedCurrency = normalizeTaxCurrency(currency);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
