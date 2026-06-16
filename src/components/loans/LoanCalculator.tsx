import { useState, useMemo } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const loanTypeConfigs = [
  { id: 'home', defaultRate: 5.99, maxAmount: 1000000, maxTerm: 360 },
  { id: 'auto', defaultRate: 4.49, maxAmount: 100000, maxTerm: 84 },
  { id: 'personal', defaultRate: 6.99, maxAmount: 100000, maxTerm: 84 },
  { id: 'student', defaultRate: 3.99, maxAmount: 200000, maxTerm: 240 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LoanCalculator() {
  const { t } = useLanguage();
  const [activeLoanType, setActiveLoanType] = useState('home');
  const [amount, setAmount] = useState(300000);
  const [rate, setRate] = useState(5.99);
  const [termMonths, setTermMonths] = useState(360);

  const currentType = loanTypeConfigs.find((lt) => lt.id === activeLoanType)!;

  const handleTypeChange = (typeId: string) => {
    const newType = loanTypeConfigs.find((lt) => lt.id === typeId)!;
    setActiveLoanType(typeId);
    setRate(newType.defaultRate);
    setAmount(Math.min(amount, newType.maxAmount));
    setTermMonths(Math.min(termMonths, newType.maxTerm));
  };

  const { monthlyPayment, totalPayment, totalInterest } = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) {
      const mp = amount / termMonths;
      return { monthlyPayment: mp, totalPayment: amount, totalInterest: 0 };
    }
    const mp =
      (amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    const tp = mp * termMonths;
    return { monthlyPayment: mp, totalPayment: tp, totalInterest: tp - amount };
  }, [amount, rate, termMonths]);

  const principalPercent = (amount / totalPayment) * 100;

  const formatTerm = (months: number) => {
    if (months < 12) return `${months} ${t('loans.calc.months')}`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const yearLabel = years > 1 ? t('loans.calc.years') : t('loans.calc.year');
    if (remainingMonths > 0) return `${years} ${yearLabel} ${remainingMonths} ${t('loans.calc.mo')}`;
    return `${years} ${yearLabel}`;
  };

  const typeLabels: Record<string, string> = {
    home: t('loans.calc.type.home'),
    auto: t('loans.calc.type.auto'),
    personal: t('loans.calc.type.personal'),
    student: t('loans.calc.type.student'),
  };

  return (
    <section className="section-padding bg-[#006446] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <span className="text-white tracking-widest uppercase text-sm font-semibold mb-4 block">
            {t('loans.calc.badge')}
          </span>
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            {t('loans.calc.title')}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/85">
            {t('loans.calc.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {loanTypeConfigs.map((lt) => (
            <button
              key={lt.id}
              onClick={() => handleTypeChange(lt.id)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeLoanType === lt.id
                  ? 'bg-white text-[#006446] shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              {typeLabels[lt.id]}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 rounded-2xl border border-white/20 bg-white p-8 lg:p-10">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 font-semibold text-surface-900">
                    <DollarSign className="h-4 w-4 text-[#006446]" />
                    {t('loans.calc.amount')}
                  </label>
                  <span className="text-black font-bold text-lg">{formatCurrency(amount)}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={currentType.maxAmount}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-[#006446]/30 rounded-lg appearance-none cursor-pointer accent-[#006446]"
                />
                <div className="flex justify-between text-xs text-[#006446]/50 mt-1">
                  <span>$5,000</span>
                  <span>{formatCurrency(currentType.maxAmount)}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 font-semibold text-surface-900">
                    <Percent className="h-4 w-4 text-[#006446]" />
                    {t('loans.calc.rate')}
                  </label>
                  <span className="text-black font-bold text-lg">{rate.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.01}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-2 bg-[#006446]/30 rounded-lg appearance-none cursor-pointer accent-[#006446]"
                />
                <div className="flex justify-between text-xs text-[#006446]/50 mt-1">
                  <span>1.00%</span>
                  <span>20.00%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 font-semibold text-surface-900">
                    <Calendar className="h-4 w-4 text-[#006446]" />
                    {t('loans.calc.term')}
                  </label>
                  <span className="text-black font-bold text-lg">{formatTerm(termMonths)}</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={currentType.maxTerm}
                  step={12}
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  className="w-full h-2 bg-[#006446]/30 rounded-lg appearance-none cursor-pointer accent-[#006446]"
                />
                <div className="flex justify-between text-xs text-[#006446]/50 mt-1">
                  <span>{t('loans.calc.termMin')}</span>
                  <span>{currentType.maxTerm / 12} {t('loans.calc.years')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-lg">
              <Calculator className="mb-3 h-8 w-8 text-[#006446]" />
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-surface-700">
                {t('loans.calc.monthly')}
              </p>
              <p className="mb-1 text-5xl font-bold text-[#006446]">
                {formatCurrency(Math.round(monthlyPayment))}
              </p>
              <p className="text-sm text-surface-600">{t('loans.calc.perMonth')}</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white p-8">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-black text-sm">{t('loans.calc.principal')}</span>
                  <span className="text-black font-semibold">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black text-sm">{t('loans.calc.interest')}</span>
                  <span className="text-black font-semibold">
                    {formatCurrency(Math.round(totalInterest))}
                  </span>
                </div>
                <div className="h-px bg-[#006446]/15" />
                <div className="flex justify-between items-center">
                  <span className="text-black font-semibold">{t('loans.calc.totalCost')}</span>
                  <span className="text-black font-bold text-lg">
                    {formatCurrency(Math.round(totalPayment))}
                  </span>
                </div>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-[#006446]/12">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#006446] to-[#2f7d61] transition-all duration-500"
                  style={{ width: `${principalPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-black">
                  {t('loans.calc.principalLabel')} ({principalPercent.toFixed(0)}%)
                </span>
                <span className="text-black">
                  {t('loans.calc.interestLabel')} ({(100 - principalPercent).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/75">
          {t('loans.calc.disclaimer')}
        </p>
      </div>
    </section>
  );
}
