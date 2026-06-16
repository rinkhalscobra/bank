import { useState } from 'react';
import { ChevronDown, Euro, Clock, Building, Globe, HelpCircle, Landmark } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';

interface FaqItem {
  icon: LucideIcon;
  questionKey: string;
  content: (t: (key: string) => string) => JSX.Element;
}

const faqItems: FaqItem[] = [
  {
    icon: Euro,
    questionKey: 'biz.faq.q1',
    content: (t) => (
      <>
        <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a1.p1')}</p>
        <p className="text-surface-500 leading-relaxed">{t('biz.faq.a1.p2')}</p>
      </>
    ),
  },
  {
    icon: Building,
    questionKey: 'biz.faq.q2',
    content: (t) => (
      <>
        <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a2.p1')}</p>
        <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a2.p2')}</p>
        <div className="my-6 rounded-r-xl border-l-4 border-[#006446] bg-[#006446]/[0.05] p-6">
          <h4 className="font-semibold text-surface-900 mb-3">{t('biz.faq.a2.depositTitle')}</h4>
          <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a2.depositP1')}</p>
          <p className="text-surface-500 leading-relaxed mb-3">{t('biz.faq.a2.depositP2')}</p>
          <ul className="space-y-2 ml-4">
            {['nv', 'bv', 'vof'].map((key) => (
              <li key={key} className="flex items-center text-surface-500">
                <span className="mr-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#006446]" />
                {t(`biz.faq.a2.${key}`)}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-surface-500 leading-relaxed mb-6">{t('biz.faq.a2.p3')}</p>
        <div className="my-6 rounded-xl border border-[#006446]/12 bg-[#006446]/[0.04] p-6">
          <h4 className="font-semibold text-surface-900 mb-3">{t('biz.faq.a2.exceptionsTitle')}</h4>
          <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a2.exceptionsP1')}</p>
          <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a2.exceptionsP2')}</p>
          <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a2.exceptionsP3')}</p>
          <p className="text-surface-500 leading-relaxed mb-3">{t('biz.faq.a2.exceptionsP4')}</p>
          <ul className="space-y-2 ml-4">
            {['donations', 'payments', 'subsidies'].map((key) => (
              <li key={key} className="flex items-center text-surface-500">
                <span className="mr-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#006446]" />
                {t(`biz.faq.a2.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </>
    ),
  },
  {
    icon: HelpCircle,
    questionKey: 'biz.faq.q3',
    content: (t) => (
      <>
        <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a3.p1')}</p>
        <p className="text-surface-500 leading-relaxed">{t('biz.faq.a3.p2')}</p>
      </>
    ),
  },
  {
    icon: Clock,
    questionKey: 'biz.faq.q4',
    content: (t) => (
      <>
        <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a4.p1')}</p>
        <p className="text-surface-500 leading-relaxed">{t('biz.faq.a4.p2')}</p>
      </>
    ),
  },
  {
    icon: Landmark,
    questionKey: 'biz.faq.q5',
    content: (t) => (
      <>
        <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a5.p1')}</p>
        <p className="text-surface-500 leading-relaxed">{t('biz.faq.a5.p2')}</p>
      </>
    ),
  },
  {
    icon: Globe,
    questionKey: 'biz.faq.q6',
    content: (t) => (
      <>
        <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a6.p1')}</p>
        <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a6.p2')}</p>
        <p className="text-surface-500 leading-relaxed mb-6">{t('biz.faq.a6.p3')}</p>
        <div className="my-6 rounded-r-xl border-l-4 border-[#006446] bg-[#006446]/[0.05] p-6">
          <h4 className="font-semibold text-surface-900 mb-4">{t('biz.faq.a6.taxTitle')}</h4>
          <p className="text-surface-500 leading-relaxed mb-4">{t('biz.faq.a6.taxP1')}</p>
          <ul className="space-y-4">
            <li className="text-surface-500 leading-relaxed">
              <span className="font-semibold text-surface-900">{t('biz.faq.a6.taxReturns')}</span> {t('biz.faq.a6.taxReturnsDesc')}
            </li>
            <li className="text-surface-500 leading-relaxed">
              <span className="font-semibold text-surface-900">{t('biz.faq.a6.cocReg')}</span> {t('biz.faq.a6.cocRegDesc')}
            </li>
            <li className="text-surface-500 leading-relaxed">
              <span className="font-semibold text-surface-900">{t('biz.faq.a6.directDebit')}</span> {t('biz.faq.a6.directDebitDesc')}
            </li>
          </ul>
        </div>
        <div className="mt-6 rounded-2xl bg-[#006446] p-8 text-white">
          <h4 className="font-display font-bold text-xl mb-3">{t('biz.faq.a6.summaryTitle')}</h4>
          <p className="mb-4 leading-relaxed text-white/80">{t('biz.faq.a6.summaryP1')}</p>
          <p className="text-lg font-semibold text-white">{t('biz.faq.a6.summaryP2')}</p>
        </div>
      </>
    ),
  },
];

export default function BusinessFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-5">
            {t('biz.faq.title')}
          </h2>
          <div className="w-16 h-1 bg-[#006446] rounded-full mx-auto" />
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'bg-white border-[#006446] shadow-soft-lg'
                    : 'bg-white border-[#006446]/12 hover:border-[#006446]/25 hover:bg-white'
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center gap-4 p-6 text-left"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isOpen ? 'bg-[#006446] shadow-md shadow-[#006446]/20' : 'bg-[#006446]/10'
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${
                      isOpen ? 'text-white' : 'text-[#006446]'
                    }`} />
                  </div>
                  <span className={`text-lg font-semibold flex-1 transition-colors duration-200 ${
                    isOpen ? 'text-surface-900' : 'text-surface-700'
                  }`}>
                    {t(item.questionKey)}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isOpen ? 'bg-[#006446] text-white' : 'bg-[#006446]/10 text-[#006446]'
                  }`}>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-8 pt-0 ml-[60px]">
                    {item.content(t)}
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
