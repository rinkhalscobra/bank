import { useLanguage } from '../../contexts/LanguageContext';

export default function AboutHero() {
  const { t } = useLanguage();

  return (
    <section className="relative text-white min-h-[600px] flex items-end">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://lpc.com/wp-content/uploads/Bank-Building_Hero_V2.jpeg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/95 via-[#006446]/75 to-[#006446]/35" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_45%,_rgba(0,0,0,0.18))]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-20 pt-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center mb-6 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full">
            <span className="text-white text-sm font-medium tracking-widest uppercase">
              {t('about.hero.badge')}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
            {t('about.hero.title1')}<span className="text-emerald-100">{t('about.hero.title2')}</span>
          </h1>
          <p className="text-xl text-emerald-50/90 leading-relaxed max-w-2xl">
            {t('about.hero.desc')}
          </p>
        </div>
      </div>
    </section>
  );
}
