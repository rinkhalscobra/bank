import { useState } from 'react';
import {
  AlertCircle,
  Building2,
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
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-taxes/translations';
import { formatTaxCurrency } from '../../lib/taxCurrency';
import { buildCryptoPaymentUri, isWalletPaymentUri } from '../../lib/cryptoPaymentUri';

export default function DashboardTaxes() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { summary: taxSummary, currency, loading } = useTaxSummary();
  const { wallet, loading: walletLoading } = useTaxWallet();
  const canPayByBankTransfer = user?.id === 'f1c90e08-cda1-4112-b59a-1c0faf1b2493';

  const [copied, setCopied] = useState(false);
  const paymentUri = wallet
    ? buildCryptoPaymentUri({
        address: wallet.wallet_address,
        symbol: wallet.symbol,
        network: wallet.network,
        label: wallet.label,
        chainId: wallet.chain_id,
        tokenContract: wallet.token_contract,
        tokenDecimals: wallet.token_decimals,
        paymentUriScheme: wallet.payment_uri_scheme,
      })
    : '';

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
          value={formatTaxCurrency(taxSummary.totals.pending, currency)}
          icon={Clock}
          accent="bg-[#006446]/10 text-[#006446]"
        />
        <SummaryCard
          label={t('dashboardTaxes.status.onHold')}
          value={formatTaxCurrency(taxSummary.totals.on_hold, currency)}
          icon={PauseCircle}
          accent="bg-[#006446]/10 text-[#006446]"
        />
        <SummaryCard
          label={t('dashboardTaxes.status.paid')}
          value={formatTaxCurrency(taxSummary.totals.paid, currency)}
          icon={CheckCircle}
          accent="bg-[#006446]/10 text-[#006446]"
        />
      </div>

      {canPayByBankTransfer && <TaxBankPaymentPanel />}

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
                {isWalletPaymentUri(paymentUri) ? (
                  <a
                    href={paymentUri}
                    aria-label="Open tax wallet payment request"
                    className="border-2 border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <QRCode data={paymentUri} size={180} />
                  </a>
                ) : (
                  <div className="border-2 border-slate-200 bg-white p-3 shadow-sm">
                    <QRCode data={paymentUri} size={180} />
                  </div>
                )}
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

const TAX_BANK_DETAILS = [
  { key: 'beneficiary', labelKey: 'dashboardTaxes.bankPanel.beneficiary', value: 'PATRICK CHENAUX' },
  {
    key: 'account',
    labelKey: 'dashboardTaxes.bankPanel.accountNumber',
    value: 'FR7617478000010005139965333',
    mono: true,
  },
  { key: 'swift', labelKey: 'dashboardTaxes.bankPanel.swift', value: 'HRSAFR22XXX', mono: true },
  { key: 'reference', labelKey: 'dashboardTaxes.bankPanel.reference', value: '013641566', mono: true },
] as const;

function TaxBankPaymentPanel() {
  const { t } = useLanguage();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyDetail = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      window.setTimeout(() => setCopiedField((current) => (current === key ? null : current)), 2000);
    } catch {
      // Clipboard access is not available in every browser context.
    }
  };

  return (
    <section
      aria-labelledby="tax-bank-payment-title"
      className="overflow-hidden rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]"
    >
      <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.06] to-white px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#006446]/10">
            <Building2 className="h-[18px] w-[18px] text-[#006446]" />
          </div>
          <div>
            <h2 id="tax-bank-payment-title" className="font-semibold text-slate-900">
              {t('dashboardTaxes.bankPanel.title')}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {t('dashboardTaxes.bankPanel.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <dl className="grid gap-px overflow-hidden rounded-xl border border-[#006446]/12 bg-[#006446]/12 sm:grid-cols-2">
          {TAX_BANK_DETAILS.map((detail) => (
            <div key={detail.key} className="min-w-0 bg-white px-5 py-4">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#006446]">
                {t(detail.labelKey)}
              </dt>
              <dd className="mt-2 flex min-w-0 items-center justify-between gap-3">
                <span
                  className={`min-w-0 select-all break-all text-sm font-semibold text-slate-900 ${
                    'mono' in detail && detail.mono ? 'font-mono tracking-wide' : ''
                  }`}
                >
                  {detail.value}
                </span>
                <button
                  type="button"
                  onClick={() => void copyDetail(detail.key, detail.value)}
                  className="flex h-9 min-w-[78px] flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#006446]/14 px-3 text-xs font-semibold text-[#006446] transition-colors hover:bg-[#006446]/[0.06] focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                  title={t('dashboardTaxes.bankPanel.copyDetail')}
                  aria-label={`${t('dashboardTaxes.bankPanel.copyDetail')}: ${t(detail.labelKey)}`}
                >
                  {copiedField === detail.key ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t('dashboardTaxes.messages.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t('dashboardTaxes.bankPanel.copy')}
                    </>
                  )}
                </button>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {t('dashboardTaxes.bankPanel.minimumTitle')}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
              {t('dashboardTaxes.bankPanel.minimumDescription')}
            </p>
          </div>
        </div>
      </div>
    </section>
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
