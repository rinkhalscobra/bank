import { useLanguage } from '../../contexts/LanguageContext';

const CRYPTO_CDN = 'https://cdn.jsdelivr.net/gh/madenix/Crypto-logo-cdn@main/Logos';

const fiatCurrencies = [
  { key: 'usd', flag: 'https://flagcdn.com/w80/us.png', flagAlt: 'USA', code: 'USD' },
  { key: 'eur', flag: 'https://flagcdn.com/w80/eu.png', flagAlt: 'European Union', code: 'EUR' },
  { key: 'cad', flag: 'https://flagcdn.com/w80/ca.png', flagAlt: 'Canada', code: 'CAD' },
];

const cryptoCurrencies = [
  { name: 'Bitcoin', code: 'BTC', logo: `${CRYPTO_CDN}/BTC.svg` },
  { name: 'Ethereum', code: 'ETH', logo: `${CRYPTO_CDN}/ETH.svg` },
  { name: 'Tether', code: 'USDT', logo: `${CRYPTO_CDN}/USDT.svg` },
];

export default function CurrenciesSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding relative overflow-hidden bg-[#006446] text-white">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_35%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-white/70" />
            <span className="text-white text-xs font-semibold tracking-[0.2em] uppercase">Multi-Currency</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h3 className="text-4xl md:text-5xl font-display font-bold">{t('home.currencies.title')}</h3>
            <p className="max-w-md leading-relaxed text-white/80 lg:text-right">{t('home.currencies.subtitle')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Fiat Currencies</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>
            <div className="space-y-3">
              {fiatCurrencies.map((c) => (
                <div
                  key={c.key}
                  className="group flex items-center gap-5 rounded-xl border border-white/15 bg-white/10 p-5 transition-all duration-300 hover:border-white/30 hover:bg-white/15"
                >
                  <div className="w-10 h-7 rounded overflow-hidden border border-white/20 group-hover:border-white/35 transition-colors flex-shrink-0">
                    <img src={c.flag} alt={c.flagAlt} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{t(`home.currencies.${c.key}`)}</div>
                  </div>
                  <span className="text-xs font-mono text-white/55 tracking-wider">{c.code}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Cryptocurrencies</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>
            <div className="space-y-3">
              {cryptoCurrencies.map((c) => (
                <div
                  key={c.code}
                  className="group flex items-center gap-5 rounded-xl border border-white/15 bg-white/10 p-5 transition-all duration-300 hover:border-white/30 hover:bg-white/15"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/90 p-1.5 flex items-center justify-center">
                    <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{c.name}</div>
                  </div>
                  <span className="text-xs font-mono text-white/55 tracking-wider">{c.code}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs tracking-wide text-white/70">And many more...</p>
          </div>
        </div>
      </div>
    </section>
  );
}
