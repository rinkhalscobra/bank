import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const testimonialMeta = [
  {
    key: 't1',
    name: 'Sarah & David Mitchell',
    location: 'Portland, OR',
    image: 'https://images.pexels.com/photos/7578878/pexels-photo-7578878.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    amount: '$425,000',
  },
  {
    key: 't2',
    name: 'Michael Torres',
    location: 'Austin, TX',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    amount: '$38,500',
  },
  {
    key: 't3',
    name: 'Jennifer Okafor',
    location: 'Chicago, IL',
    image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    amount: '$28,000',
  },
];

const statKeys = ['stat1', 'stat2', 'stat3', 'stat4'];

export default function LoanTestimonials() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-[#006446]/[0.05] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="mb-4 block text-sm font-semibold uppercase tracking-widest text-[#006446]">
            {t('loans.test.badge')}
          </span>
          <h2 className="mb-4 text-4xl font-display font-bold text-[#006446]">
            {t('loans.test.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-surface-600">
            {t('loans.test.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonialMeta.map((tm) => (
            <div
              key={tm.key}
              className="flex flex-col rounded-2xl border border-[#006446]/15 bg-white p-8 shadow-soft transition-all duration-300 hover:border-[#005737] hover:shadow-soft-lg"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: tm.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#006446] text-[#006446]" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-[#006446] mb-3" />
              <p className="mb-6 flex-1 leading-relaxed text-surface-700">
                {t(`loans.test.${tm.key}.quote`)}
              </p>
              <div className="flex items-center gap-4 border-t border-[#006446]/12 pt-5">
                <img
                  src={tm.image}
                  alt={tm.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-black text-sm">{tm.name}</p>
                  <p className="text-black text-xs">{tm.location}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[#006446] font-bold text-sm">{tm.amount}</p>
                  <p className="text-[#006446] text-xs">{t(`loans.test.${tm.key}.loanType`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#006446] rounded-3xl p-10 lg:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            {statKeys.map((key) => (
              <div key={key} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {t(`loans.test.${key}.value`)}
                </p>
                <p className="text-sm font-medium text-white/80">
                  {t(`loans.test.${key}.label`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
