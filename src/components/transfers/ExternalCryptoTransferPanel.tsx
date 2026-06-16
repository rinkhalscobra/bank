import { useState } from 'react';
import { Send, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import type {
  CryptoWallet,
  ExternalCryptoTransferPayload,
  ReceiveCryptoTransferPayload,
} from '../../hooks/useCryptoWallets';
import type { CryptoBalance } from '../../hooks/useCryptoBalances';
import Dropdown from '../ui/Dropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import '../../i18n/external-crypto-transfer-panel/translations';

const CRYPTO_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  BTC: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', accent: '#006446' },
  ETH: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', accent: '#006446' },
  SOL: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', accent: '#006446' },
  DOGE: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', accent: '#006446' },
  USDT: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', accent: '#006446' },
  USDC: { bg: 'bg-[#006446]/10', text: 'text-[#006446]', accent: '#006446' },
};

function formatCryptoAmount(amount: number, symbol: string) {
  const decimals = amount < 0.001 ? 8 : amount < 1 ? 6 : amount < 100 ? 4 : 2;
  return `${amount.toFixed(decimals)} ${symbol}`;
}

function getPlaceholder(symbol: string) {
  if (symbol === 'BTC') return 'bc1q...';
  if (symbol === 'ETH' || symbol === 'USDC') return '0x...';
  if (symbol === 'SOL') return 'Solana address...';
  if (symbol === 'DOGE') return 'D...';
  if (symbol === 'USDT') return 'T...';
  return 'Wallet address';
}

interface Props {
  wallets: CryptoWallet[];
  balances: CryptoBalance[];
  submitting: boolean;
  onSend: (payload: ExternalCryptoTransferPayload) => Promise<{ error: string | null }>;
  onReceive: (payload: ReceiveCryptoTransferPayload) => Promise<{ error: string | null }>;
  onSuccess: () => void;
}

type Mode = 'send' | 'receive';

