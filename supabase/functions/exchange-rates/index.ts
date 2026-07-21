import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FIAT_CURRENCIES = ["USD", "EUR", "CAD", "CHF"];
const CRYPTO_IDS = ["bitcoin", "ethereum", "solana", "tether", "usd-coin"];
const CRYPTO_MAP: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  tether: "USDT",
  "usd-coin": "USDC",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const fiatRates: Record<string, Record<string, number>> = {};
    const cryptoPrices: Record<
      string,
      { usd: number; usd_24h_change: number }
    > = {};

    const [fiatResponses, cryptoRes] = await Promise.all([
      Promise.all(
        FIAT_CURRENCIES.map((base) =>
          fetch(
            `https://api.frankfurter.app/latest?from=${base}&to=${FIAT_CURRENCIES.filter((c) => c !== base).join(",")}`
          ).then((r) => r.json())
        )
      ),
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_IDS.join(",")}&vs_currencies=usd&include_24hr_change=true`
      ).then((r) => r.json()),
    ]);

    for (let i = 0; i < FIAT_CURRENCIES.length; i++) {
      const base = FIAT_CURRENCIES[i];
      const data = fiatResponses[i];
      if (data?.rates) {
        fiatRates[base] = {};
        for (const [currency, rate] of Object.entries(data.rates)) {
          fiatRates[base][currency] = rate as number;
        }
      }
    }

    for (const [id, symbol] of Object.entries(CRYPTO_MAP)) {
      const coin = cryptoRes[id];
      if (coin) {
        cryptoPrices[symbol] = {
          usd: coin.usd ?? 0,
          usd_24h_change: coin.usd_24h_change ?? 0,
        };
      }
    }

    return new Response(
      JSON.stringify({
        rates: fiatRates,
        crypto: cryptoPrices,
        fetched_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to fetch exchange rates" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
