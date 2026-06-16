import { useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Repeat,
  Send,
  Download,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  Wallet,
  X,
} from 'lucide-react';
import { useTransactions, type Transaction } from '../../hooks/useBankingData';
import { useCryptoTransactions, type CryptoTransaction } from '../../hooks/useCryptoTransactions';
import Dropdown from '../../components/ui/Dropdown';
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
import '../../i18n/dashboard-transactions/translations';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatCurrencyByCode(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${formatInvoiceNumber(amount)} ${currency}`;
  }
}

function formatCryptoAmount(amount: number, symbol: string) {
  const decimals = amount < 1 ? 6 : amount < 100 ? 4 : 2;
  return `${amount.toFixed(decimals)} ${symbol}`;
}

function toSentenceCase(value: string) {
  if (!value) return 'Empty';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

type TransactionInvoice = PdfInvoiceDocument;

function formatInvoiceNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(value);
}

function normalizeAmountNumber(value: string) {
  const cleaned = value.replace(/\s/g, '');

  if (cleaned.includes(',') && cleaned.includes('.')) {
    return Number(cleaned.replace(/,/g, ''));
  }

  if (cleaned.includes(',') && !cleaned.includes('.')) {
    return Number(cleaned.replace(',', '.'));
  }

  return Number(cleaned.replace(/,/g, ''));
}

function normalizeFiatCurrency(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return '';

  const map: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    usd: 'USD',
    dollar: 'USD',
    dollars: 'USD',
    eur: 'EUR',
    euro: 'EUR',
    euros: 'EUR',
    gbp: 'GBP',
    pound: 'GBP',
    pounds: 'GBP',
    cad: 'CAD',
    chf: 'CHF',
    pln: 'PLN',
  };

  return map[normalized] || normalized.toUpperCase();
}

function parseFiatAmountFromText(value: string) {
  const text = value.trim();
  if (!text) return null;

  const symbolBefore = text.match(/([$€£])\s*(-?\d[\d\s,.]*)/);
  if (symbolBefore) {
    const amount = normalizeAmountNumber(symbolBefore[2]);
    if (Number.isFinite(amount)) return { amount, currency: normalizeFiatCurrency(symbolBefore[1]) };
  }

  const codeBefore = text.match(/\b(usd|dollar|dollars|eur|euro|euros|gbp|pound|pounds|cad|chf|pln)\s*(-?\d[\d\s,.]*)\b/i);
  if (codeBefore) {
    const amount = normalizeAmountNumber(codeBefore[2]);
    if (Number.isFinite(amount)) return { amount, currency: normalizeFiatCurrency(codeBefore[1]) };
  }

  const codeAfter = text.match(/(-?\d[\d\s,.]*)\s*(usd|dollar|dollars|eur|euro|euros|gbp|pound|pounds|cad|chf|pln)\b/i);
  if (codeAfter) {
    const amount = normalizeAmountNumber(codeAfter[1]);
    if (Number.isFinite(amount)) return { amount, currency: normalizeFiatCurrency(codeAfter[2]) };
  }

  return null;
}

function getFiatTransactionAmount(tx: Transaction) {
  const numericAmount = Number(tx.amount);
  const currency = normalizeFiatCurrency(String((tx as Transaction & { currency?: string }).currency || '')) || 'USD';

  if (Number.isFinite(numericAmount) && Math.abs(numericAmount) > 0.000001) {
    return {
      amount: Math.abs(numericAmount),
      currency,
      hasAmount: true,
      signed: `${numericAmount < 0 ? '-' : isBankingInflow(tx.type) ? '+' : '-'}${formatCurrencyByCode(Math.abs(numericAmount), currency)}`,
      plain: formatCurrencyByCode(Math.abs(numericAmount), currency),
    };
  }

  const parsed = parseFiatAmountFromText(`${tx.details || ''} ${tx.description || ''} ${tx.comment || ''}`);
  if (parsed) {
    const parsedCurrency = parsed.currency || currency;
    return {
      amount: Math.abs(parsed.amount),
      currency: parsedCurrency,
      hasAmount: true,
      signed: `${parsed.amount < 0 ? '-' : isBankingInflow(tx.type) ? '+' : '-'}${formatCurrencyByCode(Math.abs(parsed.amount), parsedCurrency)}`,
      plain: formatCurrencyByCode(Math.abs(parsed.amount), parsedCurrency),
    };
  }

  return {
    amount: 0,
    currency,
    hasAmount: false,
    signed: 'Amount unavailable',
    plain: 'Amount unavailable',
  };
}

function getFiatTransactionTitle(tx: Transaction) {
  return tx.details || tx.description || tx.comment || 'Banking transaction';
}

function getFiatTransactionNotes(tx: Transaction) {
  return tx.comment || tx.details || tx.description || 'Official banking transaction confirmation generated for customer records.';
}

function getCryptoTransactionTitle(tx: CryptoTransaction) {
  return tx.description || tx.comment || `${toSentenceCase(tx.type)} ${tx.symbol}`;
}

function getCryptoTransactionNotes(tx: CryptoTransaction) {
  return tx.comment || tx.description || 'Official crypto transaction confirmation generated for customer records.';
}

function buildFiatTransactionInvoice(tx: Transaction, formatDate: (dateStr: string) => string): TransactionInvoice {
  const reference = tx.reference_number || tx.poi || tx.id;
  const resolvedAmount = getFiatTransactionAmount(tx);

  return {
    title: getFiatTransactionTitle(tx),
    documentTitle: 'Transaction Invoice',
    sectionTitle: 'Transaction Details',
    subtitle: 'Professional transaction confirmation generated for customer records.',
    invoiceNumber: createTrxInvoiceNumber(),
    referenceId: reference,
    date: formatDate(tx.created_at),
    status: toSentenceCase(tx.status || 'completed'),
    amount: resolvedAmount.signed,
    notes: getFiatTransactionNotes(tx),
    fields: [
      { label: 'Transaction Date', value: formatDate(tx.created_at) },
      { label: 'Transaction Type', value: toSentenceCase(tx.type) },
      { label: 'Status', value: toSentenceCase(tx.status || 'completed') },
      { label: 'Reference ID', value: reference },
      { label: 'Transaction ID', value: tx.id },
      { label: 'Amount', value: resolvedAmount.signed },
      { label: 'Balance After', value: formatCurrencyByCode(Number(tx.balance_after || 0), resolvedAmount.currency) },
      { label: 'Point of Interest', value: tx.poi },
      { label: 'Category', value: tx.category },
      { label: 'Comment', value: tx.comment },
      { label: 'Details', value: tx.details || tx.description },
    ],
  };
}

function buildCryptoTransactionInvoice(tx: CryptoTransaction, formatDate: (dateStr: string) => string): TransactionInvoice {
  const inflow = tx.type === 'buy' || tx.type === 'receive';
  const amount = `${inflow ? '+' : '-'}${formatCryptoAmount(tx.amount, tx.symbol)}`;

  return {
    title: getCryptoTransactionTitle(tx),
    documentTitle: 'Transaction Invoice',
    sectionTitle: 'Transaction Details',
    subtitle: 'Professional transaction confirmation generated for customer records.',
    invoiceNumber: createTrxInvoiceNumber(),
    referenceId: tx.tx_hash || tx.id,
    date: formatDate(tx.created_at),
    status: toSentenceCase(tx.status),
    amount,
    notes: getCryptoTransactionNotes(tx),
    fields: [
      { label: 'Transaction Date', value: formatDate(tx.created_at) },
      { label: 'Transaction Type', value: toSentenceCase(tx.type) },
      { label: 'Status', value: toSentenceCase(tx.status) },
      { label: 'Reference ID', value: tx.tx_hash || tx.id },
      { label: 'Transaction ID', value: tx.id },
      { label: 'Asset', value: `${tx.name} (${tx.symbol})` },
      { label: 'Amount', value: amount },
      { label: 'Price Per Unit', value: formatCurrency(tx.price_per_unit) },
      { label: 'Total Value', value: formatCurrency(tx.total_value) },
      { label: 'Fee', value: formatCurrency(tx.fee) },
      { label: 'Wallet Address', value: tx.wallet_address },
      { label: 'Transaction Hash', value: tx.tx_hash },
      { label: 'Swap', value: tx.type === 'swap' && tx.from_symbol ? `${tx.from_symbol} to ${tx.to_symbol}` : undefined },
      { label: 'Comment', value: tx.comment },
      { label: 'Description', value: tx.description },
    ],
  };
}

function createTransactionInvoicePdf(invoice: TransactionInvoice, branding: BrandingSettings) {
  return createProfessionalInvoicePdf(invoice, branding);
}

function downloadTransactionInvoice(invoice: TransactionInvoice, branding: BrandingSettings) {
  const blob = new Blob([createTransactionInvoicePdf(invoice, branding)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `${getBrandFileSlug(branding)}-${invoice.invoiceNumber.toLowerCase()}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function isBankingInflow(type: string) {
  const normalized = type.toLowerCase();
  return ['credit', 'deposit', 'income', 'refund', 'received'].includes(normalized);
}

function bankingStatusClasses(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'completed') {
    return 'border-[#006446]/15 bg-[#006446]/10 text-[#006446]';
  }

  if (normalized === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (normalized === 'failed' || normalized === 'rejected' || normalized === 'cancelled') {
    return 'border-red-200 bg-red-50 text-red-600';
  }

  return 'border-slate-200 bg-slate-50 text-slate-600';
}

const CRYPTO_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  BTC: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', dot: 'bg-[#006446]' },
  ETH: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', dot: 'bg-[#006446]' },
  SOL: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', dot: 'bg-[#006446]' },
  DOGE: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', dot: 'bg-[#006446]' },
  USDT: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', dot: 'bg-[#006446]' },
  USDC: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', dot: 'bg-[#006446]' },
};

function CryptoTypeIcon({ type }: { type: CryptoTransaction['type'] }) {
  switch (type) {
    case 'buy':
      return <ShoppingCart className="w-4 h-4" />;
    case 'sell':
      return <TrendingDown className="w-4 h-4" />;
    case 'send':
      return <Send className="w-4 h-4" />;
    case 'receive':
      return <Download className="w-4 h-4" />;
    case 'swap':
      return <Repeat className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
}

function cryptoTypeColor(type: CryptoTransaction['type']) {
  switch (type) {
    case 'buy':
    case 'receive':
      return 'bg-[#006446]/10 text-[#006446]';
    case 'sell':
    case 'send':
      return 'bg-[#006446]/10 text-[#006446]';
    case 'swap':
      return 'bg-[#006446]/10 text-[#006446]';
    default:
      return 'bg-[#006446]/10 text-[#006446]';
  }
}

function CoinDot({ symbol }: { symbol: string }) {
  const color = CRYPTO_COLORS[symbol]?.dot || 'bg-[#006446]';
  return <span className={`w-2 h-2 rounded-full ${color} inline-block`} />;
}

interface CryptoBalanceSummary {
  symbol: string;
  totalAmount: number;
}

export default function DashboardTransactions() {
  const { t } = useLanguage();
  const { branding } = useBranding();

  const [tab, setTab] = useState<'fiat' | 'crypto'>('fiat');

  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  const [cryptoTypeFilter, setCryptoTypeFilter] = useState('all');
  const [cryptoSymbolFilter, setCryptoSymbolFilter] = useState('all');
  const [cryptoSearch, setCryptoSearch] = useState('');

  const { transactions: fiatTransactions, loading: fiatLoading } = useTransactions();
  const { transactions: cryptoTransactions, loading: cryptoLoading } = useCryptoTransactions();

  const formatDate = formatDayMonthYear;

  const fiatTypeOptions = [
    { value: 'all', label: 'All types' },
    ...Array.from(new Set(fiatTransactions.map((tx) => tx.type).filter(Boolean))).map((type) => ({
      value: type,
      label: toSentenceCase(type),
    })),
  ];

  const fiatStatusOptions = [
    { value: 'all', label: 'All statuses' },
    ...Array.from(new Set(fiatTransactions.map((tx) => tx.status).filter(Boolean))).map((status) => ({
      value: status,
      label: toSentenceCase(status),
    })),
  ];

  const cryptoTypeOptions = [
    { value: 'all', label: t('dashboardTransactions.crypto.filters.types.all') },
    { value: 'buy', label: t('dashboardTransactions.crypto.filters.types.buy'), icon: <ShoppingCart className="w-3.5 h-3.5 text-[#006446]" /> },
    { value: 'sell', label: t('dashboardTransactions.crypto.filters.types.sell'), icon: <TrendingDown className="w-3.5 h-3.5 text-[#006446]" /> },
    { value: 'send', label: t('dashboardTransactions.crypto.filters.types.send'), icon: <Send className="w-3.5 h-3.5 text-[#006446]" /> },
    { value: 'receive', label: t('dashboardTransactions.crypto.filters.types.receive'), icon: <Download className="w-3.5 h-3.5 text-[#006446]" /> },
    { value: 'swap', label: t('dashboardTransactions.crypto.filters.types.swap'), icon: <Repeat className="w-3.5 h-3.5 text-[#006446]" /> },
  ];

  const cryptoSymbolOptions = [
    { value: 'all', label: t('dashboardTransactions.crypto.filters.symbols.all'), icon: <Coins className="w-3.5 h-3.5 text-[#006446]" /> },
    { value: 'BTC', label: t('dashboardTransactions.crypto.filters.symbols.BTC'), icon: <CoinDot symbol="BTC" /> },
    { value: 'ETH', label: t('dashboardTransactions.crypto.filters.symbols.ETH'), icon: <CoinDot symbol="ETH" /> },
    { value: 'SOL', label: t('dashboardTransactions.crypto.filters.symbols.SOL'), icon: <CoinDot symbol="SOL" /> },
    { value: 'DOGE', label: t('dashboardTransactions.crypto.filters.symbols.DOGE'), icon: <CoinDot symbol="DOGE" /> },
    { value: 'USDT', label: t('dashboardTransactions.crypto.filters.symbols.USDT'), icon: <CoinDot symbol="USDT" /> },
    { value: 'USDC', label: t('dashboardTransactions.crypto.filters.symbols.USDC'), icon: <CoinDot symbol="USDC" /> },
  ];

  const filteredFiat = fiatTransactions.filter((tx) => {
    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;
    if (
      search &&
      !tx.details.toLowerCase().includes(search.toLowerCase()) &&
      !tx.comment.toLowerCase().includes(search.toLowerCase()) &&
      !tx.poi.toLowerCase().includes(search.toLowerCase())
    ) return false;
    return true;
  });

  const filteredCrypto = cryptoTransactions.filter((tx) => {
    if (cryptoTypeFilter !== 'all' && tx.type !== cryptoTypeFilter) return false;
    if (cryptoSymbolFilter !== 'all' && tx.symbol !== cryptoSymbolFilter) return false;
    if (
      cryptoSearch &&
      !tx.description.toLowerCase().includes(cryptoSearch.toLowerCase()) &&
      !tx.comment.toLowerCase().includes(cryptoSearch.toLowerCase()) &&
      !tx.symbol.toLowerCase().includes(cryptoSearch.toLowerCase())
    ) return false;
    return true;
  });

  const cryptoBalances: CryptoBalanceSummary[] = (() => {
    const map: Record<string, number> = {};
    cryptoTransactions.forEach((tx) => {
      if (!map[tx.symbol]) map[tx.symbol] = 0;
      if (tx.type === 'buy' || tx.type === 'receive') {
        map[tx.symbol] += tx.amount;
      } else if (tx.type === 'sell' || tx.type === 'send') {
        map[tx.symbol] -= tx.amount;
      }
    });
    return Object.entries(map)
      .filter(([, amt]) => amt > 0)
      .map(([symbol, totalAmount]) => ({ symbol, totalAmount }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          {t('dashboardTransactions.title')}
        </h1>
        <p className="mt-1 text-sm text-[#006446]">
          {t('dashboardTransactions.subtitle')}
        </p>
      </div>

      <div className="flex w-fit gap-1 rounded-xl bg-[#006446]/8 p-1">
        <button
          onClick={() => setTab('fiat')}
          className={`px-5 py-2 text-sm font-medium transition-colors ${
            tab === 'fiat' ? 'rounded-lg bg-white text-[#006446] shadow-sm' : 'rounded-lg text-[#006446]/70 hover:text-[#006446]'
          }`}
        >
          {t('dashboardTransactions.tabs.banking')}
        </button>
        <button
          onClick={() => setTab('crypto')}
          className={`px-5 py-2 text-sm font-medium transition-colors ${
            tab === 'crypto' ? 'rounded-lg bg-white text-[#006446] shadow-sm' : 'rounded-lg text-[#006446]/70 hover:text-[#006446]'
          }`}
        >
          {t('dashboardTransactions.tabs.crypto')}
        </button>
      </div>

      {tab === 'fiat' && (
        <FiatTransactionsView
          t={t}
          branding={branding}
          formatDate={formatDate}
          search={search}
          setSearch={setSearch}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          filtered={filteredFiat}
          loading={fiatLoading}
          fiatTypeOptions={fiatTypeOptions}
          fiatStatusOptions={fiatStatusOptions}
        />
      )}

      {tab === 'crypto' && (
        <CryptoTransactionsView
          t={t}
          branding={branding}
          formatDate={formatDate}
          search={cryptoSearch}
          setSearch={setCryptoSearch}
          typeFilter={cryptoTypeFilter}
          setTypeFilter={setCryptoTypeFilter}
          symbolFilter={cryptoSymbolFilter}
          setSymbolFilter={setCryptoSymbolFilter}
          filtered={filteredCrypto}
          loading={cryptoLoading}
          balances={cryptoBalances}
          txCount={cryptoTransactions.length}
          cryptoTypeOptions={cryptoTypeOptions}
          cryptoSymbolOptions={cryptoSymbolOptions}
        />
      )}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-[#006446]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#006446]">
        <CheckCircle2 className="w-3 h-3" /> {t('dashboardTransactions.crypto.status.completed')}
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-[#006446]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#006446]">
        <Clock className="w-3 h-3" /> {t('dashboardTransactions.crypto.status.pending')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-[#006446]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#006446]">
      <XCircle className="w-3 h-3" /> {t('dashboardTransactions.crypto.status.failed')}
    </span>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
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

function TransactionDetailShell({
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
        aria-label="Close transaction details"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#006446]/14 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.55)]">
        <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#006446]/10 bg-white px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Transaction details</p>
            <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onDownloadInvoice}
              disabled={!invoiceAvailable}
              title={invoiceAvailable ? 'Download invoice' : 'Invoice available when transaction is completed'}
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
              aria-label="Close transaction details"
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

function FiatTransactionDetailModal({
  t,
  branding,
  formatDate,
  transaction,
  onClose,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  transaction: Transaction;
  onClose: () => void;
}) {
  const inflow = isBankingInflow(transaction.type);
  const resolvedAmount = getFiatTransactionAmount(transaction);
  const amount = resolvedAmount.signed;
  const title = getFiatTransactionTitle(transaction);

  return (
    <TransactionDetailShell
      title={title}
      subtitle={`${toSentenceCase(transaction.type)} transaction - ${formatDate(transaction.created_at)}`}
      onClose={onClose}
      onDownloadInvoice={() => downloadTransactionInvoice(buildFiatTransactionInvoice(transaction, formatDate), branding)}
      invoiceAvailable={(transaction.status || 'completed') === 'completed'}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#006446]/10 bg-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10 text-[#006446]">
          {inflow ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{amount}</p>
          <p className="text-xs text-slate-500">{transaction.reference_number || transaction.poi || transaction.id}</p>
        </div>
        <StatusBadge status={transaction.status || 'completed'} t={t} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label="Created" value={formatDate(transaction.created_at)} />
        <DetailRow label="Transaction type" value={toSentenceCase(transaction.type)} />
        <DetailRow label="Status" value={toSentenceCase(transaction.status || 'completed')} />
        <DetailRow label="Amount" value={amount} />
        <DetailRow label="Balance after" value={formatCurrencyByCode(Number(transaction.balance_after || 0), resolvedAmount.currency)} />
        <DetailRow label="Reference" value={transaction.reference_number || transaction.poi || transaction.id} mono />
        <DetailRow label="POI" value={transaction.poi} />
        <DetailRow label="Category" value={transaction.category} />
        <DetailRow label="Comment" value={transaction.comment} />
        <DetailRow label="Details" value={transaction.details || transaction.description} />
      </div>
    </TransactionDetailShell>
  );
}

function CryptoTransactionDetailModal({
  t,
  branding,
  formatDate,
  transaction,
  onClose,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  transaction: CryptoTransaction;
  onClose: () => void;
}) {
  const inflow = transaction.type === 'buy' || transaction.type === 'receive';
  const amount = `${inflow ? '+' : '-'}${formatCryptoAmount(transaction.amount, transaction.symbol)}`;

  return (
    <TransactionDetailShell
      title={getCryptoTransactionTitle(transaction)}
      subtitle={`${toSentenceCase(transaction.type)} crypto transaction - ${formatDate(transaction.created_at)}`}
      onClose={onClose}
      onDownloadInvoice={() => downloadTransactionInvoice(buildCryptoTransactionInvoice(transaction, formatDate), branding)}
      invoiceAvailable={transaction.status === 'completed'}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#006446]/10 bg-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10 text-[#006446]">
          <CryptoTypeIcon type={transaction.type} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{amount}</p>
          <p className="text-xs text-slate-500">{transaction.tx_hash || transaction.id}</p>
        </div>
        <StatusBadge status={transaction.status} t={t} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label="Created" value={formatDate(transaction.created_at)} />
        <DetailRow label="Transaction type" value={toSentenceCase(transaction.type)} />
        <DetailRow label="Status" value={toSentenceCase(transaction.status)} />
        <DetailRow label="Asset" value={`${transaction.name} (${transaction.symbol})`} />
        <DetailRow label="Amount" value={amount} />
        <DetailRow label="Price per unit" value={formatCurrency(transaction.price_per_unit)} />
        <DetailRow label="Total value" value={formatCurrency(transaction.total_value)} />
        <DetailRow label="Fee" value={formatCurrency(transaction.fee)} />
        <DetailRow label="Wallet address" value={transaction.wallet_address} mono />
        <DetailRow label="Transaction hash" value={transaction.tx_hash} mono />
        {transaction.type === 'swap' && transaction.from_symbol ? (
          <DetailRow label="Swap" value={`${transaction.from_symbol} to ${transaction.to_symbol}`} />
        ) : null}
        <DetailRow label="Comment" value={transaction.comment} />
        <DetailRow label="Description" value={transaction.description} />
      </div>
    </TransactionDetailShell>
  );
}

function FiatTransactionsView({
  t,
  branding,
  formatDate,
  search,
  setSearch,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  filtered,
  loading,
  fiatTypeOptions,
  fiatStatusOptions,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  search: string;
  setSearch: (v: string) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
  filtered: Transaction[];
  loading: boolean;
  fiatTypeOptions: { value: string; label: string }[];
  fiatStatusOptions: { value: string; label: string }[];
}) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  return (
    <>
      <div className="rounded-2xl border border-[#006446]/14 bg-white p-4 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006446]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('dashboardTransactions.fiat.searchPlaceholder')}
              className="w-full rounded-xl border border-[#006446]/14 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
            />
          </div>
          <Dropdown
            value={selectedType}
            onChange={setSelectedType}
            options={fiatTypeOptions}
            className="sm:w-44"
          />
          <Dropdown
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={fiatStatusOptions}
            className="sm:w-48"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="flex items-center justify-between border-b border-[#006446]/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#006446]" />
            <span className="text-sm text-[#006446]">
              {filtered.length} {t('dashboardTransactions.fiat.count')}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-[#006446]/10">
            {filtered.map((tx) => {
              const title = getFiatTransactionTitle(tx);
              const commentPreview = tx.comment && tx.comment !== title ? tx.comment : '';

              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelectedTransaction(tx)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-[#006446]/[0.03] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#006446]/20"
                >
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                    isBankingInflow(tx.type) ? 'bg-[#006446]/10 text-[#006446]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isBankingInflow(tx.type) ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{title || 'No details'}</p>
                    {commentPreview ? (
                      <p className="mt-1 truncate text-xs text-slate-500">{commentPreview}</p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(tx.created_at)}</span>
                      <span className="rounded-full border border-[#006446]/12 bg-[#006446]/[0.03] px-2 py-0.5 text-[11px] font-medium text-[#006446]">
                        POI: {tx.poi || 'Empty'}
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
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-6 py-16 text-center text-slate-400">
                {t('dashboardTransactions.fiat.empty')}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTransaction && (
        <FiatTransactionDetailModal
          t={t}
          branding={branding}
          formatDate={formatDate}
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
}

function CryptoTransactionsView({
  t,
  branding,
  formatDate,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  symbolFilter,
  setSymbolFilter,
  filtered,
  loading,
  balances,
  txCount,
  cryptoTypeOptions,
  cryptoSymbolOptions,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  search: string;
  setSearch: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  symbolFilter: string;
  setSymbolFilter: (v: string) => void;
  filtered: CryptoTransaction[];
  loading: boolean;
  balances: CryptoBalanceSummary[];
  txCount: number;
  cryptoTypeOptions: { value: string; label: string; icon?: React.ReactNode }[];
  cryptoSymbolOptions: { value: string; label: string; icon?: React.ReactNode }[];
}) {
  const [selectedTransaction, setSelectedTransaction] = useState<CryptoTransaction | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.slice(0, 3).map((bal) => {
          const colors = CRYPTO_COLORS[bal.symbol] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
          return (
            <div key={bal.symbol} className="rounded-2xl border border-[#006446]/14 bg-white p-4 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-6 h-6 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-[10px] font-bold`}>
                  {bal.symbol.charAt(0)}
                </span>
            <p className="text-xs font-medium uppercase tracking-wider text-[#006446]">{bal.symbol}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{formatCryptoAmount(bal.totalAmount, bal.symbol)}</p>
            </div>
          );
        })}

        <div className="rounded-2xl border border-[#006446]/14 bg-white p-4 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#006446]/10 text-[#006446]">
              <Wallet className="w-3.5 h-3.5" />
            </span>
            <p className="text-xs font-medium uppercase tracking-wider text-[#006446]">
              {t('dashboardTransactions.crypto.transactionsCard')}
            </p>
          </div>
          <p className="text-lg font-bold text-slate-900">{txCount}</p>
        </div>
      </div>

      {balances.length > 3 && (
        <div className="flex flex-wrap gap-3">
          {balances.slice(3).map((bal) => {
            const colors = CRYPTO_COLORS[bal.symbol] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
            return (
              <div key={bal.symbol} className="flex items-center gap-2.5 rounded-2xl border border-[#006446]/14 bg-white px-4 py-2.5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                <span className={`w-5 h-5 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-[9px] font-bold`}>
                  {bal.symbol.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-slate-900">{formatCryptoAmount(bal.totalAmount, bal.symbol)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-[#006446]/14 bg-white p-4 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006446]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('dashboardTransactions.crypto.searchPlaceholder')}
              className="w-full rounded-xl border border-[#006446]/14 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
            />
          </div>
          <Dropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={cryptoTypeOptions}
            className="sm:w-44"
          />
          <Dropdown
            value={symbolFilter}
            onChange={setSymbolFilter}
            options={cryptoSymbolOptions}
            className="sm:w-48"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="flex items-center justify-between border-b border-[#006446]/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#006446]" />
            <span className="text-sm text-[#006446]">
              {filtered.length} {t('dashboardTransactions.crypto.count')}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-[#006446]/10">
            {filtered.map((tx) => {
              const iconStyle = CRYPTO_COLORS[tx.symbol] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
              const isInflow = tx.type === 'buy' || tx.type === 'receive';
              const title = getCryptoTransactionTitle(tx);
              const commentPreview = tx.comment && tx.comment !== title ? tx.comment : '';

              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelectedTransaction(tx)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-[#006446]/[0.03] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#006446]/20"
                >
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${cryptoTypeColor(tx.type)}`}>
                    <CryptoTypeIcon type={tx.type} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
                    </div>
                    {commentPreview ? (
                      <p className="mt-1 truncate text-xs text-slate-500">{commentPreview}</p>
                    ) : null}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{formatDate(tx.created_at)}</span>
                      <StatusBadge status={tx.status} t={t} />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${isInflow ? 'text-[#006446]' : 'text-slate-900'}`}>
                      {isInflow ? '+' : '-'}{formatCryptoAmount(tx.amount, tx.symbol)}
                    </p>
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold ${iconStyle.bg} ${iconStyle.text}`}>
                        {tx.symbol.charAt(0)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {formatCurrency(tx.total_value)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-6 py-16 text-center text-slate-400">
                {t('dashboardTransactions.crypto.empty')}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTransaction && (
        <CryptoTransactionDetailModal
          t={t}
          branding={branding}
          formatDate={formatDate}
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
}
