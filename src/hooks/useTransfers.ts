import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getBalanceActionError, isBalanceAvailable } from '../lib/balanceStatus';
import {
  isMissingIbanColumnError,
  normalizeIbanRow,
  toLegacyIbanPayload,
} from '../lib/ibanCompatibility';

export interface BankTransfer {
  id: string;
  user_id: string;
  transfer_type: 'internal' | 'external';
  status: 'pending' | 'processing' | 'approved' | 'completed' | 'failed';
  amount: number;
  currency: string;
  description: string;
  target_currency: string | null;
  recipient_name: string;
  bank_name: string;
  iban: string;
  account_number: string;
  swift_code: string;
  created_at: string;
}

export interface InternalTransferPayload {
  amount: number;
  currency: string;
  target_currency: string;
  description: string;
}

export interface ExternalTransferPayload {
  amount: number;
  currency: string;
  recipient_name: string;
  bank_name: string;
  iban: string;
  account_number: string;
  swift_code: string;
  description: string;
}

export function useTransfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransfers = useCallback(async (showLoading = true) => {
    if (!user) {
      setTransfers([]);
      setLoading(false);
      return;
    }
    if (showLoading) setLoading(true);
    const { data } = await supabase
      .from('bank_transfers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTransfers(((data as (BankTransfer & { routing_number?: string })[]) || []).map((row) =>
      normalizeIbanRow('bank_transfers', row)
    ));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`bank-transfers-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bank_transfers',
          filter: `user_id=eq.${user.id}`,
        },
        () => void fetchTransfers(false),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchTransfers, user]);

  const createInternalTransfer = async (payload: InternalTransferPayload) => {
    if (!user) return { error: 'Not authenticated' };
    setSubmitting(true);

    const { data: balances } = await supabase
      .from('fiat_balances')
      .select('*')
      .eq('user_id', user.id);

    const sourceBalance = balances?.find((b: { currency: string }) => b.currency === payload.currency) as { balance: number; status?: string } | undefined;
    const targetBalance = balances?.find((b: { currency: string }) => b.currency === payload.target_currency) as { status?: string } | undefined;

    if (sourceBalance && !isBalanceAvailable(sourceBalance.status)) {
      setSubmitting(false);
      return { error: getBalanceActionError(payload.currency, sourceBalance.status) };
    }

    if (targetBalance && !isBalanceAvailable(targetBalance.status)) {
      setSubmitting(false);
      return { error: getBalanceActionError(payload.target_currency, targetBalance.status) };
    }

    if (!sourceBalance || Number(sourceBalance.balance) < payload.amount) {
      setSubmitting(false);
      return { error: `Insufficient ${payload.currency} balance` };
    }

    const { error: insertError } = await supabase
      .from('bank_transfers')
      .insert({
        user_id: user.id,
        transfer_type: 'internal',
        amount: payload.amount,
        currency: payload.currency,
        target_currency: payload.target_currency,
        description: payload.description || `Transfer ${payload.currency} to ${payload.target_currency}`,
        status: 'pending',
      });

    if (insertError) {
      setSubmitting(false);
      return { error: insertError.message };
    }

    await fetchTransfers();
    setSubmitting(false);
    return { error: null };
  };

  const createExternalTransfer = async (payload: ExternalTransferPayload) => {
    if (!user) return { error: 'Not authenticated' };
    setSubmitting(true);

    const { data: balances } = await supabase
      .from('fiat_balances')
      .select('*')
      .eq('user_id', user.id);

    const sourceBalance = balances?.find((b: { currency: string }) => b.currency === payload.currency) as { balance: number; status?: string } | undefined;

    if (sourceBalance && !isBalanceAvailable(sourceBalance.status)) {
      setSubmitting(false);
      return { error: getBalanceActionError(payload.currency, sourceBalance.status) };
    }

    if (!sourceBalance || Number(sourceBalance.balance) < payload.amount) {
      setSubmitting(false);
      return { error: `Insufficient ${payload.currency} balance` };
    }

    const insertPayload = {
      user_id: user.id,
      transfer_type: 'external',
      amount: payload.amount,
      currency: payload.currency,
      recipient_name: payload.recipient_name,
      bank_name: payload.bank_name,
      iban: payload.iban,
      account_number: payload.account_number,
      swift_code: payload.swift_code,
      description: payload.description || `Transfer to ${payload.recipient_name}`,
      status: 'pending',
    };

    let insertResult = await supabase
      .from('bank_transfers')
      .insert(insertPayload);

    if (isMissingIbanColumnError(insertResult.error, 'bank_transfers')) {
      insertResult = await supabase
        .from('bank_transfers')
        .insert(toLegacyIbanPayload('bank_transfers', insertPayload));
    }

    const { error: insertError } = insertResult;

    if (insertError) {
      setSubmitting(false);
      return { error: insertError.message };
    }

    await fetchTransfers();
    setSubmitting(false);
    return { error: null };
  };

  return {
    transfers,
    loading,
    submitting,
    createInternalTransfer,
    createExternalTransfer,
    refetch: fetchTransfers,
  };
}
