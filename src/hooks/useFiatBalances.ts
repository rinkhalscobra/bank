import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { normalizeBalanceStatus, type BalanceAvailabilityStatus } from '../lib/balanceStatus';

export interface FiatBalance {
  id: string;
  user_id: string;
  currency: string;
  name: string;
  balance: number;
  status: BalanceAvailabilityStatus;
  created_at: string;
}

export function useFiatBalances(targetUserId?: string) {
  const { user } = useAuth();
  const [fiatBalances, setFiatBalances] = useState<FiatBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedUserId = targetUserId ?? user?.id ?? null;

  const fetchFiatBalances = async () => {
    if (!resolvedUserId) {
      setFiatBalances([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('fiat_balances')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: true });
    const normalized = ((data as Partial<FiatBalance>[]) || []).map((row) => ({
      id: String(row.id || ''),
      user_id: String(row.user_id || ''),
      currency: String(row.currency || ''),
      name: String(row.name || ''),
      balance: Number(row.balance || 0),
      status: normalizeBalanceStatus(row.status),
      created_at: String(row.created_at || ''),
    }));
    setFiatBalances(normalized);
    setLoading(false);
  };

  useEffect(() => {
    void fetchFiatBalances();
  }, [resolvedUserId]);

  return { fiatBalances, loading, refetch: fetchFiatBalances };
}
