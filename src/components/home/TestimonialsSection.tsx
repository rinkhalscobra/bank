import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const testimonials = [
  {
    key: '1',
    avatar: 'https://i.pravatar.cc/160?img=32',
    avatarAlt: 'Portrait of Sophie de Vries',
    review: 'https://home.online-mgcb.com/trustpilot.png',
    reviewAlt: 'Trustpilot',
    reviewH: 'h-5',
    rating: 4.8,
  },
  {
    key: '2',
    avatar: 'https://i.pravatar.cc/160?img=12',
    avatarAlt: 'Portrait of James Chen',
    review: 'https://home.online-mgcb.com/google.png',
    reviewAlt: 'Google Reviews',
    reviewH: 'h-6',
    rating: 4.4,
  },
  {
    key: '3',
    avatar: 'https://i.pravatar.cc/160?img=47',
    avatarAlt: 'Portrait of Emily Rodriguez',
    review: 'https://home.online-mgcb.com/reviews.png',
    reviewAlt: 'Reviews',
    reviewH: 'h-6',
    rating: 5,
  },
  {
    key: '4',
    avatar: 'https://i.pravatar.cc/160?img=14',
    avatarAlt: 'Portrait of Oliver Thompson',
    review: 'https://home.online-mgcb.com/trustpilot.png',
    reviewAlt: 'Trustpilot',
    reviewH: 'h-5',
    rating: 4.6,
  },
  {
    key: '5',
    avatar: 'https://i.pravatar.cc/160?img=18',
    avatarAlt: 'Portrait of Klaus Schmidt',
    review: 'https://home.online-mgcb.com/google.png',
    reviewAlt: 'Google Reviews',
    reviewH: 'h-6',
    rating: 4.9,
  },
  {
    key: '6',
    avatar: 'https://i.pravatar.cc/160?img=28',
    avatarAlt: 'Portrait of Marie Dubois',
    review: 'https://home.online-mgcb.com/reviews.png',
    reviewAlt: 'Reviews',
    reviewH: 'h-6',
    rating: 4.3,
  },
  {
    key: '7',
    avatar: 'https://i.pravatar.cc/160?img=60',
    avatarAlt: 'Portrait of Yuki Tanaka',
    review: 'https://home.online-mgcb.com/trustpilot.png',
    reviewAlt: 'Trustpilot',
    reviewH: 'h-5',
    rating: 4.7,
  },
  {
    key: '8',
    avatar: 'https://i.pravatar.cc/160?img=49',
    avatarAlt: 'Portrait of Sophie Anderson',
    review: 'https://home.online-mgcb.com/google.png',
    reviewAlt: 'Google Reviews',
    reviewH: 'h-6',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => {
      const fillPercent = Math.max(0, Math.min(1, rating - i)) * 100;

      return (
        <div key={i} className="relative h-3.5 w-3.5">
          <Star className="absolute inset-0 h-3.5 w-3.5 text-surface-200" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
            <Star className="h-3.5 w-3.5 fill-[#006446] text-[#006446]" />
          </div>
        </div>
      );
    });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = container.offsetWidth;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      container.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="section-padding bg-gradient-to-b from-[#006446]/[0.05] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-[#006446]" />
              <span className="text-[#006446] text-xs font-semibold tracking-[0.2em] uppercase">Testimonials</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-3">{t('home.testimonials.title')}</h3>
            <p className="text-surface-500 max-w-xl">{t('home.testimonials.subtitle')}</p>
          </div>
          <div className="flex gap-2 mt-6 md:mt-0">
            <button
              onClick={() => scroll('left')}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#006446]/12 bg-white text-surface-500 transition-all duration-200 hover:border-[#006446]/25 hover:text-[#006446]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#006446]/12 bg-white text-surface-500 transition-all duration-200 hover:border-[#006446]/25 hover:text-[#006446]"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-hidden scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((item) => (
            <div
              key={item.key}
              className="w-full flex-shrink-0 snap-center rounded-xl border border-[#006446]/12 bg-white p-8 transition-all duration-300 hover:border-[#006446]/25"
            >
              <div className="flex items-center justify-between mb-8">
                <img src={item.review} alt={item.reviewAlt} className={`${item.reviewH} w-auto opacity-60`} />
                <div className="flex items-center gap-0.5" aria-label={`${item.rating} star rating`}>
                  {renderStars(item.rating)}
                </div>
              </div>

              <p className="text-surface-700 mb-8 leading-relaxed text-[15px]">
                {t(`home.testimonials.${item.key}.text`)}
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-surface-100">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-surface-200">
                  <img src={item.avatar} alt={item.avatarAlt} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-semibold text-surface-900 text-sm">{t(`home.testimonials.${item.key}.name`)}</div>
                  <div className="text-xs text-surface-500">{t(`home.testimonials.${item.key}.role`)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
