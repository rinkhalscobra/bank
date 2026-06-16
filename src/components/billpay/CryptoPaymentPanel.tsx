import { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import { CryptoWallet } from '../../hooks/useCryptoWallets';
import QRCode from '../ui/QRCode';

const TOKEN_BADGE_STYLE = {
  backgroundColor: 'rgba(0, 100, 70, 0.12)',
  color: '#006446',
};

function getPaymentUri(symbol: string, address: string): string {
  switch (symbol) {
    case 'BTC': return `bitcoin:${address}`;
    case 'ETH': return `ethereum:${address}`;
    case 'SOL': return `solana:${address}`;
    case 'DOGE': return `dogecoin:${address}`;
    case 'USDT': return address;
    case 'USDC': return address;
    default: return address;
  }
}

interface CryptoPaymentPanelProps {
  wallets: CryptoWallet[];
  walletsLoading: boolean;
  selectedWallet: CryptoWallet | null;
  onSelectWallet: (wallet: CryptoWallet) => void;
}

export default function CryptoPaymentPanel({
  wallets,
  walletsLoading,
  selectedWallet,
  onSelectWallet,
}: CryptoPaymentPanelProps) {
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCopy = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (walletsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] py-8 text-center text-sm text-[#006446]">
        No crypto wallets found. Please contact support.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-800">Select Cryptocurrency</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-0 ${
              dropdownOpen
                ? 'border-[#006446] bg-[#006446]/[0.05] shadow-[0_18px_40px_-32px_rgba(0,100,70,0.55)]'
                : 'border-[#006446]/14 bg-[#006446]/[0.03] hover:border-[#006446]/25'
            }`}
          >
            {selectedWallet ? (
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={TOKEN_BADGE_STYLE}
                >
                  {selectedWallet.symbol.slice(0, 2)}
                </span>
                <div className="text-left">
                  <p className="font-medium text-slate-900">{selectedWallet.name}</p>
                  <p className="text-xs text-[#006446]/70">{selectedWallet.network} Network</p>
                </div>
              </div>
            ) : (
              <span className="text-[#006446]/70">Choose a wallet...</span>
            )}
            <ChevronDown className={`h-4 w-4 text-[#006446] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-[#006446]/18 bg-white shadow-[0_24px_60px_-36px_rgba(0,100,70,0.38)]">
              {wallets.map((w) => {
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => { onSelectWallet(w); setDropdownOpen(false); setCopied(false); }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#006446]/[0.05] ${
                      selectedWallet?.id === w.id ? 'bg-[#006446]/10' : ''
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      style={TOKEN_BADGE_STYLE}
                    >
                      {w.symbol.slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{w.name} ({w.symbol})</p>
                      <p className="text-xs text-[#006446]/70">{w.network}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedWallet && (
        <div className="space-y-4 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-5">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="flex-shrink-0 rounded-2xl border border-[#006446]/14 bg-white p-2 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
              <QRCode
                data={getPaymentUri(selectedWallet.symbol, selectedWallet.wallet_address)}
                size={160}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[#006446]">
                  {selectedWallet.name} Wallet Address
                </p>
                <p className="text-sm font-mono text-slate-800 break-all leading-relaxed">
                  {selectedWallet.wallet_address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(selectedWallet.wallet_address)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  copied
                    ? 'border border-[#006446]/20 bg-[#006446] text-white'
                    : 'border border-[#006446]/14 bg-white text-[#006446] hover:bg-[#006446]/[0.04]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Address'}
              </button>
              <div className="flex items-center gap-2 text-xs text-[#006446]/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#006446]" />
                Network: {selectedWallet.network}
              </div>
            </div>
          </div>
          <p className="border-t border-[#006446]/10 pt-3 text-xs leading-relaxed text-slate-600">
            Send only {selectedWallet.symbol} to this address. Sending other assets may result in permanent loss.
          </p>
        </div>
      )}
    </div>
  );
}
