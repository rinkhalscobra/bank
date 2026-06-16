import { useMemo, useState } from 'react';
import { useTransactions } from '../../hooks/useBankingData';
import { useFiatBalances } from '../../hooks/useFiatBalances';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useBalanceHistory } from '../../hooks/useBalanceHistory';
import { useCards } from '../../hooks/useCards';
import { useTransfers } from '../../hooks/useTransfers';
import { useCryptoTransfers } from '../../hooks/useCryptoWallets';
import { useBillPayments } from '../../hooks/useBillPayments';
import { useLoans } from '../../hooks/useLoans';
import { useCurrencyExchange } from '../../hooks/useCurrencyExchange';
import { useTaxSummary } from '../../hooks/useTaxSummary';
import BalanceHistoryChart from '../../components/dashboard/BalanceHistoryChart';
import {
  AssetAllocationCard,
  TransfersCard,
  CardsAndBillsCard,
  LoansCard,
  TaxCard,
} from '../../components/dashboard/AnalyticsCards';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import { getLocalizedRestrictedBalanceCountMessage } from '../../lib/balanceStatusI18n';
import '../../i18n/dashboard-analytics/translations';

const FIAT_USD: Record<string, number> = { USD: 1, EUR: 1.08, CAD: 0.74 };
const CRYPTO_USD: Record<string, number> = { BTC: 62000, ETH: 3400, SOL: 145, USDC: 1, USDT: 1 };

