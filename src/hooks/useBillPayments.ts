import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  isMissingIbanColumnError,
  normalizeIbanRow,
  toLegacyIbanPayload,
} from '../lib/ibanCompatibility';

export interface BillPayment {
  id: string;
  user_id: string;
  biller_name: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  scheduled_date: string | null;
  is_recurring: boolean;
  recurring_frequency: string | null;
  payment_method: 'bank' | 'crypto';
  crypto_symbol: string;
  crypto_wallet_address: string;
  bank_name: string;
  bank_account_number: string;
  bank_iban: string;
  bank_swift_code: string;
  created_at: string;
}

export function useBillPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('bill_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPayments(((data as (BillPayment & { bank_routing_number?: string })[]) || []).map((row) =>
      normalizeIbanRow('bill_payments', row)
    ));
    setLoading(false);
  }, [user]);

  const payBill = async (params: {
    billerName: string;
    amount: number;
    isRecurring: boolean;
    recurringFrequency?: string;
    paymentMethod: 'bank' | 'crypto';
    cryptoSymbol?: string;
    cryptoWalletAddress?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIban?: string;
    bankSwiftCode?: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };
    const payload = {
      user_id: user.id,
      biller_name: params.billerName,
      amount: params.amount,
      status: 'pending',
      is_recurring: params.isRecurring,
      recurring_frequency: params.recurringFrequency || null,
      payment_method: params.paymentMethod,
      crypto_symbol: params.cryptoSymbol || '',
      crypto_wallet_address: params.cryptoWalletAddress || '',
      bank_name: params.bankName || '',
      bank_account_number: params.bankAccountNumber || '',
      bank_iban: params.bankIban || '',
      bank_swift_code: params.bankSwiftCode || '',
    };
    let insertResult = await supabase.from('bill_payments').insert(payload);

    if (isMissingIbanColumnError(insertResult.error, 'bill_payments')) {
      insertResult = await supabase
        .from('bill_payments')
        .insert(toLegacyIbanPayload('bill_payments', payload));
    }

    const { error } = insertResult;
    if (!error) await fetchPayments();
    return { error: error?.message || null };
  };

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, refetch: fetchPayments, payBill };
}
