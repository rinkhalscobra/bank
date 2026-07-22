import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { normalizeBalanceStatus, type BalanceAvailabilityStatus } from '../lib/balanceStatus';

export interface CryptoBalance {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  display_order: number;
  balance: number;
  status: BalanceAvailabilityStatus;
  created_at: string;
}

export function useCryptoBalances(targetUserId?: string) {
  const { user } = useAuth();
  const [cryptoBalances, setCryptoBalances] = useState<CryptoBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedUserId = targetUserId ?? user?.id ?? null;

  const fetchCryptoBalances = useCallback(async (showLoading = true) => {
    if (!resolvedUserId) {
      setCryptoBalances([]);
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: true });

    if (error) {
      setCryptoBalances([]);
      setLoading(false);
      return;
    }

    const normalized = ((data as Partial<CryptoBalance>[]) || [])
      .map((row) => ({
        id: String(row.id || ''),
        user_id: String(row.user_id || ''),
        symbol: String(row.symbol || '').trim().toUpperCase(),
        name: String(row.name || ''),
        display_order: Number(row.display_order || 0),
        balance: Number(row.balance || 0),
        status: normalizeBalanceStatus(row.status),
        created_at: String(row.created_at || ''),
      }))
      .sort((left, right) => left.display_order - right.display_order);
    setCryptoBalances(normalized);
    setLoading(false);
  }, [resolvedUserId]);

  useEffect(() => {
    void fetchCryptoBalances();
  }, [fetchCryptoBalances]);

  useEffect(() => {
    if (!resolvedUserId) return;

    const channel = supabase
      .channel(`crypto-balances-${resolvedUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_balances',
          filter: `user_id=eq.${resolvedUserId}`,
        },
        () => void fetchCryptoBalances(false),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchCryptoBalances, resolvedUserId]);

  return { cryptoBalances, loading, refetch: fetchCryptoBalances };
}
