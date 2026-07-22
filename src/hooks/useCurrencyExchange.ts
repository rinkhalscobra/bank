import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchLiveMarketData,
  type CryptoPrice,
  type LiveMarketData,
} from '../lib/exchangeRates';

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

export type CrossAssetDirection = 'fiat_to_crypto' | 'crypto_to_fiat';

export interface CrossAssetExchangeParams {
  direction: CrossAssetDirection;
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
}

function toCodeKey(codes: string[] | undefined) {
  if (codes === undefined) return null;
  return Array.from(new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean)))
    .sort()
    .join(',');
}

export function useLiveRates(fiatCurrencies?: string[], cryptoSymbols?: string[]) {
  const [rates, setRates] = useState<Record<string, Record<string, number>>>({});
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, CryptoPrice>>({});
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<LiveMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequestRef = useRef(0);
  const fiatKey = toCodeKey(fiatCurrencies);
  const cryptoKey = toCodeKey(cryptoSymbols);
  const requestKey = `${fiatKey ?? 'default'}|${cryptoKey ?? 'default'}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLiveMarketData({
        fiatCurrencies: fiatKey === null ? undefined : fiatKey.split(',').filter(Boolean),
        cryptoSymbols: cryptoKey === null ? undefined : cryptoKey.split(',').filter(Boolean),
      });
      if (requestId !== latestRequestRef.current) return data;

      setRates(data.rates || {});
      setCryptoPrices(data.crypto || {});
      setFetchedAt(data.fetched_at);
      setMarketData(data);
      setLoadedRequestKey(requestKey);
      setError(data.fiat_error || data.crypto_error || null);
      return data;
    } catch (caughtError) {
      if (requestId === latestRequestRef.current) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load live rates');
      }
      return null;
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, [cryptoKey, fiatKey, requestKey]);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60_000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  return {
    rates,
    cryptoPrices,
    fetchedAt,
    loading,
    ready: loadedRequestKey === requestKey,
    error,
    unsupportedFiatCurrencies: marketData?.unsupported_fiat_currencies || [],
    unsupportedCryptoSymbols: marketData?.unsupported_crypto_symbols || [],
    refetchRates: fetchRates,
  };
}

export function useCurrencyExchange(targetUserId?: string) {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<CurrencyExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedUserId = targetUserId ?? user?.id ?? null;

  const fetchExchanges = useCallback(async () => {
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
  }, [resolvedUserId]);

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

  const executeCrossAssetFallback = async (params: CrossAssetExchangeParams) => {
    if (!resolvedUserId) return { error: 'Not authenticated' };

    const sourceIsFiat = params.direction === 'fiat_to_crypto';
    const sourceTable = sourceIsFiat ? 'fiat_balances' : 'crypto_balances';
    const targetTable = sourceIsFiat ? 'crypto_balances' : 'fiat_balances';
    const sourceCodeColumn = sourceIsFiat ? 'currency' : 'symbol';
    const targetCodeColumn = sourceIsFiat ? 'symbol' : 'currency';

    const [sourceResult, targetResult] = await Promise.all([
      supabase
        .from(sourceTable)
        .select('id, balance, status')
        .eq('user_id', resolvedUserId)
        .eq(sourceCodeColumn, params.fromAsset)
        .single(),
      supabase
        .from(targetTable)
        .select('id, balance, status')
        .eq('user_id', resolvedUserId)
        .eq(targetCodeColumn, params.toAsset)
        .single(),
    ]);

    if (sourceResult.error) return { error: sourceResult.error.message };
    if (targetResult.error) return { error: targetResult.error.message };

    const sourceRow = sourceResult.data as { id: string; balance: number; status?: string };
    const targetRow = targetResult.data as { id: string; balance: number; status?: string };
    const sourceBalance = Number(sourceRow.balance);
    const targetBalance = Number(targetRow.balance);

    if ((sourceRow.status || 'available') !== 'available') {
      return { error: `Source ${sourceIsFiat ? 'fiat' : 'crypto'} balance is ${sourceRow.status} and cannot be exchanged` };
    }

    if ((targetRow.status || 'available') !== 'available') {
      return { error: `Destination ${sourceIsFiat ? 'crypto' : 'fiat'} balance is ${targetRow.status} and cannot receive funds` };
    }

    if (sourceBalance < params.fromAmount) {
      return { error: `Insufficient balance. Available: ${sourceBalance}` };
    }

    const updatedSourceBalance = sourceBalance - params.fromAmount;
    const updatedTargetBalance = targetBalance + params.toAmount;

    const sourceUpdate = await supabase
      .from(sourceTable)
      .update({ balance: updatedSourceBalance })
      .eq('id', sourceRow.id)
      .eq('user_id', resolvedUserId)
      .eq('balance', sourceRow.balance)
      .select('id')
      .maybeSingle();

    if (sourceUpdate.error) return { error: sourceUpdate.error.message };
    if (!sourceUpdate.data) return { error: 'The source balance changed. Refresh rates and try again.' };

    const targetUpdate = await supabase
      .from(targetTable)
      .update({ balance: updatedTargetBalance })
      .eq('id', targetRow.id)
      .eq('user_id', resolvedUserId)
      .eq('balance', targetRow.balance)
      .select('id')
      .maybeSingle();

    if (targetUpdate.error || !targetUpdate.data) {
      await supabase
        .from(sourceTable)
        .update({ balance: sourceBalance })
        .eq('id', sourceRow.id)
        .eq('user_id', resolvedUserId)
        .eq('balance', updatedSourceBalance);
      return { error: targetUpdate.error?.message || 'The destination balance changed. Please try again.' };
    }

    const historyResult = await supabase.from('currency_exchanges').insert({
      user_id: resolvedUserId,
      from_currency: params.fromAsset,
      to_currency: params.toAsset,
      from_amount: params.fromAmount,
      to_amount: params.toAmount,
      exchange_rate: params.exchangeRate,
      fee: 0,
      status: 'completed',
    });

    if (historyResult.error) {
      await Promise.all([
        supabase
          .from(sourceTable)
          .update({ balance: sourceBalance })
          .eq('id', sourceRow.id)
          .eq('user_id', resolvedUserId)
          .eq('balance', updatedSourceBalance),
        supabase
          .from(targetTable)
          .update({ balance: targetBalance })
          .eq('id', targetRow.id)
          .eq('user_id', resolvedUserId)
          .eq('balance', updatedTargetBalance),
      ]);
      return { error: historyResult.error.message };
    }

    return { error: null };
  };

  const executeCrossAssetExchange = async (params: CrossAssetExchangeParams) => {
    if (!resolvedUserId) return { error: 'Not authenticated' };

    const { error } = await supabase.rpc('execute_cross_asset_exchange', {
      p_user_id: resolvedUserId,
      p_direction: params.direction,
      p_from_asset: params.fromAsset,
      p_to_asset: params.toAsset,
      p_from_amount: params.fromAmount,
      p_to_amount: params.toAmount,
      p_exchange_rate: params.exchangeRate,
      p_fee: 0,
    });

    const missingRpc = error && (
      error.code === 'PGRST202' ||
      error.message.includes('execute_cross_asset_exchange') ||
      error.message.includes('schema cache')
    );

    if (error && !missingRpc) return { error: error.message };

    const result = missingRpc ? await executeCrossAssetFallback(params) : { error: null };
    if (!result.error) await fetchExchanges();
    return result;
  };

  useEffect(() => {
    void fetchExchanges();
  }, [fetchExchanges]);

  return {
    exchanges,
    loading,
    refetch: fetchExchanges,
    executeExchange,
    executeCryptoSwap,
    executeCrossAssetExchange,
  };
}
