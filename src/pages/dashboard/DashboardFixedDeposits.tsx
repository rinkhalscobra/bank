import { useEffect, useState } from 'react';
import {
  Plus,
  AlertCircle,
  Wallet,
  ArrowDownLeft,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { useAddFund, SUPPORTED_ASSETS } from '../../hooks/useFixedDeposits';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useCryptoWallets } from '../../hooks/useCryptoWallets';
import QRCode from '../../components/ui/QRCode';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getBalanceStatusClasses,
  getBalanceStatusLabel,
  getHiddenBalanceDescription,
  getHiddenBalanceLabel,
  isBalanceAvailable,
} from '../../lib/balanceStatus';
import '../../i18n/dashboard-add-fund/translations';

const CRYPTO_LOGOS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
};

const CRYPTO_COLORS: Record<string, string> = {
  BTC: 'bg-[#006446]/10 text-[#006446]',
  ETH: 'bg-[#006446]/10 text-[#006446]',
  SOL: 'bg-[#006446]/10 text-[#006446]',
  USDC: 'bg-[#006446]/10 text-[#006446]',
  USDT: 'bg-[#006446]/10 text-[#006446]',
};

const CRYPTO_BORDER: Record<string, string> = {
  BTC: 'border-[#006446]',
  ETH: 'border-[#006446]',
  SOL: 'border-[#006446]',
  USDC: 'border-[#006446]',
  USDT: 'border-[#006446]',
};

