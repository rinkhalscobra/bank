import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;

export default function InternationalFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-emerald-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#006446] font-semibold tracking-widest uppercase text-sm">
            {t('intl.faq.badge')}
          </span>
          <h2 className="text-4xl font-display font-bold text-surface-900 mt-3 mb-4">
            {t('intl.faq.title')}
          </h2>
          <p className="text-xl text-surface-500 max-w-2xl mx-auto">
            {t('intl.faq.desc')}
          </p>
        </div>

        <div className="space-y-4">
          {faqKeys.map((key, index) => (
            <div
              key={key}
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
                openIndex === index
                  ? 'border-[#006446]/35 shadow-soft-lg'
                  : 'border-[#006446]/12 shadow-soft hover:shadow-soft-lg hover:border-[#006446]/25'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-display font-semibold text-surface-900 pr-4">{t(`intl.faq.${key}`)}</span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    openIndex === index
                      ? 'bg-[#006446] text-white'
                      : 'bg-[#006446]/10 text-[#006446]'
                  }`}
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="px-6 text-surface-500 leading-relaxed">{t(`intl.faq.a${index + 1}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
