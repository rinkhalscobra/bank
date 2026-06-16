import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import type { FiatBalance } from '../../hooks/useFiatBalances';
import type { ExternalTransferPayload } from '../../hooks/useTransfers';
import Dropdown from '../ui/Dropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import '../../i18n/external-transfer-panel/translations';

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface ExternalTransferPanelProps {
  fiatBalances: FiatBalance[];
  submitting: boolean;
  onSubmit: (payload: ExternalTransferPayload) => Promise<{ error: string | null }>;
  onSuccess: () => void;
}

export default function ExternalTransferPanel({
  fiatBalances,
  submitting,
  onSubmit,
  onSuccess,
}: ExternalTransferPanelProps) {
  const { t } = useLanguage();
  const actionableBalances = fiatBalances.filter((balance) => isBalanceAvailable(balance.status));
  const restrictedCount = fiatBalances.length - actionableBalances.length;

  const [currency, setCurrency] = useState(actionableBalances[0]?.currency || 'USD');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sourceBalance = actionableBalances.find((b) => b.currency === currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      setError(t('externalTransfer.errors.invalidAmount'));
      return;
    }
    if (!recipientName.trim()) {
      setError(t('externalTransfer.errors.recipientRequired'));
      return;
    }
    if (!bankName.trim()) {
      setError(t('externalTransfer.errors.bankRequired'));
      return;
    }
    if (!routingNumber.trim()) {
      setError(t('externalTransfer.errors.routingRequired'));
      return;
    }
    if (!accountNumber.trim()) {
      setError(t('externalTransfer.errors.accountRequired'));
      return;
    }

    const result = await onSubmit({
      amount: numAmount,
      currency,
      recipient_name: recipientName.trim(),
      bank_name: bankName.trim(),
      routing_number: routingNumber.trim(),
      account_number: accountNumber.trim(),
      swift_code: swiftCode.trim(),
      description: description.trim(),
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setAmount('');
      setRecipientName('');
      setBankName('');
      setRoutingNumber('');
      setAccountNumber('');
      setSwiftCode('');
      setDescription('');
      onSuccess();
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 px-6 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10">
            <Building2 className="w-5 h-5 text-[#006446]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('externalTransfer.title')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('externalTransfer.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {restrictedCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Restricted balances are hidden and cannot be used for transfers.
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {t('externalTransfer.success')}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('externalTransfer.fields.sourceCurrency')}
            </label>
            <Dropdown
              value={currency}
              onChange={setCurrency}
              options={actionableBalances.map((b) => ({
                value: b.currency,
                label: `${b.currency} (${formatCurrency(b.balance, b.currency)})`,
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('externalTransfer.fields.amount')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('externalTransfer.placeholders.amount')}
                className="w-full rounded-xl border border-[#006446]/14 py-3 pl-14 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
              />
            </div>
            {sourceBalance && (
              <p className="mt-1 text-xs text-slate-400">
                {t('externalTransfer.available')} {formatCurrency(sourceBalance.balance, sourceBalance.currency)}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            {t('externalTransfer.recipientSection')}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('externalTransfer.fields.recipientName')}
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder={t('externalTransfer.placeholders.recipientName')}
                className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('externalTransfer.fields.bankName')}
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={t('externalTransfer.placeholders.bankName')}
                className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('externalTransfer.fields.routingNumber')}
                </label>
                <input
                  type="text"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder={t('externalTransfer.placeholders.routingNumber')}
                  maxLength={9}
                  className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('externalTransfer.fields.accountNumber')}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={t('externalTransfer.placeholders.accountNumber')}
                  className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('externalTransfer.fields.swiftCode')}{' '}
                <span className="text-slate-400 font-normal">
                  ({t('externalTransfer.optionalInternational')})
                </span>
              </label>
              <input
                type="text"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value)}
                placeholder={t('externalTransfer.placeholders.swiftCode')}
                maxLength={11}
                className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('externalTransfer.fields.note')}{' '}
            <span className="text-slate-400 font-normal">
              ({t('externalTransfer.optional')})
            </span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('externalTransfer.placeholders.note')}
            className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !amount || !recipientName || !bankName || !routingNumber || !accountNumber || actionableBalances.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006446] py-3.5 font-semibold text-white transition-colors hover:bg-[#00523a] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t('externalTransfer.actions.send')}
            </>
          )}
        </button>

        {actionableBalances.length === 0 ? (
          <p className="text-xs text-slate-400 text-center">
            No available fiat balances can be used for external transfers right now.
          </p>
        ) : null}
      </form>
    </div>
  );
}
