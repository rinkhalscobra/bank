import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CurrencyExchange {
  id: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export interface CryptoPrice {
  usd: number;
  usd_24h_change: number;
}

interface RatesResponse {
  rates: Record<string, Record<string, number>>;
  crypto: Record<string, CryptoPrice>;
  fetched_at: string;
}

export function useLiveRates() {
  const [rates, setRates] = useState<Record<string, Record<string, number>>>({});
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, CryptoPrice>>({});
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-rates`;
      const res = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch rates');
      const data: RatesResponse = await res.json();
      setRates(data.rates);
      setCryptoPrices(data.crypto || {});
      setFetchedAt(data.fetched_at);
    } catch {
      setError('Unable to load live rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60_000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  return { rates, cryptoPrices, fetchedAt, loading, error, refetchRates: fetchRates };
}

export function useCurrencyExchange(targetUserId?: string) {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<CurrencyExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedUserId = targetUserId ?? user?.id ?? null;

  const fetchExchanges = async () => {
    if (!resolvedUserId) {
      setExchanges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('currency_exchanges')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: false })
      .limit(50);
    setExchanges((data as CurrencyExchange[]) || []);
    setLoading(false);
  };

  const executeExchange = async (params: {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: number;
    toAmount: number;
    exchangeRate: number;
  }) => {
    if (!resolvedUserId) return { error: 'Not authenticated' };
    const { error } = await supabase.rpc('execute_currency_exchange', {
      p_user_id: resolvedUserId,
      p_from_currency: params.fromCurrency,
      p_to_currency: params.toCurrency,
      p_from_amount: params.fromAmount,
      p_to_amount: params.toAmount,
      p_exchange_rate: params.exchangeRate,
      p_fee: 0,
    });
    if (!error) await fetchExchanges();
    return { error: error?.message || null };
  };

  const executeCryptoSwap = async (params: {
    fromSymbol: string;
    toSymbol: string;
    fromAmount: number;
    toAmount: number;
    fromPriceUsd: number;
    toPriceUsd: number;
  }) => {
    if (!resolvedUserId) return { error: 'Not authenticated' };
    const { error } = await supabase.rpc('execute_crypto_swap', {
      p_user_id: resolvedUserId,
      p_from_symbol: params.fromSymbol,
      p_to_symbol: params.toSymbol,
      p_from_amount: params.fromAmount,
      p_to_amount: params.toAmount,
      p_from_price_usd: params.fromPriceUsd,
      p_to_price_usd: params.toPriceUsd,
      p_fee_usd: 0,
    });
    return { error: error?.message || null };
  };

  useEffect(() => {
    void fetchExchanges();
  }, [resolvedUserId]);

  return { exchanges, loading, refetch: fetchExchanges, executeExchange, executeCryptoSwap };
}
