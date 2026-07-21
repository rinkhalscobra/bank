import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CryptoDeposit {
  id: string;
  user_id: string;
  symbol: string;
  crypto_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'failed';
  created_at: string;
}

export const SUPPORTED_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether' },
];

export function useAddFund() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<CryptoDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = useCallback(async () => {
    if (!user) {
      setDeposits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('crypto_deposits')
      .select('id, user_id, symbol, crypto_name, amount, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setDeposits((data as CryptoDeposit[]) || []);
    setLoading(false);
  }, [user]);

  const addFund = async (params: { symbol: string; cryptoName: string; amount: number }) => {
    if (!user) return { error: 'Not authenticated' };

    const { error: insertErr } = await supabase.from('crypto_deposits').insert({
      user_id: user.id,
      symbol: params.symbol,
      crypto_name: params.cryptoName,
      amount: params.amount,
      status: 'pending',
    });
    if (insertErr) return { error: insertErr.message };

    await fetchDeposits();
    return { error: null };
  };

  useEffect(() => {
    void fetchDeposits();
  }, [fetchDeposits]);

  return { deposits, loading, refetch: fetchDeposits, addFund };
}