function formatCrypto(amount: number, symbol: string) {
  if (amount === 0) return `0 ${symbol}`;
  const decimals = ['USDC', 'USDT'].includes(symbol) ? 2 : 8;
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })} ${symbol}`;
}

const STATUS_KEYS: Record<string, string> = {
  approved: 'dashboardAddFund.status.approved',
  completed: 'dashboardAddFund.status.completed',
  pending: 'dashboardAddFund.status.pending',
  failed: 'dashboardAddFund.status.failed',
};

const STATUS_STYLES: Record<string, string> = {
  approved: 'border border-[#006446]/14 bg-[#006446]/10 text-[#006446]',
  completed: 'border border-[#006446]/14 bg-[#006446]/10 text-[#006446]',
  pending: 'border border-[#006446]/14 bg-[#006446]/10 text-[#006446]',
  failed: 'border border-[#006446]/14 bg-[#006446]/10 text-[#006446]',
};

export default function DashboardFixedDeposits() {
  const { t, language } = useLanguage();
  const { deposits, loading, addFund } = useAddFund();
  const { cryptoBalances, refetch: refetchBalances } = useCryptoBalances();
  const { wallets, loading: walletsLoading } = useCryptoWallets();

  const [showForm, setShowForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const availableBalances = cryptoBalances.filter((balance) => isBalanceAvailable(balance.status));
  const restrictedBalanceCount = cryptoBalances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  const numAmount = parseFloat(amount) || 0;
  const selectedInfo = SUPPORTED_ASSETS.find((a) => a.symbol === selectedAsset);
  const wallet = wallets.find((entry) => entry.symbol === selectedAsset);
  const selectedBalance = cryptoBalances.find((entry) => entry.symbol === selectedAsset);
  const selectedBalanceAvailable = !selectedBalance || isBalanceAvailable(selectedBalance.status);

  useEffect(() => {
    if (selectedBalanceAvailable) return;

    const fallback = availableBalances[0]?.symbol;
    if (fallback) {
      setSelectedAsset(fallback);
    }
  }, [availableBalances, selectedBalanceAvailable]);

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

  const handleCopy = async () => {
    if (!wallet?.wallet_address) return;
    await navigator.clipboard.writeText(wallet.wallet_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || !selectedInfo || !selectedBalanceAvailable) return;

    setSubmitting(true);
    setResult(null);

    const res = await addFund({
      symbol: selectedInfo.symbol,
      cryptoName: selectedInfo.name,
      amount: numAmount,
    });

    if (res.error) {
      setResult({ success: false, message: res.error });
    } else {
      setResult({
        success: true,
        message: `${t('dashboardAddFund.messages.depositOf')} ${formatCrypto(numAmount, selectedInfo.symbol)} ${t('dashboardAddFund.messages.submitted')}`,
      });
      setAmount('');
      refetchBalances();
    }

    setSubmitting(false);
  };

  if (loading || walletsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {t('dashboardAddFund.title')}
          </h1>
          <p className="mt-1 text-sm text-[#006446]">
            {t('dashboardAddFund.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setResult(null);
          }}
          className="flex self-start items-center gap-2 rounded-xl bg-[#006446] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a]"
        >
          <Plus className="w-4 h-4" />
          {t('dashboardAddFund.actions.addFund')}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SUPPORTED_ASSETS.map((asset) => {
          const bal = cryptoBalances.find((b) => b.symbol === asset.symbol);
          const logo = CRYPTO_LOGOS[asset.symbol];
          const canShowAmount = isBalanceAvailable(bal?.status);

          return (
            <div
              key={asset.symbol}
              className={`rounded-2xl border p-4 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] ${
                canShowAmount ? 'border-[#006446]/14 bg-white' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#006446]/10 bg-white p-1">
                    {logo ? (
                      <img src={logo} alt={asset.name} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-[#006446]">{asset.symbol}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{asset.symbol}</p>
                    <p className="text-[10px] text-[#006446]/70">{asset.name}</p>
                  </div>
                </div>
                {bal ? (
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${getBalanceStatusClasses(bal.status)}`}>
                    {getBalanceStatusLabel(bal.status)}
                  </span>
                ) : null}
              </div>
              <p className={`text-sm font-bold ${canShowAmount ? 'text-slate-900' : 'text-slate-500'}`}>
                {bal
                  ? canShowAmount
                    ? bal.balance.toLocaleString('en-US', { maximumFractionDigits: 8 })
                    : getHiddenBalanceLabel(bal.status)
                  : '0.00'}
              </p>
              {bal && !canShowAmount ? (
                <p className="mt-1 text-[11px] text-slate-500">{getHiddenBalanceDescription(bal.status)}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {restrictedBalanceCount > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {restrictedBalanceCount} restricted crypto balance{restrictedBalanceCount === 1 ? '' : 's'} hidden from deposit actions until marked available.
        </div>
      ) : null}

      {result && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
          {result.success ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {result.message}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-[#006446]/14 bg-white p-6 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <h2 className="mb-5 font-semibold text-slate-900">
            {t('dashboardAddFund.form.title')}
          </h2>

          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-slate-800">
              {t('dashboardAddFund.form.selectAsset')}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SUPPORTED_ASSETS.map((asset) => {
                const bal = cryptoBalances.find((b) => b.symbol === asset.symbol);
                const logo = CRYPTO_LOGOS[asset.symbol];
                const canUseAsset = isBalanceAvailable(bal?.status);

                return (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset.symbol);
                      setAmount('');
                      setCopied(false);
                    }}
                    disabled={!canUseAsset}
                    className={`rounded-2xl border p-3 text-center transition-all ${
                      selectedAsset === asset.symbol
                        ? `border-2 ${CRYPTO_BORDER[asset.symbol] || 'border-[#006446]'} bg-[#006446]/[0.04] shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]`
                        : canUseAsset
                        ? 'border-[#006446]/14 bg-white hover:border-[#006446]/25'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <div className="mb-2 flex justify-center">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#006446]/10 bg-white p-1">
                        {logo ? (
                          <img src={logo} alt={asset.name} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-bold text-[#006446]">{asset.symbol}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{asset.symbol}</p>
                    <p className="mt-0.5 text-[10px] text-[#006446]/70">{asset.name}</p>
                    <p className={`mt-1 text-[10px] font-medium ${canUseAsset ? 'text-slate-600' : 'text-slate-500'}`}>
                      {t('dashboardAddFund.form.balanceShort')}: {bal
                        ? canUseAsset
                          ? bal.balance.toLocaleString('en-US', { maximumFractionDigits: 6 })
                          : getHiddenBalanceLabel(bal.status)
                        : '0'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {!selectedBalanceAvailable ? (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              This asset is currently restricted and cannot be used for a deposit request.
            </div>
          ) : null}

          {wallet && wallet.wallet_address && (
            <div className="mb-6 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-5">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="rounded-2xl border border-[#006446]/14 bg-white p-3 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                    <QRCode data={wallet.wallet_address} size={160} />
                  </div>
                  <p className="mt-2 text-[10px] text-[#006446]/70">
                    {t('dashboardAddFund.form.scanToGetAddress')}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[#006446]/10 bg-white p-1">
                      {CRYPTO_LOGOS[selectedAsset] ? (
                        <img src={CRYPTO_LOGOS[selectedAsset]} alt={selectedAsset} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[9px] font-bold text-[#006446]">{selectedAsset}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{wallet.name} Deposit</p>
                      <p className="text-xs text-[#006446]/70">{wallet.network}</p>
                    </div>
                  </div>

                  <p className="mb-1.5 text-xs font-medium text-[#006446]">
                    {t('dashboardAddFund.form.walletAddress')}
                  </p>

                  <div className="flex items-center gap-2 rounded-2xl border border-[#006446]/14 bg-white p-3">
                    <code className="text-xs text-slate-800 font-mono break-all flex-1 select-all leading-relaxed">
                      {wallet.wallet_address}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-shrink-0 rounded-full p-1.5 text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
                      title={t('dashboardAddFund.actions.copyAddress')}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-[#006446]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {copied && (
                    <p className="mt-1.5 text-xs font-medium text-[#006446]">
                      {t('dashboardAddFund.messages.addressCopied')}
                    </p>
                  )}

                  <div className="mt-4 rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-xs leading-relaxed text-slate-700">
                    {t('dashboardAddFund.form.warning1')}{' '}
                    <span className="font-bold">{selectedAsset}</span>{' '}
                    {t('dashboardAddFund.form.warning2')}{' '}
                    <span className="font-bold">{wallet.network}</span>{' '}
                    {t('dashboardAddFund.form.warning3')}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleAddFund} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-800">
                {t('dashboardAddFund.form.amount')} ({selectedAsset})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('dashboardAddFund.placeholders.amount')}
                className="w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                required
              />
            </div>

            {numAmount > 0 && selectedInfo && (
              <div className="space-y-2 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#006446]/70">{t('dashboardAddFund.summary.asset')}</span>
                  <span className="text-slate-900 font-medium">
                    {selectedInfo.name} ({selectedInfo.symbol})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#006446]/70">{t('dashboardAddFund.summary.network')}</span>
                  <span className="text-slate-900 font-medium">{wallet?.network || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#006446]/70">{t('dashboardAddFund.summary.status')}</span>
                  <span className="font-semibold text-[#006446]">
                    {t('dashboardAddFund.status.pending')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#006446]/10 pt-2">
                  <span className="font-medium text-slate-800">
                    {t('dashboardAddFund.summary.depositAmount')}
                  </span>
                  <span className="text-slate-900 font-bold">
                    {formatCrypto(numAmount, selectedInfo.symbol)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || numAmount <= 0 || !selectedBalanceAvailable}
                className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-300 disabled:text-slate-500"
              >
                {submitting
                  ? t('dashboardAddFund.actions.submitting')
                  : t('dashboardAddFund.actions.submitDeposit')}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#006446]/14 px-6 py-2.5 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
              >
                {t('dashboardAddFund.actions.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {deposits.length > 0 && (
        <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="border-b border-[#006446]/10 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              {t('dashboardAddFund.history.title')}
            </h2>
          </div>

          <div className="divide-y divide-[#006446]/10">
            {deposits.map((dep) => {
              const colorClass = CRYPTO_COLORS[dep.symbol] || 'bg-[#006446]/10 text-[#006446]';
              const statusStyle = STATUS_STYLES[dep.status] || 'border border-[#006446]/14 bg-[#006446]/10 text-[#006446]';

              return (
                <div key={dep.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[#006446]/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#006446]/10">
                      <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white p-1 shadow-sm">
                        {CRYPTO_LOGOS[dep.symbol] ? (
                          <img src={CRYPTO_LOGOS[dep.symbol]} alt={dep.symbol} className="h-full w-full object-contain" />
                        ) : (
                          <span className={`text-[9px] font-bold ${colorClass}`}>{dep.symbol}</span>
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#006446] text-white shadow-sm">
                        <ArrowDownLeft className="h-2.5 w-2.5" />
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        +{formatCrypto(dep.amount, dep.symbol)}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#006446]/70">
                        <Clock className="h-3 w-3" />
                        {formatDate(dep.created_at)}
                      </div>
                    </div>
                  </div>

                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyle}`}>
                    {t(STATUS_KEYS[dep.status] || 'dashboardAddFund.status.pending')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {deposits.length === 0 && !showForm && (
        <div className="rounded-2xl border border-[#006446]/14 bg-white p-16 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <Wallet className="mx-auto mb-4 h-12 w-12 text-[#006446]/30" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            {t('dashboardAddFund.empty.title')}
          </h3>
          <p className="mb-6 text-sm text-[#006446]/70">
            {t('dashboardAddFund.empty.subtitle')}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a]"
          >
            {t('dashboardAddFund.empty.cta')}
          </button>
        </div>
      )}
    </div>
  );
}
