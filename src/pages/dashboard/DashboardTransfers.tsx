import { useState, type ReactNode } from 'react';
import {
  ArrowRightLeft,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Download,
  Send,
  Wallet,
  X,
} from 'lucide-react';
import { useFiatBalances } from '../../hooks/useFiatBalances';
import { useCryptoWallets, useCryptoTransfers, type CryptoTransfer } from '../../hooks/useCryptoWallets';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useTransfers, type BankTransfer } from '../../hooks/useTransfers';
import InternalTransferPanel from '../../components/transfers/InternalTransferPanel';
import ExternalTransferPanel from '../../components/transfers/ExternalTransferPanel';
import InternalCryptoTransferPanel from '../../components/transfers/InternalCryptoTransferPanel';
import ExternalCryptoTransferPanel from '../../components/transfers/ExternalCryptoTransferPanel';
import {
  getBrandFileSlug,
  type BrandingSettings,
  useBranding,
} from '../../contexts/BrandingContext';
import {
  createProfessionalInvoicePdf,
  createTrxInvoiceNumber,
  type PdfInvoiceDocument,
} from '../../lib/pdfInvoice';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getBalanceStatusClasses,
  isBalanceAvailable,
} from '../../lib/balanceStatus';
import {
  getLocalizedBalanceRestrictionMessage,
  getLocalizedBalanceStatusLabel,
  getLocalizedHiddenBalanceLabel,
} from '../../lib/balanceStatusI18n';
import '../../i18n/dashboard-transfers/translations';

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatCryptoAmount(amount: number, symbol: string) {
  const decimals = amount < 0.001 ? 8 : amount < 1 ? 6 : amount < 100 ? 4 : 2;
  return `${amount.toFixed(decimals)} ${symbol}`;
}

function shortenAddress(addr: string) {
  if (!addr || addr.length < 16) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
}

function formatDayMonthYear(dateStr: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

type TransferInvoice = PdfInvoiceDocument;

function formatInvoiceNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(value);
}

function formatInvoiceFiatAmount(amount: number, currency: string) {
  return `${currency} ${formatInvoiceNumber(amount)}`;
}

function buildBankTransferInvoice(transfer: BankTransfer, formatDate: (dateStr: string) => string): TransferInvoice {
  const isInternal = transfer.transfer_type === 'internal';

  return {
    title: isInternal
      ? `${transfer.currency} to ${transfer.target_currency || '-'}`
      : transfer.recipient_name || 'External bank transfer',
    documentTitle: 'Transfer Invoice',
    sectionTitle: 'Transfer Details',
    subtitle: 'Professional transfer confirmation generated for customer records.',
    invoiceNumber: createTrxInvoiceNumber(),
    referenceId: transfer.id,
    date: formatDate(transfer.created_at),
    status: toTitleCase(transfer.status),
    amount: formatInvoiceFiatAmount(transfer.amount, transfer.currency),
    notes: transfer.description || 'Official transfer confirmation generated for customer records.',
    fields: [
      { label: 'Transfer Date', value: formatDate(transfer.created_at) },
      { label: 'Transfer Type', value: isInternal ? 'Internal' : 'External' },
      { label: 'Status', value: toTitleCase(transfer.status) },
      { label: 'Reference ID', value: transfer.id },
      { label: 'Amount', value: formatInvoiceFiatAmount(transfer.amount, transfer.currency) },
      { label: 'Source Currency', value: transfer.currency },
      { label: 'Target Currency', value: isInternal ? transfer.target_currency : undefined },
      { label: 'Recipient Name', value: isInternal ? undefined : transfer.recipient_name },
      { label: 'Beneficiary Bank', value: isInternal ? undefined : transfer.bank_name },
      { label: 'IBAN', value: isInternal ? undefined : transfer.iban },
      { label: 'Account Number', value: isInternal ? undefined : transfer.account_number },
      { label: 'SWIFT Code', value: isInternal ? undefined : transfer.swift_code },
      { label: 'Description', value: transfer.description },
    ],
  };
}

