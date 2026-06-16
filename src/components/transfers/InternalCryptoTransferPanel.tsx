import { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CryptoWallet, InternalCryptoTransferPayload } from '../../hooks/useCryptoWallets';
import type { CryptoBalance } from '../../hooks/useCryptoBalances';
import Dropdown from '../ui/Dropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import '../../i18n/internal-crypto-transfer-panel/translations';

const CRYPTO_COLORS: Record<string, { bg: string; text: string }> = {
  BTC: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
  ETH: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
  SOL: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
  DOGE: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
  USDT: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
  USDC: { bg: 'bg-[#006446]/10', text: 'text-[#006446]' },
};

function formatCryptoAmount(amount: number, symbol: string) {
  const decimals = amount < 0.001 ? 8 : amount < 1 ? 6 : amount < 100 ? 4 : 2;
  return `${amount.toFixed(decimals)} ${symbol}`;
}

interface Props {
  wallets: CryptoWallet[];
  balances: CryptoBalance[];
  submitting: boolean;
  onSubmit: (payload: InternalCryptoTransferPayload) => Promise<{ error: string | null }>;
  onSuccess: () => void;
}

export default function InternalCryptoTransferPanel({
  wallets,
  balances,
  submitting,
  onSubmit,
  onSuccess,
}: Props) {
  const { t } = useLanguage();
  const actionableWallets = wallets.filter((wallet) => {
    const balance = balances.find((entry) => entry.symbol === wallet.symbol);
    return balance ? isBalanceAvailable(balance.status) : false;
  });
  const restrictedCount = balances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  const [sourceSymbol, setSourceSymbol] = useState(actionableWallets[0]?.symbol || 'BTC');
  const [targetSymbol, setTargetSymbol] = useState(
    actionableWallets.length > 1 ? actionableWallets[1].symbol : actionableWallets[0]?.symbol || 'ETH'
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sourceBalance = balances.find((b) => b.symbol === sourceSymbol);
  const sourceAvailable = sourceBalance ? Number(sourceBalance.balance) : 0;

  const handleSwap = () => {
    const temp = sourceSymbol;
    setSourceSymbol(targetSymbol);
    setTargetSymbol(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError(t('internalCryptoTransfer.errors.invalidAmount'));
      return;
    }
    if (sourceSymbol === targetSymbol) {
      setError(t('internalCryptoTransfer.errors.sameCoin'));
      return;
    }
    if (numAmount > sourceAvailable) {
      setError(`${t('internalCryptoTransfer.errors.insufficient')} ${sourceSymbol} ${t('internalCryptoTransfer.errors.balance')}`);
      return;
    }

    const result = await onSubmit({
      symbol: sourceSymbol,
      target_symbol: targetSymbol,
      amount: numAmount,
      note: note.trim(),
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setAmount('');
      setNote('');
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
              {t('internalCryptoTransfer.title')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('internalCryptoTransfer.subtitle')}
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
            Restricted balances are hidden and cannot be used for crypto transfers.
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {t('internalCryptoTransfer.success')}
          </div>
        )}

        <div className="grid sm:grid-cols-[1fr,auto,1fr] gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('internalCryptoTransfer.fields.from')}
            </label>
            <Dropdown
              value={sourceSymbol}
              onChange={(value) => {
                setSourceSymbol(value);
                if (value === targetSymbol) {
                  const next = actionableWallets.find((w) => w.symbol !== value);
                  if (next) setTargetSymbol(next.symbol);
                }
              }}
              options={actionableWallets.map((w) => {
                const bal = balances.find((b) => b.symbol === w.symbol);
                const amt = bal ? Number(bal.balance) : 0;
                return {
                  value: w.symbol,
                  label: `${w.symbol} (${formatCryptoAmount(amt, w.symbol)})`,
                  icon: (
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${CRYPTO_COLORS[w.symbol]?.bg || 'bg-[#006446]/10'} ${CRYPTO_COLORS[w.symbol]?.text || 'text-[#006446]'} text-[9px] font-bold`}>
                      {w.symbol.charAt(0)}
                    </span>
                  ),
                };
              })}
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="mb-0.5 hidden h-10 w-10 items-center justify-center rounded-xl border border-[#006446]/14 text-[#006446] transition-colors hover:bg-[#006446]/[0.04] sm:flex"
            title={t('internalCryptoTransfer.actions.swap')}
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('internalCryptoTransfer.fields.to')}
            </label>
            <Dropdown
              value={targetSymbol}
              onChange={setTargetSymbol}
              options={actionableWallets
                .filter((w) => w.symbol !== sourceSymbol)
                .map((w) => {
                  const bal = balances.find((b) => b.symbol === w.symbol);
                  const amt = bal ? Number(bal.balance) : 0;
                  return {
                    value: w.symbol,
                    label: `${w.symbol} (${formatCryptoAmount(amt, w.symbol)})`,
                    icon: (
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${CRYPTO_COLORS[w.symbol]?.bg || 'bg-[#006446]/10'} ${CRYPTO_COLORS[w.symbol]?.text || 'text-[#006446]'} text-[9px] font-bold`}>
                        {w.symbol.charAt(0)}
                      </span>
                    ),
                  };
                })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('internalCryptoTransfer.fields.amount')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
              {sourceSymbol}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('internalCryptoTransfer.placeholders.amount')}
              className="w-full rounded-xl border border-[#006446]/14 py-3 pl-16 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t('internalCryptoTransfer.available')} {formatCryptoAmount(sourceAvailable, sourceSymbol)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('internalCryptoTransfer.fields.note')}{' '}
            <span className="text-slate-400 font-normal">
              ({t('internalCryptoTransfer.optional')})
            </span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('internalCryptoTransfer.placeholders.note')}
            className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !amount || actionableWallets.length < 2}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006446] py-3.5 font-semibold text-white transition-colors hover:bg-[#00523a] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4" />
              {t('internalCryptoTransfer.actions.convert')}
            </>
          )}
        </button>

        {actionableWallets.length < 2 && (
          <p className="text-xs text-slate-400 text-center">
            You need at least two available crypto balances to use internal crypto transfers.
          </p>
        )}
      </form>
    </div>
  );
}
