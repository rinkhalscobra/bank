import { useLanguage } from '../../contexts/LanguageContext';


export default function BusinessHero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/95 via-[#006446]/80 to-[#006446]/50" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_45%,_rgba(0,0,0,0.18))]" />
      </div>

      <div className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white mb-8 leading-[1.1]">
            {t('biz.hero.title')}
            <span className="block mt-2 bg-white bg-clip-text text-transparent">
              {t('biz.hero.title2')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white leading-relaxed max-w-xl mb-12">
            {t('biz.hero.subtitle')}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </section>
  );
}
