import { CheckCircle, DollarSign, Globe, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const wireFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;
const fxFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;
const multiFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;

export default function InternationalCoreServices() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-emerald-50/60 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#006446]">
            {t('intl.core.badge')}
          </span>
          <h2 className="mt-3 mb-4 text-4xl font-display font-bold text-surface-900">
            {t('intl.core.title')}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-surface-500">
            {t('intl.core.desc')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[#006446]/12 bg-white p-8 shadow-soft transition-all duration-300 hover:border-[#006446]/30 hover:shadow-soft-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-[#006446]/15 bg-[#006446]/10 transition-transform duration-300 hover:scale-105">
              <Send className="h-8 w-8 text-[#006446]" />
            </div>
            <h3 className="mb-4 text-2xl font-display font-bold text-surface-900">
              {t('intl.core.wire.title')}
            </h3>
            <ul className="mb-6 space-y-3">
              {wireFeatures.map((feature) => (
                <li key={feature} className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-[#006446]" />
                  <span className="text-surface-500">{t(`intl.core.wire.${feature}`)}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/online-banking"
              className="inline-block w-full rounded-xl bg-[#006446] px-6 py-3 text-center font-semibold text-white transition-all duration-200 hover:bg-[#00563b]"
            >
              {t('intl.core.wire.cta')}
            </Link>
          </div>

          <div className="relative rounded-2xl border border-[#006446] bg-[#006446] p-8 shadow-soft-lg ring-2 ring-[#006446]/20 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-1.5 text-sm font-semibold text-[#006446] shadow-md shadow-black/10">
              {t('intl.core.fx.badge')}
            </div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition-transform duration-300 hover:scale-105">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-display font-bold text-white">
              {t('intl.core.fx.title')}
            </h3>
            <ul className="mb-6 space-y-3">
              {fxFeatures.map((feature) => (
                <li key={feature} className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-white" />
                  <span className="text-emerald-50/90">{t(`intl.core.fx.${feature}`)}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/online-banking"
              className="inline-block w-full rounded-xl bg-white px-6 py-3 text-center font-semibold text-[#006446] shadow-soft transition-all duration-200 hover:bg-emerald-50 hover:shadow-soft-lg"
            >
              {t('intl.core.fx.cta')}
            </Link>
          </div>

          <div className="rounded-2xl border border-[#006446]/12 bg-white p-8 shadow-soft transition-all duration-300 hover:border-[#006446]/30 hover:shadow-soft-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-[#006446]/15 bg-[#006446]/10 transition-transform duration-300 hover:scale-105">
              <Globe className="h-8 w-8 text-[#006446]" />
            </div>
            <h3 className="mb-4 text-2xl font-display font-bold text-surface-900">
              {t('intl.core.multi.title')}
            </h3>
            <ul className="mb-6 space-y-3">
              {multiFeatures.map((feature) => (
                <li key={feature} className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-[#006446]" />
                  <span className="text-surface-500">{t(`intl.core.multi.${feature}`)}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/online-banking"
              className="inline-block w-full rounded-xl bg-[#006446] px-6 py-3 text-center font-semibold text-white transition-all duration-200 hover:bg-[#00563b]"
            >
              {t('intl.core.multi.cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
