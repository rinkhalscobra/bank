import { useLanguage } from '../contexts/LanguageContext';
import '../i18n/loans';
import LoanCard from '../components/loans/LoanCard';
import LoanHowItWorks from '../components/loans/LoanHowItWorks';
import LoanCalculator from '../components/loans/LoanCalculator';
import LoanRefinancing from '../components/loans/LoanRefinancing';
import LoanTestimonials from '../components/loans/LoanTestimonials';
import LoanFAQ from '../components/loans/LoanFAQ';

const loanTypes = [
  {
    key: 'home',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiSmgsrTkS0kxJFwvtv58FRssPRrxUeT_GWA&s',
    featured: false
  },
  {
    key: 'auto',
    image: 'https://media.istockphoto.com/id/1138560072/photo/salesman-giving-new-car-keys-to-customer.jpg?s=612x612&w=0&k=20&c=Mp-ZV3uPdHx89kqIzjimzfUQ9qyzoFxFOwHuozDKlVA=',
    featured: false
  },
  {
    key: 'student',
    image: 'https://readlion.com/wp-content/uploads/2024/05/student-loan.jpeg',
    featured: false
  },
  {
    key: 'personal',
    image: 'https://wetrust.co.uk/wp-content/uploads/2020/07/AdobeStock_287067334-scaled.jpeg',
    featured: true
  }
];

export default function Loans() {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative text-white min-h-[700px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://www.globalimebank.com/blog/wp-content/uploads/2025/06/home-loan-img.jpg')"
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/95 via-[#006446]/80 to-[#006446]/45" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_45%,_rgba(0,0,0,0.18))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
              <span className="text-sm font-semibold text-white">
                {t('loans.hero.title')}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              {t('loans.hero.title')}
            </h1>

            <p className="text-xl leading-relaxed text-white/88">
              {t('loans.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Loan Cards */}
      <section className="section-padding bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loanTypes.map((loan) => (
              <LoanCard
                key={loan.key}
                t={t}
                loanKey={loan.key}
                image={loan.image}
                featured={loan.featured}
              />
            ))}
          </div>
        </div>
      </section>

      <LoanCalculator />
      <LoanHowItWorks />
      <LoanRefinancing />
      <LoanTestimonials />
      <LoanFAQ />
    </>
  );
}
