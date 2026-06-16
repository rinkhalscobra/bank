import { ClipboardCheck, MonitorSmartphone, BadgeCheck, Mail, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const stepIcons = [ClipboardCheck, MonitorSmartphone, BadgeCheck, Mail];

export default function CardApplicationSteps() {
  const { t } = useLanguage();

  return (
    <section className="py-28 bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-[#006446]" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-surface-900">
            {t('cards.apply.title')}
          </h2>
          <p className="text-surface-500 max-w-md lg:text-right mt-3 lg:mt-0">
            {t('cards.apply.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[0, 1, 2, 3].map((idx) => {
            const Icon = stepIcons[idx];
            const stepKey = `step${idx + 1}`;
            const num = String(idx + 1).padStart(2, '0');
            return (
              <div key={idx} className="group relative">
                <div className="bg-white rounded-2xl border border-[#006446]/12 p-7 h-full hover:border-[#006446]/25 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#006446] transition-all duration-300 group-hover:bg-[#00523a]">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-mono text-[#006446]/30">{num}</span>
                  </div>
                  <h3 className="text-base font-bold text-surface-900 mb-2">
                    {t(`cards.apply.${stepKey}.title`)}
                  </h3>
                  <p className="text-surface-500 text-sm leading-relaxed mb-4">
                    {t(`cards.apply.${stepKey}.desc`)}
                  </p>
                  <span className="inline-block rounded border border-[#006446] bg-[#006446] px-3 py-1 text-[11px] font-semibold text-white group-hover:bg-[#00523a]">
                    {t(`cards.apply.${stepKey}.detail`)}
                  </span>
                </div>
                {idx < 3 && (
                  <div className="absolute top-1/2 -right-3 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#006446]/12 bg-white lg:flex">
                    <ArrowRight className="h-3 w-3 text-[#006446]/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-[#006446] rounded-2xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-white/10 blur-[100px]" />
          <div className="relative z-10 grid lg:grid-cols-3 gap-10 items-center">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-display font-bold text-white mb-5">
                {t('cards.apply.need.title')}
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="text-white text-sm flex items-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-white flex-shrink-0" />
                    {t(`cards.apply.need.item${i}`)}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center lg:text-right">
              <button className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold tracking-wide text-[#006446] transition-all duration-200 hover:bg-white/90">
                {t('cards.apply.need.cta')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="mt-3 text-xs text-white/75">
                {t('cards.apply.need.note')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
