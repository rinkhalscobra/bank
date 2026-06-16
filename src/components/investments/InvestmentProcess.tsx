import { MessageSquare, ClipboardCheck, BarChart3, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const steps = [
  { icon: MessageSquare, number: '01', key: 's1' },
  { icon: ClipboardCheck, number: '02', key: 's2' },
  { icon: BarChart3, number: '03', key: 's3' },
  { icon: RefreshCw, number: '04', key: 's4' },
] as const;

export default function InvestmentProcess() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-black">
            {t('inv.process.badge')}
          </p>
          <h2 className="mb-4 text-4xl font-display font-bold text-black">
            {t('inv.process.title')}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-surface-600">
            {t('inv.process.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px bg-[#006446]/20 z-0" />
              )}
              <div className="relative z-10 bg-white rounded-2xl border border-[#006446]/20 shadow-soft hover:shadow-soft-lg hover:border-[#006446] p-8 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="rounded-xl bg-[#006446] w-16 h-16 flex items-center justify-center group-hover:bg-white transition-all duration-300">
                    <step.icon className="w-8 h-8 text-white group-hover:text-[#006446] transition-colors duration-300" />
                  </div>
                  <span className="text-5xl font-display font-bold text-[#006446] group-hover:text-[#006446] transition-colors duration-300">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-surface-900 mb-3">
                  {t(`inv.process.${step.key}.title`)}
                </h3>
                <p className="text-surface-500 text-sm leading-relaxed">
                  {t(`inv.process.${step.key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
