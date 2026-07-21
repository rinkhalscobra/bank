import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { normalizeTaxStatus, summarizeTaxAmounts, type TaxStatus } from '../lib/taxStatus';

type TaxSummaryCardRow = {
  id: string;
  user_id: string;
  status: TaxStatus;
  amount: number;
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

  const fetchTaxSummary = useCallback(async () => {
    if (!user) {
      setSummary(emptyTaxSummary());
      setLoading(false);
      return;
    }

    setLoading(true);

    const summaryResult = await supabase
      .from('tax_summary_cards')
      .select('*')
      .eq('user_id', user.id);

    if (!summaryResult.error) {
      setSummary(summarizeTaxAmounts(((summaryResult.data as TaxSummaryCardRow[]) || []).map(taxSummaryCardToTaxLike)));
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

  return { summary, loading, refetch: fetchTaxSummary };
}
