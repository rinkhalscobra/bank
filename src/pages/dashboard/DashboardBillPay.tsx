import { useState } from 'react';
import {
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Landmark,
  Bitcoin,
  Receipt,
  XCircle,
} from 'lucide-react';
import { useBillPayments } from '../../hooks/useBillPayments';
import { useCryptoWallets, CryptoWallet } from '../../hooks/useCryptoWallets';
import BankPaymentPanel from '../../components/billpay/BankPaymentPanel';
import CryptoPaymentPanel from '../../components/billpay/CryptoPaymentPanel';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-billpay/translations';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function DashboardBillPay() {
  const { t, language } = useLanguage();
  const { payments, loading, payBill } = useBillPayments();
  const { wallets, loading: walletsLoading } = useCryptoWallets();

  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'crypto'>('crypto');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const [billerName, setBillerName] = useState('');
  const [amount, setAmount] = useState('');

  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);

  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankRoutingNumber, setBankRoutingNumber] = useState('');
  const [bankSwiftCode, setBankSwiftCode] = useState('');

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resetForm = () => {
    setBillerName('');
    setAmount('');
    setSelectedWallet(null);
    setBankName('');
    setBankAccountNumber('');
    setBankRoutingNumber('');
    setBankSwiftCode('');
    setPaymentMethod('crypto');
  };

  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;

  const canSubmit =
    billerName.trim().length > 0 &&
    isAmountValid &&
    !submitting &&
    (paymentMethod === 'bank'
      ? bankName.trim().length > 0 && bankAccountNumber.trim().length > 0
      : selectedWallet !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setResult(null);

    const res = await payBill({
      billerName: billerName.trim(),
      amount: parsedAmount,
      isRecurring: false,
      paymentMethod,
      cryptoSymbol: paymentMethod === 'crypto' ? selectedWallet?.symbol : undefined,
      cryptoWalletAddress: paymentMethod === 'crypto' ? selectedWallet?.wallet_address : undefined,
      bankName: paymentMethod === 'bank' ? bankName : undefined,
      bankAccountNumber: paymentMethod === 'bank' ? bankAccountNumber : undefined,
      bankRoutingNumber: paymentMethod === 'bank' ? bankRoutingNumber : undefined,
      bankSwiftCode: paymentMethod === 'bank' ? bankSwiftCode : undefined,
    });

    if (res?.error) {
      setResult({ success: false, message: res.error });
    } else {
      setResult({
        success: true,
        message: `${t('dashboardBillPay.messages.paymentOf')} ${formatCurrency(parsedAmount)} ${t('dashboardBillPay.messages.to')} ${billerName.trim()} ${t('dashboardBillPay.messages.submitted')}`,
      });
      resetForm();
      setShowForm(false);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {t('dashboardBillPay.title')}
          </h1>
          <p className="mt-1 text-sm text-[#006446]">
            {t('dashboardBillPay.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              resetForm();
              setResult(null);
            }
          }}
          className="flex self-start items-center gap-2 rounded-xl bg-[#006446] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a]"
        >
          <Zap className="w-4 h-4" />
          {showForm
            ? t('dashboardBillPay.actions.cancel')
            : t('dashboardBillPay.actions.newRequest')}
        </button>
      </div>

      {pendingCount > 0 && !showForm && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
          <Clock className="w-5 h-5 flex-shrink-0" />
          {t('dashboardBillPay.pending.youHave')} {pendingCount} {pendingCount !== 1
            ? t('dashboardBillPay.pending.payments')
            : t('dashboardBillPay.pending.payment')} {t('dashboardBillPay.pending.awaitingApproval')}
        </div>
      )}

      {result && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
          {result.success ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium">
              {result.success
                ? t('dashboardBillPay.messages.submittedTitle')
                : t('dashboardBillPay.messages.failedTitle')}
            </p>
            <p className="mt-0.5 opacity-90">{result.message}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="flex items-center gap-3 border-b border-[#006446]/10 px-6 py-4">
            <Receipt className="w-5 h-5 text-[#006446]" />
            <div>
              <h2 className="font-semibold text-slate-900">
                {t('dashboardBillPay.form.title')}
              </h2>
              <p className="mt-0.5 text-xs text-[#006446]">
                {t('dashboardBillPay.form.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('dashboardBillPay.fields.billerName')} <span className="text-[#006446]">*</span>
                </label>
                <input
                  type="text"
                  value={billerName}
                  onChange={(e) => setBillerName(e.target.value)}
                  placeholder={t('dashboardBillPay.placeholders.billerName')}
                  className="w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('dashboardBillPay.fields.amountUsd')} <span className="text-[#006446]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006446] text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t('dashboardBillPay.placeholders.amount')}
                    className="w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] py-2.5 pl-8 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                {t('dashboardBillPay.fields.paymentMethod')} <span className="text-[#006446]">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`flex items-center gap-3 p-4 border-2 transition-all ${
                    paymentMethod === 'crypto'
                      ? 'rounded-2xl border-[#006446] bg-[#006446]/[0.04] shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]'
                      : 'rounded-2xl border-[#006446]/14 bg-white hover:border-[#006446]/25'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10 text-[#006446]">
                    <Bitcoin className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${paymentMethod === 'crypto' ? 'text-slate-900' : 'text-slate-700'}`}>
                      {t('dashboardBillPay.methods.crypto.title')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t('dashboardBillPay.methods.crypto.subtitle')}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex items-center gap-3 p-4 border-2 transition-all ${
                    paymentMethod === 'bank'
                      ? 'rounded-2xl border-[#006446] bg-[#006446]/[0.04] shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]'
                      : 'rounded-2xl border-[#006446]/14 bg-white hover:border-[#006446]/25'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10 text-[#006446]">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${paymentMethod === 'bank' ? 'text-slate-900' : 'text-slate-700'}`}>
                      {t('dashboardBillPay.methods.bank.title')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t('dashboardBillPay.methods.bank.subtitle')}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="border-t border-[#006446]/10 pt-5">
              {paymentMethod === 'crypto' ? (
                <CryptoPaymentPanel
                  wallets={wallets}
                  walletsLoading={walletsLoading}
                  selectedWallet={selectedWallet}
                  onSelectWallet={setSelectedWallet}
                />
              ) : (
                <BankPaymentPanel
                  bankName={bankName}
                  bankAccountNumber={bankAccountNumber}
                  bankRoutingNumber={bankRoutingNumber}
                  bankSwiftCode={bankSwiftCode}
                  onChangeBankName={setBankName}
                  onChangeBankAccountNumber={setBankAccountNumber}
                  onChangeBankRoutingNumber={setBankRoutingNumber}
                  onChangeBankSwiftCode={setBankSwiftCode}
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-300 disabled:text-slate-500"
              >
                {submitting
                  ? t('dashboardBillPay.actions.submitting')
                  : t('dashboardBillPay.actions.submit')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-xl border border-[#006446]/14 px-6 py-2.5 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
              >
                {t('dashboardBillPay.actions.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <PaymentHistory
        t={t}
        formatDate={formatDate}
        payments={payments}
      />
    </div>
  );
}

function StatusBadge({
  t,
  status,
}: {
  t: (key: string) => string;
  status: string;
}) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#006446]/14 bg-[#006446]/10 px-2 py-0.5 text-xs font-medium text-[#006446]">
        <CheckCircle className="w-3 h-3" />
        {t('dashboardBillPay.status.approved')}
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#006446]/14 bg-[#006446]/10 px-2 py-0.5 text-xs font-medium text-[#006446]">
        <Clock className="w-3 h-3" />
        {t('dashboardBillPay.status.pending')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#006446]/14 bg-[#006446]/10 px-2 py-0.5 text-xs font-medium text-[#006446]">
      <XCircle className="w-3 h-3" />
      {t('dashboardBillPay.status.declined')}
    </span>
  );
}

function PaymentHistory({
  t,
  formatDate,
  payments,
}: {
  t: (key: string) => string;
  formatDate: (dateStr: string) => string;
  payments: {
    id: string;
    biller_name: string;
    amount: number;
    status: string;
    payment_method: string;
    crypto_symbol: string;
    created_at: string;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 px-6 py-4">
        <h2 className="font-semibold text-slate-900">
          {t('dashboardBillPay.history.title')}
        </h2>
      </div>

      {payments.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Receipt className="mx-auto mb-3 h-10 w-10 text-[#006446]/30" />
          <p className="text-sm text-[#006446]">{t('dashboardBillPay.history.emptyTitle')}</p>
          <p className="mt-1 text-xs text-[#006446]/70">{t('dashboardBillPay.history.emptySubtitle')}</p>
        </div>
      ) : (
        <div className="divide-y divide-[#006446]/10">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#006446]/[0.03]">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#006446]/10 text-[#006446]">
                {p.payment_method === 'crypto' ? (
                  <Bitcoin className="w-5 h-5" />
                ) : (
                  <Landmark className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {p.biller_name ||
                      (p.payment_method === 'crypto'
                        ? t('dashboardBillPay.history.cryptoPayment')
                        : t('dashboardBillPay.history.bankPayment'))}
                  </p>
                  <span
                    className="rounded-full bg-[#006446]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#006446]"
                  >
                    {p.payment_method === 'crypto' ? p.crypto_symbol : t('dashboardBillPay.methods.bank.short')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#006446]/70">{formatDate(p.created_at)}</p>
              </div>

              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                {p.amount > 0 && (
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(p.amount)}
                  </p>
                )}
                <StatusBadge t={t} status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
