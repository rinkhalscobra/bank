import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AboutCTA() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[480px] flex items-end">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=1600')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/95 via-[#006446]/80 to-[#006446]/45" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pb-20 pt-24">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
          {t('about.cta.title')}
        </h2>
        <p className="text-xl text-emerald-50/90 mb-10 leading-relaxed max-w-2xl mx-auto">
          {t('about.cta.desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white hover:bg-emerald-50 text-[#006446] px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center group">
            {t('about.cta.btn1')}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <Link
            to="/online-banking"
            className="bg-transparent hover:bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/25 transition-all duration-200 inline-flex items-center justify-center"
          >
            {t('about.cta.btn2')}
          </Link>
        </div>
      </div>
    </section>
  );
}
