import { useState } from 'react';
import {
  Check,
  CheckCircle,
  Clock,
  Copy,
  PauseCircle,
  QrCode,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useTaxSummary } from '../../hooks/useTaxSummary';
import { useTaxWallet } from '../../hooks/useTaxWallet';
import QRCode from '../../components/ui/QRCode';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-taxes/translations';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function DashboardTaxes() {
  const { t } = useLanguage();
  const { summary: taxSummary, loading } = useTaxSummary();
  const { wallet, loading: walletLoading } = useTaxWallet();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  if (loading || walletLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#006446]/20 border-t-[#006446]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {t('dashboardTaxes.title')}
          </h1>
          <p className="mt-1 text-sm text-[#006446]">
            {t('dashboardTaxes.subtitle')}
          </p>
        </div>

      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label={t('dashboardTaxes.status.pending')}
          value={formatCurrency(taxSummary.totals.pending)}
          icon={Clock}
          accent="bg-[#006446]/10 text-[#006446]"
        />
        <SummaryCard
          label={t('dashboardTaxes.status.onHold')}
          value={formatCurrency(taxSummary.totals.on_hold)}
          icon={PauseCircle}
          accent="bg-[#006446]/10 text-[#006446]"
        />
        <SummaryCard
          label={t('dashboardTaxes.status.paid')}
          value={formatCurrency(taxSummary.totals.paid)}
          icon={CheckCircle}
          accent="bg-[#006446]/10 text-[#006446]"
        />
      </div>

      {wallet && (
        <div className="overflow-hidden rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.04] to-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#006446]" />
              <h2 className="font-semibold text-slate-900">
                {t('dashboardTaxes.payPanel.title')}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t('dashboardTaxes.payPanel.subtitle')}
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
              <div className="flex flex-shrink-0 flex-col items-center gap-4">
                <div className="border-2 border-slate-200 bg-white p-3 shadow-sm">
                  <QRCode data={wallet.wallet_address} size={180} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <QrCode className="h-3.5 w-3.5" />
                  <span>{t('dashboardTaxes.payPanel.scanToPay')}</span>
                </div>
              </div>

              <div className="w-full flex-1 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#006446]">
                    {t('dashboardTaxes.payPanel.walletAddress')}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 select-all break-all rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 font-mono text-sm text-slate-700">
                      {wallet.wallet_address}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="group flex-shrink-0 rounded-xl border border-[#006446]/14 p-3 transition-colors hover:bg-[#006446]/[0.04]"
                      title={t('dashboardTaxes.actions.copyAddress')}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-[#006446]" />
                      ) : (
                        <Copy className="h-4 w-4 text-[#006446]/70 group-hover:text-[#006446]" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="mt-1.5 text-xs font-medium text-[#006446]">
                      {t('dashboardTaxes.messages.copied')}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-4">
                  <p className="text-xs leading-relaxed text-[#006446]">
                    {t('dashboardTaxes.payPanel.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="border border-[#006446]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] transition-all duration-200 hover:border-[#006446]/25 hover:shadow-[0_24px_70px_-44px_rgba(0,100,70,0.55)]">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#006446]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
