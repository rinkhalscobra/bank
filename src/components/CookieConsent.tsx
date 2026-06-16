import {
  BarChart3,
  Check,
  Cookie,
  Megaphone,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  useCookieConsent,
  type CookieCategory,
  type CookiePreferences,
} from '../contexts/CookieConsentContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../i18n/cookies/translations';

const categories: Array<{
  key: CookieCategory;
  icon: typeof ShieldCheck;
  optional: boolean;
}> = [
  { key: 'necessary', icon: ShieldCheck, optional: false },
  { key: 'functional', icon: Wrench, optional: true },
  { key: 'analytics', icon: BarChart3, optional: true },
  { key: 'marketing', icon: Megaphone, optional: true },
];

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-all duration-200 ${
        checked
          ? 'border-[#006446] bg-[#006446]'
          : 'border-surface-300 bg-surface-200'
      } ${disabled ? 'cursor-not-allowed opacity-70' : 'hover:shadow-sm'}`}
    >
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      >
        {checked && <Check className="h-3 w-3 text-[#006446]" />}
      </span>
    </button>
  );
}

export default function CookieConsent() {
  const { t } = useLanguage();
  const {
    preferences,
    isBannerVisible,
    isPreferencesOpen,
    acceptAll,
    rejectOptional,
    savePreferences,
    openPreferences,
    closePreferences,
  } = useCookieConsent();
  const [draftPreferences, setDraftPreferences] = useState<CookiePreferences>(preferences);

  useEffect(() => {
    if (isPreferencesOpen) {
      setDraftPreferences(preferences);
    }
  }, [isPreferencesOpen, preferences]);

  const updateDraftPreference = (category: CookieCategory) => {
    if (category === 'necessary') return;

    setDraftPreferences((current) => ({
      ...current,
      [category]: !current[category],
      necessary: true,
    }));
  };

  const handleSave = () => {
    savePreferences(draftPreferences);
  };

  const handleRejectOptional = () => {
    rejectOptional();
  };

  return (
    <>
      {isBannerVisible && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#006446]/15 bg-white shadow-[0_24px_80px_rgba(24,28,40,0.18)]">
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr,auto] lg:items-end lg:p-6">
              <div className="flex gap-4">
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#006446]/10 text-[#006446] sm:flex">
                  <Cookie className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">
                    {t('cookies.banner.kicker')}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-surface-950">
                    {t('cookies.banner.title')}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-surface-700">
                    {t('cookies.banner.description')}{' '}
                    <Link
                      to="/privacy-policy"
                      className="font-semibold text-[#006446] underline-offset-4 hover:underline"
                    >
                      {t('cookies.banner.policyLink')}
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                <button
                  type="button"
                  onClick={openPreferences}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm font-semibold text-surface-800 transition-all duration-200 hover:border-[#006446]/30 hover:bg-[#006446]/[0.04] hover:text-[#006446]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('cookies.banner.manage')}
                </button>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-surface-800 transition-all duration-200 hover:border-surface-300 hover:bg-surface-100"
                >
                  <X className="h-4 w-4" />
                  {t('cookies.banner.rejectOptional')}
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006446] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#00583e] hover:shadow-lg hover:shadow-[#006446]/20"
                >
                  <Check className="h-4 w-4" />
                  {t('cookies.banner.acceptAll')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPreferencesOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-surface-950/55 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
          >
            <div className="border-b border-surface-200 px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">
                    {t('cookies.banner.kicker')}
                  </p>
                  <h2
                    id="cookie-preferences-title"
                    className="mt-1 text-2xl font-semibold text-surface-950"
                  >
                    {t('cookies.modal.title')}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closePreferences}
                  aria-label={t('cookies.modal.close')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-surface-500 transition-all duration-200 hover:bg-surface-100 hover:text-surface-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-surface-700">
                {t('cookies.modal.description')}
              </p>
              <p className="mt-3 text-xs font-medium text-surface-500">
                {t('cookies.modal.lastUpdated')}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-7">
              <div className="divide-y divide-surface-200 overflow-hidden rounded-2xl border border-surface-200">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const checked = draftPreferences[category.key];
                  const statusLabel = category.optional
                    ? checked
                      ? t('cookies.modal.enabled')
                      : t('cookies.modal.disabled')
                    : t('cookies.modal.alwaysOn');

                  return (
                    <section key={category.key} className="bg-white p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#006446]/10 text-[#006446]">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-surface-950">
                                {t(`cookies.category.${category.key}.title`)}
                              </h3>
                              <span className="rounded-full bg-surface-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-600">
                                {statusLabel}
                              </span>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-700">
                              {t(`cookies.category.${category.key}.description`)}
                            </p>

                            <div className="mt-4 grid gap-3 text-xs leading-relaxed text-surface-600 md:grid-cols-2">
                              <p>
                                <span className="font-semibold text-surface-800">
                                  {t('cookies.modal.examples')}:
                                </span>{' '}
                                {t(`cookies.category.${category.key}.examples`)}
                              </p>
                              <p>
                                <span className="font-semibold text-surface-800">
                                  {t('cookies.modal.retention')}:
                                </span>{' '}
                                {t(`cookies.category.${category.key}.retention`)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Toggle
                          checked={checked}
                          disabled={!category.optional}
                          label={t(`cookies.category.${category.key}.title`)}
                          onChange={() => updateDraftPreference(category.key)}
                        />
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-surface-200 bg-surface-50 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm font-semibold text-surface-800 transition-all duration-200 hover:border-surface-300 hover:bg-surface-100"
              >
                <X className="h-4 w-4" />
                {t('cookies.modal.rejectOptional')}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#006446]/20 bg-white px-4 py-3 text-sm font-semibold text-[#006446] transition-all duration-200 hover:bg-[#006446]/[0.06]"
              >
                <Check className="h-4 w-4" />
                {t('cookies.modal.acceptAll')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006446] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#00583e] hover:shadow-lg hover:shadow-[#006446]/20"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('cookies.modal.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
