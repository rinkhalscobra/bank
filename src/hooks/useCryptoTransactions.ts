import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CryptoTransaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell' | 'send' | 'receive' | 'swap';
  symbol: string;
  name: string;
  amount: number;
  price_per_unit: number;
  total_value: number;
  fee: number;
  from_symbol: string;
  to_symbol: string;
  wallet_address: string;
  tx_hash: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  comment: string;
  created_at: string;
}

export function useCryptoTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('crypto_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    const normalized = ((data as Partial<CryptoTransaction>[]) || []).map((row) => ({
      id: String(row.id || ''),
      user_id: String(row.user_id || ''),
      type: (row.type || 'buy') as CryptoTransaction['type'],
      symbol: String(row.symbol || ''),
      name: String(row.name || ''),
      amount: Number(row.amount || 0),
      price_per_unit: Number(row.price_per_unit || 0),
      total_value: Number(row.total_value || 0),
      fee: Number(row.fee || 0),
      from_symbol: String(row.from_symbol || ''),
      to_symbol: String(row.to_symbol || ''),
      wallet_address: String(row.wallet_address || ''),
      tx_hash: String(row.tx_hash || ''),
      status: (row.status || 'completed') as CryptoTransaction['status'],
      description: String(row.description || ''),
      comment: String(row.comment || ''),
      created_at: String(row.created_at || ''),
    }));
    setTransactions(normalized);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return { transactions, loading, refetch: fetchTransactions };
}
