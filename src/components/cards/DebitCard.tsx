import { CreditCard, CheckCircle, ArrowRight } from 'lucide-react';

export default function DebitCard({ t, variant }: { t: (k: string) => string; variant: 'standard' | 'premium' }) {
  const benefits = [1, 2, 3, 4, 5].map(i => t(`cards.${variant}.benefit${i}`));
  const isPremium = variant === 'premium';

  return (
    <div className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
      isPremium
        ? 'border-2 border-brand-500 shadow-lg shadow-brand-500/5'
        : 'border border-surface-200 hover:border-surface-300'
    }`}>
      {isPremium && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
      )}

      <div className="p-7 pb-5">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isPremium
              ? 'bg-brand-500 text-white'
              : 'bg-surface-900 text-white group-hover:bg-brand-500'
          }`}>
            <CreditCard className="w-6 h-6" />
          </div>
          {isPremium && (
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-600 bg-brand-50 border border-brand-200 px-3 py-1 rounded">
              RECOMMENDED
            </span>
          )}
        </div>
        <h3 className="text-xl font-display font-bold text-surface-900 mb-1">{t(`cards.${variant}.name`)}</h3>
      </div>

      <div className="px-7 pb-7">
        <div className="border-t border-surface-100 pt-5">
          <ul className="space-y-3 mb-8">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-surface-600 text-sm leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
          <button className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
            isPremium
              ? 'bg-surface-900 text-white hover:bg-surface-800'
              : 'bg-surface-100 text-surface-800 hover:bg-surface-200'
          }`}>
            {t(`cards.${variant}.cta`)}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}
