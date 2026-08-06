interface CryptoPaymentUriOptions {
  address: string;
  symbol?: string;
  network?: string;
  amount?: string | number;
  label?: string;
  chainId?: string | number;
  tokenContract?: string;
  tokenDecimals?: number | null;
  paymentUriScheme?: string;
}

const ETHEREUM_MAINNET_TOKENS: Record<string, { contract: string; decimals: number }> = {
  USDC: {
    contract: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
  },
  USDT: {
    contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
  },
};

const PAYMENT_SCHEMES: Record<string, string> = {
  BTC: 'bitcoin',
  BITCOIN: 'bitcoin',
  BCH: 'bitcoincash',
  BITCOINCASH: 'bitcoincash',
  LTC: 'litecoin',
  LITECOIN: 'litecoin',
  DOGE: 'dogecoin',
  DOGECOIN: 'dogecoin',
  DASH: 'dash',
  ZEC: 'zcash',
  ZCASH: 'zcash',
  XMR: 'monero',
  MONERO: 'monero',
  DCR: 'decred',
  DECRED: 'decred',
};

const EVM_CHAIN_IDS: Record<string, string> = {
  ETHEREUM: '1',
  ETHEREUMMAINNET: '1',
  ERC20: '1',
  BSC: '56',
  BEP20: '56',
  BINANCESMARTCHAIN: '56',
  POLYGON: '137',
  POLYGONPOS: '137',
  ARBITRUM: '42161',
  ARBITRUMONE: '42161',
  OPTIMISM: '10',
  BASE: '8453',
  AVALANCHE: '43114',
  AVALANCHECCHAIN: '43114',
  FANTOM: '250',
  GNOSIS: '100',
  LINEA: '59144',
  ZKSYNC: '324',
  ZKSYNCERA: '324',
};

const EVM_NATIVE_SYMBOLS = new Set(['ETH', 'BNB', 'POL', 'MATIC', 'AVAX', 'FTM', 'XDAI']);
const STANDARD_AMOUNT_SCHEMES = new Set([
  'bitcoin',
  'bitcoincash',
  'litecoin',
  'dogecoin',
  'dash',
  'zcash',
  'decred',
]);

function positiveAmount(amount?: string | number): string | undefined {
  if (amount === undefined) return undefined;

  const value = String(amount).trim();
  if (!/^\d+(?:\.\d+)?$/.test(value) || Number(value) <= 0) return undefined;

  return value;
}

function toAtomicUnits(amount: string, decimals: number): string {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = `${fraction}${'0'.repeat(decimals)}`.slice(0, decimals);
  return `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, '');
}

function inferNetwork(address: string): string {
  if (/^0x[0-9a-fA-F]{40}$/.test(address)) return 'ethereum';
  if (/^(?:bc1|[13])[a-zA-HJ-NP-Z0-9]{20,}$/i.test(address)) return 'bitcoin';
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return 'tron';
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'solana';
  return '';
}

function normalizeIdentifier(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

function sanitizeScheme(value: string): string {
  const scheme = value.trim().replace(/:$/, '').toLowerCase();
  return /^[a-z][a-z0-9+.-]*$/.test(scheme) ? scheme : '';
}

function appendQuery(uri: string, params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const suffix = query.toString();
  return suffix ? `${uri}?${suffix}` : uri;
}

export function buildCryptoPaymentUri({
  address,
  symbol = '',
  network = '',
  amount,
  label,
  chainId,
  tokenContract = '',
  tokenDecimals,
  paymentUriScheme = '',
}: CryptoPaymentUriOptions): string {
  const cleanAddress = address.trim();
  if (!cleanAddress) return '';

  const cleanSymbol = symbol.trim().toUpperCase();
  const cleanNetwork = network.trim().toLowerCase() || inferNetwork(cleanAddress);
  const cleanAmount = positiveAmount(amount);
  const normalizedNetwork = normalizeIdentifier(cleanNetwork);
  const explicitScheme = sanitizeScheme(paymentUriScheme);
  const requestedChainId = String(chainId ?? '').trim();
  const configuredChainId = /^\d+$/.test(requestedChainId) ? requestedChainId : '';
  const knownChainId = configuredChainId || EVM_CHAIN_IDS[normalizedNetwork];
  const requestedTokenContract = tokenContract.trim();
  const cleanTokenContract = /^0x[0-9a-fA-F]{40}$/.test(requestedTokenContract)
    ? requestedTokenContract
    : '';
  const cleanTokenDecimals = Number.isInteger(tokenDecimals) && Number(tokenDecimals) >= 0
    ? Number(tokenDecimals)
    : undefined;

  const knownScheme = PAYMENT_SCHEMES[normalizeIdentifier(cleanSymbol)]
    || PAYMENT_SCHEMES[normalizedNetwork];

  const useGenericScheme = explicitScheme
    ? explicitScheme !== 'ethereum' && explicitScheme !== 'solana'
    : Boolean(knownScheme);

  if (useGenericScheme) {
    const scheme = explicitScheme || knownScheme;
    const params = scheme === 'monero'
      ? { tx_amount: cleanAmount, recipient_name: label }
      : STANDARD_AMOUNT_SCHEMES.has(scheme)
      ? { amount: cleanAmount, label }
      : {};
    return appendQuery(`${scheme}:${cleanAddress}`, params);
  }

  const isEvmAddress = /^0x[0-9a-fA-F]{40}$/.test(cleanAddress);
  const isEvmNetwork = explicitScheme === 'ethereum'
    || Boolean(knownChainId)
    || normalizedNetwork.includes('ETHEREUM')
    || normalizedNetwork.includes('EVM');

  if (isEvmAddress && isEvmNetwork) {
    const defaultToken = knownChainId === '1' ? ETHEREUM_MAINNET_TOKENS[cleanSymbol] : undefined;
    const token = cleanTokenContract
      ? { contract: cleanTokenContract, decimals: cleanTokenDecimals }
      : defaultToken;

    if (token) {
      return cleanAmount && token.decimals !== undefined
        ? appendQuery(`ethereum:${token.contract}@${knownChainId || '1'}/transfer`, {
            address: cleanAddress,
            uint256: toAtomicUnits(cleanAmount, token.decimals),
          })
        : cleanAddress;
    }

    const value = EVM_NATIVE_SYMBOLS.has(cleanSymbol) && cleanAmount
      ? toAtomicUnits(cleanAmount, 18)
      : undefined;
    const chainSuffix = knownChainId ? `@${knownChainId}` : '';
    return appendQuery(`ethereum:${cleanAddress}${chainSuffix}`, { value });
  }

  if (explicitScheme === 'solana' || normalizedNetwork.includes('SOLANA') || cleanSymbol === 'SOL') {
    return appendQuery(`solana:${cleanAddress}`, {
      amount: cleanAmount,
      label,
    });
  }

  // Unknown networks and address-only formats (including Tron/TRC-20) remain
  // universally scannable. Admins can opt into a registered scheme explicitly.
  return cleanAddress;
}

export function isWalletPaymentUri(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}
