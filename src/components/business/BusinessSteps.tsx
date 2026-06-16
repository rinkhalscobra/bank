import { ArrowRight, UserCheck, ShieldCheck, PartyPopper } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';
import { Link } from "react-router-dom";

interface Step {
  key: 's1' | 's2' | 's3';
  icon: LucideIcon;
}

const steps: Step[] = [
  { key: 's1', icon: UserCheck },
  { key: 's2', icon: ShieldCheck },
  { key: 's3', icon: PartyPopper },
];

export default function BusinessSteps() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[#006446] py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.12),_transparent_38%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(0,0,0,0.08),_transparent_45%,_rgba(255,255,255,0.08))] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold tracking-widest uppercase text-white">
            {t('biz.steps.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-5">
            {t('biz.steps.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white">
            {t('biz.steps.subtitle')}
          </p>
        </div>

        <div className="relative mt-20">
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-white/20 via-white/70 to-white/20" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/15 via-white/50 to-white/15 blur-sm" />
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {steps.map(({ key, icon: Icon }, i) => (
              <div key={key} className="relative text-center group">
                <div className="relative z-10 mx-auto mb-8 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/60 group-hover:bg-white/20 group-hover:shadow-lg group-hover:shadow-black/10">
                  <Icon className="h-7 w-7 text-white" />
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#006446] shadow-md shadow-black/10">
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {t(`biz.steps.${key}.title`)}
                </h3>
                <p className="leading-relaxed text-white">
                  {t(`biz.steps.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/online-banking"
              className="group inline-flex items-center gap-3 rounded-xl bg-white px-10 py-4 text-lg font-semibold text-[#006446] shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl hover:shadow-black/20"
            >
              {t('biz.steps.cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </section>
  );
}
