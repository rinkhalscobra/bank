import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const stepKeys = ['s1', 's2', 's3', 's4'] as const;
const stepNumbers = ['01', '02', '03', '04'];

export default function TransferProcess() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-[#006446]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-white/80 font-semibold tracking-widest uppercase text-sm">
            {t('intl.transfer.badge')}
          </span>
          <h2 className="text-4xl font-display font-bold text-white mt-3 mb-4">
            {t('intl.transfer.title')}
          </h2>
          <p className="text-xl text-emerald-50/85 max-w-3xl mx-auto">
            {t('intl.transfer.desc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stepKeys.map((key, index) => (
            <div key={key} className="relative group">
              <div className="h-full rounded-2xl border border-white/20 bg-white/10 p-8 shadow-soft backdrop-blur-sm transition-all duration-300 hover:border-white/35 hover:bg-white/15 hover:shadow-soft-lg">
                <div className="mb-4 text-5xl font-bold text-white/25 transition-colors duration-300 group-hover:text-white/40">
                  {stepNumbers[index]}
                </div>
                <h3 className="mb-3 text-xl font-display font-semibold text-white">{t(`intl.transfer.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-emerald-50/80">{t(`intl.transfer.${key}.desc`)}</p>
              </div>
              {index < stepKeys.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-4 z-10 -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-white/80" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/20 bg-white p-8 text-center md:flex-row md:text-left">
          <div>
            <h4 className="mb-1 text-lg font-display font-semibold text-[#006446]">
              {t('intl.transfer.banner.title')}
            </h4>
            <p className="text-surface-600">
              {t('intl.transfer.banner.desc')}
            </p>
          </div>
          <Link
            to="/online-banking"
            className="whitespace-nowrap rounded-xl bg-[#006446] px-8 py-3 font-semibold text-white shadow-soft transition-all duration-200 hover:bg-[#00563b] hover:shadow-soft-lg"
          >
            {t('intl.transfer.banner.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
