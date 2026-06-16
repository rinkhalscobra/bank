import { Shield, Target, CheckCircle, Wallet } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import '../i18n/investments';
import InvestmentPhilosophy from '../components/investments/InvestmentPhilosophy';
import InvestmentProcess from '../components/investments/InvestmentProcess';
import AssetAllocation from '../components/investments/AssetAllocation';
import InvestmentTestimonials from '../components/investments/InvestmentTestimonials';
import InvestmentFAQ from '../components/investments/InvestmentFAQ';
import { Link } from "react-router-dom";

export default function Investments() {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative text-white min-h-[700px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&cs=tinysrgb&w=1600')"
          }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#006446]/95 via-[#006446]/80 to-[#006446]/50"></div>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_45%,_rgba(0,0,0,0.18))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="max-w-3xl">
            <span className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-white">
              {t('inv.hero.badge')}
            </span>

            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              {t('inv.hero.title')}
            </h1>

            <p className="mb-8 text-xl leading-relaxed text-white/88">
              {t('inv.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/online-banking"
                className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[#006446] shadow-lg shadow-black/15 transition-all duration-300 hover:bg-white/90"
              >
                {t('inv.hero.cta1')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-black font-semibold text-sm tracking-widest uppercase mb-3">
              {t('inv.services.badge')}
            </p>
            <h2 className="text-4xl font-display font-bold text-black mb-4">{t('inv.services.title')}</h2>
            <p className="max-w-3xl mx-auto text-xl text-surface-600">
              {t('inv.services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-[#006446]/12 bg-white p-8 shadow-soft transition-all duration-300 hover:border-[#006446]/25 hover:shadow-soft-lg">
              <div className="w-20 h-16 flex items-center justify-center mb-6">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7560/7560585.png"
                  alt="business chart"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="text-2xl font-display font-bold text-surface-900 mb-4">{t('inv.portfolio.title')}</h3>
              <p className="text-surface-500 text-sm mb-4 leading-relaxed">
                {t('inv.portfolio.desc')}
              </p>
              <ul className="space-y-3 mb-6">
                {(['b1', 'b2', 'b3', 'b4', 'b5'] as const).map((key) => (
                  <li key={key} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#006446] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-surface-500">{t(`inv.portfolio.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-[#006446] hover:bg-[#00523a] text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200">
                {t('inv.portfolio.cta')}
              </button>
            </div>

            <div className="relative rounded-2xl border border-[#006446] bg-[#006446] p-8 shadow-soft-lg ring-2 ring-[#006446]/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-1.5 text-sm font-semibold text-[#006446]">
                {t('inv.retirement.badge')}
              </div>
              <div className="rounded-xl w-20 h-16 flex items-center justify-center mb-6">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/11048/11048632.png"
                  alt="retirement planning"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">{t('inv.retirement.title')}</h3>
              <p className="mb-4 text-sm leading-relaxed text-white/80">
                {t('inv.retirement.desc')}
              </p>
              <ul className="space-y-3 mb-6">
                {(['b1', 'b2', 'b3', 'b4', 'b5'] as const).map((key) => (
                  <li key={key} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">{t(`inv.retirement.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-xl bg-white px-6 py-3 font-semibold text-[#006446] transition-all duration-200 hover:bg-white/90">
                {t('inv.retirement.cta')}
              </button>
            </div>

            <div className="rounded-2xl border border-[#006446]/12 bg-white p-8 shadow-soft transition-all duration-300 hover:border-[#006446]/25 hover:shadow-soft-lg">
              <div className="rounded-xl w-20 h-16 flex items-center justify-center mb-6">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/17597/17597684.png"
                  alt="wealth"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="text-2xl font-display font-bold text-surface-900 mb-4">{t('inv.wealth.title')}</h3>
              <p className="text-surface-500 text-sm mb-4 leading-relaxed">
                {t('inv.wealth.desc')}
              </p>
              <ul className="space-y-3 mb-6">
                {(['b1', 'b2', 'b3', 'b4', 'b5'] as const).map((key) => (
                  <li key={key} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#006446] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-surface-500">{t(`inv.wealth.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-[#006446] hover:bg-[#00523a] text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200">
                {t('inv.wealth.cta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <InvestmentPhilosophy />

      <section className="section-padding bg-gradient-to-b from-white via-[#006446]/[0.04] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-black font-semibold text-sm tracking-widest uppercase mb-3">
              {t('inv.vehicles.badge')}
            </p>
            <h2 className="text-4xl font-display font-bold text-black mb-4">{t('inv.vehicles.title')}</h2>
            <p className="text-xl text-surface-600">{t('inv.vehicles.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(['stocks', 'bonds', 'mutual', 'etfs', 'alts', 'digital'] as const).map((v) => (
              <div key={v} className="rounded-2xl border border-[#006446]/12 border-l-4 border-l-[#006446] bg-white p-8 shadow-soft transition-all duration-300 hover:border-[#006446]/25 hover:shadow-soft-lg">
                <h4 className="text-xl font-display font-semibold text-surface-900 mb-3">{t(`inv.vehicles.${v}.title`)}</h4>
                <p className="text-surface-500 text-sm leading-relaxed">
                  {t(`inv.vehicles.${v}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AssetAllocation />

      <InvestmentProcess />

      <section className="section-padding bg-[#006446] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-white mb-6">{t('inv.why.title')}</h2>
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="rounded-xl bg-white p-2.5 mr-4 mt-1 flex-shrink-0 group-hover:bg-[#006446]/30 transition-all duration-300">
                    <Shield className="w-6 h-6 text-[#006446] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl mb-2">{t('inv.why.fiduciary.title')}</h4>
                    <p className="text-white/85 leading-relaxed">{t('inv.why.fiduciary.desc')}</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="rounded-xl bg-white p-2.5 mr-4 mt-1 flex-shrink-0 group-hover:bg-[#006446]/30 transition-all duration-300">
                    <Target className="w-6 h-6 text-[#006446] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl mb-2">{t('inv.why.track.title')}</h4>
                    <p className="text-white/85 leading-relaxed">{t('inv.why.track.desc')}</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="rounded-xl bg-white p-2.5 mr-4 mt-1 flex-shrink-0 group-hover:bg-[#006446]/30 transition-all duration-300">
                    <Wallet className="w-6 h-6 text-[#006446] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl mb-2">{t('inv.why.pricing.title')}</h4>
                    <p className="text-white/85 leading-relaxed">{t('inv.why.pricing.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Investment team reviewing portfolio performance"
                className="w-full h-[400px] object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#006446]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-white/30 shadow-lg">
                  <h3 className="text-xl text-black font-display font-bold mb-3">{t('inv.why.cta.title')}</h3>
                  <p className="text-black text-sm mb-4">
                    {t('inv.why.cta.desc')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/online-banking"
                      className="inline-block bg-[#006446] hover:bg-[#005634] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex-1 text-center"
                    >
                      {t('inv.why.cta1')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InvestmentTestimonials />

      <InvestmentFAQ />

      <section className="section-padding bg-surface-50 border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <p className="mb-2 text-xs text-surface-500">
              {t('inv.disclaimer1')}
            </p>
            <p className="mb-2 text-xs text-surface-500">
              {t('inv.disclaimer2')}
            </p>
            <p className="text-xs text-surface-500">
              {t('inv.disclaimer3')}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
