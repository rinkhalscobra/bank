import { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { FiatBalance } from '../../hooks/useFiatBalances';
import type { InternalTransferPayload } from '../../hooks/useTransfers';
import Dropdown from '../ui/Dropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import '../../i18n/internal-transfer-panel/translations';

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface InternalTransferPanelProps {
  fiatBalances: FiatBalance[];
  submitting: boolean;
  onSubmit: (payload: InternalTransferPayload) => Promise<{ error: string | null }>;
  onSuccess: () => void;
}

export default function InternalTransferPanel({
  fiatBalances,
  submitting,
  onSubmit,
  onSuccess,
}: InternalTransferPanelProps) {
  const { t } = useLanguage();
  const actionableBalances = fiatBalances.filter((balance) => isBalanceAvailable(balance.status));
  const restrictedCount = fiatBalances.length - actionableBalances.length;

  const [sourceCurrency, setSourceCurrency] = useState(actionableBalances[0]?.currency || 'USD');
  const [targetCurrency, setTargetCurrency] = useState(
    actionableBalances.length > 1 ? actionableBalances[1].currency : actionableBalances[0]?.currency || 'USD'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sourceBalance = actionableBalances.find((b) => b.currency === sourceCurrency);
  const availableTargets = actionableBalances.filter((b) => b.currency !== sourceCurrency);

  const handleSwap = () => {
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      setError(t('internalTransfer.errors.invalidAmount'));
      return;
    }

    if (sourceCurrency === targetCurrency) {
      setError(t('internalTransfer.errors.sameCurrency'));
      return;
    }

    const result = await onSubmit({
      amount: numAmount,
      currency: sourceCurrency,
      target_currency: targetCurrency,
      description,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setAmount('');
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
            <ArrowRightLeft className="w-5 h-5 text-[#006446]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('internalTransfer.title')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('internalTransfer.subtitle')}
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
            {t('internalTransfer.success')}
          </div>
        )}

        <div className="grid sm:grid-cols-[1fr,auto,1fr] gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('internalTransfer.fields.from')}
            </label>
            <Dropdown
              value={sourceCurrency}
              onChange={(value) => {
                setSourceCurrency(value);
                if (value === targetCurrency && availableTargets.length > 0) {
                  const next = actionableBalances.find((b) => b.currency !== value);
                  if (next) setTargetCurrency(next.currency);
                }
              }}
              options={actionableBalances.map((b) => ({
                value: b.currency,
                label: `${b.currency} (${formatCurrency(b.balance, b.currency)})`,
              }))}
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="mb-0.5 hidden h-10 w-10 items-center justify-center rounded-xl border border-[#006446]/14 text-[#006446] transition-colors hover:bg-[#006446]/[0.04] sm:flex"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('internalTransfer.fields.to')}
            </label>
            <Dropdown
              value={targetCurrency}
              onChange={setTargetCurrency}
              options={actionableBalances
                .filter((b) => b.currency !== sourceCurrency)
                .map((b) => ({
                  value: b.currency,
                  label: `${b.currency} (${formatCurrency(b.balance, b.currency)})`,
                }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('internalTransfer.fields.amount')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
              {sourceCurrency}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('internalTransfer.placeholders.amount')}
              className="w-full rounded-xl border border-[#006446]/14 py-3 pl-14 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
            />
          </div>
          {sourceBalance && (
            <p className="mt-1 text-xs text-slate-400">
              {t('internalTransfer.available')} {formatCurrency(sourceBalance.balance, sourceBalance.currency)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('internalTransfer.fields.note')}{' '}
            <span className="text-slate-400 font-normal">
              ({t('internalTransfer.optional')})
            </span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('internalTransfer.placeholders.note')}
            className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !amount || actionableBalances.length < 2}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006446] py-3.5 font-semibold text-white transition-colors hover:bg-[#00523a] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4" />
              {t('internalTransfer.actions.submit')}
            </>
          )}
        </button>

        {actionableBalances.length < 2 && (
          <p className="text-xs text-slate-400 text-center">
            You need at least two available fiat balances to use internal transfers.
          </p>
        )}
      </form>
    </div>
  );
}
