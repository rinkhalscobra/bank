import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const principleKeys = ['p1', 'p2', 'p3', 'p4'] as const;

export default function InvestmentPhilosophy() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-black">
              {t('inv.philosophy.badge')}
            </p>
            <h2 className="mb-6 text-4xl font-display font-bold text-black">
              {t('inv.philosophy.title')}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-surface-700">
              {t('inv.philosophy.desc')}
            </p>
            <div className="space-y-5">
              {principleKeys.map((key) => (
                <div key={key} className="flex items-start group">
                  <div className="mr-4 mt-0.5 flex-shrink-0 rounded-xl border border-[#006446]/12 bg-[#006446]/10 p-1.5 transition-all duration-300 group-hover:bg-[#006446]/15">
                    <CheckCircle className="w-5 h-5 text-[#006446]" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-surface-900">{t(`inv.philosophy.${key}.title`)}</h4>
                    <p className="text-sm leading-relaxed text-surface-600">
                      {t(`inv.philosophy.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-soft-lg">
              <img
                src="https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Financial advisor discussing portfolio strategy with client"
                className="w-full h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/55 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#006446] text-white p-6 rounded-2xl shadow-xl">
              <div className="text-3xl font-display font-bold">{t('inv.philosophy.stat')}</div>
              <div className="text-sm font-semibold text-white/80">
                {t('inv.philosophy.statLabel')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