export default function DashboardAnalytics() {
  const { t } = useLanguage();

  const { transactions, loading } = useTransactions();
  const { fiatBalances } = useFiatBalances();
  const { cryptoBalances } = useCryptoBalances();
  const { assetSeries, loading: historyLoading } = useBalanceHistory();
  const { cards } = useCards();
  const { transfers } = useTransfers();
  const { transfers: cryptoTransfers } = useCryptoTransfers();
  const { payments: billPayments } = useBillPayments();
  const { loans } = useLoans();
  const { summary: taxSummary } = useTaxSummary();
  const { exchanges } = useCurrencyExchange();

  const [period, setPeriod] = useState<'all' | '30' | '90'>('all');

  const filteredTxns = useMemo(() => {
    if (period === 'all') return transactions;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(period));
    return transactions.filter((t) => new Date(t.created_at) >= cutoff);
  }, [transactions, period]);

  const availableFiatBalances = useMemo(
    () => fiatBalances.filter((balance) => isBalanceAvailable(balance.status)),
    [fiatBalances]
  );
  const availableCryptoBalances = useMemo(
    () => cryptoBalances.filter((balance) => isBalanceAvailable(balance.status)),
    [cryptoBalances]
  );
  const visibleAssetSymbols = useMemo(
    () => new Set([...availableFiatBalances.map((balance) => balance.currency), ...availableCryptoBalances.map((balance) => balance.symbol)]),
    [availableFiatBalances, availableCryptoBalances]
  );
  const visibleAssetSeries = useMemo(
    () => assetSeries.filter((series) => visibleAssetSymbols.has(series.symbol)),
    [assetSeries, visibleAssetSymbols]
  );
  const restrictedBalanceCount =
    fiatBalances.filter((balance) => !isBalanceAvailable(balance.status)).length +
    cryptoBalances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  const fiatTotalUsd = availableFiatBalances.reduce((s, b) => s + b.balance * (FIAT_USD[b.currency] || 1), 0);
  const cryptoTotalUsd = availableCryptoBalances.reduce((s, b) => s + b.balance * (CRYPTO_USD[b.symbol] || 1), 0);
  const totalBalance = fiatTotalUsd + cryptoTotalUsd;
  const fiatPct = totalBalance > 0 ? (fiatTotalUsd / totalBalance) * 100 : 0;
  const cryptoPct = totalBalance > 0 ? (cryptoTotalUsd / totalBalance) * 100 : 0;

  const activeCards = cards.filter((c) => c.status === 'active' || c.status === 'approved').length;
  const frozenCards = cards.filter((c) => c.status === 'frozen').length;

  const bankTransferVolume = transfers.reduce((s, t) => s + t.amount, 0);
  const bankTransferPending = transfers.filter((t) => t.status === 'pending').length;
  const cryptoTransferVolume = cryptoTransfers.reduce((s, t) => s + t.amount, 0);
  const cryptoTransferPending = cryptoTransfers.filter((t) => t.status === 'pending').length;

  const billsCompleted = billPayments.filter((b) => b.status === 'completed');
  const billsPending = billPayments.filter((b) => b.status === 'pending');
  const billsTotalPaid = billsCompleted.reduce((s, b) => s + b.amount, 0);

  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalDebt = activeLoans.reduce((s, l) => s + l.remaining_balance, 0);
  const totalMonthlyPayment = activeLoans.reduce((s, l) => s + l.monthly_payment, 0);
  const totalLoanPaid = activeLoans.reduce((s, l) => s + l.total_paid, 0);
  const totalLoanPrincipal = activeLoans.reduce((s, l) => s + l.principal, 0);
  const loanProgress = totalLoanPrincipal > 0 ? (totalLoanPaid / totalLoanPrincipal) * 100 : 0;

  const exchangeVolume = exchanges.reduce((s, e) => s + e.from_amount, 0);

  if (loading || historyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  const completedCount = filteredTxns.filter((t) => t.status === 'completed').length;
  const pendingCount = filteredTxns.filter((t) => t.status === 'pending').length;
  const uniquePoiCount = new Set(filteredTxns.map((t) => t.poi).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {t('dashboardAnalytics.title')}
          </h1>
          <p className="mt-1 text-sm text-[#006446]">
            {t('dashboardAnalytics.subtitle')}
          </p>
        </div>

        <div className="flex self-start gap-1 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] p-1">
          {(
            [
              ['all', t('dashboardAnalytics.periods.all')],
              ['90', t('dashboardAnalytics.periods.90days')],
              ['30', t('dashboardAnalytics.periods.30days')],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key as 'all' | '30' | '90')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                period === key
                  ? 'bg-white text-[#006446] shadow-sm'
                  : 'text-[#006446]/70 hover:text-[#006446]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {restrictedBalanceCount > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {getLocalizedRestrictedBalanceCountMessage(t, 'analytics', restrictedBalanceCount)}
        </div>
      ) : null}

      <BalanceHistoryChart assetSeries={visibleAssetSeries} />

      <div className="grid lg:grid-cols-2 gap-6">
        <AssetAllocationCard
          fiatBalances={availableFiatBalances}
          cryptoBalances={availableCryptoBalances}
          fiatTotalUsd={fiatTotalUsd}
          cryptoTotalUsd={cryptoTotalUsd}
          fiatPct={fiatPct}
          cryptoPct={cryptoPct}
          totalBalance={totalBalance}
        />
        <TransfersCard
          bankTransferCount={transfers.length}
          bankTransferVolume={bankTransferVolume}
          bankTransferPending={bankTransferPending}
          cryptoTransferCount={cryptoTransfers.length}
          cryptoTransferVolume={cryptoTransferVolume}
          cryptoTransferPending={cryptoTransferPending}
          exchangeCount={exchanges.length}
          exchangeVolume={exchangeVolume}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <CardsAndBillsCard
          activeCards={activeCards}
          frozenCards={frozenCards}
          totalCards={cards.length}
          billsPaidCount={billsCompleted.length}
          billsPendingCount={billsPending.length}
          billsTotalPaid={billsTotalPaid}
        />
        <LoansCard
          activeCount={activeLoans.length}
          totalDebt={totalDebt}
          monthlyPayment={totalMonthlyPayment}
          progress={loanProgress}
          pendingApproval={loans.filter((l) => l.status === 'pending_approval').length}
        />
        <TaxCard
          pendingAmount={taxSummary.totals.pending}
          onHoldAmount={taxSummary.totals.on_hold}
          paidAmount={taxSummary.totals.paid}
          totalOutstanding={taxSummary.totals.pending + taxSummary.totals.on_hold}
        />
      </div>

      <div className="rounded-2xl border border-[#006446]/14 bg-white p-6 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <h2 className="mb-4 font-semibold text-slate-900">
          {t('dashboardAnalytics.transactionSummary.title')}
        </h2>

        <div className="grid sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-slate-900">{filteredTxns.length}</p>
            <p className="mt-1 text-xs text-[#006446]/70">
              {t('dashboardAnalytics.transactionSummary.totalTransactions')}
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold text-[#006446]">{completedCount}</p>
            <p className="mt-1 text-xs text-[#006446]/70">Completed</p>
          </div>

          <div>
            <p className="text-3xl font-bold text-[#006446]">{pendingCount}</p>
            <p className="mt-1 text-xs text-[#006446]/70">Pending</p>
          </div>

          <div>
            <p className="text-3xl font-bold text-slate-900">{uniquePoiCount}</p>
            <p className="mt-1 text-xs text-[#006446]/70">Unique POIs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
