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
import {
  useCurrencyExchange,
  useLiveRates,
  type CrossAssetDirection,
} from '../../hooks/useCurrencyExchange';
import { useFiatBalances } from '../../hooks/useFiatBalances';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import {
  getLocalizedBalanceRestrictionMessage,
  getLocalizedRestrictedBalanceCountMessage,
} from '../../lib/balanceStatusI18n';
import '../../i18n/dashboard-currency-exchange/translations';

type CurrencyExchangeControlPanelProps = {
  userId?: string;
  variant?: 'dashboard' | 'crm';
  onSuccess?: () => Promise<void> | void;
};

const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  USDT: 'Tether',
  USDC: 'USD Coin',
};

function getCrossAssetRate(
  direction: CrossAssetDirection,
  fiatAsset: string,
  cryptoAsset: string,
  rates: Record<string, Record<string, number>>,
  cryptoPrices: Record<string, { usd: number }>,
) {
  const fiatToUsdRate = fiatAsset === 'USD'
    ? 1
    : rates[fiatAsset]?.USD || (rates.USD?.[fiatAsset] ? 1 / rates.USD[fiatAsset] : 0);
  const usdToFiatRate = fiatAsset === 'USD'
    ? 1
    : rates.USD?.[fiatAsset] || (rates[fiatAsset]?.USD ? 1 / rates[fiatAsset].USD : 0);
  const cryptoUsdPrice = cryptoPrices[cryptoAsset]?.usd || 0;

  if (direction === 'fiat_to_crypto') {
    return fiatToUsdRate > 0 && cryptoUsdPrice > 0 ? fiatToUsdRate / cryptoUsdPrice : 0;
  }

  return cryptoUsdPrice > 0 && usdToFiatRate > 0 ? cryptoUsdPrice * usdToFiatRate : 0;
}

