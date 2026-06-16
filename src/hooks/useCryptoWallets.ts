import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getBalanceActionError, isBalanceAvailable } from '../lib/balanceStatus';

export interface CryptoWallet {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  wallet_address: string;
  network: string;
  created_at: string;
}

export interface CryptoTransfer {
  id: string;
  user_id: string;
  symbol: string;
  direction: 'send' | 'receive';
  transfer_type: 'internal' | 'external';
  target_symbol: string;
  amount: number;
  recipient_address: string;
  sender_address: string;
  tx_hash: string;
  status: 'pending' | 'approved' | 'completed' | 'failed';
  fee: number;
  note: string;
  created_at: string;
}

export interface InternalCryptoTransferPayload {
  symbol: string;
  target_symbol: string;
  amount: number;
  note: string;
}

export interface ExternalCryptoTransferPayload {
  symbol: string;
  amount: number;
  recipient_address: string;
  note: string;
}

export interface ReceiveCryptoTransferPayload {
  symbol: string;
  amount: number;
  sender_address: string;
  note: string;
}

export function useCryptoWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchWallets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setWallets((data as CryptoWallet[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const updateWalletAddress = useCallback(async (symbol: string, walletAddress: string) => {
    if (!user) return { error: 'Not authenticated' };
    setUpdating(true);
    const { error } = await supabase
      .from('crypto_wallets')
      .update({ wallet_address: walletAddress })
      .eq('user_id', user.id)
      .eq('symbol', symbol);
    if (error) {
      setUpdating(false);
      return { error: error.message };
    }
    await fetchWallets();
    setUpdating(false);
    return { error: null };
  }, [user, fetchWallets]);

  return { wallets, loading, updating, updateWalletAddress, refetch: fetchWallets };
}

export function useCryptoTransfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<CryptoTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransfers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('crypto_transfers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setTransfers((data as CryptoTransfer[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const createInternalCryptoTransfer = async (payload: InternalCryptoTransferPayload) => {
    if (!user) return { error: 'Not authenticated' };
    setSubmitting(true);

    const { data: balances } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', user.id);

    const sourceBalance = balances?.find((b: { symbol: string }) => b.symbol === payload.symbol) as { balance: number; status?: string } | undefined;
    const targetBalance = balances?.find((b: { symbol: string }) => b.symbol === payload.target_symbol) as { status?: string } | undefined;

    if (sourceBalance && !isBalanceAvailable(sourceBalance.status)) {
      setSubmitting(false);
      return { error: getBalanceActionError(payload.symbol, sourceBalance.status) };
    }

    if (targetBalance && !isBalanceAvailable(targetBalance.status)) {
      setSubmitting(false);
      return { error: getBalanceActionError(payload.target_symbol, targetBalance.status) };
    }

    if (!sourceBalance || Number(sourceBalance.balance) < payload.amount) {
      setSubmitting(false);
      return { error: `Insufficient ${payload.symbol} balance` };
    }

    const { error: insertError } = await supabase
      .from('crypto_transfers')
      .insert({
        user_id: user.id,
        symbol: payload.symbol,
        target_symbol: payload.target_symbol,
        transfer_type: 'internal',
        direction: 'send',
        amount: payload.amount,
        recipient_address: '',
        sender_address: '',
        tx_hash: '',
        status: 'pending',
        fee: 0,
        note: payload.note || `Convert ${payload.symbol} to ${payload.target_symbol}`,
      });

    if (insertError) {
      setSubmitting(false);
      return { error: insertError.message };
    }

    await fetchTransfers();
    setSubmitting(false);
    return { error: null };
  };

  const createExternalCryptoTransfer = async (payload: ExternalCryptoTransferPayload) => {
    if (!user) return { error: 'Not authenticated' };
    setSubmitting(true);

    const { data: balances } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', user.id);

    const sourceBalance = balances?.find((b: { symbol: string }) => b.symbol === payload.symbol) as { balance: number; status?: string } | undefined;

    if (sourceBalance && !isBalanceAvailable(sourceBalance.status)) {
      setSubmitting(false);
      return { error: getBalanceActionError(payload.symbol, sourceBalance.status) };
    }

    if (!sourceBalance || Number(sourceBalance.balance) < payload.amount) {
      setSubmitting(false);
      return { error: `Insufficient ${payload.symbol} balance` };
    }

    const { data: wallets } = await supabase
      .from('crypto_wallets')
      .select('wallet_address')
      .eq('user_id', user.id)
      .eq('symbol', payload.symbol)
      .maybeSingle();

    const { error: insertError } = await supabase
      .from('crypto_transfers')
      .insert({
        user_id: user.id,
        symbol: payload.symbol,
        target_symbol: '',
        transfer_type: 'external',
        direction: 'send',
        amount: payload.amount,
        recipient_address: payload.recipient_address,
        sender_address: wallets?.wallet_address || '',
        tx_hash: '',
        status: 'pending',
        fee: 0,
        note: payload.note || `Send ${payload.symbol} to external wallet`,
      });

    if (insertError) {
      setSubmitting(false);
      return { error: insertError.message };
    }

    await fetchTransfers();
    setSubmitting(false);
    return { error: null };
  };

  const createReceiveCryptoTransfer = async (payload: ReceiveCryptoTransferPayload) => {
    if (!user) return { error: 'Not authenticated' };
    setSubmitting(true);

    const { data: balances } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', user.id);

    const targetBalance = balances?.find((b: { symbol: string }) => b.symbol === payload.symbol) as { status?: string } | undefined;

    if (targetBalance && !isBalanceAvailable(targetBalance.status)) {
      setSubmitting(false);
      return { error: getBalanceActionError(payload.symbol, targetBalance.status) };
    }

    const { data: wallets } = await supabase
      .from('crypto_wallets')
      .select('wallet_address')
      .eq('user_id', user.id)
      .eq('symbol', payload.symbol)
      .maybeSingle();

    const { error: insertError } = await supabase
      .from('crypto_transfers')
      .insert({
        user_id: user.id,
        symbol: payload.symbol,
        target_symbol: '',
        transfer_type: 'external',
        direction: 'receive',
        amount: payload.amount,
        recipient_address: wallets?.wallet_address || '',
        sender_address: payload.sender_address,
        tx_hash: '',
        status: 'pending',
        fee: 0,
        note: payload.note || `Receive ${payload.symbol} from external wallet`,
      });

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
    createInternalCryptoTransfer,
    createExternalCryptoTransfer,
    createReceiveCryptoTransfer,
    refetch: fetchTransfers,
  };
}
