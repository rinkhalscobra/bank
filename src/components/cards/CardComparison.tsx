import { useState } from 'react';
import { CheckCircle, Minus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const featureKeys = [
  'annualFee', 'introApr', 'regularApr', 'welcomeBonus',
  'topRewards', 'foreignFee', 'lounge', 'travelInsurance',
  'purchaseProtection', 'employeeCards', 'expenseTools', 'concierge',
];

const featureValues: Record<string, { platinum: string | boolean; gold: string | boolean; business: string | boolean }> = {
  annualFee: { platinum: '$0', gold: '$95', business: '$0' },
  regularApr: { platinum: '16.99% - 24.99%', gold: '18.99% - 26.99%', business: '17.49% - 25.49%' },
  lounge: { platinum: false, gold: true, business: false },
  travelInsurance: { platinum: false, gold: true, business: true },
  purchaseProtection: { platinum: true, gold: true, business: true },
  employeeCards: { platinum: false, gold: false, business: true },
  expenseTools: { platinum: false, gold: false, business: true },
  concierge: { platinum: false, gold: true, business: false },
};

const translatedValueKeys: Record<string, { platinum?: string; gold?: string; business?: string }> = {
  introApr: { platinum: 'cards.comparison.introApr.platinum', gold: 'cards.comparison.introApr.gold', business: 'cards.comparison.introApr.business' },
  welcomeBonus: { platinum: undefined, gold: 'cards.comparison.welcomeBonus.gold', business: undefined },
  topRewards: { platinum: 'cards.comparison.topRewards.platinum', gold: 'cards.comparison.topRewards.gold', business: 'cards.comparison.topRewards.business' },
  foreignFee: { platinum: 'cards.comparison.foreignFee.platinum', gold: 'cards.comparison.foreignFee.none', business: 'cards.comparison.foreignFee.none' },
};

const staticValues: Record<string, { platinum?: string; gold?: string; business?: string }> = {
  welcomeBonus: { platinum: '$200', business: '$500' },
};

type CardType = 'platinum' | 'gold' | 'business';

const cardNames: Record<CardType, string> = {
  platinum: 'Platinum Rewards',
  gold: 'Gold Elite',
  business: 'Business Premier',
};

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckCircle className="w-4 h-4 text-[#006446] mx-auto" />
    ) : (
      <Minus className="w-4 h-4 text-surface-300 mx-auto" />
    );
  }
  return <span className="text-surface-700 text-sm font-medium">{value}</span>;
}

function getFeatureValue(
  key: string,
  card: CardType,
  t: (k: string) => string
): string | boolean {
  if (featureValues[key]) {
    return featureValues[key][card];
  }
  const tKey = translatedValueKeys[key]?.[card];
  if (tKey) return t(tKey);
  const sVal = staticValues[key]?.[card];
  if (sVal) return sVal;
  return '';
}

export default function CardComparison() {
  const { t } = useLanguage();
  const [highlighted, setHighlighted] = useState<CardType>('gold');

  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-[#006446]" />
          <span className="text-[#006446] text-xs font-semibold tracking-[0.2em] uppercase">{t('cards.comparison.compare')}</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14">
          <div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-[#006446] mb-3">
              {t('cards.comparison.title')}
            </h2>
            <p className="text-surface-500 max-w-xl">
              {t('cards.comparison.subtitle')}
            </p>
          </div>
          <div className="mt-6 flex gap-1 rounded-lg bg-[#006446]/10 p-1 lg:mt-0">
            {(['platinum', 'gold', 'business'] as CardType[]).map((card) => (
              <button
                key={card}
                onClick={() => setHighlighted(card)}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  highlighted === card
                    ? 'bg-[#006446] text-white shadow-sm'
                    : 'text-[#006446]/70 hover:text-[#006446]'
                }`}
              >
                {cardNames[card]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#006446]/12">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#006446]/12">
                <th className="w-1/4 bg-[#006446]/[0.05] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#006446]/70">
                  {t('cards.comparison.feature')}
                </th>
                {(['platinum', 'gold', 'business'] as CardType[]).map((card) => (
                  <th
                    key={card}
                    className={`text-center px-6 py-4 font-semibold text-xs tracking-[0.1em] uppercase w-1/4 transition-colors duration-200 ${
                      highlighted === card ? 'bg-[#006446]/[0.12] text-[#006446]' : 'bg-[#006446]/[0.05] text-[#006446]/60'
                    }`}
                  >
                    {cardNames[card]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureKeys.map((key, idx) => (
                <tr
                  key={key}
                  className={`transition-colors duration-150 ${idx !== featureKeys.length - 1 ? 'border-b border-[#006446]/10' : ''}`}
                >
                  <td className="px-6 py-4 text-surface-700 font-medium text-sm">
                    {t(`cards.comparison.${key}`)}
                  </td>
                  {(['platinum', 'gold', 'business'] as CardType[]).map((card) => (
                    <td
                      key={card}
                      className={`px-6 py-4 text-center transition-colors duration-200 ${
                        highlighted === card ? 'bg-[#006446]/[0.05]' : ''
                      }`}
                    >
                      <CellValue value={getFeatureValue(key, card, t)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-xs text-surface-400">
          {t('cards.comparison.disclaimer')}
        </p>
      </div>
    </section>
  );
}
