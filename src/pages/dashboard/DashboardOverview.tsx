import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Copy,
  Eye,
  EyeOff,
  Receipt,
  DollarSign,
  Euro,
  CreditCard,
  Zap,
  FileText,
  PauseCircle,
  Clock,
  CheckCircle,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '../../hooks/useBankingData';
import { useFiatBalances } from '../../hooks/useFiatBalances';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useAuth } from '../../contexts/AuthContext';
import BalanceAnalysisChart from '../../components/dashboard/BalanceAnalysisChart';
import { useTaxSummary } from '../../hooks/useTaxSummary';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getBalanceStatusClasses,
  getBalanceStatusLabel,
  getHiddenBalanceDescription,
  getHiddenBalanceLabel,
  isBalanceAvailable,
} from '../../lib/balanceStatus';
import '../../i18n/dashboardOverview/translations';

const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string }> = {
  USD: { symbol: 'USD', locale: 'en-US' },
  EUR: { symbol: 'EUR', locale: 'de-DE' },
  CAD: { symbol: 'CAD', locale: 'en-CA' },
};

const CURRENCY_ICONS: Record<string, typeof DollarSign> = {
  USD: DollarSign,
  EUR: Euro,
  CAD: DollarSign,
};

const CRYPTO_LOGOS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png',
};

const CRYPTO_SORT_ORDER: Record<string, number> = {
  BTC: 0,
  ETH: 1,
  USDT: 2,
};

function formatCurrency(amount: number, currency = 'USD') {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  return new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.symbol }).format(amount);
}

