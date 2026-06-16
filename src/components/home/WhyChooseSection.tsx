import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useBranding } from '../../contexts/BrandingContext';
import { useLanguage } from '../../contexts/LanguageContext';

const benefits = [
  { key: 'fdic' },
  { key: 'award' },
  { key: 'security' },
  { key: 'local' },
];

export default function WhyChooseSection() {
  const { applyBranding } = useBranding();
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white to-[#006446]/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-[#006446]" />
              <span className="text-[#006446] text-xs font-semibold tracking-[0.2em] uppercase">{applyBranding('Why SKOK')}</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-6 leading-tight">{t('home.why.title')}</h3>
            <p className="text-surface-500 mb-10 leading-relaxed">{t('home.why.subtitle')}</p>

            <Link to="/about" className="inline-flex">
              <button className="group inline-flex items-center gap-3 bg-[#006446] hover:bg-[#00563b] text-white px-7 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200">
                {t('home.why.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <div className="mt-12 p-6 rounded-xl border border-[#006446]/12 bg-white">
              <div className="text-4xl font-display font-bold text-[#006446] mb-1">98%</div>
              <p className="text-sm text-surface-500 leading-relaxed">{t('home.why.stat')}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              <img
                src="https://www.studyinpoland.pl/en/images/articles/why-poland-new.jpg"
                alt="Professional bank personnel"
                className="w-full h-[320px] object-cover rounded-xl mb-10"
              />

              <div className="space-y-0">
                {benefits.map((b, i) => (
                  <div key={b.key} className="group flex items-start gap-5 py-6 border-b border-surface-100 last:border-b-0">
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs font-mono text-[#006446]/30 w-6">0{i + 1}</span>
                      <div className="w-8 h-8 rounded-md bg-[#006446]/10 flex items-center justify-center group-hover:bg-[#006446]/15 transition-colors">
                        <CheckCircle className="w-4 h-4 text-[#006446]" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-surface-900 mb-1">{t(`home.why.${b.key}.title`)}</h5>
                      <p className="text-surface-500 text-sm leading-relaxed">{t(`home.why.${b.key}.desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
