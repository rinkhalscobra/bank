import { Link } from 'react-router-dom';
import { Building2, CreditCard, Landmark, TrendingUp, Globe, Smartphone, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const services = [
  { to: '/business-banking', icon: Building2, key: 'accounts', ctaKey: 'accounts.business', featured: true },
  { to: '/cards', icon: CreditCard, key: 'cards', ctaKey: 'learnMore', featured: false },
  { to: '/loans', icon: Landmark, key: 'loans', ctaKey: 'learnMore', featured: false },
  { to: '/investments', icon: TrendingUp, key: 'wealth', ctaKey: 'learnMore', featured: false },
  { to: '/international', icon: Globe, key: 'international', ctaKey: 'learnMore', featured: false },
  { to: '/online-banking', icon: Smartphone, key: 'online', ctaKey: 'learnMore', featured: false },
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-[#006446]/[0.05] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-px bg-[#006446]" />
          <span className="text-[#006446] text-xs font-semibold tracking-[0.2em] uppercase">Our Solutions</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-4">
          <h3 className="text-4xl md:text-5xl font-display font-bold text-surface-900">{t('home.services.title')}</h3>
          <p className="text-surface-500 max-w-md lg:text-right">{t('home.services.subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ to, icon: Icon, key, ctaKey, featured }, i) => (
            <Link
              key={key}
              to={to}
              className={`group relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                featured
                  ? 'bg-[#006446] hover:bg-[#00563b]'
                  : 'bg-white border border-[#006446]/12 hover:border-[#006446]/25'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  featured
                    ? 'bg-white/10'
                    : 'bg-[#006446]/[0.06] border border-[#006446]/12 group-hover:bg-[#006446]/10 group-hover:border-[#006446]/20'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    featured
                      ? 'text-white'
                      : 'text-[#006446] group-hover:text-[#00563b]'
                  }`} />
                </div>
                <span className={`text-xs font-mono ${featured ? 'text-white/35' : 'text-[#006446]/30'}`}>0{i + 1}</span>
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${featured ? 'text-white' : 'text-surface-900'}`}>
                {t(`home.services.${key}.title`)}
              </h4>
              <p className={`text-sm leading-relaxed mb-6 ${featured ? 'text-surface-400' : 'text-surface-500'}`}>
                {t(`home.services.${key}.desc`)}
              </p>
              <span className={`mt-auto font-semibold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200 ${
                featured ? 'text-white' : 'text-[#006446]'
              }`}>
                {t(`home.services.${ctaKey}`)} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
