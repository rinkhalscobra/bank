import { Check, Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PricingTier {
  nameKey: string;
  price: string;
  descKey: string;
  featured: boolean;
  features: string[];
}

const tiers: PricingTier[] = [
  {
    nameKey: 'biz.pricing.basic',
    price: '5',
    descKey: 'biz.pricing.basicDesc',
    featured: false,
    features: [
      'IBAN',
      'Debit card included',
      'Mobile & web banking',
      'Basic accounting tools',
    ],
  },
  {
    nameKey: 'biz.pricing.smart',
    price: '15',
    descKey: 'biz.pricing.smartDesc',
    featured: true,
    features: [
      'Everything in Basic',
      'Smart dashboard',
      'Integrated invoicing',
      'Accounting integrations',
      'Priority support',
    ],
  },
  {
    nameKey: 'biz.pricing.premium',
    price: '25',
    descKey: 'biz.pricing.premiumDesc',
    featured: false,
    features: [
      'Everything in Smart',
      'Sub-accounts with IBAN',
      'Premium support',
      'Dedicated account manager',
      'Custom reporting',
    ],
  },
];

export default function BusinessPricing() {
  const { t } = useLanguage();

  return (
    <section className="relative py-28 bg-white overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-50/50 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="inline-block text-brand-600 text-sm font-semibold tracking-widest uppercase mb-3">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-5">
            {t('biz.pricing.title')}
          </h2>
          <div className="w-16 h-1 bg-brand-500 rounded-full mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.nameKey}
              className={`relative rounded-2xl transition-all duration-500 ${
                tier.featured
                  ? 'bg-surface-950 text-white shadow-2xl shadow-surface-950/20 scale-[1.03] z-10 ring-1 ring-brand-500/30'
                  : 'bg-white border border-surface-200 hover:border-surface-300 hover:shadow-soft-lg'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-brand-500 text-surface-950 px-5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-brand-500/30">
                    <Star className="w-3 h-3" />
                    {t('biz.pricing.popular')}
                  </div>
                </div>
              )}

              <div className="p-8 lg:p-10">
                <div className="mb-8">
                  <span className={`text-sm font-semibold tracking-wider uppercase ${
                    tier.featured ? 'text-brand-400' : 'text-surface-500'
                  }`}>
                    {t(tier.nameKey)}
                  </span>
                  <p className={`text-xs mt-1 ${tier.featured ? 'text-surface-400' : 'text-surface-400'}`}>
                    {t('biz.pricing.by')}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-5xl lg:text-6xl font-bold tracking-tight ${
                    tier.featured ? 'text-white' : 'text-surface-900'
                  }`}>
                    &euro;{tier.price}
                  </span>
                </div>
                <p className={`text-sm mb-8 ${tier.featured ? 'text-surface-400' : 'text-surface-500'}`}>
                  {t('biz.pricing.perMonth')}
                </p>

                <p className={`leading-relaxed mb-8 text-[15px] ${
                  tier.featured ? 'text-surface-300' : 'text-surface-600'
                }`}>
                  {t(tier.descKey)}
                </p>

                <ul className="space-y-3 mb-10">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        tier.featured ? 'bg-brand-500/20' : 'bg-brand-50'
                      }`}>
                        <Check className={`w-3 h-3 ${
                          tier.featured ? 'text-brand-400' : 'text-brand-600'
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        tier.featured ? 'text-surface-300' : 'text-surface-600'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  tier.featured
                    ? 'bg-brand-500 hover:bg-brand-400 text-surface-950 shadow-lg shadow-brand-500/20 hover:shadow-brand-400/30'
                    : 'border-2 border-surface-900 text-surface-900 hover:bg-surface-900 hover:text-white'
                }`}>
                  {t('biz.pricing.cta')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
