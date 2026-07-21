import {
  CreditCard,
  Send,
  FileText,
  Landmark,
  Wallet,
} from 'lucide-react';
import { useLanguage, type Language } from '../../contexts/LanguageContext';
import '../../i18n/dashboardcards/translations';

const FIAT_USD: Record<string, number> = { USD: 1, EUR: 1.08, CAD: 0.74, CHF: 1.12 };
const CRYPTO_USD: Record<string, number> = { BTC: 62000, ETH: 3400, SOL: 145, USDC: 1, USDT: 1 };

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  el: 'el-GR',
};

function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

function useFormatters() {
  const { language } = useLanguage();
  const locale = LOCALE_MAP[language];

  const formatUsd = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const formatPercent = (amount: number, digits = 1) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);

  const formatUnits = (amount: number, digits = 4) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }).format(amount);

  return { formatUsd, formatPercent, formatUnits };
}

export function AssetAllocationCard({
  fiatBalances,
  cryptoBalances,
  fiatTotalUsd,
  cryptoTotalUsd,
  fiatPct,
  cryptoPct,
  totalBalance,
}: {
  fiatBalances: { currency: string; balance: number }[];
  cryptoBalances: { symbol: string; name: string; balance: number }[];
  fiatTotalUsd: number;
  cryptoTotalUsd: number;
  fiatPct: number;
  cryptoPct: number;
  totalBalance: number;
}) {
  const { t } = useLanguage();
  const { formatUsd, formatPercent } = useFormatters();

  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex items-center gap-3 border-b border-[#006446]/10 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006446]/10">
          <Wallet className="h-4 w-4 text-[#006446]" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{t('dashboard.assetAllocation.title')}</h2>
          <p className="text-xs text-[#006446]/70">{t('dashboard.assetAllocation.subtitle')}</p>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-800">
              {t('dashboard.assetAllocation.fiatCurrencies')}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#006446]/70">{formatPercent(fiatPct)}%</span>
              <span className="text-sm font-bold text-slate-900">{formatUsd(fiatTotalUsd)}</span>
            </div>
          </div>
          <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-[#006446]/10">
            <div className="h-full rounded-full bg-[#006446] transition-all duration-700" style={{ width: `${fiatPct}%` }} />
          </div>
          <div className="space-y-1.5 pl-2">
            {fiatBalances.map((fb) => {
              const usd = fb.balance * (FIAT_USD[fb.currency] || 1);
              const pct = totalBalance > 0 ? (usd / totalBalance) * 100 : 0;

              return (
                <div key={fb.currency} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#006446]" />
                    <span className="text-[#006446]/70">{fb.currency}</span>
                  </div>
                  <span className="font-medium text-slate-800">
                    {formatUsd(usd)} ({formatPercent(pct)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#006446]/10 pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-800">
              {t('dashboard.assetAllocation.cryptoAssets')}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#006446]/70">{formatPercent(cryptoPct)}%</span>
              <span className="text-sm font-bold text-slate-900">{formatUsd(cryptoTotalUsd)}</span>
            </div>
          </div>
          <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-[#006446]/10">
            <div className="h-full rounded-full bg-[#006446] transition-all duration-700" style={{ width: `${cryptoPct}%` }} />
          </div>
          <div className="space-y-1.5 pl-2">
            {cryptoBalances.filter((c) => c.balance > 0).map((cb) => {
              const usd = cb.balance * (CRYPTO_USD[cb.symbol] || 1);
              const pct = totalBalance > 0 ? (usd / totalBalance) * 100 : 0;

              return (
                <div key={cb.symbol} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#006446]" />
                    <span className="text-[#006446]/70">{cb.symbol}</span>
                  </div>
                  <span className="font-medium text-slate-800">
                    {formatUsd(usd)} ({formatPercent(pct)}%)
                  </span>
                </div>
              );
            })}

            {cryptoBalances.filter((c) => c.balance > 0).length === 0 && (
              <p className="text-xs text-[#006446]/70">{t('dashboard.assetAllocation.noCryptoHoldings')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TransfersCard({
  bankTransferCount,
  bankTransferVolume,
  bankTransferPending,
  cryptoTransferCount,
  cryptoTransferVolume,
  cryptoTransferPending,
  exchangeCount,
  exchangeVolume,
}: {
  bankTransferCount: number;
  bankTransferVolume: number;
  bankTransferPending: number;
  cryptoTransferCount: number;
  cryptoTransferVolume: number;
  cryptoTransferPending: number;
  exchangeCount: number;
  exchangeVolume: number;
}) {
  const { t } = useLanguage();
  const { formatUsd, formatUnits } = useFormatters();

  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex items-center gap-3 border-b border-[#006446]/10 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006446]/10">
          <Send className="h-4 w-4 text-[#006446]" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{t('dashboard.transfers.title')}</h2>
          <p className="text-xs text-[#006446]/70">{t('dashboard.transfers.subtitle')}</p>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-800">{t('dashboard.transfers.bankTransfers')}</span>
            <span className="text-sm font-bold text-slate-900">{bankTransferCount}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-xs text-[#006446]/70">
            <span>
              {interpolate(t('dashboard.transfers.totalVolume'), {
                amount: formatUsd(bankTransferVolume),
              })}
            </span>
            {bankTransferPending > 0 && (
              <span className="font-medium text-[#006446]">
                {interpolate(t('dashboard.transfers.pending'), {
                  count: bankTransferPending,
                })}
              </span>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#006446]/10">
            <div
              className="h-full rounded-full bg-[#006446] transition-all duration-700"
              style={{ width: `${Math.min(100, bankTransferCount * 10)}%` }}
            />
          </div>
        </div>

        <div className="border-t border-[#006446]/10 pt-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-800">{t('dashboard.transfers.cryptoTransfers')}</span>
            <span className="text-sm font-bold text-slate-900">{cryptoTransferCount}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-xs text-[#006446]/70">
            <span>
              {interpolate(t('dashboard.transfers.unitsMoved'), {
                amount: formatUnits(cryptoTransferVolume, 4),
              })}
            </span>
            {cryptoTransferPending > 0 && (
              <span className="font-medium text-[#006446]">
                {interpolate(t('dashboard.transfers.pending'), {
                  count: cryptoTransferPending,
                })}
              </span>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#006446]/10">
            <div
              className="h-full rounded-full bg-[#006446] transition-all duration-700"
              style={{ width: `${Math.min(100, cryptoTransferCount * 10)}%` }}
            />
          </div>
        </div>

        <div className="border-t border-[#006446]/10 pt-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-800">{t('dashboard.transfers.currencyExchanges')}</span>
            <span className="text-sm font-bold text-slate-900">{exchangeCount}</span>
          </div>
          <p className="text-xs text-[#006446]/70">
            {exchangeCount > 0
              ? interpolate(t('dashboard.transfers.exchanged'), {
                  amount: formatUsd(exchangeVolume),
                })
              : t('dashboard.transfers.noExchangesYet')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CardsAndBillsCard({
  activeCards,
  frozenCards,
  totalCards,
  billsPaidCount,
  billsPendingCount,
  billsTotalPaid,
}: {
  activeCards: number;
  frozenCards: number;
  totalCards: number;
  billsPaidCount: number;
  billsPendingCount: number;
  billsTotalPaid: number;
}) {
  const { t } = useLanguage();
  const { formatUsd } = useFormatters();

  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex items-center gap-3 border-b border-[#006446]/10 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006446]/10">
          <CreditCard className="h-4 w-4 text-[#006446]" />
        </div>
        <h2 className="font-semibold text-slate-900">{t('dashboard.cardsBills.title')}</h2>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#006446]/70">
            {t('dashboard.cardsBills.cards')}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{totalCards}</p>
              <p className="mt-0.5 text-[10px] text-[#006446]/70">{t('dashboard.cardsBills.total')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#006446]">{activeCards}</p>
              <p className="mt-0.5 text-[10px] text-[#006446]/70">{t('dashboard.cardsBills.active')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#006446]">{frozenCards}</p>
              <p className="mt-0.5 text-[10px] text-[#006446]/70">{t('dashboard.cardsBills.frozen')}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-[#006446]/10 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#006446]/70">
            {t('dashboard.cardsBills.billPayments')}
          </p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-800">{t('dashboard.cardsBills.paid')}</span>
            <span className="text-sm font-bold text-[#006446]">{billsPaidCount}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-800">{t('dashboard.cardsBills.pending')}</span>
            <span className="text-sm font-bold text-[#006446]">{billsPendingCount}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#006446]/10 pt-2">
            <span className="text-xs text-[#006446]/70">{t('dashboard.cardsBills.totalPaid')}</span>
            <span className="text-sm font-bold text-slate-900">{formatUsd(billsTotalPaid)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoansCard({
  activeCount,
  totalDebt,
  monthlyPayment,
  progress,
  pendingApproval,
}: {
  activeCount: number;
  totalDebt: number;
  monthlyPayment: number;
  progress: number;
  pendingApproval: number;
}) {
  const { t } = useLanguage();
  const { formatUsd, formatPercent } = useFormatters();

  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex items-center gap-3 border-b border-[#006446]/10 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006446]/10">
          <Landmark className="h-4 w-4 text-[#006446]" />
        </div>
        <h2 className="font-semibold text-slate-900">{t('dashboard.loans.title')}</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-800">{t('dashboard.loans.activeLoans')}</span>
          <span className="text-2xl font-bold text-slate-900">{activeCount}</span>
        </div>
        {pendingApproval > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-800">{t('dashboard.loans.pendingApproval')}</span>
            <span className="text-sm font-bold text-[#006446]">{pendingApproval}</span>
          </div>
        )}
        <div className="border-t border-[#006446]/10 pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#006446]/70">{t('dashboard.loans.remainingDebt')}</span>
            <span className="text-sm font-bold text-[#006446]">{formatUsd(totalDebt)}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#006446]/70">{t('dashboard.loans.monthlyPayment')}</span>
            <span className="text-sm font-bold text-slate-800">{formatUsd(monthlyPayment)}</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#006446]/70">{t('dashboard.loans.repaymentProgress')}</span>
              <span className="text-xs font-semibold text-[#006446]">{formatPercent(progress, 0)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#006446]/10">
              <div className="h-full rounded-full bg-[#006446] transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaxCard({
  pendingAmount,
  onHoldAmount,
  paidAmount,
  totalOutstanding,
}: {
  pendingAmount: number;
  onHoldAmount: number;
  paidAmount: number;
  totalOutstanding: number;
}) {
  const { t } = useLanguage();
  const { formatUsd } = useFormatters();

  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex items-center gap-3 border-b border-[#006446]/10 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006446]/10">
          <FileText className="h-4 w-4 text-[#006446]" />
        </div>
        <h2 className="font-semibold text-slate-900">{t('dashboard.taxes.title')}</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-[#006446]">{formatUsd(pendingAmount)}</p>
            <p className="mt-0.5 text-[10px] text-[#006446]/70">{t('dashboard.taxes.pending')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#006446]">{formatUsd(onHoldAmount)}</p>
            <p className="mt-0.5 text-[10px] text-[#006446]/70">{t('dashboard.taxes.onHold')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#006446]">{formatUsd(paidAmount)}</p>
            <p className="mt-0.5 text-[10px] text-[#006446]/70">{t('dashboard.taxes.paid')}</p>
          </div>
        </div>
        <div className="border-t border-[#006446]/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#006446]/70">{t('dashboard.taxes.totalOutstanding')}</span>
            <span className="text-lg font-bold text-slate-900">{formatUsd(totalOutstanding)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
