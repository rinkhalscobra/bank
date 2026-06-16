import { Shield, Globe, Gift, CreditCard } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const benefitItems = [
  { key: 'fraud', icon: Shield },
  { key: 'global', icon: Globe },
  { key: 'rewards', icon: Gift },
  { key: 'wallet', icon: CreditCard },
];

export default function BenefitsSection() {
  const { t } = useLanguage();

  const stats = [1, 2, 3].map(i => ({
    value: t(`cards.benefits.stat${i}.value`),
    label: t(`cards.benefits.stat${i}.label`),
  }));

  return (
    <section className="py-28 bg-[#006446] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-[20%] h-[600px] w-[600px] rounded-full bg-white/10 blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="lg:sticky lg:top-32">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-white" />
              <span className="text-white text-xs font-semibold tracking-[0.2em] uppercase">{t('cards.benefits.whyChooseUs')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">{t('cards.benefits.title')}</h2>
            <p className="mb-12 text-lg leading-relaxed text-white/85">{t('cards.benefits.subtitle')}</p>

            <div className="flex gap-10">
              {stats.map((stat, i) => (
                <div key={i} className="relative">
                  <div className="text-3xl font-display font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-white/75 text-xs">{stat.label}</p>
                  {i < stats.length - 1 && (
                    <div className="absolute top-0 -right-5 h-full w-px bg-white/[0.3]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {benefitItems.map((item, idx) => (
              <div
                key={item.key}
                className="group flex items-start gap-6 rounded-xl border border-white/[0.12] bg-white/[0.08] p-6 transition-all duration-300 hover:bg-white/[0.12] hover:border-white/[0.2]"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.1]">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-semibold">{t(`cards.benefits.${item.key}.title`)}</h4>
                    <span className="text-[10px] font-mono text-white/55">0{idx + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">{t(`cards.benefits.${item.key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