function buildCryptoTransferInvoice(transfer: CryptoTransfer, formatDate: (dateStr: string) => string): TransferInvoice {
  const isInternal = transfer.transfer_type === 'internal';
  const isReceive = transfer.direction === 'receive';

  return {
    title: isInternal
      ? `${transfer.symbol} to ${transfer.target_symbol || '-'}`
      : `${toTitleCase(transfer.direction)} ${transfer.symbol}`,
    documentTitle: 'Transfer Invoice',
    sectionTitle: 'Transfer Details',
    subtitle: 'Professional transfer confirmation generated for customer records.',
    invoiceNumber: createTrxInvoiceNumber(),
    referenceId: transfer.id,
    date: formatDate(transfer.created_at),
    status: toTitleCase(transfer.status),
    amount: formatCryptoAmount(transfer.amount, transfer.symbol),
    notes: transfer.note || 'Official crypto transfer confirmation generated for customer records.',
    fields: [
      { label: 'Transfer Date', value: formatDate(transfer.created_at) },
      { label: 'Transfer Type', value: isInternal ? 'Internal' : 'External' },
      { label: 'Direction', value: toTitleCase(transfer.direction) },
      { label: 'Status', value: toTitleCase(transfer.status) },
      { label: 'Reference ID', value: transfer.id },
      { label: 'Amount', value: formatCryptoAmount(transfer.amount, transfer.symbol) },
      { label: 'Asset', value: transfer.symbol },
      { label: 'Target Asset', value: isInternal ? transfer.target_symbol : undefined },
      { label: 'Sender Address', value: !isInternal ? transfer.sender_address : undefined },
      { label: isReceive ? 'Receiving Address' : 'Recipient Address', value: !isInternal ? transfer.recipient_address : undefined },
      { label: 'Network Fee', value: !isInternal ? formatCryptoAmount(Number(transfer.fee || 0), transfer.symbol) : undefined },
      { label: 'Transaction Hash', value: transfer.tx_hash },
      { label: 'Note', value: transfer.note },
    ],
  };
}

function createTransferInvoicePdf(invoice: TransferInvoice, branding: BrandingSettings) {
  return createProfessionalInvoicePdf(invoice, branding);
}

