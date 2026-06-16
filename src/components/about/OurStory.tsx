import { useBranding } from '../../contexts/BrandingContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function OurStory() {
  const { applyBranding } = useBranding();
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-emerald-50/45 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#006446] font-semibold tracking-widest text-sm uppercase">
              {t('about.story.badge')}
            </span>
            <h2 className="text-4xl font-display font-bold text-surface-900 mt-3 mb-6">
              {t('about.story.title')}
            </h2>
            <p className="text-lg text-surface-500 leading-relaxed mb-6">
              {t('about.story.p1')}
            </p>
            <p className="text-lg text-surface-500 leading-relaxed mb-6">
              {t('about.story.p2')}
            </p>
            <p className="text-lg text-surface-500 leading-relaxed">
              {t('about.story.p3')}
            </p>
          </div>
          <div className="relative">
            <img
              src="https://t3.ftcdn.net/jpg/08/08/99/46/360_F_808994683_OUZEZt581lOYP0H2zGRXMZKJ5g87jkjx.jpg"
              alt={applyBranding('SKOK Bank team collaboration')}
              className="w-full h-[480px] object-cover rounded-2xl shadow-soft"
            />
            <div className="absolute -bottom-6 -right-6 bg-[#006446] text-white p-8 rounded-2xl shadow-soft-lg">
              <div className="text-4xl font-bold text-white mb-1">{t('about.story.stat')}</div>
              <p className="text-sm text-emerald-50/80">{t('about.story.statLabel')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
