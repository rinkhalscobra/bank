import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_TAX_BANK_PAYMENT_SETTINGS,
  PATRICK_CHENAUX_USER_ID,
  normalizeTaxBankPaymentSettings,
  type TaxBankPaymentSettings,
} from '../lib/taxBankPayment';

export function useTaxBankPaymentSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TaxBankPaymentSettings>(DEFAULT_TAX_BANK_PAYMENT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (user?.id !== PATRICK_CHENAUX_USER_ID) {
      setSettings(DEFAULT_TAX_BANK_PAYMENT_SETTINGS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('tax_bank_payment_settings')
      .select('*')
      .eq('user_id', PATRICK_CHENAUX_USER_ID)
      .maybeSingle();

    setSettings(normalizeTaxBankPaymentSettings(data as Partial<TaxBankPaymentSettings> | null));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (user?.id !== PATRICK_CHENAUX_USER_ID) return;

    const channel = supabase
      .channel(`tax-bank-payment-settings-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tax_bank_payment_settings',
          filter: `user_id=eq.${user.id}`,
        },
        () => void fetchSettings(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchSettings, user?.id]);

  return { settings, loading, refetch: fetchSettings };
}
