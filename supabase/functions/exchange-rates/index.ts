import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_FIAT_CURRENCIES = ["USD", "EUR", "CAD", "CHF"];
const DEFAULT_CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "USDT", "USDC"];
const MAX_FIAT_CURRENCIES = 165;
const MAX_CRYPTO_SYMBOLS = 50;
const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v2";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

type FiatResult = {
  rates: Record<string, Record<string, number>>;
  currencyNames: Record<string, string>;
  supported: string[];
  unsupported: string[];
  rateDate: string | null;
};

type CryptoResult = {
  prices: Record<string, { usd: number; usd_24h_change: number }>;
  unsupported: string[];
};

let currencyCatalogCache: {
  expiresAt: number;
  currencies: Record<string, string>;
} | null = null;

function parseCodes(
  url: URL,
  parameter: string,
  defaults: string[],
  maxItems: number,
) {
  const rawValue = url.searchParams.has(parameter)
    ? url.searchParams.get(parameter) || ""
    : defaults.join(",");

  return Array.from(
    new Set(
      rawValue
        .split(",")
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Market provider returned HTTP ${response.status}`);
  }

  return response.json();
}

async function getCurrencyCatalog() {
  if (currencyCatalogCache && currencyCatalogCache.expiresAt > Date.now()) {
    return currencyCatalogCache.currencies;
  }

  const data = await fetchJson(`${FRANKFURTER_BASE_URL}/currencies`);
  const currencies = Object.fromEntries(
    (Array.isArray(data) ? data : [])
      .filter((currency) =>
        /^[A-Z]{3}$/.test(String(currency?.iso_code || "")) &&
        typeof currency?.name === "string"
      )
      .map((currency) => [String(currency.iso_code), String(currency.name)] as const)
      .sort(([left], [right]) => left.localeCompare(right)),
  ) as Record<string, string>;

  if (!currencies.USD) {
    throw new Error("The fiat currency catalog is unavailable");
  }

  currencyCatalogCache = {
    currencies,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  return currencies;
}

async function loadFiatRates(requestedCodes: string[]): Promise<FiatResult> {
  const currencyNames = await getCurrencyCatalog();
  const validCodes = requestedCodes.filter((code) => /^[A-Z]{3}$/.test(code));
  const supported = validCodes.filter((code) => Boolean(currencyNames[code]));
  const unsupported = requestedCodes.filter((code) => !supported.includes(code));

  if (supported.length === 0) {
    return { rates: {}, currencyNames, supported, unsupported, rateDate: null };
  }

  const quoteCurrencies = Array.from(new Set(["USD", ...supported]));
  const targets = quoteCurrencies.filter((code) => code !== "USD");
  let rateDate: string | null = null;
  const usdRates: Record<string, number> = { USD: 1 };

  if (targets.length > 0) {
    const query = new URLSearchParams({
      base: "USD",
      quotes: targets.join(","),
    });
    const data = await fetchJson(`${FRANKFURTER_BASE_URL}/rates?${query}`);

    for (const quote of Array.isArray(data) ? data : []) {
      const code = String(quote?.quote || "");
      const numericRate = Number(quote?.rate);
      if (currencyNames[code] && numericRate > 0) {
        usdRates[code] = numericRate;
        if (!rateDate && typeof quote?.date === "string") rateDate = quote.date;
      }
    }
  }

  const missingQuotes = supported.filter((code) => !usdRates[code]);
  const quotedCurrencies = quoteCurrencies.filter((code) => Boolean(usdRates[code]));
  const rates: Record<string, Record<string, number>> = {};

  for (const from of quotedCurrencies) {
    rates[from] = {};
    for (const to of quotedCurrencies) {
      rates[from][to] = usdRates[to] / usdRates[from];
    }
  }

  return {
    rates,
    currencyNames,
    supported: supported.filter((code) => !missingQuotes.includes(code)),
    unsupported: Array.from(new Set([...unsupported, ...missingQuotes])),
    rateDate,
  };
}

async function loadCryptoPrices(requestedSymbols: string[]): Promise<CryptoResult> {
  const validSymbols = requestedSymbols.filter((symbol) => /^[A-Z0-9]{2,15}$/.test(symbol));
  const invalidSymbols = requestedSymbols.filter((symbol) => !validSymbols.includes(symbol));

  if (validSymbols.length === 0) {
    return { prices: {}, unsupported: invalidSymbols };
  }

  const query = new URLSearchParams({
    symbols: validSymbols.map((symbol) => symbol.toLowerCase()).join(","),
    vs_currencies: "usd",
    include_24hr_change: "true",
  });
  const data = await fetchJson(`${COINGECKO_BASE_URL}/simple/price?${query}`);
  const prices: Record<string, { usd: number; usd_24h_change: number }> = {};

  for (const symbol of validSymbols) {
    const quote = data?.[symbol.toLowerCase()];
    const usd = Number(quote?.usd);
    if (usd > 0) {
      prices[symbol] = {
        usd,
        usd_24h_change: Number(quote?.usd_24h_change) || 0,
      };
    }
  }

  return {
    prices,
    unsupported: [
      ...invalidSymbols,
      ...validSymbols.filter((symbol) => !prices[symbol]),
    ],
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const fiatCurrencies = parseCodes(
      url,
      "currencies",
      DEFAULT_FIAT_CURRENCIES,
      MAX_FIAT_CURRENCIES,
    );
    const includeCrypto = url.searchParams.get("include_crypto") !== "false";
    const cryptoSymbols = includeCrypto
      ? parseCodes(url, "cryptos", DEFAULT_CRYPTO_SYMBOLS, MAX_CRYPTO_SYMBOLS)
      : [];

    const [fiatResult, cryptoResult] = await Promise.allSettled([
      loadFiatRates(fiatCurrencies),
      includeCrypto
        ? loadCryptoPrices(cryptoSymbols)
        : Promise.resolve({ prices: {}, unsupported: [] } as CryptoResult),
    ]);

    const fiat = fiatResult.status === "fulfilled"
      ? fiatResult.value
      : {
          rates: {},
          currencyNames: {},
          supported: [],
          unsupported: fiatCurrencies,
          rateDate: null,
        };
    const crypto = cryptoResult.status === "fulfilled"
      ? cryptoResult.value
      : { prices: {}, unsupported: cryptoSymbols };
    const fiatError = fiatResult.status === "rejected"
      ? fiatResult.reason instanceof Error ? fiatResult.reason.message : "Fiat rate provider unavailable"
      : null;
    const cryptoError = cryptoResult.status === "rejected"
      ? cryptoResult.reason instanceof Error ? cryptoResult.reason.message : "Crypto price provider unavailable"
      : null;

    if (fiatError && (!includeCrypto || cryptoError)) {
      throw new Error(fiatError);
    }

    return new Response(
      JSON.stringify({
        rates: fiat.rates,
        crypto: crypto.prices,
        fetched_at: new Date().toISOString(),
        fiat_rate_date: fiat.rateDate,
        supported_fiat_currencies: fiat.supported,
        unsupported_fiat_currencies: fiat.unsupported,
        unsupported_crypto_symbols: crypto.unsupported,
        fiat_currency_names: fiat.currencyNames,
        fiat_error: fiatError,
        crypto_error: cryptoError,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch exchange rates",
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