export default function ExternalCryptoTransferPanel({
  wallets,
  balances,
  submitting,
  onSend,
  onReceive,
  onSuccess,
}: Props) {
  const { t } = useLanguage();
  const actionableWallets = wallets.filter((wallet) => {
    const balance = balances.find((entry) => entry.symbol === wallet.symbol);
    return balance ? isBalanceAvailable(balance.status) : false;
  });
  const restrictedCount = balances.filter((balance) => !isBalanceAvailable(balance.status)).length;
  const [mode, setMode] = useState<Mode>('send');
  const [symbol, setSymbol] = useState(actionableWallets[0]?.symbol || 'BTC');

  const selectedWallet = actionableWallets.find((w) => w.symbol === symbol);
  const sourceBalance = balances.find((b) => b.symbol === symbol);
  const sourceAvailable = sourceBalance ? Number(sourceBalance.balance) : 0;
  return (
    <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 px-6 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006446]/10">
            {mode === 'send' ? (
              <Send className="w-5 h-5 text-[#006446]" />
            ) : (
              <Download className="w-5 h-5 text-[#006446]" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('externalCryptoTransfer.title')}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === 'send'
                ? t('externalCryptoTransfer.send.subtitle')
                : t('externalCryptoTransfer.receive.subtitle')}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-1 rounded-xl bg-[#006446]/8 p-1">
          <button
            onClick={() => setMode('send')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
              mode === 'send'
                ? 'rounded-lg bg-white text-[#006446] shadow-sm'
                : 'rounded-lg text-[#006446]/70 hover:text-[#006446]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            {t('externalCryptoTransfer.tabs.send')}
          </button>
          <button
            onClick={() => setMode('receive')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
              mode === 'receive'
                ? 'rounded-lg bg-white text-[#006446] shadow-sm'
                : 'rounded-lg text-[#006446]/70 hover:text-[#006446]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {t('externalCryptoTransfer.tabs.receive')}
          </button>
        </div>
      </div>

      <div className="p-6">
        {restrictedCount > 0 && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Restricted balances are hidden and cannot be used for send or receive requests.
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('externalCryptoTransfer.fields.selectCoin')}
          </label>
          <Dropdown
            value={symbol}
            onChange={setSymbol}
            options={actionableWallets.map((w) => {
              const bal = balances.find((b) => b.symbol === w.symbol);
              const amt = bal ? Number(bal.balance) : 0;
              return {
                value: w.symbol,
                label: `${w.name} - ${w.symbol} (${formatCryptoAmount(amt, w.symbol)})`,
                icon: (
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full ${CRYPTO_COLORS[w.symbol]?.bg || 'bg-[#006446]/10'} ${CRYPTO_COLORS[w.symbol]?.text || 'text-[#006446]'} text-[9px] font-bold`}>
                    {w.symbol.charAt(0)}
                  </span>
                ),
              };
            })}
          />
        </div>

        {mode === 'send' ? (
          <SendPanel
            t={t}
            symbol={symbol}
            sourceAvailable={sourceAvailable}
            wallet={selectedWallet}
            submitting={submitting}
            onSubmit={onSend}
            onSuccess={onSuccess}
            disabled={actionableWallets.length === 0}
          />
        ) : (
          <ReceiveForm
            t={t}
            symbol={symbol}
            wallet={selectedWallet}
            submitting={submitting}
            onSubmit={onReceive}
            onSuccess={onSuccess}
            disabled={actionableWallets.length === 0}
          />
        )}
      </div>
    </div>
  );
}

function SendPanel({
  t,
  symbol,
  sourceAvailable,
  wallet,
  submitting,
  onSubmit,
  onSuccess,
  disabled,
}: {
  t: (key: string) => string;
  symbol: string;
  sourceAvailable: number;
  wallet: CryptoWallet | undefined;
  submitting: boolean;
  onSubmit: (payload: ExternalCryptoTransferPayload) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  disabled: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError(t('externalCryptoTransfer.errors.invalidAmount'));
      return;
    }
    if (!recipientAddress.trim()) {
      setError(t('externalCryptoTransfer.errors.recipientRequired'));
      return;
    }
    if (recipientAddress.trim().length < 10) {
      setError(t('externalCryptoTransfer.errors.invalidAddress'));
      return;
    }
    if (numAmount > sourceAvailable) {
      setError(`${t('externalCryptoTransfer.errors.insufficient')} ${symbol} ${t('externalCryptoTransfer.errors.balance')}`);
      return;
    }

    const result = await onSubmit({
      symbol,
      amount: numAmount,
      recipient_address: recipientAddress.trim(),
      note: note.trim(),
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setAmount('');
      setRecipientAddress('');
      setNote('');
      onSuccess();
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {t('externalCryptoTransfer.send.success')}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('externalCryptoTransfer.fields.amount')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
              {symbol}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('externalCryptoTransfer.placeholders.amount')}
              className="w-full rounded-xl border border-[#006446]/14 py-3 pl-16 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t('externalCryptoTransfer.available')} {formatCryptoAmount(sourceAvailable, symbol)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('externalCryptoTransfer.send.recipientAddress')}
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder={getPlaceholder(symbol)}
            className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
          />
        </div>

        {wallet && (
          <div className="flex items-start gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-3 py-2 text-xs text-[#006446]">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {t('externalCryptoTransfer.send.networkWarning1')} {wallet.name} ({wallet.symbol}) {t('externalCryptoTransfer.send.networkWarning2')} {wallet.network} {t('externalCryptoTransfer.send.networkWarning3')}
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('externalCryptoTransfer.fields.note')}{' '}
            <span className="text-slate-400 font-normal">({t('externalCryptoTransfer.optional')})</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('externalCryptoTransfer.placeholders.sendNote')}
            className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !amount || !recipientAddress || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006446] py-3.5 font-semibold text-white transition-colors hover:bg-[#00523a] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t('externalCryptoTransfer.send.action')} {symbol}
            </>
          )}
        </button>

        {disabled ? (
          <p className="text-xs text-slate-400 text-center">
            No available crypto balances can be used right now.
          </p>
        ) : null}
      </form>
    </div>
  );
}

function ReceiveForm({
  t,
  symbol,
  wallet,
  submitting,
  onSubmit,
  onSuccess,
  disabled,
}: {
  t: (key: string) => string;
  symbol: string;
  wallet: CryptoWallet | undefined;
  submitting: boolean;
  onSubmit: (payload: ReceiveCryptoTransferPayload) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  disabled: boolean;
}) {
  const [senderAddress, setSenderAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError(t('externalCryptoTransfer.errors.invalidAmount'));
      return;
    }
    if (!senderAddress.trim()) {
      setError(t('externalCryptoTransfer.errors.senderRequired'));
      return;
    }
    if (senderAddress.trim().length < 10) {
      setError(t('externalCryptoTransfer.errors.invalidAddress'));
      return;
    }

    const result = await onSubmit({
      symbol,
      amount: numAmount,
      sender_address: senderAddress.trim(),
      note: note.trim(),
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setSenderAddress('');
      setAmount('');
      setNote('');
      onSuccess();
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {t('externalCryptoTransfer.receive.success')}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {t('externalCryptoTransfer.receive.senderAddress')}
        </label>
        <input
          type="text"
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
          placeholder={getPlaceholder(symbol)}
          className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
        />
        <p className="mt-1 text-xs text-slate-400">
          {t('externalCryptoTransfer.receive.senderHelp')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {t('externalCryptoTransfer.fields.amount')}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            {symbol}
          </span>
          <input
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('externalCryptoTransfer.placeholders.amount')}
            className="w-full rounded-xl border border-[#006446]/14 py-3 pl-16 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {t('externalCryptoTransfer.receive.amountHelp')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {t('externalCryptoTransfer.fields.note')}{' '}
          <span className="text-slate-400 font-normal">({t('externalCryptoTransfer.optional')})</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('externalCryptoTransfer.placeholders.receiveNote')}
          className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
        />
      </div>

      {wallet && (
        <div className="flex items-start gap-2 rounded-xl border border-[#006446]/14 bg-[#006446]/[0.04] px-3 py-2 text-xs text-[#006446]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#006446]" />
          <span>
            {t('externalCryptoTransfer.receive.networkWarning1')} {wallet.name} ({wallet.symbol}) {t('externalCryptoTransfer.receive.networkWarning2')} {wallet.network} {t('externalCryptoTransfer.receive.networkWarning3')}
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !amount || !senderAddress || disabled}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006446] py-3.5 font-semibold text-white transition-colors hover:bg-[#00523a] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Download className="w-4 h-4" />
            {t('externalCryptoTransfer.receive.action')}
          </>
        )}
      </button>

      {disabled ? (
        <p className="text-xs text-slate-400 text-center">
          No available crypto balances can be used right now.
        </p>
      ) : null}
    </form>
  );
}
