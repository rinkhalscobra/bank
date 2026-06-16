import { useState } from 'react';
import { Shield, TrendingUp, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AllocationSlice {
  labelKey: string;
  percentage: number;
  color: string;
}

interface PortfolioModel {
  id: string;
  nameKey: string;
  icon: React.ElementType;
  subtitleKey: string;
  descriptionKey: string;
  expectedReturn: string;
  riskKey: string;
  allocation: AllocationSlice[];
}

const models: PortfolioModel[] = [
  {
    id: 'conservative',
    nameKey: 'inv.alloc.conservative',
    icon: Shield,
    subtitleKey: 'inv.alloc.conservativeSub',
    descriptionKey: 'inv.alloc.conservativeDesc',
    expectedReturn: '4-6%',
    riskKey: 'inv.alloc.riskLow',
    allocation: [
      { labelKey: 'inv.alloc.fixedIncome', percentage: 50, color: 'bg-[#00523a]' },
      { labelKey: 'inv.alloc.largeCap', percentage: 20, color: 'bg-[#006446]' },
      { labelKey: 'inv.alloc.cashEquiv', percentage: 15, color: 'bg-[#2f7d61]' },
      { labelKey: 'inv.alloc.realEstate', percentage: 10, color: 'bg-[#5da287]' },
      { labelKey: 'inv.alloc.alternatives', percentage: 5, color: 'bg-[#99c7b4]' },
    ],
  },
  {
    id: 'balanced',
    nameKey: 'inv.alloc.balanced',
    icon: TrendingUp,
    subtitleKey: 'inv.alloc.balancedSub',
    descriptionKey: 'inv.alloc.balancedDesc',
    expectedReturn: '6-9%',
    riskKey: 'inv.alloc.riskModerate',
    allocation: [
      { labelKey: 'inv.alloc.largeCap', percentage: 35, color: 'bg-[#006446]' },
      { labelKey: 'inv.alloc.fixedIncome', percentage: 25, color: 'bg-[#00523a]' },
      { labelKey: 'inv.alloc.intlEquities', percentage: 20, color: 'bg-[#2f7d61]' },
      { labelKey: 'inv.alloc.realEstate', percentage: 10, color: 'bg-[#5da287]' },
      { labelKey: 'inv.alloc.alternatives', percentage: 10, color: 'bg-[#99c7b4]' },
    ],
  },
  {
    id: 'aggressive',
    nameKey: 'inv.alloc.aggressive',
    icon: Zap,
    subtitleKey: 'inv.alloc.aggressiveSub',
    descriptionKey: 'inv.alloc.aggressiveDesc',
    expectedReturn: '9-12%',
    riskKey: 'inv.alloc.riskHigh',
    allocation: [
      { labelKey: 'inv.alloc.largeCap', percentage: 35, color: 'bg-[#006446]' },
      { labelKey: 'inv.alloc.intlEquities', percentage: 25, color: 'bg-[#2f7d61]' },
      { labelKey: 'inv.alloc.smallMidCap', percentage: 20, color: 'bg-[#5da287]' },
      { labelKey: 'inv.alloc.emergingMarkets', percentage: 12, color: 'bg-[#99c7b4]' },
      { labelKey: 'inv.alloc.fixedIncome', percentage: 8, color: 'bg-[#00523a]' },
    ],
  },
];

export default function AssetAllocation() {
  const [active, setActive] = useState('balanced');
  const { t } = useLanguage();
  const selected = models.find((m) => m.id === active)!;

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-black">
            {t('inv.alloc.badge')}
          </p>
          <h2 className="mb-4 text-4xl font-display font-bold text-black">
            {t('inv.alloc.title')}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-surface-600">
            {t('inv.alloc.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setActive(model.id)}
              className={`p-6 text-left transition-all duration-300 rounded-2xl border-2 ${
                active === model.id
                  ? 'border-[#006446] ring-2 ring-[#006446]/20 bg-[#006446]/10 shadow-soft-lg'
                  : 'border-[#006446]/12 bg-white hover:border-[#006446] hover:shadow-soft'
              }`}
            >
              <div className="flex items-center mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all duration-300 ${
                    active === model.id ? 'bg-gradient-to-br from-[#006446] to-[#00523a]' : 'bg-[#006446]/10'
                  }`}
                >
                  <model.icon
                    className={`w-5 h-5 ${
                      active === model.id ? 'text-white' : 'text-[#006446]'
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-surface-900">{t(model.nameKey)}</h4>
                  <p className="text-xs text-surface-600">{t(model.subtitleKey)}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-700">
                  {t('inv.alloc.targetReturn')} <span className="font-semibold text-surface-900">{model.expectedReturn}</span>
                </span>
                <span className="text-surface-700">
                  {t('inv.alloc.risk')} <span className="font-semibold text-surface-900">{t(model.riskKey)}</span>
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="mb-4 text-2xl font-display font-bold text-surface-900">
              {t(selected.nameKey)} {t('inv.alloc.portfolio')}
            </h3>
            <p className="text-surface-500 leading-relaxed mb-8">
              {t(selected.descriptionKey)}
            </p>
            <div className="space-y-4">
              {selected.allocation.map((slice) => (
                <div key={slice.labelKey}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-surface-700">{t(slice.labelKey)}</span>
                    <span className="text-surface-900 font-bold">{slice.percentage}%</span>
                  </div>
                  <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${slice.color} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${slice.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.04] p-8">
            <h4 className="font-display font-bold text-surface-900 text-lg mb-6">
              {t('inv.alloc.breakdown')}
            </h4>
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {selected.allocation.reduce<{ elements: React.ReactNode[]; offset: number }>(
                    (acc, slice, i) => {
                      const circumference = 2 * Math.PI * 40;
                      const dashLength = (slice.percentage / 100) * circumference;
                      const gapLength = circumference - dashLength;
                      const colorMap: Record<string, string> = {
                        'bg-[#00523a]': '#00523a',
                        'bg-[#006446]': '#006446',
                        'bg-[#2f7d61]': '#2f7d61',
                        'bg-[#5da287]': '#5da287',
                        'bg-[#99c7b4]': '#99c7b4',
                      };
                      acc.elements.push(
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={colorMap[slice.color] || '#94a3b8'}
                          strokeWidth="16"
                          strokeDasharray={`${dashLength} ${gapLength}`}
                          strokeDashoffset={-acc.offset}
                        />
                      );
                      acc.offset += dashLength;
                      return acc;
                    },
                    { elements: [], offset: 0 }
                  ).elements}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-surface-900">
                      {selected.expectedReturn}
                    </div>
                    <div className="text-xs text-surface-500">{t('inv.alloc.targetReturnLabel')}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {selected.allocation.map((slice) => (
                <div key={slice.labelKey} className="flex items-center text-sm">
                  <div className={`w-3 h-3 rounded-full ${slice.color} mr-2 flex-shrink-0`} />
                  <span className="text-surface-500">{t(slice.labelKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
