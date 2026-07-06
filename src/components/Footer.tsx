import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import { useBranding } from '../contexts/BrandingContext';
import { useLanguage } from '../contexts/LanguageContext';
import BrandLogo from './ui/BrandLogo';
import '../i18n/footer/translations';

export default function Footer() {
  const { t } = useLanguage();
  const { branding } = useBranding();
  const { openPreferences } = useCookieConsent();
  const depositorProtectionUrl = 'https://www.gov.pl/web/finance/protection-of-depositors';

  const productLinks = [
    { label: t('checkingAccounts'), href: '/business-banking' },
    { label: t('loansMortgages'), href: '/loans' },
    { label: t('creditCards'), href: '/cards' },
  ];

  const companyLinks = [
    { label: t('aboutUs'), href: '/about' },
    { label: t('services'), href: '/services' },
    { label: t('businessBanking'), href: '/business-banking' },
    { label: t('internationalBanking'), href: '/international' },
  ];

  const legalLinks = [
    { label: t('privacyPolicy'), href: '/privacy-policy' },
    { label: t('termsOfService'), href: '/terms-of-service' },
    { label: t('disclosures'), href: '/disclosures' },
  ];

  const linkGroups = [
    { title: t('products'), links: productLinks },
    { title: t('company'), links: companyLinks },
    { title: t('legal'), links: legalLinks },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-[#006446]/10 bg-white text-surface-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,100,70,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,100,70,0.05),_transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,100,70,0.03),_transparent_26%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#006446]/20 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 py-16 lg:grid-cols-[0.95fr,1.25fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#006446]/12 bg-[linear-gradient(135deg,rgba(0,100,70,0.1),rgba(255,255,255,0.9))] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_35%),linear-gradient(180deg,transparent,rgba(0,100,70,0.04))]" />

            <div className="relative">
              <Link to="/" className="mb-8 inline-flex items-center">
                <BrandLogo
                  src={branding.footerLogoUrl}
                  alt={branding.brandName}
                  className="h-12 w-auto object-contain"
                />
              </Link>

              <p className="max-w-sm text-[15px] leading-relaxed text-surface-700">
                {t('footerDescription')}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <div className="rounded-full border border-[#006446]/12 bg-white px-4 py-2 shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]/65">
                    {t('mfiId')}
                  </span>
                </div>
                <div className="rounded-full border border-[#006446]/12 bg-white px-4 py-2 shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]/65">
                    {t('countryCode')}
                  </span>
                </div>
                <div className="rounded-full border border-[#006446]/12 bg-white px-4 py-2 shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]/65">
                    {t('mfiCode')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#006446]/12 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] lg:p-8">
            <div className="grid gap-6 md:grid-cols-3 md:gap-0">
              {linkGroups.map((group, index) => (
                <div
                  key={group.title}
                  className={`px-2 md:px-6 ${index < linkGroups.length - 1 ? 'md:border-r md:border-[#006446]/10' : ''}`}
                >
                  <h5 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#006446]">
                    {group.title}
                  </h5>

                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.href}
                          className="group inline-flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm text-surface-700 transition-all duration-200 hover:bg-[#006446]/[0.06] hover:text-[#006446]"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 -translate-y-0.5 opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-1 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#006446]/10 py-10">
          <div className="rounded-3xl border border-[#006446]/12 bg-[#006446]/[0.04] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr,auto] lg:items-center">
              <div>
                <h5 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#006446]">
                  {t('institutionalIdentification')}
                </h5>

                <p className="max-w-3xl text-sm leading-relaxed text-surface-700">
                  {t('institutionalIdentificationDescription')}
                </p>

                <p className="mt-6 max-w-3xl text-[11px] leading-relaxed text-surface-500">
                  {t('mfiIdNote')}
                </p>

                <a
                  href={depositorProtectionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-5 inline-flex max-w-xl items-start gap-3 rounded-2xl border border-[#006446]/12 bg-white/80 px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-[#006446]/25 hover:bg-white hover:shadow-[0_14px_32px_rgba(0,100,70,0.08)]"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">
                      {t('depositorProtectionTitle')}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-surface-700">
                      {t('depositorProtectionDescription')}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#006446]/60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#006446]" />
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="min-w-[130px] rounded-2xl border border-[#006446]/12 bg-white px-5 py-4">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-surface-500">{t('mfiId')}</p>
                  <p className="text-lg font-semibold text-[#006446]">PL10026</p>
                </div>
                <div className="min-w-[130px] rounded-2xl border border-[#006446]/12 bg-white px-5 py-4">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-surface-500">{t('countryCode')}</p>
                  <p className="text-lg font-semibold text-[#006446]">PL</p>
                </div>
                <div className="min-w-[130px] rounded-2xl border border-[#006446]/12 bg-white px-5 py-4">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-surface-500">{t('mfiCode')}</p>
                  <p className="text-lg font-semibold text-[#006446]">10026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#006446]/10 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-xs text-surface-600 md:text-left">
              {t('copyright')}
            </p>

            <button
              type="button"
              onClick={openPreferences}
              className="inline-flex items-center gap-2 rounded-xl border border-[#006446]/12 bg-white px-4 py-2.5 text-xs font-semibold text-[#006446] shadow-sm transition-all duration-200 hover:border-[#006446]/25 hover:bg-[#006446]/[0.04]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t('cookies.footer.preferences')}
            </button>

            <p className="max-w-md text-center text-[11px] text-surface-500 md:text-right">
              {t('fdicNotice')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
