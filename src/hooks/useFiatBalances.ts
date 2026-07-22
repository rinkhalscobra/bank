import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { normalizeBalanceStatus, type BalanceAvailabilityStatus } from '../lib/balanceStatus';

export interface FiatBalance {
  id: string;
  user_id: string;
  currency: string;
  name: string;
  display_order: number;
  balance: number;
  status: BalanceAvailabilityStatus;
  created_at: string;
}

export function useFiatBalances(targetUserId?: string) {
  const { user } = useAuth();
  const [fiatBalances, setFiatBalances] = useState<FiatBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedUserId = targetUserId ?? user?.id ?? null;

  const fetchFiatBalances = useCallback(async (showLoading = true) => {
    if (!resolvedUserId) {
      setFiatBalances([]);
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from('fiat_balances')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: true });

    if (error) {
      setFiatBalances([]);
      setLoading(false);
      return;
    }

    const normalized = ((data as Partial<FiatBalance>[]) || [])
      .map((row) => ({
        id: String(row.id || ''),
        user_id: String(row.user_id || ''),
        currency: String(row.currency || '').trim().toUpperCase(),
        name: String(row.name || ''),
        display_order: Number(row.display_order || 0),
        balance: Number(row.balance || 0),
        status: normalizeBalanceStatus(row.status),
        created_at: String(row.created_at || ''),
      }))
      .sort((left, right) => left.display_order - right.display_order);
    setFiatBalances(normalized);
    setLoading(false);
  }, [resolvedUserId]);

  useEffect(() => {
    void fetchFiatBalances();
  }, [fetchFiatBalances]);

  useEffect(() => {
    if (!resolvedUserId) return;

    const channel = supabase
      .channel(`fiat-balances-${resolvedUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fiat_balances',
          filter: `user_id=eq.${resolvedUserId}`,
        },
        () => void fetchFiatBalances(false),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchFiatBalances, resolvedUserId]);

  return { fiatBalances, loading, refetch: fetchFiatBalances };
}
