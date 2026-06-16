import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { normalizeBalanceStatus, type BalanceAvailabilityStatus } from '../lib/balanceStatus';

export interface CryptoBalance {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  balance: number;
  status: BalanceAvailabilityStatus;
  created_at: string;
}

export function useCryptoBalances(targetUserId?: string) {
  const { user } = useAuth();
  const [cryptoBalances, setCryptoBalances] = useState<CryptoBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedUserId = targetUserId ?? user?.id ?? null;

  const fetchCryptoBalances = async () => {
    if (!resolvedUserId) {
      setCryptoBalances([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: true });
    const normalized = ((data as Partial<CryptoBalance>[]) || []).map((row) => ({
      id: String(row.id || ''),
      user_id: String(row.user_id || ''),
      symbol: String(row.symbol || ''),
      name: String(row.name || ''),
      balance: Number(row.balance || 0),
      status: normalizeBalanceStatus(row.status),
      created_at: String(row.created_at || ''),
    }));
    setCryptoBalances(normalized);
    setLoading(false);
  };

  useEffect(() => {
    void fetchCryptoBalances();
  }, [resolvedUserId]);

  return { cryptoBalances, loading, refetch: fetchCryptoBalances };
}
