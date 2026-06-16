import { CreditCard, Users, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';

interface ServiceItem {
  key: string;
  icon: LucideIcon;
}

const services: ServiceItem[] = [
  { key: 'payments', icon: CreditCard },
  { key: 'payroll', icon: Users },
  { key: 'transfers', icon: ArrowLeftRight },
];

export default function BusinessServices() {
  const { t } = useLanguage();

  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-5">
            {t('biz.services.title')}
          </h2>
          <div className="w-16 h-1 bg-[#006446] rounded-full mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="group relative rounded-2xl border border-[#006446]/12 bg-gradient-to-b from-white to-[#006446]/[0.03] p-8 transition-all duration-500 hover:border-[#006446]/25 hover:shadow-soft-lg"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-[#006446]/12 bg-[#006446]/10 transition-all duration-500 group-hover:bg-[#006446]">
                <Icon className="w-6 h-6 text-[#006446] transition-colors duration-500 group-hover:text-white" />
              </div>

              <h4 className="text-xl font-semibold text-surface-900 mb-3">
                {t(`biz.services.${key}.title`)}
              </h4>
              <p className="text-surface-500 leading-relaxed">
                {t(`biz.services.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
