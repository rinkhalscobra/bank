import { useLanguage } from '../contexts/LanguageContext';
import '../i18n/cards';
import CreditCardItem from '../components/cards/CreditCardItem';
//import DebitCard from '../components/cards/DebitCard';
import TravelSection from '../components/cards/TravelSection';
import BenefitsSection from '../components/cards/BenefitsSection';
import CardComparison from '../components/cards/CardComparison';
import CardDigitalManagement from '../components/cards/CardDigitalManagement';
import CardApplicationSteps from '../components/cards/CardApplicationSteps';
import CardFAQ from '../components/cards/CardFAQ';
//import CardVisual from '../components/cards/CardVisual';

export default function Cards() {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative min-h-[700px] overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://www.forbes.com/advisor/wp-content/uploads/2022/07/credit_cards.jpeg-1-1.jpg"
            alt="Credit cards"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/95 via-[#006446]/80 to-[#006446]/50" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_45%,_rgba(0,0,0,0.18))]" />
        </div>

        {/* Existing blur effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-[800px] w-[800px] rounded-full bg-white/10 blur-[160px] -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-white/10 blur-[120px] translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="absolute inset-0 border-b border-white/[0.06]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-40 pb-28">
          <div className="grid gap-20 items-center">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-px bg-[#006446]" />
              </div>
              <h1 className="text-5xl lg:text-[4.25rem] font-display font-bold mb-8 text-white leading-[1.08] tracking-tight">
                {t('cards.hero.title')}
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-md mb-12">
                {t('cards.hero.subtitle')}
              </p>
              <div className="flex items-center gap-5">
                <button className="rounded-lg bg-white px-8 py-4 text-sm font-semibold tracking-wide text-[#006446] transition-all duration-200 hover:bg-white/90">
                  {t('cards.hero.cta.explore')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-28 bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#006446]" />
            <span className="text-[#006446] text-xs font-semibold tracking-[0.2em] uppercase">{t('cards.credit.title')}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-surface-900">{t('cards.credit.title')}</h2>
            <p className="text-surface-500 max-w-md lg:text-right mt-3 lg:mt-0">{t('cards.credit.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <CreditCardItem t={t} variant="platinum" />
            <CreditCardItem t={t} variant="gold" popular />
            <CreditCardItem t={t} variant="business" />
          </div>
        </div>
      </section>


      <CardComparison />
      <BenefitsSection />
      <TravelSection />
      <CardDigitalManagement />
      <CardApplicationSteps />
      <CardFAQ />
    </>
  );
}
