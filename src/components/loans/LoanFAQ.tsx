import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const faqCount = 8;

export default function LoanFAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#006446] tracking-widest uppercase text-sm font-semibold mb-4 block">
            {t('loans.faq.badge')}
          </span>
          <h2 className="mb-4 text-4xl font-display font-bold text-[#006446]">
            {t('loans.faq.title')}
          </h2>
          <p className="text-xl text-surface-600">
            {t('loans.faq.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {Array.from({ length: faqCount }).map((_, idx) => {
            const num = idx + 1;
            const isOpen = openIndex === idx;
            return (
              <div
                key={num}
                className="overflow-hidden rounded-2xl border border-[#006446]/15 bg-white transition-all duration-300 hover:border-[#005737]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200"
                >
                  <span className="text-black font-semibold pr-4">
                    {t(`loans.faq.q${num}`)}
                  </span>
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                      isOpen ? 'bg-[#006446] rotate-180' : 'bg-[#006446]/10'
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-colors duration-300 ${
                        isOpen ? 'text-white' : 'text-[#006446]'
                      }`}
                    />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-[#006446]/12 px-6 pb-5 pt-4 leading-relaxed text-surface-600">
                    {t(`loans.faq.a${num}`)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
