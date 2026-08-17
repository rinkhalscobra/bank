import { buildCryptoPaymentUri, isWalletPaymentUri } from './cryptoPaymentUri';

export type CryptoPaymentSource = {
  wallet_address?: string | null;
  symbol?: string | null;
  network?: string | null;
  payment_uri?: string | null;
  amount?: string | number | null;
  label?: string | null;
};

export type CryptoPaymentRequest = {
  valid: boolean;
  payload: string;
  format: string;
  error: string;
};

function normalizeIdentifier(value: string) {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

function looksLikeWalletAddress(address: string, network: string, symbol: string) {
  const normalizedNetwork = normalizeIdentifier(network);
  const normalizedSymbol = normalizeIdentifier(symbol);

  if (
    normalizedNetwork.includes('ETHEREUM')
    || normalizedNetwork === 'ERC20'
    || normalizedNetwork === 'BSC'
    || normalizedNetwork === 'BEP20'
    || normalizedNetwork.includes('POLYGON')
    || normalizedNetwork.includes('ARBITRUM')
    || normalizedNetwork.includes('OPTIMISM')
    || normalizedNetwork === 'BASE'
    || ['ETH', 'BNB', 'MATIC', 'POL', 'AVAX'].includes(normalizedSymbol)
  ) {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }

  if (normalizedNetwork.includes('BITCOIN') || normalizedSymbol === 'BTC') {
    return /^(?:bc1[a-z0-9]{20,}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(address);
  }

  if (normalizedNetwork.includes('TRON') || normalizedNetwork === 'TRC20' || normalizedSymbol === 'TRX') {
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
  }

  if (normalizedNetwork.includes('SOLANA') || normalizedSymbol === 'SOL') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }

  // Unknown networks remain usable, but obvious placeholders, whitespace and
  // punctuation-heavy values are rejected before a QR code is generated.
  return address.length >= 12 && address.length <= 256 && /^[a-zA-Z0-9:_-]+$/.test(address);
}

function describePayload(payload: string) {
  if (/^bitcoin:/i.test(payload)) return 'Bitcoin payment URI';
  if (/^ethereum:/i.test(payload)) return 'EIP-681 payment URI';
  if (/^solana:/i.test(payload)) return 'Solana Pay URI';
  if (isWalletPaymentUri(payload)) return 'Payment URI';
  return 'Wallet address';
}

export function getCryptoPaymentRequest(source: CryptoPaymentSource): CryptoPaymentRequest {
  const address = String(source.wallet_address || '').trim();
  const symbol = String(source.symbol || '').trim();
  const network = String(source.network || '').trim();
  const suppliedUri = String(source.payment_uri || '').trim();

  if (suppliedUri) {
    if (!isWalletPaymentUri(suppliedUri) || /\s/.test(suppliedUri)) {
      return {
        valid: false,
        payload: '',
        format: '',
        error: 'The payment URI must use a valid registered scheme and cannot contain spaces.',
      };
    }

    return {
      valid: true,
      payload: suppliedUri,
      format: describePayload(suppliedUri),
      error: '',
    };
  }

  if (!address) {
    return {
      valid: false,
      payload: '',
      format: '',
      error: 'Enter a receiving wallet address.',
    };
  }

  if (!looksLikeWalletAddress(address, network, symbol)) {
    return {
      valid: false,
      payload: '',
      format: '',
      error: 'The wallet address does not match the selected asset or network.',
    };
  }

  const payload = buildCryptoPaymentUri({
    address,
    symbol,
    network,
    amount: source.amount ?? undefined,
    label: String(source.label || '').trim() || undefined,
  });

  if (!payload) {
    return {
      valid: false,
      payload: '',
      format: '',
      error: 'A payment request could not be generated from this wallet.',
    };
  }

  return {
    valid: true,
    payload,
    format: describePayload(payload),
    error: '',
  };
}
