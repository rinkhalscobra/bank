import { useLanguage } from '../../contexts/LanguageContext';

const additionalServices = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export default function InternationalAdditionalServices() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#006446]">
            {t('intl.addl.badge')}
          </span>
          <h2 className="mt-3 mb-4 text-4xl font-display font-bold text-surface-900">
            {t('intl.addl.title')}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-surface-500">
            {t('intl.addl.desc')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {additionalServices.map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-[#006446]/12 bg-gradient-to-b from-white to-emerald-50/40 p-8 shadow-soft transition-all duration-300 hover:border-[#006446]/30 hover:shadow-soft-lg"
            >
              <h4 className="mb-3 text-xl font-display font-semibold text-surface-900">
                {t(`intl.addl.${key}.title`)}
              </h4>
              <p className="leading-relaxed text-surface-500">
                {t(`intl.addl.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
