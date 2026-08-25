import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  isTaxBankPaymentUserId,
  normalizeTaxBankPaymentSettings,
  type TaxBankPaymentSettings,
} from '../lib/taxBankPayment';

export function useTaxBankPaymentSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TaxBankPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const userId = user?.id;
    if (!isTaxBankPaymentUserId(userId)) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('tax_bank_payment_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    setSettings(
      !error && data
        ? normalizeTaxBankPaymentSettings(data as Partial<TaxBankPaymentSettings>, userId)
        : null,
    );
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!isTaxBankPaymentUserId(user?.id)) return;

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
