import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const faqCount = 8;

export default function CardFAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-20">
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#006446]" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-surface-900 mb-4">
                {t('cards.faq.title')}
              </h2>
              <p className="text-surface-500 mb-10">
                {t('cards.faq.subtitle')}
              </p>

              <div className="rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.04] p-7">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#006446]">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-display font-bold text-surface-900 mb-2">
                  {t('cards.faq.still.title')}
                </h3>
                <p className="text-surface-500 text-sm mb-6">
                  {t('cards.faq.still.desc')}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-2">
            {Array.from({ length: faqCount }, (_, idx) => {
              const isOpen = openIndex === idx;
              const num = idx + 1;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-[#006446]/25 bg-[#006446]/[0.04]' : 'border-[#006446]/12 bg-white hover:border-[#006446]/25'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="text-surface-900 font-semibold text-sm pr-4">
                      {t(`cards.faq.q${num}`)}
                    </span>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isOpen ? 'bg-[#006446] text-white rotate-180' : 'bg-[#006446]/10 text-[#006446]'
                    }`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-5 text-surface-500 text-sm leading-relaxed">
                      {t(`cards.faq.a${num}`)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
