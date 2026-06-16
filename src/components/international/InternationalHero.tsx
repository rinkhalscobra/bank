import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function InternationalHero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[680px] items-center pb-20 pt-32 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://media.licdn.com/dms/image/v2/C4D12AQG1sgqLYV4ehQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1632471365765?e=2147483647&v=beta&t=7p8PsxKDkVnIuEF7KBsiHXA5dqjw22uY_aLKJiEmwM8')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/95 via-[#006446]/80 to-[#006446]/50" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_40%,_rgba(0,0,0,0.18))]" />
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-white">
            {t('intl.hero.badge')}
          </span>
          <h1 className="mb-6 text-5xl font-display font-bold leading-tight md:text-6xl">
            {t('intl.hero.title')}
          </h1>
          <p className="mb-8 max-w-2xl text-xl leading-relaxed text-emerald-50/90">
            {t('intl.hero.desc')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/online-banking"
              className="inline-flex items-center rounded-xl bg-white px-8 py-4 font-semibold text-[#006446] shadow-lg shadow-black/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl hover:shadow-black/20"
            >
              {t('intl.hero.cta1')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
