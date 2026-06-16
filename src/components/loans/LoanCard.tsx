import { CheckCircle } from 'lucide-react';

export default function LoanCard({ t, loanKey, image, featured }: { t: (k: string) => string; loanKey: string; image: string; featured: boolean }) {
  const benefits = [1, 2, 3, 4].map(i => t(`loans.${loanKey}.benefit${i}`));

  if (featured) {
    return (
      <div className="relative rounded-2xl border-2 border-[#006446] bg-white p-8 shadow-soft-lg ring-2 ring-[#006446]/20 transition-all duration-300">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#006446] px-5 py-1.5 text-sm font-semibold text-white">
          {t(`loans.${loanKey}.badge`)}
        </div>
        <div className="w-46 h-28 rounded-xl flex items-center justify-center mb-6">
          <img
            src={image}
            alt={loanKey}
            className="w-46 h-36 object-contain rounded-xl"
          />
        </div>
        <h3 className="text-2xl font-display font-bold text-black mb-4">{t(`loans.${loanKey}.name`)}</h3>
        <div className="text-lg font-semibold text-black mb-4">{t(`loans.${loanKey}.rate`)}</div>
        <ul className="space-y-3 mb-6">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-[#006446]" />
              <span className="text-black">{b}</span>
            </li>
          ))}
        </ul>
        <button className="w-full bg-gradient-to-r from-[#006446] to-[#006446]/90 hover:from-[#006446]/90 hover:to-[#006446]/80 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
          {t(`loans.${loanKey}.apply`)}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#006446]/18 bg-white p-8 shadow-soft transition-all duration-300 hover:border-[#006446]/35 hover:shadow-soft-lg">
      <div className="w-46 h-28 rounded-xl flex items-center justify-center mb-6">
        <img
          src={image}
          alt={loanKey}
          className="w-46 h-36 object-contain rounded-xl"
        />
      </div>
      <h3 className="text-2xl font-display font-bold text-black mb-4">{t(`loans.${loanKey}.name`)}</h3>
      <div className="text-lg font-semibold text-black mb-4">{t(`loans.${loanKey}.rate`)}</div>
      <ul className="space-y-3 mb-6">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-[#006446]" />
            <span className="text-black">{b}</span>
          </li>
        ))}
      </ul>
      <button className="w-full bg-[#006446] hover:bg-[#00523a] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200">
        {t(`loans.${loanKey}.apply`)}
      </button>
    </div>
  );
}
