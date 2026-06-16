import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRightLeft,
  Bitcoin,
  CheckCircle,
  DollarSign,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Dropdown from '../ui/Dropdown';
import { useCurrencyExchange, useLiveRates } from '../../hooks/useCurrencyExchange';
import { useFiatBalances } from '../../hooks/useFiatBalances';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import '../../i18n/dashboard-currency-exchange/translations';

type CurrencyExchangeControlPanelProps = {
  userId?: string;
  variant?: 'dashboard' | 'crm';
  onSuccess?: () => Promise<void> | void;
};

const CURRENCY_INFO: Record<string, { symbol: string; nameKey: string }> = {
  USD: { symbol: '$', nameKey: 'dashboardCurrencyExchange.currencies.usd' },
  EUR: { symbol: 'EUR', nameKey: 'dashboardCurrencyExchange.currencies.eur' },
  CAD: { symbol: 'CAD', nameKey: 'dashboardCurrencyExchange.currencies.cad' },
};

const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  USDT: 'Tether',
  USDC: 'USD Coin',
};

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'CAD'];

function formatFiat(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatCryptoAmount(amount: number) {
  if (amount >= 1) return amount.toFixed(4);
  if (amount >= 0.001) return amount.toFixed(6);
  return amount.toFixed(8);
}

export default function CurrencyExchangeControlPanel({
  userId,
  variant = 'dashboard',
  onSuccess,
}: CurrencyExchangeControlPanelProps) {
  const { t } = useLanguage();
  const { loading, executeExchange, executeCryptoSwap } = useCurrencyExchange(userId);
  const { rates, cryptoPrices, fetchedAt, loading: ratesLoading, error: ratesError, refetchRates } = useLiveRates();
  const { fiatBalances, loading: fiatLoading, refetch: refetchFiat } = useFiatBalances(userId);
  const { cryptoBalances, loading: cryptoLoading, refetch: refetchCrypto } = useCryptoBalances(userId);
  const isCrmVariant = variant === 'crm';
  const isLoading = loading || fiatLoading || cryptoLoading;
  const availableFiatBalances = fiatBalances.filter((balance) => isBalanceAvailable(balance.status));
  const availableCryptoBalances = cryptoBalances.filter((balance) => isBalanceAvailable(balance.status));
  const restrictedFiatCount = fiatBalances.length - availableFiatBalances.length;
  const restrictedCryptoCount = cryptoBalances.length - availableCryptoBalances.length;

  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [fiatSubmitting, setFiatSubmitting] = useState(false);
  const [fiatResult, setFiatResult] = useState<{ success: boolean; message: string } | null>(null);

  const [fromCrypto, setFromCrypto] = useState('');
  const [toCrypto, setToCrypto] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoSubmitting, setCryptoSubmitting] = useState(false);
  const [cryptoResult, setCryptoResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setFromCurrency('');
    setToCurrency('');
    setFiatAmount('');
    setFiatResult(null);
    setFromCrypto('');
    setToCrypto('');
    setCryptoAmount('');
    setCryptoResult(null);
  }, [userId]);

  const cryptoSymbols = Object.keys(cryptoPrices);
  const fiatOptions = SUPPORTED_CURRENCIES.map((cur) => {
    const bal = availableFiatBalances.find((balance) => balance.currency === cur);
    return {
      value: cur,
      label: `${t(CURRENCY_INFO[cur]?.nameKey || cur)} (${CURRENCY_INFO[cur]?.symbol}) - ${bal ? formatFiat(bal.balance, cur) : formatFiat(0, cur)}`,
      icon: (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#006446]/10 text-[10px] font-semibold text-[#006446]">
          {cur}
        </span>
      ),
    };
  });
  const cryptoOptions = cryptoSymbols.map((sym) => {
    const bal = availableCryptoBalances.find((balance) => balance.symbol === sym);
    return {
      value: sym,
      label: `${CRYPTO_NAMES[sym] || sym} (${sym}) - ${bal ? formatCryptoAmount(bal.balance) : '0'}`,
      icon: (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#006446]/10 text-[10px] font-semibold text-[#006446]">
          {sym.slice(0, 2)}
        </span>
      ),
    };
  });

  const fiatNum = parseFloat(fiatAmount) || 0;
  const fiatRate =
    fromCurrency && toCurrency && fromCurrency !== toCurrency
      ? rates[fromCurrency]?.[toCurrency] || 0
      : 0;
  const fiatConverted = fiatNum * fiatRate;
  const fiatFromBal = availableFiatBalances.find((balance) => balance.currency === fromCurrency);
  const fiatInsufficient = fiatFromBal ? fiatNum > fiatFromBal.balance : false;

  const cryptoNum = parseFloat(cryptoAmount) || 0;
  const fromPrice = cryptoPrices[fromCrypto]?.usd || 0;
  const toPrice = cryptoPrices[toCrypto]?.usd || 0;
  const cryptoValueUsd = cryptoNum * fromPrice;
  const cryptoConvertedAmount = fromPrice > 0 && toPrice > 0 ? cryptoValueUsd / toPrice : 0;
  const cryptoFromBal = availableCryptoBalances.find((balance) => balance.symbol === fromCrypto);
  const cryptoInsufficient = cryptoFromBal ? cryptoNum > cryptoFromBal.balance : false;

  function timeAgo(isoStr: string) {
    const diff = Date.now() - new Date(isoStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}${t('dashboardCurrencyExchange.time.secondsAgo')}`;
    const mins = Math.floor(secs / 60);
    return `${mins}${t('dashboardCurrencyExchange.time.minutesAgo')}`;
  }

  async function handleAfterSuccess(kind: 'fiat' | 'crypto') {
    if (kind === 'fiat') {
      await refetchFiat();
    } else {
      await refetchCrypto();
    }

    if (onSuccess) {
      await onSuccess();
    }
  }

  const handleFiatExchange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !fromCurrency ||
      !toCurrency ||
      fiatNum <= 0 ||
      fiatRate <= 0 ||
      fromCurrency === toCurrency ||
      fiatInsufficient
    ) return;

    setFiatSubmitting(true);
    setFiatResult(null);

    const received = Math.round(fiatConverted * 100) / 100;
    const result = await executeExchange({
      fromCurrency,
      toCurrency,
      fromAmount: fiatNum,
      toAmount: received,
      exchangeRate: fiatRate,
    });

    if (result?.error) {
      setFiatResult({ success: false, message: result.error });
    } else {
      setFiatResult({
        success: true,
        message: `${t('dashboardCurrencyExchange.messages.exchanged')} ${formatFiat(fiatNum, fromCurrency)} ${t('dashboardCurrencyExchange.messages.to')} ${formatFiat(received, toCurrency)}`,
      });
      setFiatAmount('');
      await handleAfterSuccess('fiat');
    }

    setFiatSubmitting(false);
  };

  const handleCryptoSwap = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !fromCrypto ||
      !toCrypto ||
      cryptoNum <= 0 ||
      fromCrypto === toCrypto ||
      cryptoInsufficient ||
      toPrice <= 0
    ) return;

    setCryptoSubmitting(true);
    setCryptoResult(null);

    const cryptoReceived = parseFloat(cryptoConvertedAmount.toFixed(8));
    const result = await executeCryptoSwap({
      fromSymbol: fromCrypto,
      toSymbol: toCrypto,
      fromAmount: cryptoNum,
      toAmount: cryptoReceived,
      fromPriceUsd: fromPrice,
      toPriceUsd: toPrice,
    });

    if (result?.error) {
      setCryptoResult({ success: false, message: result.error });
    } else {
      setCryptoResult({
        success: true,
        message: `${t('dashboardCurrencyExchange.messages.swapped')} ${formatCryptoAmount(cryptoNum)} ${fromCrypto} ${t('dashboardCurrencyExchange.messages.to')} ${formatCryptoAmount(cryptoReceived)} ${toCrypto}`,
      });
      setCryptoAmount('');
      await handleAfterSuccess('crypto');
    }

    setCryptoSubmitting(false);
  };

  if (isCrmVariant && !userId) {
    return (
      <div className="border border-[#006446]/14 bg-white px-6 py-12 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <p className="text-sm text-slate-500">Select a customer first to control fiat and crypto exchanges.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#006446]/20 border-t-[#006446]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-4 ${isCrmVariant ? 'justify-end' : 'justify-between'}`}>
        {!isCrmVariant && (
          <div>
            <>
              <h1 className="text-2xl font-serif font-bold text-slate-900">
                {t('dashboardCurrencyExchange.title')}
              </h1>
              <p className="mt-1 text-sm text-[#006446]">
                {t('dashboardCurrencyExchange.subtitle')}
              </p>
            </>
          </div>
        )}

        <div className="flex items-center gap-3">
          {fetchedAt && (
            <span className="hidden text-[11px] text-[#006446]/70 sm:inline">
              {t('dashboardCurrencyExchange.updated')} {timeAgo(fetchedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={refetchRates}
            disabled={ratesLoading}
            className="flex items-center gap-1.5 rounded-full border border-[#006446]/14 bg-[#006446]/[0.04] px-3 py-1.5 text-xs font-medium text-[#006446] transition-colors hover:bg-[#006446]/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${ratesLoading ? 'animate-spin' : ''}`} />
            {t('dashboardCurrencyExchange.actions.refresh')}
          </button>
        </div>
      </div>

      {ratesError && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {ratesError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.04] to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#006446]/10">
                <DollarSign className="h-5 w-5 text-[#006446]" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  {t('dashboardCurrencyExchange.fiat.title')}
                </h2>
                <p className="text-[11px] text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fiat.liveRatesSource')}
                </p>
              </div>
            </div>
          </div>

          {fiatResult && (
            <div className="flex items-center gap-2 border-b border-[#006446]/10 bg-[#006446]/[0.04] px-4 py-2.5 text-sm text-[#006446]">
              {fiatResult.success ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span className="truncate">{fiatResult.message}</span>
            </div>
          )}

          <div className="p-6">
            {restrictedFiatCount > 0 && (
              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {restrictedFiatCount} fiat balance{restrictedFiatCount === 1 ? '' : 's'} hidden from exchange controls until marked available.
              </div>
            )}

            <form onSubmit={handleFiatExchange} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fields.from')}
                </label>
                <Dropdown
                  value={fromCurrency}
                  onChange={setFromCurrency}
                  options={fiatOptions.filter((option) => availableFiatBalances.some((balance) => balance.currency === option.value))}
                  placeholder={t('dashboardCurrencyExchange.placeholders.selectCurrency')}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fields.amount')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 flex w-12 -translate-y-1/2 items-center text-sm font-semibold text-[#006446]">
                    {CURRENCY_INFO[fromCurrency]?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={fiatAmount}
                    onChange={(event) => setFiatAmount(event.target.value)}
                    placeholder={t('dashboardCurrencyExchange.placeholders.amount')}
                    className="w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] py-2.5 pl-20 pr-3 text-sm text-slate-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                    required
                  />
                </div>
                {fiatFromBal && (
                  <p className={`mt-1 text-[11px] ${fiatInsufficient ? 'font-medium text-[#006446]' : 'text-[#006446]/70'}`}>
                    {t('dashboardCurrencyExchange.balance')}: {formatFiat(fiatFromBal.balance, fromCurrency)}
                    {fiatInsufficient && ` -- ${t('dashboardCurrencyExchange.insufficient')}`}
                  </p>
                )}
              </div>

              <div className="flex justify-center -my-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006446]/10">
                  <ArrowRightLeft className="h-4 w-4 text-[#006446]" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fields.to')}
                </label>
                <Dropdown
                  value={toCurrency}
                  onChange={setToCurrency}
                  options={fiatOptions.filter((option) => option.value !== fromCurrency && availableFiatBalances.some((balance) => balance.currency === option.value))}
                  placeholder={t('dashboardCurrencyExchange.placeholders.selectCurrency')}
                  className="w-full"
                />
              </div>

              {fiatRate > 0 && fiatNum > 0 && (
                <div className="space-y-1.5 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-3.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#006446]/70">{t('dashboardCurrencyExchange.summary.youSend')}</span>
                    <span className="font-medium text-slate-900">{formatFiat(fiatNum, fromCurrency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#006446]/70">{t('dashboardCurrencyExchange.summary.rate')}</span>
                    <span className="font-medium text-slate-900">1 {fromCurrency} = {fiatRate.toFixed(4)} {toCurrency}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#006446]/10 pt-1.5">
                    <span className="font-medium text-slate-800">{t('dashboardCurrencyExchange.summary.youReceive')}</span>
                    <span className="font-bold text-[#006446]">{formatFiat(fiatConverted, toCurrency)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={fiatSubmitting || fiatNum <= 0 || fiatRate <= 0 || fromCurrency === toCurrency || fiatInsufficient || availableFiatBalances.length < 2}
                className="w-full rounded-xl bg-[#006446] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-200 disabled:text-slate-400"
              >
                {fiatSubmitting ? t('dashboardCurrencyExchange.actions.processing') : t('dashboardCurrencyExchange.actions.exchange')}
              </button>

              {availableFiatBalances.length < 2 ? (
                <p className="text-xs text-slate-400">
                  You need at least two available fiat balances to exchange funds.
                </p>
              ) : null}
            </form>

            {Object.keys(rates).length > 0 && (
              <div className="mt-5 border-t border-[#006446]/10 pt-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fiat.liveRates')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_CURRENCIES.flatMap((from) =>
                    SUPPORTED_CURRENCIES
                      .filter((to) => to > from && rates[from]?.[to])
                      .map((to) => (
                        <div key={`${from}-${to}`} className="flex items-center justify-between rounded-xl border border-[#006446]/10 bg-[#006446]/[0.04] px-3 py-2">
                          <span className="text-xs font-medium text-[#006446]">{from}/{to}</span>
                          <span className="text-xs font-mono text-slate-900">{rates[from][to].toFixed(4)}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.04] to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#006446]/10">
                <Bitcoin className="h-5 w-5 text-[#006446]" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  {t('dashboardCurrencyExchange.crypto.title')}
                </h2>
                <p className="text-[11px] text-[#006446]/70">
                  {t('dashboardCurrencyExchange.crypto.livePricesSource')}
                </p>
              </div>
            </div>
          </div>

          {cryptoResult && (
            <div className="flex items-center gap-2 border-b border-[#006446]/10 bg-[#006446]/[0.04] px-4 py-2.5 text-sm text-[#006446]">
              {cryptoResult.success ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span className="truncate">{cryptoResult.message}</span>
            </div>
          )}

          <div className="p-6">
            {restrictedCryptoCount > 0 && (
              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {restrictedCryptoCount} crypto balance{restrictedCryptoCount === 1 ? '' : 's'} hidden from swap controls until marked available.
              </div>
            )}

            <form onSubmit={handleCryptoSwap} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fields.from')}
                </label>
                <Dropdown
                  value={fromCrypto}
                  onChange={setFromCrypto}
                  options={cryptoOptions.filter((option) => availableCryptoBalances.some((balance) => balance.symbol === option.value))}
                  placeholder={t('dashboardCurrencyExchange.placeholders.selectToken')}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fields.amount')}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={cryptoAmount}
                  onChange={(event) => setCryptoAmount(event.target.value)}
                  placeholder={t('dashboardCurrencyExchange.placeholders.amount')}
                  className="w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] px-3 py-2.5 text-sm text-slate-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                  required
                />
                {cryptoFromBal && (
                  <div className="mt-1 flex items-center justify-between">
                    <p className={`text-[11px] ${cryptoInsufficient ? 'font-medium text-[#006446]' : 'text-[#006446]/70'}`}>
                      {t('dashboardCurrencyExchange.balance')}: {formatCryptoAmount(cryptoFromBal.balance)} {fromCrypto}
                      {cryptoInsufficient && ` -- ${t('dashboardCurrencyExchange.insufficient')}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCryptoAmount(String(cryptoFromBal.balance))}
                      className="text-[11px] font-semibold text-[#006446] hover:text-[#00523a]"
                    >
                      {t('dashboardCurrencyExchange.actions.max')}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={() => {
                    const nextFromCrypto = toCrypto;
                    setToCrypto(fromCrypto);
                    setFromCrypto(nextFromCrypto);
                    setCryptoAmount('');
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006446]/10 transition-colors hover:bg-[#006446]/15"
                >
                  <ArrowRightLeft className="h-4 w-4 text-[#006446]" />
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fields.to')}
                </label>
                <Dropdown
                  value={toCrypto}
                  onChange={setToCrypto}
                  options={cryptoOptions.filter((option) => option.value !== fromCrypto && availableCryptoBalances.some((balance) => balance.symbol === option.value))}
                  placeholder={t('dashboardCurrencyExchange.placeholders.selectToken')}
                  className="w-full"
                />
              </div>

              {fromCrypto && toCrypto && fromPrice > 0 && toPrice > 0 && cryptoNum > 0 && (
                <div className="space-y-1.5 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-3.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#006446]/70">{t('dashboardCurrencyExchange.summary.youSend')}</span>
                    <span className="font-medium text-slate-900">{formatCryptoAmount(cryptoNum)} {fromCrypto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#006446]/70">{fromCrypto} {t('dashboardCurrencyExchange.summary.price')}</span>
                    <span className="text-slate-900">{formatUsd(fromPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#006446]/70">{toCrypto} {t('dashboardCurrencyExchange.summary.price')}</span>
                    <span className="text-slate-900">{formatUsd(toPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#006446]/70">{t('dashboardCurrencyExchange.summary.rate')}</span>
                    <span className="font-medium text-slate-900">1 {fromCrypto} = {formatCryptoAmount(fromPrice / toPrice)} {toCrypto}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#006446]/10 pt-1.5">
                    <span className="font-medium text-slate-800">{t('dashboardCurrencyExchange.summary.youReceive')}</span>
                    <span className="font-bold text-[#006446]">{formatCryptoAmount(cryptoConvertedAmount)} {toCrypto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-[#006446]/70">{t('dashboardCurrencyExchange.summary.value')}</span>
                    <span className="text-[11px] text-[#006446]/70">{formatUsd(cryptoValueUsd)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={cryptoSubmitting || cryptoNum <= 0 || !fromCrypto || !toCrypto || fromCrypto === toCrypto || cryptoInsufficient || toPrice <= 0 || availableCryptoBalances.length < 2}
                className="w-full rounded-xl bg-[#006446] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-200 disabled:text-slate-400"
              >
                {cryptoSubmitting ? t('dashboardCurrencyExchange.actions.processing') : t('dashboardCurrencyExchange.actions.swap')}
              </button>

              {availableCryptoBalances.length < 2 ? (
                <p className="text-xs text-slate-400">
                  You need at least two available crypto balances to swap assets.
                </p>
              ) : null}
            </form>

            {cryptoSymbols.length > 0 && (
              <div className="mt-5 border-t border-[#006446]/10 pt-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.crypto.livePrices')}
                </p>
                <div className="space-y-1.5">
                  {cryptoSymbols.map((sym) => {
                    const price = cryptoPrices[sym];
                    const isUp = price.usd_24h_change >= 0;
                    return (
                      <div key={sym} className="flex items-center justify-between rounded-xl border border-[#006446]/10 bg-[#006446]/[0.04] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#006446]/10 text-[10px] font-semibold text-[#006446]">
                            {sym.slice(0, 2)}
                          </span>
                          <div>
                            <span className="block text-xs font-bold text-slate-900">{sym}</span>
                            <span className="text-[10px] text-[#006446]/70">{CRYPTO_NAMES[sym]}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono text-slate-900">{formatUsd(price.usd)}</span>
                          <span className={`flex min-w-[52px] items-center justify-end gap-0.5 text-[10px] font-medium ${isUp ? 'text-[#006446]' : 'text-[#006446]/70'}`}>
                            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(price.usd_24h_change).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
