export interface CryptoPrice {
  usd: number;
  usd_24h_change: number;
}

export interface LiveMarketData {
  rates: Record<string, Record<string, number>>;
  crypto: Record<string, CryptoPrice>;
  fetched_at: string;
  fiat_rate_date?: string | null;
  supported_fiat_currencies: string[];
  unsupported_fiat_currencies: string[];
  unsupported_crypto_symbols: string[];
  fiat_currency_names: Record<string, string>;
  fiat_error?: string | null;
  crypto_error?: string | null;
}

type LiveMarketRequest = {
  fiatCurrencies?: string[];
  cryptoSymbols?: string[];
  includeCrypto?: boolean;
};

function normalizeCodes(codes: string[] | undefined) {
  if (codes === undefined) return undefined;

  return Array.from(new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean)));
}

export async function fetchLiveMarketData({
  fiatCurrencies,
  cryptoSymbols,
  includeCrypto = true,
}: LiveMarketRequest = {}): Promise<LiveMarketData> {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('Live exchange-rate service is not configured.');
  }

  const url = new URL(`${baseUrl}/functions/v1/exchange-rates`);
  const normalizedFiat = normalizeCodes(fiatCurrencies);
  const normalizedCrypto = normalizeCodes(cryptoSymbols);

  if (normalizedFiat !== undefined) {
    url.searchParams.set('currencies', normalizedFiat.join(','));
  }
  if (normalizedCrypto !== undefined) {
    url.searchParams.set('cryptos', normalizedCrypto.join(','));
  }
  if (!includeCrypto) {
    url.searchParams.set('include_crypto', 'false');
  }

  const response = await fetch(url, {
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
  });
  const payload = await response.json().catch(() => null) as (LiveMarketData & { error?: string }) | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.error || 'Unable to load live market rates.');
  }

  return payload;
}

