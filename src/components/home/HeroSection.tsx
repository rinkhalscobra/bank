import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative h-[80vh] md:h-[90vh] lg:h-[100vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bank.jpg')",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/95 via-[#006446]/80 to-[#006446]/50" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_45%,_rgba(0,0,0,0.18))]" />

      {/* Top subtle line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/5" />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl text-center">
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/70" />
            <span className="text-white text-xs font-semibold tracking-[0.25em] uppercase">
              {t('home.hero.badge')}
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-display font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[4.5rem]">
            {t('home.hero.title.start')}
            <span className="bg-white bg-clip-text text-transparent">
              {t('home.hero.title.highlight')}
            </span>
            {t('home.hero.title.end')}
          </h2>
          <div className="flex justify-center">
            <Link to="/online-banking">
              <button className="group inline-flex items-center justify-center gap-3 rounded-lg bg-white px-8 py-4 font-semibold text-[#006446] shadow-lg shadow-black/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95">
                {t('home.hero.cta.account')}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
    </section>
  );
}
