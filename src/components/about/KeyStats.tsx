import { useLanguage } from '../../contexts/LanguageContext';

const statKeys = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export default function KeyStats() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-[#006446] via-[#00583d] to-[#006446] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-white/80 font-semibold tracking-widest text-sm uppercase">
            {t('about.stats.badge')}
          </span>
          <h2 className="text-4xl font-display font-bold mt-3 mb-4">
            {t('about.stats.title')}
          </h2>
          <p className="text-lg text-emerald-50/80 max-w-2xl mx-auto">
            {t('about.stats.desc')}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
          {statKeys.map((key) => (
            <div
              key={key}
              className="text-center p-8 rounded-2xl border border-white/15 hover:border-white/30 bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              <div className="text-4xl lg:text-5xl font-bold text-white mb-3">
                {t(`about.stats.${key}.value`)}
              </div>
              <div className="text-emerald-50/80 font-medium">{t(`about.stats.${key}.label`)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
