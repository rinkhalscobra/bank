import { Smartphone, Bell, Lock, BarChart3, Wallet, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const featureItems = [
  { key: 'alerts', icon: Bell },
  { key: 'lock', icon: Lock },
  { key: 'spending', icon: BarChart3 },
  { key: 'wallet', icon: Wallet },
  { key: 'virtual', icon: Eye },
  { key: 'deposit', icon: Smartphone },
];

export default function CardDigitalManagement() {
  const { t } = useLanguage();

  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-start mb-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#006446]" />
              <span className="text-[#006446] text-xs font-semibold tracking-[0.2em] uppercase">{t('cards.digital.subtitle')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-surface-900 mb-6 leading-tight">
              {t('cards.digital.title')}
            </h2>
            <p className="mb-3 leading-relaxed text-surface-700">
              {t('cards.digital.desc1')}
            </p>
            <p className="leading-relaxed text-surface-700">
              {t('cards.digital.desc2')}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[#006446]/12">
            <img
              src="https://images.pexels.com/photos/6347720/pexels-photo-6347720.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Person managing their banking on a smartphone"
              className="w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-[#006446]/12 bg-[#006446]/10 md:grid-cols-2 lg:grid-cols-3">
          {featureItems.map((item) => (
            <div
              key={item.key}
              className="group bg-white p-7 transition-all duration-200 hover:bg-[#006446]/[0.04]"
            >
              <div className="flex items-start gap-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#006446]/10 transition-all duration-300 group-hover:bg-[#006446]">
                  <item.icon className="w-5 h-5 text-[#006446] transition-colors duration-300 group-hover:text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-surface-900 mb-1.5">
                    {t(`cards.digital.${item.key}.title`)}
                  </h4>
                  <p className="text-surface-500 text-sm leading-relaxed">
                    {t(`cards.digital.${item.key}.desc`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
