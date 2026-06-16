import { CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const benefitKeys = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'] as const;

export default function GlobalMobility() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-[#006446]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <div className="relative overflow-hidden rounded-2xl shadow-soft-lg">
              <img
                src="https://images.pexels.com/photos/2033343/pexels-photo-2033343.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Passport and boarding pass representing global mobility"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/55 to-transparent" />
            </div>
            <div className="relative overflow-hidden rounded-2xl shadow-soft-lg">
              <img
                src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="International team meeting discussing financial planning"
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/45 to-transparent" />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-white/80 font-semibold tracking-widest uppercase text-sm">
              {t('intl.mobility.badge')}
            </span>
            <h2 className="text-4xl font-display font-bold text-white mt-3 mb-6">
              {t('intl.mobility.title')}
            </h2>
            <p className="text-lg text-emerald-50/85 mb-8 leading-relaxed">
              {t('intl.mobility.desc')}
            </p>
            <div className="space-y-4 mb-10">
              {benefitKeys.map((key) => (
                <div key={key} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed text-emerald-50/85">{t(`intl.mobility.${key}`)}</span>
                </div>
              ))}
            </div>
            <Link
              to="/online-banking"
              className="inline-flex items-center rounded-xl bg-white px-8 py-4 font-semibold text-[#006446] shadow-soft transition-all duration-200 hover:bg-emerald-50 hover:shadow-soft-lg"
            >
              {t('intl.mobility.cta')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
