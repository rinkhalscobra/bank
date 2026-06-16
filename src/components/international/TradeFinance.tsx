import { CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const serviceKeys = ['s1', 's2', 's3', 's4'] as const;

export default function TradeFinance() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-emerald-50/60 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#006446] font-semibold tracking-widest uppercase text-sm">
              {t('intl.trade.badge')}
            </span>
            <h2 className="text-4xl font-display font-bold text-surface-900 mt-3 mb-6">
              {t('intl.trade.title')}
            </h2>
            <p className="text-lg text-surface-500 mb-8 leading-relaxed">
              {t('intl.trade.desc')}
            </p>
            <div className="space-y-6 mb-10">
              {serviceKeys.map((key) => (
                <div key={key} className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-[#006446] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-display font-semibold text-surface-900 mb-1">{t(`intl.trade.${key}.title`)}</h4>
                    <p className="text-surface-500 text-sm leading-relaxed">
                      {t(`intl.trade.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/online-banking"
              className="inline-flex items-center rounded-xl bg-[#006446] px-8 py-4 font-semibold text-white shadow-soft transition-all duration-200 hover:bg-[#00563b] hover:shadow-soft-lg"
            >
              {t('intl.trade.cta')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl shadow-soft-lg">
              <img
                src="https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Container ship at port representing international trade"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/55 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#006446]/15 bg-white shadow-soft p-6">
                <div className="text-3xl font-display font-bold text-[#006446] mb-1">{t('intl.trade.stat1')}</div>
                <p className="text-surface-500 text-sm">
                  {t('intl.trade.stat1.desc')}
                </p>
              </div>
              <div className="rounded-2xl border border-[#006446]/15 bg-white shadow-soft p-6">
                <div className="text-3xl font-display font-bold text-[#006446] mb-1">{t('intl.trade.stat2')}</div>
                <p className="text-surface-500 text-sm">
                  {t('intl.trade.stat2.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
