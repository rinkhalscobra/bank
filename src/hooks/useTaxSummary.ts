import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { normalizeTaxStatus, summarizeTaxAmounts, type TaxStatus } from '../lib/taxStatus';
import { DEFAULT_TAX_CURRENCY, normalizeTaxCurrency } from '../lib/taxCurrency';

type TaxSummaryCardRow = {
  id: string;
  user_id: string;
  status: TaxStatus;
  amount: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
};

function emptyTaxSummary() {
  return summarizeTaxAmounts([]);
}

function taxSummaryCardToTaxLike(row: TaxSummaryCardRow) {
  const status = normalizeTaxStatus(row.status);
  const amount = Math.max(Number(row.amount ?? 0), 0);

  return {
    status,
    amount_owed: amount,
    amount_paid: status === 'paid' ? amount : 0,
  };
}

export function useTaxSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(emptyTaxSummary);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(DEFAULT_TAX_CURRENCY);

  const fetchTaxSummary = useCallback(async () => {
    if (!user) {
      setSummary(emptyTaxSummary());
      setCurrency(DEFAULT_TAX_CURRENCY);
      setLoading(false);
      return;
    }

    setLoading(true);

    const summaryResult = await supabase
      .from('tax_summary_cards')
      .select('*')
      .eq('user_id', user.id);

    if (!summaryResult.error) {
      const rows = (summaryResult.data as TaxSummaryCardRow[]) || [];
      setSummary(summarizeTaxAmounts(rows.map(taxSummaryCardToTaxLike)));
      setCurrency(normalizeTaxCurrency(rows[0]?.currency));
      setLoading(false);
      return;
    }

    const legacyResult = await supabase
      .from('taxes')
      .select('*')
      .eq('user_id', user.id);

    setSummary(summarizeTaxAmounts((legacyResult.data as unknown[]) || []));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchTaxSummary();
  }, [fetchTaxSummary]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`tax-summary-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tax_summary_cards',
          filter: `user_id=eq.${user.id}`,
        },
        () => void fetchTaxSummary()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, fetchTaxSummary]);

  return { summary, currency, loading, refetch: fetchTaxSummary };
}
