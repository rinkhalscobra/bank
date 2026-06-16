import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const testimonialKeys = [
  {
    key: 't1',
    image: 'https://images.pexels.com/photos/5257526/pexels-photo-5257526.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
  },
  {
    key: 't2',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
  },
  {
    key: 't3',
    image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
  },
] as const;

export default function InvestmentTestimonials() {
  const { t } = useLanguage();

  return (
    <section className="section-padding relative overflow-hidden bg-[#006446] text-white">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">
            {t('inv.testimonials.badge')}
          </p>
          <h2 className="mb-4 text-4xl font-display font-bold text-white">
            {t('inv.testimonials.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            {t('inv.testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonialKeys.map((item) => (
            <div
              key={item.key}
              className="relative rounded-2xl border border-white/15 bg-white/[0.08] p-8 backdrop-blur-sm transition-all duration-300 group hover:bg-white/[0.12] hover:border-white/25"
            >
              <Quote className="absolute top-6 right-6 h-10 w-10 text-white/15" />
              <div className="flex mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-white text-white"
                  />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-white/82">
                "{t(`inv.testimonials.${item.key}.text`)}"
              </p>
              <div className="flex items-center mt-auto">
                <img
                  src={item.image}
                  alt={t(`inv.testimonials.${item.key}.name`)}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
                />
                <div className="ml-4">
                  <div className="font-semibold text-white text-sm">{t(`inv.testimonials.${item.key}.name`)}</div>
                  <div className="text-xs text-white/60">{t(`inv.testimonials.${item.key}.role`)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