function formatFiat(amount: number, currency: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

function getCurrencySymbol(currency: string) {
  if (!currency) return '';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0).find((part) => part.type === 'currency')?.value || currency;
  } catch {
    return currency;
  }
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
  const { loading, executeExchange, executeCryptoSwap, executeCrossAssetExchange } = useCurrencyExchange(userId);
  const { fiatBalances, loading: fiatLoading, refetch: refetchFiat } = useFiatBalances(userId);
  const { cryptoBalances, loading: cryptoLoading, refetch: refetchCrypto } = useCryptoBalances(userId);
  const fiatRateCurrencies = fiatBalances.map((balance) => balance.currency);
  const cryptoRateSymbols = cryptoBalances.map((balance) => balance.symbol);
  const {
    rates,
    cryptoPrices,
    fetchedAt,
    loading: ratesLoading,
    ready: ratesReady,
    error: ratesError,
    unsupportedFiatCurrencies,
    unsupportedCryptoSymbols,
    refetchRates,
  } = useLiveRates(fiatRateCurrencies, cryptoRateSymbols);
  const isCrmVariant = variant === 'crm';
  const isLoading = loading || fiatLoading || cryptoLoading || !ratesReady || (ratesLoading && !fetchedAt);
  const availableFiatBalances = fiatBalances.filter((balance) => isBalanceAvailable(balance.status));
  const availableCryptoBalances = cryptoBalances.filter((balance) => isBalanceAvailable(balance.status));
  const exchangeableFiatBalances = availableFiatBalances.filter((balance) => Boolean(rates[balance.currency]));
  const exchangeableCryptoBalances = availableCryptoBalances.filter((balance) => Boolean(cryptoPrices[balance.symbol]));
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

  const [crossDirection, setCrossDirection] = useState<CrossAssetDirection>('fiat_to_crypto');
  const [crossFromAsset, setCrossFromAsset] = useState('');
  const [crossToAsset, setCrossToAsset] = useState('');
  const [crossAmount, setCrossAmount] = useState('');
  const [crossSubmitting, setCrossSubmitting] = useState(false);
  const [crossResult, setCrossResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setFromCurrency('');
    setToCurrency('');
    setFiatAmount('');
    setFiatResult(null);
    setFromCrypto('');
    setToCrypto('');
    setCryptoAmount('');
    setCryptoResult(null);
    setCrossDirection('fiat_to_crypto');
    setCrossFromAsset('');
    setCrossToAsset('');
    setCrossAmount('');
    setCrossResult(null);
  }, [userId]);

  const cryptoSymbols = exchangeableCryptoBalances.map((balance) => balance.symbol);
  const fiatOptions = exchangeableFiatBalances.map((balance) => {
    const currency = balance.currency;
    const currencyName = balance.name.trim() || currency;
    return {
      value: currency,
      label: `${currencyName} (${currency}) - ${formatFiat(balance.balance, currency)}`,
      icon: (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#006446]/10 text-[10px] font-semibold text-[#006446]">
          {currency}
        </span>
      ),
    };
  });
  const cryptoOptions = exchangeableCryptoBalances.map((balance) => {
    const symbol = balance.symbol;
    return {
      value: symbol,
      label: `${balance.name.trim() || CRYPTO_NAMES[symbol] || symbol} (${symbol}) - ${formatCryptoAmount(balance.balance)}`,
      icon: (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#006446]/10 text-[10px] font-semibold text-[#006446]">
          {symbol.slice(0, 2)}
        </span>
      ),
    };
  });
  const liveFiatPairs = exchangeableFiatBalances.flatMap((fromBalance, fromIndex) =>
    exchangeableFiatBalances
      .slice(fromIndex + 1)
      .filter((toBalance) => rates[fromBalance.currency]?.[toBalance.currency])
      .map((toBalance) => ({
        from: fromBalance.currency,
        to: toBalance.currency,
        rate: rates[fromBalance.currency][toBalance.currency],
      }))
  );
  const unsupportedConfiguredFiat = unsupportedFiatCurrencies.filter((currency) =>
    availableFiatBalances.some((balance) => balance.currency === currency)
  );
  const unsupportedConfiguredCrypto = unsupportedCryptoSymbols.filter((symbol) =>
    availableCryptoBalances.some((balance) => balance.symbol === symbol)
  );

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

  const crossSourceIsFiat = crossDirection === 'fiat_to_crypto';
  const crossNum = parseFloat(crossAmount) || 0;
  const crossFromBalance = crossSourceIsFiat
    ? availableFiatBalances.find((balance) => balance.currency === crossFromAsset)
    : availableCryptoBalances.find((balance) => balance.symbol === crossFromAsset);
  const crossInsufficient = crossFromBalance ? crossNum > crossFromBalance.balance : false;
  const crossFiatAsset = crossSourceIsFiat ? crossFromAsset : crossToAsset;
  const crossCryptoAsset = crossSourceIsFiat ? crossToAsset : crossFromAsset;
  const fiatToUsdRate = crossFiatAsset === 'USD'
    ? 1
    : rates[crossFiatAsset]?.USD || (rates.USD?.[crossFiatAsset] ? 1 / rates.USD[crossFiatAsset] : 0);
  const crossCryptoUsdPrice = cryptoPrices[crossCryptoAsset]?.usd || 0;
  const crossRate = getCrossAssetRate(
    crossDirection,
    crossFiatAsset,
    crossCryptoAsset,
    rates,
    cryptoPrices,
  );
  const crossConvertedAmount = crossNum * crossRate;
  const crossValueUsd = crossSourceIsFiat
    ? crossNum * fiatToUsdRate
    : crossNum * crossCryptoUsdPrice;

  function timeAgo(isoStr: string) {
    const diff = Date.now() - new Date(isoStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}${t('dashboardCurrencyExchange.time.secondsAgo')}`;
    const mins = Math.floor(secs / 60);
    return `${mins}${t('dashboardCurrencyExchange.time.minutesAgo')}`;
  }

  async function handleAfterSuccess(kind: 'fiat' | 'crypto' | 'both') {
    if (kind === 'fiat' || kind === 'both') {
      await refetchFiat();
    }
    if (kind === 'crypto' || kind === 'both') {
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

  const handleCrossAssetExchange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !crossFromAsset ||
      !crossToAsset ||
      crossNum <= 0 ||
      crossRate <= 0 ||
      crossInsufficient
    ) return;

    setCrossSubmitting(true);
    setCrossResult(null);

    const latestMarket = await refetchRates();
    if (!latestMarket) {
      setCrossResult({ success: false, message: 'Unable to load a current market quote. Please try again.' });
      setCrossSubmitting(false);
      return;
    }

    const liveRate = getCrossAssetRate(
      crossDirection,
      crossFiatAsset,
      crossCryptoAsset,
      latestMarket.rates,
      latestMarket.crypto || {},
    );
    if (liveRate <= 0) {
      setCrossResult({ success: false, message: 'A live rate is not available for this pair.' });
      setCrossSubmitting(false);
      return;
    }

    const liveConvertedAmount = crossNum * liveRate;
    const received = crossSourceIsFiat
      ? parseFloat(liveConvertedAmount.toFixed(8))
      : Math.round(liveConvertedAmount * 100) / 100;
    const result = await executeCrossAssetExchange({
      direction: crossDirection,
      fromAsset: crossFromAsset,
      toAsset: crossToAsset,
      fromAmount: crossNum,
      toAmount: received,
      exchangeRate: liveRate,
    });

    if (result.error) {
      setCrossResult({ success: false, message: result.error });
    } else {
      const sentLabel = crossSourceIsFiat
        ? formatFiat(crossNum, crossFromAsset)
        : `${formatCryptoAmount(crossNum)} ${crossFromAsset}`;
      const receivedLabel = crossSourceIsFiat
        ? `${formatCryptoAmount(received)} ${crossToAsset}`
        : formatFiat(received, crossToAsset);
      setCrossResult({
        success: true,
        message: `${t('dashboardCurrencyExchange.messages.exchanged')} ${sentLabel} ${t('dashboardCurrencyExchange.messages.to')} ${receivedLabel}`,
      });
      setCrossAmount('');
      await handleAfterSuccess('both');
    }

    setCrossSubmitting(false);
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

      {(unsupportedConfiguredFiat.length > 0 || unsupportedConfiguredCrypto.length > 0) && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Live quotes are unavailable for{' '}
            {[...unsupportedConfiguredFiat, ...unsupportedConfiguredCrypto].join(', ')}.
            Those balances remain visible in the account but are excluded from exchange controls.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-visible rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="rounded-t-2xl border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.04] to-white px-6 py-4">
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
                {getLocalizedRestrictedBalanceCountMessage(t, 'exchangeFiat', restrictedFiatCount)}
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
                  options={fiatOptions}
                  placeholder={t('dashboardCurrencyExchange.placeholders.selectCurrency')}
                  className="w-full"
                  searchable={fiatOptions.length > 6}
                  searchPlaceholder="Search currencies..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fields.amount')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 flex w-12 -translate-y-1/2 items-center text-sm font-semibold text-[#006446]">
                    {getCurrencySymbol(fromCurrency)}
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
                  options={fiatOptions.filter((option) => option.value !== fromCurrency)}
                  placeholder={t('dashboardCurrencyExchange.placeholders.selectCurrency')}
                  className="w-full"
                  searchable={fiatOptions.length > 6}
                  searchPlaceholder="Search currencies..."
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
                disabled={fiatSubmitting || fiatNum <= 0 || fiatRate <= 0 || fromCurrency === toCurrency || fiatInsufficient || exchangeableFiatBalances.length < 2}
                className="w-full rounded-xl bg-[#006446] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-200 disabled:text-slate-400"
              >
                {fiatSubmitting ? t('dashboardCurrencyExchange.actions.processing') : t('dashboardCurrencyExchange.actions.exchange')}
              </button>

              {exchangeableFiatBalances.length < 2 ? (
                <p className="text-xs text-slate-400">
                  {getLocalizedBalanceRestrictionMessage(t, 'needTwoFiat')}
                </p>
              ) : null}
            </form>

            {liveFiatPairs.length > 0 && (
              <div className="mt-5 border-t border-[#006446]/10 pt-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#006446]/70">
                  {t('dashboardCurrencyExchange.fiat.liveRates')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {liveFiatPairs.map(({ from, to, rate }) => (
                    <div key={`${from}-${to}`} className="flex items-center justify-between rounded-xl border border-[#006446]/10 bg-[#006446]/[0.04] px-3 py-2">
                      <span className="text-xs font-medium text-[#006446]">{from}/{to}</span>
                      <span className="text-xs font-mono text-slate-900">{rate.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-visible rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="rounded-t-2xl border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.04] to-white px-6 py-4">
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
                {getLocalizedRestrictedBalanceCountMessage(t, 'exchangeCrypto', restrictedCryptoCount)}
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
                  options={cryptoOptions}
                  placeholder={t('dashboardCurrencyExchange.placeholders.selectToken')}
                  className="w-full"
                  searchable={cryptoOptions.length > 6}
                  searchPlaceholder="Search tokens..."
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
                  options={cryptoOptions.filter((option) => option.value !== fromCrypto)}
                  placeholder={t('dashboardCurrencyExchange.placeholders.selectToken')}
                  className="w-full"
                  searchable={cryptoOptions.length > 6}
                  searchPlaceholder="Search tokens..."
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
                disabled={cryptoSubmitting || cryptoNum <= 0 || !fromCrypto || !toCrypto || fromCrypto === toCrypto || cryptoInsufficient || toPrice <= 0 || exchangeableCryptoBalances.length < 2}
                className="w-full rounded-xl bg-[#006446] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-200 disabled:text-slate-400"
              >
                {cryptoSubmitting ? t('dashboardCurrencyExchange.actions.processing') : t('dashboardCurrencyExchange.actions.swap')}
              </button>

              {exchangeableCryptoBalances.length < 2 ? (
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

      <div className="overflow-visible rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="rounded-t-2xl border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.08] via-[#006446]/[0.03] to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#006446]/10">
              <ArrowRightLeft className="h-5 w-5 text-[#006446]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                {t('dashboardCurrencyExchange.cross.title')}
              </h2>
              <p className="text-[11px] text-[#006446]/70">
                {t('dashboardCurrencyExchange.cross.liveRatesSource')}
              </p>
            </div>
          </div>
        </div>

        {crossResult && (
          <div className="flex items-center gap-2 border-b border-[#006446]/10 bg-[#006446]/[0.04] px-4 py-2.5 text-sm text-[#006446]">
            {crossResult.success ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{crossResult.message}</span>
          </div>
        )}

        <form onSubmit={handleCrossAssetExchange} className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
              {t('dashboardCurrencyExchange.cross.direction')}
            </label>
            <Dropdown
              value={crossDirection}
              onChange={(value) => {
                setCrossDirection(value as CrossAssetDirection);
                setCrossFromAsset('');
                setCrossToAsset('');
                setCrossAmount('');
                setCrossResult(null);
              }}
              options={[
                { value: 'fiat_to_crypto', label: t('dashboardCurrencyExchange.cross.fiatToCrypto') },
                { value: 'crypto_to_fiat', label: t('dashboardCurrencyExchange.cross.cryptoToFiat') },
              ]}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)_auto_minmax(0,1fr)] lg:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                {t('dashboardCurrencyExchange.fields.from')}
              </label>
              <Dropdown
                value={crossFromAsset}
                onChange={(value) => {
                  setCrossFromAsset(value);
                  setCrossAmount('');
                  setCrossResult(null);
                }}
                options={(crossSourceIsFiat ? fiatOptions : cryptoOptions).filter((option) =>
                  crossSourceIsFiat
                    ? exchangeableFiatBalances.some((balance) => balance.currency === option.value)
                    : exchangeableCryptoBalances.some((balance) => balance.symbol === option.value)
                )}
                placeholder={crossSourceIsFiat
                  ? t('dashboardCurrencyExchange.placeholders.selectCurrency')
                  : t('dashboardCurrencyExchange.placeholders.selectToken')}
                searchable={(crossSourceIsFiat ? fiatOptions : cryptoOptions).length > 6}
                searchPlaceholder={crossSourceIsFiat ? 'Search currencies...' : 'Search tokens...'}
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
                value={crossAmount}
                onChange={(event) => setCrossAmount(event.target.value)}
                placeholder={t('dashboardCurrencyExchange.placeholders.amount')}
                className="w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] px-3 py-2.5 text-sm text-slate-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                required
              />
              {crossFromBalance && (
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className={`text-[11px] ${crossInsufficient ? 'font-medium text-[#006446]' : 'text-[#006446]/70'}`}>
                    {t('dashboardCurrencyExchange.balance')}: {crossSourceIsFiat
                      ? formatFiat(crossFromBalance.balance, crossFromAsset)
                      : `${formatCryptoAmount(crossFromBalance.balance)} ${crossFromAsset}`}
                    {crossInsufficient && ` -- ${t('dashboardCurrencyExchange.insufficient')}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCrossAmount(String(crossFromBalance.balance))}
                    className="text-[11px] font-semibold text-[#006446] hover:text-[#00523a]"
                  >
                    {t('dashboardCurrencyExchange.actions.max')}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setCrossDirection(crossSourceIsFiat ? 'crypto_to_fiat' : 'fiat_to_crypto');
                setCrossFromAsset(crossToAsset);
                setCrossToAsset(crossFromAsset);
                setCrossAmount('');
                setCrossResult(null);
              }}
              title={t('dashboardCurrencyExchange.cross.reverse')}
              aria-label={t('dashboardCurrencyExchange.cross.reverse')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10 transition-colors hover:bg-[#006446]/15"
            >
              <ArrowRightLeft className="h-4 w-4 text-[#006446]" />
            </button>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#006446]/70">
                {t('dashboardCurrencyExchange.fields.to')}
              </label>
              <Dropdown
                value={crossToAsset}
                onChange={(value) => {
                  setCrossToAsset(value);
                  setCrossResult(null);
                }}
                options={(crossSourceIsFiat ? cryptoOptions : fiatOptions).filter((option) =>
                  crossSourceIsFiat
                    ? exchangeableCryptoBalances.some((balance) => balance.symbol === option.value)
                    : exchangeableFiatBalances.some((balance) => balance.currency === option.value)
                )}
                placeholder={crossSourceIsFiat
                  ? t('dashboardCurrencyExchange.placeholders.selectToken')
                  : t('dashboardCurrencyExchange.placeholders.selectCurrency')}
                searchable={(crossSourceIsFiat ? cryptoOptions : fiatOptions).length > 6}
                searchPlaceholder={crossSourceIsFiat ? 'Search tokens...' : 'Search currencies...'}
              />
            </div>
          </div>

          {crossFromAsset && crossToAsset && crossNum > 0 && crossRate > 0 && (
            <div className="grid gap-2 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-[#006446]/70">{t('dashboardCurrencyExchange.summary.rate')}</p>
                <p className="mt-1 font-medium text-slate-900">
                  1 {crossFromAsset} = {crossSourceIsFiat ? formatCryptoAmount(crossRate) : crossRate.toFixed(2)} {crossToAsset}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#006446]/70">{t('dashboardCurrencyExchange.summary.value')}</p>
                <p className="mt-1 font-medium text-slate-900">{formatUsd(crossValueUsd)}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#006446]/70">{t('dashboardCurrencyExchange.summary.youReceive')}</p>
                <p className="mt-1 font-bold text-[#006446]">
                  {crossSourceIsFiat
                    ? `${formatCryptoAmount(crossConvertedAmount)} ${crossToAsset}`
                    : formatFiat(crossConvertedAmount, crossToAsset)}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              crossSubmitting ||
              ratesLoading ||
              !crossFromAsset ||
              !crossToAsset ||
              crossNum <= 0 ||
              crossRate <= 0 ||
              crossInsufficient ||
              exchangeableFiatBalances.length === 0 ||
              exchangeableCryptoBalances.length === 0
            }
            className="w-full rounded-xl bg-[#006446] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-200 disabled:text-slate-400"
          >
            {crossSubmitting
              ? t('dashboardCurrencyExchange.actions.processing')
              : t('dashboardCurrencyExchange.cross.convert')}
          </button>
        </form>
      </div>
    </div>
  );
}
