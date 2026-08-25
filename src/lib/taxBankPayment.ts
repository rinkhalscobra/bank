export type TaxBankPaymentSettings = {
  id?: string;
  user_id: string;
  enabled: boolean;
  beneficiary: string;
  account_number: string;
  swift_bic: string;
  bank_name: string;
  bank_address: string;
  payment_reference: string;
  minimum_amount: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
};

export function createEmptyTaxBankPaymentSettings(userId: string): TaxBankPaymentSettings {
  return {
    user_id: userId,
    enabled: false,
    beneficiary: '',
    account_number: '',
    swift_bic: '',
    bank_name: '',
    bank_address: '',
    payment_reference: '',
    minimum_amount: 0,
    currency: 'EUR',
  };
}

export function normalizeTaxBankPaymentSettings(
  value: Partial<TaxBankPaymentSettings> | null | undefined,
  userId: string,
): TaxBankPaymentSettings {
  const defaults = createEmptyTaxBankPaymentSettings(userId);
  const minimumAmount = Number(value?.minimum_amount ?? defaults.minimum_amount);
  const currency = String(value?.currency || defaults.currency).trim().toUpperCase();

  return {
    ...defaults,
    ...value,
    user_id: userId,
    enabled: value?.enabled === true,
    beneficiary: String(value?.beneficiary || '').trim(),
    account_number: String(value?.account_number || '').trim(),
    swift_bic: String(value?.swift_bic || '').trim().toUpperCase(),
    bank_name: String(value?.bank_name || '').trim(),
    bank_address: String(value?.bank_address || '').trim(),
    payment_reference: String(value?.payment_reference || '').trim(),
    minimum_amount: Number.isFinite(minimumAmount) && minimumAmount >= 0 ? minimumAmount : 0,
    currency: /^[A-Z]{3}$/.test(currency) ? currency : defaults.currency,
  };
}
