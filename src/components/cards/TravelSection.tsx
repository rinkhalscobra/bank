import { CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TravelSection() {
  const { t } = useLanguage();
  const benefits = [1, 2, 3, 4].map(i => t(`cards.travel.benefit${i}`));

  return (
    <section className="py-28 bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-0 overflow-hidden rounded-2xl border border-[#006446]/12 lg:grid-cols-2">
          <div className="relative min-h-[400px] lg:min-h-[520px]">
            <img
              src="https://www.popphoto.com/uploads/2022/04/02/fly-with-film-02-scaled.jpg?auto=webp&width=1440&height=960.1875"
              alt="Traveler at an airport with luggage"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          <div className="bg-[#006446] p-10 lg:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-white" />
              <span className="text-white text-xs font-semibold tracking-[0.2em] uppercase">Travel Perks</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-5 leading-tight">{t('cards.travel.title')}</h2>
            <p className="mb-8 leading-relaxed text-white/85">{t('cards.travel.desc')}</p>

            <ul className="space-y-3 mb-10">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="text-sm text-white/90">{b}</span>
                </li>
              ))}
            </ul>

            <div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold tracking-wide text-[#006446] transition-all duration-200 hover:bg-white/90">
                {t('cards.travel.cta')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