function downloadTransferInvoice(invoice: TransferInvoice, branding: BrandingSettings) {
  const blob = new Blob([createTransferInvoicePdf(invoice, branding)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `${getBrandFileSlug(branding)}-${invoice.invoiceNumber.toLowerCase()}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type MainTab = 'banking' | 'crypto';
type SubTab = 'internal' | 'external';

export default function DashboardTransfers() {
  const { t } = useLanguage();
  const { branding } = useBranding();
  const [mainTab, setMainTab] = useState<MainTab>('banking');
  const [bankingTab, setBankingTab] = useState<SubTab>('internal');
  const [cryptoTab, setCryptoTab] = useState<SubTab>('internal');

  const formatDate = formatDayMonthYear;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          {t('dashboardTransfers.title')}
        </h1>
        <p className="mt-1 text-sm text-[#006446]">
          {t('dashboardTransfers.subtitle')}
        </p>
      </div>

      <div className="max-w-xl">
        <div className="grid grid-cols-1 gap-1.5 rounded-xl border border-[#006446]/12 bg-white p-1.5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)] sm:grid-cols-2">
          <button
            onClick={() => setMainTab('banking')}
            aria-pressed={mainTab === 'banking'}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all ${
              mainTab === 'banking'
                ? 'bg-[#006446] text-white shadow-[0_12px_30px_-20px_rgba(0,100,70,0.9)]'
                : 'text-slate-600 hover:bg-[#006446]/[0.04] hover:text-[#006446]'
            }`}
          >
            <Building2 className="h-4 w-4" />
            {t('dashboardTransfers.tabs.banking')}
          </button>
          <button
            onClick={() => setMainTab('crypto')}
            aria-pressed={mainTab === 'crypto'}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all ${
              mainTab === 'crypto'
                ? 'bg-slate-900 text-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.85)]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            <Wallet className="h-4 w-4" />
            {t('dashboardTransfers.tabs.crypto')}
          </button>
        </div>
      </div>

      {mainTab === 'banking' && (
        <BankingTransferView
          t={t}
          branding={branding}
          formatDate={formatDate}
          bankingTab={bankingTab}
          setBankingTab={setBankingTab}
        />
      )}

      {mainTab === 'crypto' && (
        <CryptoTransferView
          t={t}
          branding={branding}
          formatDate={formatDate}
          cryptoTab={cryptoTab}
          setCryptoTab={setCryptoTab}
        />
      )}
    </div>
  );
}

function BankingTransferView({
  t,
  branding,
  formatDate,
  bankingTab,
  setBankingTab,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  bankingTab: SubTab;
  setBankingTab: (t: SubTab) => void;
}) {
  const { fiatBalances, loading: balLoading, refetch: refetchBalances } = useFiatBalances();
  const {
    transfers,
    loading: txLoading,
    submitting,
    createInternalTransfer,
    createExternalTransfer,
    refetch: refetchTransfers,
  } = useTransfers();

  const handleSuccess = () => {
    refetchBalances();
    refetchTransfers();
  };

  if (balLoading || txLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  const bankingTransfers = transfers.filter((t) =>
    bankingTab === 'internal' ? t.transfer_type === 'internal' : t.transfer_type === 'external'
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-[#006446]/10 pb-3">
        <button
          onClick={() => setBankingTab('internal')}
          aria-pressed={bankingTab === 'internal'}
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-all ${
            bankingTab === 'internal'
              ? 'border-[#006446]/25 bg-[#006446]/8 text-[#006446]'
              : 'border-transparent text-slate-500 hover:border-[#006446]/14 hover:bg-white hover:text-[#006446]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          {t('dashboardTransfers.banking.internalTransfer')}
        </button>

        <button
          onClick={() => setBankingTab('external')}
          aria-pressed={bankingTab === 'external'}
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-all ${
            bankingTab === 'external'
              ? 'border-[#006446]/25 bg-[#006446]/8 text-[#006446]'
              : 'border-transparent text-slate-500 hover:border-[#006446]/14 hover:bg-white hover:text-[#006446]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          {t('dashboardTransfers.banking.externalTransfer')}
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {bankingTab === 'internal' && (
            <InternalTransferPanel
              fiatBalances={fiatBalances}
              submitting={submitting}
              onSubmit={createInternalTransfer}
              onSuccess={handleSuccess}
            />
          )}

          {bankingTab === 'external' && (
            <ExternalTransferPanel
              fiatBalances={fiatBalances}
              submitting={submitting}
              onSubmit={createExternalTransfer}
              onSuccess={handleSuccess}
            />
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <BankTransferHistory
            t={t}
            branding={branding}
            formatDate={formatDate}
            transfers={bankingTransfers}
            type={bankingTab}
          />

          <div
            className="rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]"
          >
            <h3 className="mb-2 font-semibold text-slate-900">
              {bankingTab === 'internal'
                ? t('dashboardTransfers.banking.info.internalTitle')
                : t('dashboardTransfers.banking.info.externalTitle')}
            </h3>

            <ul className="space-y-2 text-sm text-[#006446]">
              {bankingTab === 'internal' ? (
                <>
                  <li>- {t('dashboardTransfers.banking.info.internal1')}</li>
                  <li>- {t('dashboardTransfers.banking.info.internal2')}</li>
                  <li>- {t('dashboardTransfers.banking.info.internal3')}</li>
                </>
              ) : (
                <>
                  <li>- {t('dashboardTransfers.banking.info.external1')}</li>
                  <li>- {t('dashboardTransfers.banking.info.external2')}</li>
                  <li>- {t('dashboardTransfers.banking.info.external3')}</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function CryptoTransferView({
  t,
  branding,
  formatDate,
  cryptoTab,
  setCryptoTab,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  cryptoTab: SubTab;
  setCryptoTab: (t: SubTab) => void;
}) {
  const { wallets, loading: walletsLoading, refetch: refetchWallets } = useCryptoWallets();
  const { cryptoBalances, loading: balancesLoading, refetch: refetchBalances } = useCryptoBalances();
  const {
    transfers,
    loading: transfersLoading,
    submitting,
    createInternalCryptoTransfer,
    createExternalCryptoTransfer,
    createReceiveCryptoTransfer,
    refetch: refetchTransfers,
  } = useCryptoTransfers();

  const handleSuccess = () => {
    refetchWallets();
    refetchBalances();
    refetchTransfers();
  };

  if (walletsLoading || balancesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  const filteredTransfers = transfers.filter((t) =>
    cryptoTab === 'internal' ? t.transfer_type === 'internal' : t.transfer_type === 'external'
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-[#006446]/10 pb-3">
        <button
          onClick={() => setCryptoTab('internal')}
          aria-pressed={cryptoTab === 'internal'}
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-all ${
            cryptoTab === 'internal'
              ? 'border-[#006446]/25 bg-[#006446]/8 text-[#006446]'
              : 'border-transparent text-slate-500 hover:border-[#006446]/14 hover:bg-white hover:text-[#006446]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          {t('dashboardTransfers.crypto.internalTransfer')}
        </button>

        <button
          onClick={() => setCryptoTab('external')}
          aria-pressed={cryptoTab === 'external'}
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-all ${
            cryptoTab === 'external'
              ? 'border-[#006446]/25 bg-[#006446]/8 text-[#006446]'
              : 'border-transparent text-slate-500 hover:border-[#006446]/14 hover:bg-white hover:text-[#006446]'
          }`}
        >
          <Send className="w-4 h-4" />
          {t('dashboardTransfers.crypto.externalTransfer')}
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {cryptoTab === 'internal' && (
            <InternalCryptoTransferPanel
              wallets={wallets}
              balances={cryptoBalances}
              submitting={submitting}
              onSubmit={createInternalCryptoTransfer}
              onSuccess={handleSuccess}
            />
          )}

          {cryptoTab === 'external' && (
            <ExternalCryptoTransferPanel
              wallets={wallets}
              balances={cryptoBalances}
              submitting={submitting}
              onSend={createExternalCryptoTransfer}
              onReceive={createReceiveCryptoTransfer}
              onSuccess={handleSuccess}
            />
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <CryptoTransferHistory
            t={t}
            branding={branding}
            formatDate={formatDate}
            transfers={filteredTransfers}
            loading={transfersLoading}
            type={cryptoTab}
          />

          <CryptoBalancesSidebar
            t={t}
            wallets={wallets}
            balances={cryptoBalances}
          />

          <div
            className="rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]"
          >
            <h3 className="mb-2 font-semibold text-slate-900">
              {cryptoTab === 'internal'
                ? t('dashboardTransfers.crypto.info.internalTitle')
                : t('dashboardTransfers.crypto.info.externalTitle')}
            </h3>

            <ul className="space-y-2 text-sm text-[#006446]">
              {cryptoTab === 'internal' ? (
                <>
                  <li>- {t('dashboardTransfers.crypto.info.internal1')}</li>
                  <li>- {t('dashboardTransfers.crypto.info.internal2')}</li>
                  <li>- {t('dashboardTransfers.crypto.info.internal3')}</li>
                </>
              ) : (
                <>
                  <li>- {t('dashboardTransfers.crypto.info.external1')}</li>
                  <li>- {t('dashboardTransfers.crypto.info.external2')}</li>
                  <li>- {t('dashboardTransfers.crypto.info.external3')}</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function BankTransferHistory({
  t,
  branding,
  formatDate,
  transfers,
  type,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  transfers: BankTransfer[];
  type: SubTab;
}) {
  const [selectedTransfer, setSelectedTransfer] = useState<BankTransfer | null>(null);

  return (
    <>
      <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="border-b border-[#006446]/10 px-5 py-4">
          <h3 className="font-semibold text-slate-900">
            {type === 'internal'
              ? t('dashboardTransfers.history.internalBanking')
              : t('dashboardTransfers.history.externalBanking')}
          </h3>
        </div>

        <div className="divide-y divide-[#006446]/10">
          {transfers.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10">
                <ArrowUpRight className="w-5 h-5 text-[#006446]" />
              </div>
              <p className="text-sm text-slate-400">
                {type === 'internal'
                  ? t('dashboardTransfers.history.noInternalBanking')
                  : t('dashboardTransfers.history.noExternalBanking')}
              </p>
            </div>
          ) : (
            transfers.slice(0, 10).map((tx) => (
              <button
                key={tx.id}
                type="button"
                onClick={() => setSelectedTransfer(tx)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#006446]/[0.03] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#006446]/20"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[#006446]/10 text-[#006446]">
                  {tx.transfer_type === 'internal' ? (
                    <ArrowRightLeft className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {tx.transfer_type === 'internal'
                      ? `${tx.currency} ${t('dashboardTransfers.common.to')} ${tx.target_currency}`
                      : tx.recipient_name || t('dashboardTransfers.history.externalTransfer')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDate(tx.created_at)}
                    {tx.transfer_type === 'external' && tx.bank_name ? ` - ${tx.bank_name}` : ''}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(tx.amount, tx.currency)}
                  </p>
                  <StatusBadge t={t} status={tx.status} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {selectedTransfer && (
        <BankTransferDetailModal
          t={t}
          branding={branding}
          formatDate={formatDate}
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}
    </>
  );
}

function CryptoTransferHistory({
  t,
  branding,
  formatDate,
  transfers,
  loading,
  type,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  transfers: CryptoTransfer[];
  loading: boolean;
  type: SubTab;
}) {
  const [selectedTransfer, setSelectedTransfer] = useState<CryptoTransfer | null>(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#006446]/14 bg-white p-6 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <h3 className="font-semibold text-slate-900 mb-4">
          {type === 'internal'
            ? t('dashboardTransfers.history.internalCrypto')
            : t('dashboardTransfers.history.externalCrypto')}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="border-b border-[#006446]/10 px-5 py-4">
          <h3 className="font-semibold text-slate-900">
            {type === 'internal'
              ? t('dashboardTransfers.history.internalCrypto')
              : t('dashboardTransfers.history.externalCrypto')}
          </h3>
        </div>

        <div className="divide-y divide-[#006446]/10">
          {transfers.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10">
                <ArrowUpRight className="w-5 h-5 text-[#006446]" />
              </div>
              <p className="text-sm text-slate-400">
                {type === 'internal'
                  ? t('dashboardTransfers.history.noInternalCrypto')
                  : t('dashboardTransfers.history.noExternalCrypto')}
              </p>
            </div>
          ) : (
            transfers.slice(0, 10).map((tx) => (
              <button
                key={tx.id}
                type="button"
                onClick={() => setSelectedTransfer(tx)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#006446]/[0.03] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#006446]/20"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[#006446]/10 text-[#006446]">
                  {tx.transfer_type === 'internal' ? (
                    <ArrowRightLeft className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {tx.transfer_type === 'internal'
                      ? `${tx.symbol} ${t('dashboardTransfers.common.to')} ${tx.target_symbol}`
                      : tx.direction === 'receive'
                      ? `${t('dashboardTransfers.crypto.receive')} ${tx.symbol} ${t('dashboardTransfers.common.from')} ${shortenAddress(tx.sender_address)}`
                      : `${t('dashboardTransfers.crypto.send')} ${tx.symbol} ${t('dashboardTransfers.common.to')} ${shortenAddress(tx.recipient_address)}`}
                  </p>
                  <p className="text-[11px] text-slate-400">{formatDate(tx.created_at)}</p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">
                    {formatCryptoAmount(tx.amount, tx.symbol)}
                  </p>
                  <StatusBadge t={t} status={tx.status} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {selectedTransfer && (
        <CryptoTransferDetailModal
          t={t}
          branding={branding}
          formatDate={formatDate}
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}
    </>
  );
}

function CryptoBalancesSidebar({
  t,
  wallets,
  balances,
}: {
  t: (key: string) => string;
  wallets: { symbol: string; name: string }[];
  balances: { symbol: string; balance: number; status?: string }[];
}) {
  const CRYPTO_COLORS: Record<string, { bg: string; text: string }> = {
    BTC: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
    ETH: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
    SOL: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
    DOGE: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
    USDT: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
    USDC: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
  };
  const restrictedCount = balances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-[#006446]" />
        <h3 className="font-semibold text-slate-900 text-sm">
          {t('dashboardTransfers.cryptoBalances.title')}
        </h3>
      </div>

      <div className="space-y-1">
        {wallets.map((w) => {
          const bal = balances.find((b) => b.symbol === w.symbol);
          const amount = bal ? Number(bal.balance) : 0;
          const colors = CRYPTO_COLORS[w.symbol] || { bg: 'bg-slate-50', text: 'text-slate-600' };
          const canShowAmount = isBalanceAvailable(bal?.status);

          return (
            <div key={w.symbol} className="flex items-center justify-between gap-3 border-b border-[#006446]/10 py-2 last:border-0">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-[9px] font-bold`}
                >
                  {w.symbol.charAt(0)}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-slate-700">{w.symbol}</span>
                  {bal && !isBalanceAvailable(bal.status) ? (
                    <div className="mt-1">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${getBalanceStatusClasses(bal.status)}`}>
                        {getLocalizedBalanceStatusLabel(t, bal.status)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
              <span className={`text-xs font-semibold tabular-nums ${canShowAmount ? 'text-slate-900' : 'text-slate-500'}`}>
                {canShowAmount ? formatCryptoAmount(amount, w.symbol) : getLocalizedHiddenBalanceLabel(t, bal?.status)}
              </span>
            </div>
          );
        })}
      </div>

      {restrictedCount > 0 ? (
        <p className="mt-3 text-xs text-slate-500">
          {getLocalizedBalanceRestrictionMessage(t, 'transfers')}
        </p>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <div className="rounded-xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">{label}</p>
      <div className={`mt-1 break-words text-sm text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function TransferDetailShell({
  title,
  subtitle,
  children,
  onClose,
  onDownloadInvoice,
  invoiceAvailable,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
  onDownloadInvoice: () => void;
  invoiceAvailable: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-transparent p-4">
      <button
        type="button"
        aria-label="Close transfer details"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#006446]/14 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.55)]">
        <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#006446]/10 bg-white px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Transfer details</p>
            <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onDownloadInvoice}
              disabled={!invoiceAvailable}
              title={invoiceAvailable ? 'Download invoice' : 'Invoice available when transfer is completed'}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                invoiceAvailable
                  ? 'bg-[#006446] text-white shadow-[0_14px_28px_-20px_rgba(0,100,70,0.85)] hover:bg-[#00563d]'
                  : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
              }`}
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#006446]/12 text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
              aria-label="Close transfer details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">{children}</div>
      </section>
    </div>
  );
}

function BankTransferDetailModal({
  t,
  branding,
  formatDate,
  transfer,
  onClose,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  transfer: BankTransfer;
  onClose: () => void;
}) {
  const isInternal = transfer.transfer_type === 'internal';
  const title = isInternal
    ? `${transfer.currency} ${t('dashboardTransfers.common.to')} ${transfer.target_currency || '-'}`
    : transfer.recipient_name || t('dashboardTransfers.history.externalTransfer');

  return (
    <TransferDetailShell
      title={title}
      subtitle={`${isInternal ? 'Internal bank transfer' : 'External bank transfer'} - ${formatDate(transfer.created_at)}`}
      onClose={onClose}
      onDownloadInvoice={() => downloadTransferInvoice(buildBankTransferInvoice(transfer, formatDate), branding)}
      invoiceAvailable={transfer.status === 'completed'}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#006446]/10 bg-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10 text-[#006446]">
          {isInternal ? <ArrowRightLeft className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{formatCurrency(transfer.amount, transfer.currency)}</p>
          <p className="text-xs text-slate-500">{transfer.id}</p>
        </div>
        <StatusBadge t={t} status={transfer.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label="Created" value={formatDate(transfer.created_at)} />
        <DetailRow label="Transfer type" value={toTitleCase(transfer.transfer_type)} />
        <DetailRow label="Amount" value={formatCurrency(transfer.amount, transfer.currency)} />
        <DetailRow label="Source currency" value={transfer.currency} />
        {isInternal ? (
          <DetailRow label="Target currency" value={transfer.target_currency} />
        ) : (
          <>
            <DetailRow label="Recipient" value={transfer.recipient_name} />
            <DetailRow label="Bank" value={transfer.bank_name} />
            <DetailRow label="IBAN" value={transfer.iban} mono />
            <DetailRow label="Account number" value={transfer.account_number} mono />
            <DetailRow label="SWIFT code" value={transfer.swift_code} mono />
          </>
        )}
        <DetailRow label="Description" value={transfer.description} />
      </div>
    </TransferDetailShell>
  );
}

function CryptoTransferDetailModal({
  t,
  branding,
  formatDate,
  transfer,
  onClose,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  transfer: CryptoTransfer;
  onClose: () => void;
}) {
  const isInternal = transfer.transfer_type === 'internal';
  const title = isInternal
    ? `${transfer.symbol} ${t('dashboardTransfers.common.to')} ${transfer.target_symbol || '-'}`
    : transfer.direction === 'receive'
    ? `${t('dashboardTransfers.crypto.receive')} ${transfer.symbol}`
    : `${t('dashboardTransfers.crypto.send')} ${transfer.symbol}`;

  return (
    <TransferDetailShell
      title={title}
      subtitle={`${isInternal ? 'Internal crypto transfer' : 'External crypto transfer'} - ${formatDate(transfer.created_at)}`}
      onClose={onClose}
      onDownloadInvoice={() => downloadTransferInvoice(buildCryptoTransferInvoice(transfer, formatDate), branding)}
      invoiceAvailable={transfer.status === 'completed'}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#006446]/10 bg-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10 text-[#006446]">
          {isInternal ? <ArrowRightLeft className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{formatCryptoAmount(transfer.amount, transfer.symbol)}</p>
          <p className="text-xs text-slate-500">{transfer.id}</p>
        </div>
        <StatusBadge t={t} status={transfer.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label="Created" value={formatDate(transfer.created_at)} />
        <DetailRow label="Transfer type" value={toTitleCase(transfer.transfer_type)} />
        <DetailRow label="Direction" value={toTitleCase(transfer.direction)} />
        <DetailRow label="Amount" value={formatCryptoAmount(transfer.amount, transfer.symbol)} />
        <DetailRow label="Asset" value={transfer.symbol} />
        {isInternal ? (
          <DetailRow label="Target asset" value={transfer.target_symbol} />
        ) : transfer.direction === 'receive' ? (
          <>
            <DetailRow label="Sender address" value={transfer.sender_address} mono />
            <DetailRow label="Receiving address" value={transfer.recipient_address} mono />
          </>
        ) : (
          <>
            <DetailRow label="Recipient address" value={transfer.recipient_address} mono />
            <DetailRow label="Sender address" value={transfer.sender_address} mono />
          </>
        )}
        <DetailRow label="Network fee" value={formatCryptoAmount(Number(transfer.fee || 0), transfer.symbol)} />
        <DetailRow label="Transaction hash" value={transfer.tx_hash} mono />
        <DetailRow label="Note" value={transfer.note} />
      </div>
    </TransferDetailShell>
  );
}

function toTitleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({
  t,
  status,
}: {
  t: (key: string) => string;
  status: string;
}) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#006446]">
        <CheckCircle2 className="w-3 h-3" /> {t('dashboardTransfers.status.approved')}
      </span>
    );
  }

  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#006446]">
        <CheckCircle2 className="w-3 h-3" /> {t('dashboardTransfers.status.completed')}
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#006446]">
        <Clock className="w-3 h-3" /> {t('dashboardTransfers.status.pending')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#006446]">
      <XCircle className="w-3 h-3" /> {t('dashboardTransfers.status.failed')}
    </span>
  );
}
