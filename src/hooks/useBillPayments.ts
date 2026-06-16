import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  bank_routing_number: string;
  bank_swift_code: string;
  created_at: string;
}

export function useBillPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('bill_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPayments((data as BillPayment[]) || []);
    setLoading(false);
  };

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
    bankRoutingNumber?: string;
    bankSwiftCode?: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('bill_payments').insert({
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
      bank_routing_number: params.bankRoutingNumber || '',
      bank_swift_code: params.bankSwiftCode || '',
    });
    if (!error) await fetchPayments();
    return { error: error?.message || null };
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  return { payments, loading, refetch: fetchPayments, payBill };
}
