import { ArrowDownRight, Shield, Clock, PiggyBank, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const benefitIcons = [ArrowDownRight, PiggyBank, Clock, Shield];
const benefitKeys = ['benefit1', 'benefit2', 'benefit3', 'benefit4'];

export default function LoanRefinancing() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
          <div>
            <span className="text-[#006446] tracking-widest uppercase text-sm font-semibold mb-4 block">
              {t('loans.refi.badge')}
            </span>
            <h2 className="mb-6 text-4xl font-display font-bold text-[#006446]">
              {t('loans.refi.title')}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-surface-700">
              {t('loans.refi.desc1')}
            </p>
            <p className="mb-8 text-lg leading-relaxed text-surface-700">
              {t('loans.refi.desc2')}
            </p>
          </div>
          <div className="relative">
            <img
              src="https://www.packsend.co.uk/wp-content/uploads/2025/04/Taking-Out-A-Bank-Loan-For-A-First-Time-Business-Franchise.jpg"
              alt="Business owner reviewing loan options"
              className="w-full h-[520px] object-cover rounded-2xl shadow-soft-lg"
            />
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-[#006446] to-[#005737] text-white p-6 rounded-2xl shadow-xl hidden lg:block">
              <p className="text-3xl font-bold">{t('loans.refi.savings')}</p>
              <p className="text-white text-sm">{t('loans.refi.savingsLabel')}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefitKeys.map((key, i) => {
            const Icon = benefitIcons[i];
            return (
              <div
              key={key}
                className="flex gap-5 rounded-2xl border border-[#006446]/15 bg-white p-6 shadow-soft transition-all duration-300 hover:border-[#005737] hover:shadow-soft-lg"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#006446]/10 transition-transform duration-300 hover:scale-105">
                  <Icon className="h-7 w-7 text-[#006446]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-surface-900 mb-2">
                    {t(`loans.refi.${key}.title`)}
                  </h4>
                  <p className="text-surface-500 text-sm leading-relaxed">
                    {t(`loans.refi.${key}.desc`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 rounded-2xl border border-[#006446]/15 bg-[#006446]/[0.04] p-8 lg:p-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-display font-bold text-surface-900 mb-4">
                {t('loans.refi.right.title')}
              </h3>
              <p className="text-surface-500 leading-relaxed mb-4">
                {t('loans.refi.right.desc')}
              </p>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <li key={n} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#006446]" />
                    <span className="text-surface-500 text-sm">
                      {t(`loans.refi.right.item${n}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Financial advisor discussing loan options"
                className="w-full h-[320px] object-cover rounded-2xl shadow-soft-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
