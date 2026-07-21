import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { normalizeTaxStatus, type TaxStatus } from '../lib/taxStatus';

export interface Tax {
  id: string;
  user_id: string;
  tax_type: string;
  tax_year: number;
  description: string;
  amount_owed: number;
  amount_paid: number;
  due_date: string;
  status: TaxStatus;
  filed_date: string | null;
  reference_number: string;
  notes: string;
  created_at: string;
}

export function useTaxes() {
  const { user } = useAuth();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTaxes = useCallback(async () => {
    if (!user) {
      setTaxes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('taxes')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: false });
    setTaxes(((data as Tax[]) || []).map((tax) => ({ ...tax, status: normalizeTaxStatus(tax.status) })));
    setLoading(false);
  }, [user]);

  const addTax = async (params: {
    taxType: string;
    taxYear: number;
    description: string;
    amountOwed: number;
    dueDate: string;
    notes?: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('taxes').insert({
      user_id: user.id,
      tax_type: params.taxType,
      tax_year: params.taxYear,
      description: params.description,
      amount_owed: params.amountOwed,
      due_date: params.dueDate,
      notes: params.notes || '',
    });
    if (!error) await fetchTaxes();
    return { error: error?.message || null };
  };

  const makePayment = async (taxId: string, amount: number) => {
    if (!user) return { error: 'Not authenticated' };
    const tax = taxes.find((t) => t.id === taxId);
    if (!tax) return { error: 'Tax record not found' };

    const newPaid = tax.amount_paid + amount;
    const newStatus: TaxStatus = newPaid >= tax.amount_owed ? 'paid' : 'pending';

    const { error } = await supabase
      .from('taxes')
      .update({
        amount_paid: newPaid,
        status: newStatus,
        filed_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : tax.filed_date,
      })
      .eq('id', taxId)
      .eq('user_id', user.id);
    if (!error) await fetchTaxes();
    return { error: error?.message || null };
  };

  useEffect(() => {
    void fetchTaxes();
  }, [fetchTaxes]);

  return { taxes, loading, refetch: fetchTaxes, addTax, makePayment };
}
