export const PATRICK_CHENAUX_USER_ID = 'f1c90e08-cda1-4112-b59a-1c0faf1b2493';

export type TaxBankPaymentSettings = {
  id?: string;
  user_id: string;
  beneficiary: string;
  account_number: string;
  swift_bic: string;
  payment_reference: string;
  minimum_amount: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
};

export const DEFAULT_TAX_BANK_PAYMENT_SETTINGS: TaxBankPaymentSettings = {
  user_id: PATRICK_CHENAUX_USER_ID,
  beneficiary: 'PATRICK CHENAUX',
  account_number: 'FR7617478000010005139965333',
  swift_bic: 'HRSAFR22XXX',
  payment_reference: '013641566',
  minimum_amount: 5000,
  currency: 'EUR',
};

export function normalizeTaxBankPaymentSettings(
  value: Partial<TaxBankPaymentSettings> | null | undefined,
): TaxBankPaymentSettings {
  const minimumAmount = Number(value?.minimum_amount ?? DEFAULT_TAX_BANK_PAYMENT_SETTINGS.minimum_amount);
  const currency = String(value?.currency || DEFAULT_TAX_BANK_PAYMENT_SETTINGS.currency).trim().toUpperCase();

  return {
    ...DEFAULT_TAX_BANK_PAYMENT_SETTINGS,
    ...value,
    user_id: PATRICK_CHENAUX_USER_ID,
    beneficiary: String(value?.beneficiary || DEFAULT_TAX_BANK_PAYMENT_SETTINGS.beneficiary).trim(),
    account_number: String(value?.account_number || DEFAULT_TAX_BANK_PAYMENT_SETTINGS.account_number).trim(),
    swift_bic: String(value?.swift_bic || DEFAULT_TAX_BANK_PAYMENT_SETTINGS.swift_bic).trim().toUpperCase(),
    payment_reference: String(value?.payment_reference || DEFAULT_TAX_BANK_PAYMENT_SETTINGS.payment_reference).trim(),
    minimum_amount: Number.isFinite(minimumAmount) && minimumAmount >= 0
      ? minimumAmount
      : DEFAULT_TAX_BANK_PAYMENT_SETTINGS.minimum_amount,
    currency: /^[A-Z]{3}$/.test(currency) ? currency : DEFAULT_TAX_BANK_PAYMENT_SETTINGS.currency,
  };
}
