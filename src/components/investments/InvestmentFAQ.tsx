import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

export default function InvestmentFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-black">
            {t('inv.faq.badge')}
          </p>
          <h2 className="mb-4 text-4xl font-display font-bold text-black">
            {t('inv.faq.title')}
          </h2>
          <p className="text-lg text-surface-600">
            {t('inv.faq.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {faqKeys.map((key, i) => (
            <div
              key={key}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                openIndex === i
                  ? 'border-[#006446] shadow-soft-lg bg-white'
                  : 'border-surface-200 bg-white hover:border-[#006446]/40 shadow-soft'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-surface-900 pr-4">
                  {t(`inv.faq.${key}`)}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    openIndex === i
                      ? 'bg-[#006446] rotate-180'
                      : 'bg-surface-100'
                  }`}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-colors duration-300 ${
                      openIndex === i ? 'text-white' : 'text-surface-400'
                    }`}
                  />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-5 text-surface-500 leading-relaxed">
                  {t(`inv.faq.a${key.slice(1)}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
