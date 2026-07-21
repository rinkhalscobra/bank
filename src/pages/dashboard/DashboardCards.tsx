import { useEffect, useRef, useState } from 'react';
import {
  CreditCard,
  Snowflake,
  Play,
  Plus,
  Shield,
  Wifi,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Briefcase,
  DollarSign,
  Target,
  ChevronDown,
} from 'lucide-react';
import { useCards, CardApplication } from '../../hooks/useCards';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-cards/translations';

function getCardDisplayDigits(num: string) {
  const digits = num.replace(/\D/g, '');
  return digits.length === 17 && /^[45]/.test(digits) ? `${digits.slice(0, 4)}${digits.slice(5)}` : digits;
}

function getCardNumberGroups(num: string) {
  return getCardDisplayDigits(num).match(/.{1,4}/g) || [];
}

function maskCard(num: string) {
  const groups = getCardNumberGroups(num);

  if (groups.length <= 2) return groups.join(' ');
  return [groups[0], ...groups.slice(1, -1).map(() => '****'), groups[groups.length - 1]].join(' ');
}

function formatCardNumber(num: string) {
  return getCardNumberGroups(num).join(' ');
}

type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

function CustomSelect<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value) || options[0];

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-xl border border-[#006446]/14 bg-white px-4 py-2.5 text-left text-sm text-slate-900 transition-all duration-200 ${
          open ? 'ring-2 ring-[#006446]/20' : 'hover:border-[#006446]/25'
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-[#006446] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_70px_-38px_rgba(0,100,70,0.45)]">
          <div className="max-h-60 overflow-y-auto p-2">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-[#006446] text-white'
                      : 'text-slate-700 hover:bg-[#006446]/[0.05] hover:text-[#006446]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const BRAND_COLORS: Record<string, { gradient: string; accent: string }> = {
  visa: { gradient: 'from-[#00523a] to-[#006446]', accent: 'text-white' },
  mastercard: { gradient: 'from-[#006446] to-[#0a7f59]', accent: 'text-white' },
};

const INITIAL_FORM: CardApplication = {
  cardholderName: '',
  billingAddress: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  country: 'US',
  phoneNumber: '',
  employmentStatus: 'employed',
  annualIncome: 0,
  currency: 'USD',
  purpose: 'everyday',
  dailyLimit: 5000,
  monthlyLimit: 25000,
};

export default function DashboardCards() {
  const { cards, pendingApplications, loading, toggleFreeze, createCard } = useCards();
  const { t } = useLanguage();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CardApplication>({ ...INITIAL_FORM });
  const [creating, setCreating] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [step, setStep] = useState(1);

  const EMPLOYMENT_OPTIONS = [
    { value: 'employed', label: t('dashboardCards.employment.employed') },
    { value: 'self-employed', label: t('dashboardCards.employment.selfEmployed') },
    { value: 'business-owner', label: t('dashboardCards.employment.businessOwner') },
    { value: 'student', label: t('dashboardCards.employment.student') },
    { value: 'retired', label: t('dashboardCards.employment.retired') },
    { value: 'other', label: t('dashboardCards.employment.other') },
  ];

  const PURPOSE_OPTIONS = [
    { value: 'everyday', label: t('dashboardCards.purpose.everyday') },
    { value: 'travel', label: t('dashboardCards.purpose.travel') },
    { value: 'business', label: t('dashboardCards.purpose.business') },
    { value: 'online', label: t('dashboardCards.purpose.online') },
  ];

  const COUNTRY_OPTIONS = [
    { value: 'US', label: t('dashboardCards.countries.US') },
    { value: 'CA', label: t('dashboardCards.countries.CA') },
    { value: 'FR', label: t('dashboardCards.countries.FR') },
    { value: 'DE', label: t('dashboardCards.countries.DE') },
    { value: 'NL', label: t('dashboardCards.countries.NL') },
    { value: 'BE', label: t('dashboardCards.countries.BE') },
    { value: 'AT', label: t('dashboardCards.countries.AT') },
    { value: 'ES', label: t('dashboardCards.countries.ES') },
    { value: 'CH', label: t('dashboardCards.countries.CH') },
    { value: 'IT', label: t('dashboardCards.countries.IT') },
    { value: 'PT', label: t('dashboardCards.countries.PT') },
    { value: 'IE', label: t('dashboardCards.countries.IE') },
    { value: 'GB', label: t('dashboardCards.countries.GB') },
  ];

  const CURRENCY_OPTIONS = [
    { value: 'USD', label: t('dashboardCards.currencies.USD') },
    { value: 'EUR', label: t('dashboardCards.currencies.EUR') },
    { value: 'CAD', label: t('dashboardCards.currencies.CAD') },
    { value: 'CHF', label: t('dashboardCards.currencies.CHF') },
  ];

  const DAILY_LIMIT_OPTIONS = [1000, 2500, 5000, 10000, 25000];
  const MONTHLY_LIMIT_OPTIONS = [5000, 10000, 25000, 50000, 100000];
  const DAILY_LIMIT_SELECT_OPTIONS = DAILY_LIMIT_OPTIONS.map((value) => ({
    value,
    label: `$${value.toLocaleString()}`,
  }));
  const MONTHLY_LIMIT_SELECT_OPTIONS = MONTHLY_LIMIT_OPTIONS.map((value) => ({
    value,
    label: `$${value.toLocaleString()}`,
  }));

  const updateField = <K extends keyof CardApplication>(key: K, value: CardApplication[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.cardholderName.trim() ||
      !form.billingAddress.trim() ||
      !form.city.trim() ||
      !form.postalCode.trim() ||
      !form.phoneNumber.trim()
    ) return;

    setCreating(true);
    setResult(null);

    const res = await createCard({
      ...form,
      cardholderName: form.cardholderName.trim().toUpperCase(),
    });

    if (res?.error) {
      setResult({ success: false, message: res.error });
    } else {
      setResult({
        success: true,
        message: t('dashboardCards.messages.applicationSubmitted'),
      });
      setShowCreate(false);
      setForm({ ...INITIAL_FORM });
      setStep(1);
    }

    setCreating(false);
  };

  const handleFreeze = async (cardId: string, status: string) => {
    const res = await toggleFreeze(cardId, status);
    if (res?.error) {
      setResult({ success: false, message: res.error });
    }
  };

  const canProceedStep1 = form.cardholderName.trim().length > 0 && form.phoneNumber.trim().length > 0;
  const canProceedStep2 =
    form.billingAddress.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.postalCode.trim().length > 0 &&
    form.country.length > 0;
  const canSubmit = canProceedStep1 && canProceedStep2 && form.annualIncome > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">{t('dashboardCards.title')}</h1>
          <p className="mt-1 text-sm text-[#006446]">{t('dashboardCards.subtitle')}</p>
        </div>

        <button
          onClick={() => {
            setShowCreate(!showCreate);
            setStep(1);
            setForm({ ...INITIAL_FORM });
          }}
          className="flex self-start items-center gap-2 rounded-xl bg-[#006446] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a]"
        >
          <Plus className="w-4 h-4" />
          {t('dashboardCards.actions.applyForCard')}
        </button>
      </div>

      {result && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
          {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {result.message}
        </div>
      )}

      {pendingApplications.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-slate-900">
                {pendingApplications.length === 1
                  ? t('dashboardCards.messages.pendingApprovalTitleOne')
                  : t('dashboardCards.messages.pendingApprovalTitleMany')}
              </p>
              <p className="mt-1">
                {pendingApplications.length === 1
                  ? t('dashboardCards.messages.pendingApprovalDescriptionOne')
                  : t('dashboardCards.messages.pendingApprovalDescriptionMany').replace(
                      '{count}',
                      String(pendingApplications.length)
                    )}
              </p>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="rounded-3xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="border-b border-[#006446]/10 px-6 py-4">
            <h2 className="font-semibold text-slate-900">{t('dashboardCards.application.title')}</h2>
            <p className="mt-1 text-xs text-[#006446]">{t('dashboardCards.application.subtitle')}</p>
          </div>

          <div className="border-b border-[#006446]/10 px-6 py-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (s < step || (s === 2 && canProceedStep1) || (s === 3 && canProceedStep2)) setStep(s);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s
                        ? 'bg-[#006446] text-white'
                        : step > s
                        ? 'bg-[#006446]/10 text-[#006446]'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </button>

                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      step === s ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {s === 1
                      ? t('dashboardCards.steps.personalInfo')
                      : s === 2
                      ? t('dashboardCards.steps.address')
                      : t('dashboardCards.steps.financial')}
                  </span>

                  {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-[#006446]/35' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreate} className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#006446]" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('dashboardCards.sections.personalInformation')}
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('dashboardCards.fields.fullName')}
                    </label>
                    <input
                      type="text"
                      value={form.cardholderName}
                      onChange={(e) => updateField('cardholderName', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.fullName')}
                      className="w-full rounded-xl border border-[#006446]/14 px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {t('dashboardCards.fields.phoneNumber')}
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.phoneNumber')}
                      className="w-full rounded-xl border border-[#006446]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('dashboardCards.fields.preferredCurrency')}
                    </label>
                    <CustomSelect
                      value={form.currency}
                      onChange={(value) => updateField('currency', value)}
                      options={CURRENCY_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        {t('dashboardCards.fields.primaryPurpose')}
                      </span>
                    </label>
                    <CustomSelect
                      value={form.purpose}
                      onChange={(value) => updateField('purpose', value)}
                      options={PURPOSE_OPTIONS}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {t('dashboardCards.actions.continue')}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#006446]" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('dashboardCards.sections.billingAddress')}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('dashboardCards.fields.streetAddress')}
                  </label>
                  <input
                    type="text"
                    value={form.billingAddress}
                    onChange={(e) => updateField('billingAddress', e.target.value)}
                    placeholder={t('dashboardCards.placeholders.streetAddress')}
                    className="w-full rounded-xl border border-[#006446]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('dashboardCards.fields.city')}
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.city')}
                      className="w-full rounded-xl border border-[#006446]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('dashboardCards.fields.stateProvince')}
                    </label>
                    <input
                      type="text"
                      value={form.stateProvince}
                      onChange={(e) => updateField('stateProvince', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.stateProvince')}
                      className="w-full rounded-xl border border-[#006446]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('dashboardCards.fields.postalCode')}
                    </label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.postalCode')}
                      className="w-full rounded-xl border border-[#006446]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('dashboardCards.fields.country')}
                  </label>
                  <CustomSelect
                    value={form.country}
                    onChange={(value) => updateField('country', value)}
                    options={COUNTRY_OPTIONS}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-[#006446]/14 px-6 py-2.5 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
                  >
                    {t('dashboardCards.actions.back')}
                  </button>

                  <button
                    type="button"
                    disabled={!canProceedStep2}
                    onClick={() => setStep(3)}
                    className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {t('dashboardCards.actions.continue')}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-[#006446]" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('dashboardCards.sections.financialInformation')}
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('dashboardCards.fields.employmentStatus')}
                    </label>
                    <CustomSelect
                      value={form.employmentStatus}
                      onChange={(value) => updateField('employmentStatus', value)}
                      options={EMPLOYMENT_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {t('dashboardCards.fields.annualIncome')}
                      </span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006446] text-sm">$</span>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        value={form.annualIncome || ''}
                        onChange={(e) => updateField('annualIncome', parseFloat(e.target.value) || 0)}
                        placeholder={t('dashboardCards.placeholders.annualIncome')}
                        className="w-full rounded-xl border border-[#006446]/14 py-2.5 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('dashboardCards.fields.dailySpendingLimit')}
                    </label>
                    <CustomSelect
                      value={form.dailyLimit}
                      onChange={(value) => updateField('dailyLimit', value)}
                      options={DAILY_LIMIT_SELECT_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('dashboardCards.fields.monthlySpendingLimit')}
                    </label>
                    <CustomSelect
                      value={form.monthlyLimit}
                      onChange={(value) => updateField('monthlyLimit', value)}
                      options={MONTHLY_LIMIT_SELECT_OPTIONS}
                    />
                  </div>
                </div>

                {canSubmit && (
                  <div className="space-y-2 rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4 text-sm">
                    <p className="font-semibold text-slate-900 mb-3">{t('dashboardCards.summary.title')}</p>

                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#006446]">{t('dashboardCards.summary.name')}</span>
                        <span className="text-slate-900 font-medium uppercase">{form.cardholderName}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#006446]">{t('dashboardCards.summary.phone')}</span>
                        <span className="text-slate-900 font-medium">{form.phoneNumber}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#006446]">{t('dashboardCards.summary.currency')}</span>
                        <span className="text-slate-900 font-medium">{form.currency}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#006446]">{t('dashboardCards.summary.purpose')}</span>
                        <span className="text-slate-900 font-medium">
                          {PURPOSE_OPTIONS.find((o) => o.value === form.purpose)?.label}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#006446]">{t('dashboardCards.summary.address')}</span>
                        <span className="text-slate-900 font-medium truncate max-w-[180px]">
                          {form.billingAddress}, {form.city}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#006446]">{t('dashboardCards.summary.employment')}</span>
                        <span className="text-slate-900 font-medium">
                          {EMPLOYMENT_OPTIONS.find((o) => o.value === form.employmentStatus)?.label}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#006446]">{t('dashboardCards.summary.dailyLimit')}</span>
                        <span className="text-slate-900 font-medium">${form.dailyLimit.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#006446]">{t('dashboardCards.summary.monthlyLimit')}</span>
                        <span className="text-slate-900 font-medium">${form.monthlyLimit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl border border-[#006446]/14 px-6 py-2.5 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
                  >
                    {t('dashboardCards.actions.back')}
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreate(false);
                        setForm({ ...INITIAL_FORM });
                        setStep(1);
                      }}
                      className="rounded-xl border border-[#006446]/14 px-6 py-2.5 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
                    >
                      {t('dashboardCards.actions.cancel')}
                    </button>

                    <button
                      type="submit"
                      disabled={creating || !canSubmit}
                      className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      {creating
                        ? t('dashboardCards.actions.submitting')
                        : t('dashboardCards.actions.submitApplication')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        {cards.map((card) => {
          const brand = BRAND_COLORS[card.card_brand] || BRAND_COLORS.visa;
          const isRevealed = showDetails === card.id;
          const isFrozen = card.status === 'frozen';

          return (
            <div key={card.id} className="w-full max-w-[28rem] space-y-4 sm:w-[28rem]">
              <div
                className={`relative bg-gradient-to-br ${brand.gradient} rounded-xl p-6 text-white overflow-hidden ${
                  isFrozen ? 'opacity-70' : ''
                }`}
              >
                {isFrozen && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#003d2b]/35">
                    <div className="flex items-center gap-2 rounded-lg bg-[#006446]/90 px-4 py-2">
                      <Snowflake className="w-5 h-5" />
                      <span className="font-semibold text-sm">{t('dashboardCards.card.frozen')}</span>
                    </div>
                  </div>
                )}

                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="flex items-center justify-between mb-8 relative z-[1]">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 rotate-90 text-white/60" />
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/70">
                      {card.currency || 'USD'}
                    </span>
                  </div>

                  <span className={`text-lg font-bold uppercase tracking-wider ${brand.accent}`}>
                    {card.card_brand}
                  </span>
                </div>

                <div className="mb-6 relative z-[1]">
                  <p className="text-xl font-mono tracking-widest">
                    {isRevealed ? formatCardNumber(card.card_number) : maskCard(card.card_number)}
                  </p>
                </div>

                <div className="flex items-end justify-between relative z-[1]">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
                      {t('dashboardCards.card.cardholder')}
                    </p>
                    <p className="text-sm font-semibold tracking-wider">{card.cardholder_name}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
                      {t('dashboardCards.card.expires')}
                    </p>
                    <p className="text-sm font-semibold">{isRevealed ? card.expiry_date : '**/**'}</p>
                  </div>

                  {isRevealed && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
                        {t('dashboardCards.card.cvv')}
                      </p>
                      <p className="text-sm font-semibold">{card.cvv}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#006446]/14 bg-white p-4 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#006446]">{t('dashboardCards.card.dailyLimit')}</span>
                  <span className="font-medium text-slate-900">${card.daily_limit.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#006446]">{t('dashboardCards.card.monthlyLimit')}</span>
                  <span className="font-medium text-slate-900">${card.monthly_limit.toLocaleString()}</span>
                </div>

                <div className="flex gap-2 border-t border-[#006446]/10 pt-2">
                  <button
                    onClick={() => setShowDetails(isRevealed ? null : card.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#006446]/14 px-3 py-2 text-xs font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {isRevealed
                      ? t('dashboardCards.actions.hideDetails')
                      : t('dashboardCards.actions.showDetails')}
                  </button>

                  <button
                    onClick={() => handleFreeze(card.id, card.status)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                      isFrozen
                        ? 'border border-[#006446]/14 bg-[#006446]/10 text-[#006446] hover:bg-[#006446]/15'
                        : 'border border-[#006446]/14 bg-[#006446]/[0.05] text-[#006446] hover:bg-[#006446]/10'
                    }`}
                  >
                    {isFrozen ? <Play className="w-3.5 h-3.5" /> : <Snowflake className="w-3.5 h-3.5" />}
                    {isFrozen ? t('dashboardCards.actions.unfreeze') : t('dashboardCards.actions.freeze')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cards.length === 0 && pendingApplications.length === 0 && !showCreate && (
        <div className="rounded-3xl border border-[#006446]/14 bg-white p-16 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-[#006446]/35" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('dashboardCards.empty.title')}</h3>
          <p className="mb-6 text-sm text-[#006446]">{t('dashboardCards.empty.subtitle')}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a]"
          >
            {t('dashboardCards.empty.cta')}
          </button>
        </div>
      )}

      {cards.length === 0 && pendingApplications.length > 0 && !showCreate && (
        <div className="rounded-3xl border border-amber-200 bg-white p-16 text-center shadow-[0_24px_60px_-48px_rgba(180,83,9,0.2)]">
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-amber-500/60" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            {t('dashboardCards.messages.noApprovedCardsTitle')}
          </h3>
          <p className="text-sm text-amber-700">
            {t('dashboardCards.messages.noApprovedCardsDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