function toSentenceCase(value: string) {
  if (!value) return 'Empty';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isBankingInflow(type: string) {
  const normalized = type.toLowerCase();
  return ['credit', 'deposit', 'income', 'refund', 'received'].includes(normalized);
}

function bankingStatusClasses(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'completed') return 'border-[#006446]/15 bg-[#006446]/10 text-[#006446]';
  if (normalized === 'pending') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (normalized === 'failed' || normalized === 'rejected' || normalized === 'cancelled') return 'border-red-200 bg-red-50 text-red-600';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const { fiatBalances, loading: fiatLoading } = useFiatBalances();
  const { transactions, loading: txLoading } = useTransactions();
  const { cryptoBalances, loading: cryptoLoading } = useCryptoBalances();
  const { summary: taxSummary, loading: taxLoading } = useTaxSummary();
  const { t, language } = useLanguage();
  const [showBalances, setShowBalances] = useState(true);
  const [ibanCopied, setIbanCopied] = useState(false);

  const recentTransactions = transactions.slice(0, 8);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboardOverview.greeting.morning');
    if (hour < 18) return t('dashboardOverview.greeting.afternoon');
    return t('dashboardOverview.greeting.evening');
  };

  const formatDate = (dateStr: string) => {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      it: 'it-IT',
      el: 'el-GR',
    };

    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const completedTransactions = transactions.filter((tx) => tx.status === 'completed').length;
  const pendingTransactions = transactions.filter((tx) => tx.status === 'pending').length;
  const availableFiatBalances = fiatBalances.filter((balance) => isBalanceAvailable(balance.status));
  const availableCryptoBalances = cryptoBalances.filter((balance) => isBalanceAvailable(balance.status));
  const restrictedBalanceCount =
    fiatBalances.filter((balance) => !isBalanceAvailable(balance.status)).length +
    cryptoBalances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  const handleCopyIban = async () => {
    const iban = profile?.account_iban?.trim();
    if (!iban) return;

    try {
      await navigator.clipboard.writeText(iban);
      setIbanCopied(true);
      window.setTimeout(() => setIbanCopied(false), 1600);
    } catch {
      setIbanCopied(false);
    }
  };

  if (fiatLoading || txLoading || cryptoLoading || taxLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {greeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || t('dashboardOverview.greeting.fallbackName')}
          </h1>
          <div className="mt-3 w-full max-w-5xl border border-[#006446]/14 bg-white px-5 py-4 shadow-[0_20px_50px_-42px_rgba(0,100,70,0.4)] sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#006446]">Your Account IBAN</p>
                <p className="mt-2 break-all font-mono text-lg font-semibold text-slate-800 sm:text-2xl">
                  {profile?.account_iban || 'Not assigned'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyIban()}
                disabled={!profile?.account_iban}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 border border-[#006446]/14 bg-[#006446]/[0.04] px-4 text-sm font-semibold text-[#006446] transition-colors hover:bg-[#006446]/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ibanCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {ibanCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="flex items-center gap-2 self-start text-sm text-[#006446] transition-colors hover:text-[#004d36] sm:self-start"
        >
          {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showBalances ? t('dashboardOverview.actions.hide') : t('dashboardOverview.actions.show')} {t('dashboardOverview.actions.balances')}
        </button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#006446]">
          {t('dashboardOverview.sections.fiatCurrencies')}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fiatBalances.map((fb) => {
            const CurrIcon = CURRENCY_ICONS[fb.currency] || DollarSign;
            const canShowAmount = showBalances && isBalanceAvailable(fb.status);

            return (
              <div
                key={fb.id}
                className={`border p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] transition-all duration-200 hover:shadow-[0_24px_70px_-44px_rgba(0,100,70,0.55)] ${
                  isBalanceAvailable(fb.status)
                    ? 'border-[#006446]/14 bg-white hover:border-[#006446]/30'
                    : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#006446]/10">
                      <CurrIcon className="w-4 h-4 text-[#006446]" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#006446]">
                      {fb.currency}
                    </span>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getBalanceStatusClasses(fb.status)}`}>
                    {getBalanceStatusLabel(fb.status)}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {fb.currency === 'USD'
                    ? t('dashboardOverview.currencies.usd')
                    : fb.currency === 'EUR'
                    ? t('dashboardOverview.currencies.eur')
                    : t('dashboardOverview.currencies.cad')}
                </p>
                <p className={`text-2xl font-bold ${canShowAmount ? 'text-slate-900' : 'text-slate-500'}`}>
                  {canShowAmount
                    ? formatCurrency(fb.balance, fb.currency)
                    : showBalances
                    ? getHiddenBalanceLabel(fb.status)
                    : '****'}
                </p>
                {!isBalanceAvailable(fb.status) && showBalances ? (
                  <p className="mt-2 text-xs text-slate-500">{getHiddenBalanceDescription(fb.status)}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {cryptoBalances.length > 0 && (
        <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#006446]">
          {t('dashboardOverview.sections.cryptoAssets')}
        </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...cryptoBalances]
              .sort((a, b) => (CRYPTO_SORT_ORDER[a.symbol] ?? 99) - (CRYPTO_SORT_ORDER[b.symbol] ?? 99))
              .map((crypto) => {
                const canShowAmount = showBalances && isBalanceAvailable(crypto.status);

                return (
                  <div
                    key={crypto.id}
                    className={`border p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] transition-all duration-200 hover:shadow-[0_24px_70px_-44px_rgba(0,100,70,0.55)] ${
                      isBalanceAvailable(crypto.status)
                        ? 'border-[#006446]/14 bg-white hover:border-[#006446]/30'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        {CRYPTO_LOGOS[crypto.symbol] ? (
                          <img
                            src={CRYPTO_LOGOS[crypto.symbol]}
                            alt={crypto.name}
                            className="w-7 h-7 rounded-full"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#006446]/10">
                            <span className="text-[10px] font-bold text-[#006446]">{crypto.symbol.slice(0, 2)}</span>
                          </div>
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#006446]">
                          {crypto.symbol}
                        </span>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getBalanceStatusClasses(crypto.status)}`}>
                        {getBalanceStatusLabel(crypto.status)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1">{crypto.name}</p>
                    <p className={`text-2xl font-bold ${canShowAmount ? 'text-slate-900' : 'text-slate-500'}`}>
                      {canShowAmount
                        ? crypto.balance.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })
                        : showBalances
                        ? getHiddenBalanceLabel(crypto.status)
                        : '****'}
                    </p>
                    {!isBalanceAvailable(crypto.status) && showBalances ? (
                      <p className="mt-2 text-xs text-slate-500">{getHiddenBalanceDescription(crypto.status)}</p>
                    ) : null}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {restrictedBalanceCount > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {restrictedBalanceCount} restricted balance{restrictedBalanceCount === 1 ? '' : 's'} hidden from charts and totals until marked available.
        </div>
      ) : null}

      <BalanceAnalysisChart
        fiatBalances={availableFiatBalances}
        cryptoBalances={availableCryptoBalances}
        showBalances={showBalances}
      />

      <div className="border border-[#006446]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] transition-all duration-200 hover:shadow-[0_24px_70px_-44px_rgba(0,100,70,0.55)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#006446]/10">
              <FileText className="w-5 h-5 text-[#006446]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{t('dashboardOverview.tax.title')}</h2>
              <p className="text-xs text-[#006446]">{t('dashboardOverview.tax.subtitle')}</p>
            </div>
          </div>
          <Link
            to="/dashboard/taxes"
            className="text-sm font-medium text-[#006446] hover:text-[#004d36]"
          >
            {t('dashboardOverview.tax.payTaxes')}
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4">
            <div className="flex items-center gap-1.5 mb-1">
              {taxSummary.totals.pending > 0 && <Clock className="w-3.5 h-3.5 text-[#006446]" />}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#006446]">
                {t('dashboardOverview.tax.pending')}
              </p>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {showBalances ? formatCurrency(taxSummary.totals.pending) : '****'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4">
            <div className="flex items-center gap-1.5 mb-1">
              {taxSummary.totals.on_hold > 0 && <PauseCircle className="w-3.5 h-3.5 text-[#006446]" />}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#006446]">
                {t('dashboardOverview.tax.onHold')}
              </p>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {showBalances ? formatCurrency(taxSummary.totals.on_hold) : '****'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4">
            <div className="flex items-center gap-1.5 mb-1">
              {taxSummary.totals.paid > 0 && <CheckCircle className="w-3.5 h-3.5 text-[#006446]" />}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#006446]">
                {t('dashboardOverview.tax.paid')}
              </p>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {showBalances ? formatCurrency(taxSummary.totals.paid) : '****'}
            </p>
          </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="flex items-center justify-between border-b border-[#006446]/10 px-6 py-4">
            <h2 className="font-semibold text-slate-900">{t('dashboardOverview.transactions.title')}</h2>
            <Link to="/dashboard/transactions" className="text-sm font-medium text-[#006446] hover:text-[#004d36]">
              {t('dashboardOverview.viewAll')}
            </Link>
          </div>

          <div className="divide-y divide-[#006446]/10">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#006446]/[0.03]">
                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${isBankingInflow(tx.type) ? 'bg-[#006446]/10 text-[#006446]' : 'bg-slate-100 text-slate-600'}`}>
                  {isBankingInflow(tx.type) ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{tx.details || 'No details'}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs text-slate-400">{formatDate(tx.created_at)}</p>
                    <span className="rounded-full border border-[#006446]/12 bg-[#006446]/[0.03] px-2 py-0.5 text-[11px] font-medium text-[#006446]">
                      {tx.poi || 'No POI'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right flex-shrink-0">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${bankingStatusClasses(tx.status)}`}>
                    {tx.status || 'completed'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600">
                    {toSentenceCase(tx.type)}
                  </span>
                </div>
              </div>
            ))}

            {recentTransactions.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-400">
                {t('dashboardOverview.transactions.empty')}
              </div>
            )}
          </div>
        </div>

        <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="border-b border-[#006446]/10 px-6 py-4">
            <h2 className="font-semibold text-slate-900">{t('dashboardOverview.quickActions.title')}</h2>
          </div>

          <div className="p-4 space-y-2">
            <Link
              to="/dashboard/transfers"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[#006446]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10">
                <Send className="w-5 h-5 text-[#006446]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{t('dashboardOverview.quickActions.transferMoney')}</p>
                <p className="text-xs text-[#006446]">{t('dashboardOverview.quickActions.transferMoneyDesc')}</p>
              </div>
            </Link>

            <Link
              to="/dashboard/transactions"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[#006446]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10">
                <Receipt className="w-5 h-5 text-[#006446]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{t('dashboardOverview.quickActions.transactionHistory')}</p>
                <p className="text-xs text-[#006446]">{t('dashboardOverview.quickActions.transactionHistoryDesc')}</p>
              </div>
            </Link>

            <Link
              to="/dashboard/cards"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[#006446]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10">
                <CreditCard className="w-5 h-5 text-[#006446]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{t('dashboardOverview.quickActions.manageCards')}</p>
                <p className="text-xs text-[#006446]">{t('dashboardOverview.quickActions.manageCardsDesc')}</p>
              </div>
            </Link>

            <Link
              to="/dashboard/bill-pay"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[#006446]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10">
                <Zap className="w-5 h-5 text-[#006446]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{t('dashboardOverview.quickActions.payBills')}</p>
                <p className="text-xs text-[#006446]">{t('dashboardOverview.quickActions.payBillsDesc')}</p>
              </div>
            </Link>
          </div>

          <div className="border-t border-[#006446]/10 px-6 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#006446]">
              {t('dashboardOverview.monthlySummary.title')}
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#006446]" />
                  <span className="text-sm text-slate-600">Completed</span>
                </div>
                <span className="text-sm font-semibold text-[#006446]">{completedTransactions}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#006446]" />
                  <span className="text-sm text-slate-600">Pending</span>
                </div>
                <span className="text-sm font-semibold text-[#006446]">{pendingTransactions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
