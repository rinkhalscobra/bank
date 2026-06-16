import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../i18n/disclosures/translations';

const summaryCardDefinitions = [
  {
    labelKey: 'disclosures.effectiveDate',
    valueKey: 'disclosures.effectiveDateValue',
  },
  {
    labelKey: 'disclosures.lastUpdated',
    valueKey: 'disclosures.lastUpdatedValue',
  },
  {
    labelKey: 'disclosures.appliesTo',
    valueKey: 'disclosures.appliesToValue',
  },
] as const;

const sectionDefinitions = [
  {
    id: 'section-1-general-regulatory-notice',
    key: 'section1',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-2-no-offer-or-solicitation-where-restricted',
    key: 'section2',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-3-business-and-service-availability',
    key: 'section3',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-4-banking-and-fiat-services-disclosure',
    key: 'section4',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-5-digital-asset-and-crypto-services-disclosure',
    key: 'section5',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-6-digital-asset-risk-disclosure',
    key: 'section6',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-7-blockchain-network-disclosure',
    key: 'section7',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-8-wallet-address-and-transfer-accuracy',
    key: 'section8',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-9-no-investment-advice',
    key: 'section9',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-10-no-fiduciary-relationship',
    key: 'section10',
    paragraphs: ['p1'],
  },
  {
    id: 'section-11-no-guarantee-of-returns-or-performance',
    key: 'section11',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-12-third-party-providers-and-dependencies',
    key: 'section12',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-13-compliance-aml-and-sanctions-disclosure',
    key: 'section13',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-14-custody-and-safekeeping-disclosure',
    key: 'section14',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-15-deposit-protection-and-insurance-disclosure',
    key: 'section15',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-16-fees-charges-and-pricing-disclosure',
    key: 'section16',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-17-tax-disclosure',
    key: 'section17',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-18-forward-looking-and-informational-statements',
    key: 'section18',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-19-website-content-accuracy',
    key: 'section19',
    paragraphs: ['p1', 'p2'],
  },
  {
    id: 'section-20-limitation-of-website-reliance',
    key: 'section20',
    paragraphs: ['p1'],
  },
  {
    id: 'section-21-jurisdiction-specific-notices',
    key: 'section21',
    paragraphs: ['p1'],
  },
  {
    id: 'section-22-changes-to-disclosures',
    key: 'section22',
    paragraphs: ['p1', 'p2'],
  },
] as const;

function SectionCard({
  id,
  title,
  paragraphs,
}: {
  id: string;
  title: string;
  paragraphs: string[];
}) {
  return (
    <section
      id={id}
      className="rounded-3xl border border-surface-200 bg-white p-6 md:p-8 shadow-sm"
    >
      <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight text-surface-950">
        {title}
      </h2>

      <div className="mt-5 prose prose-slate max-w-none prose-p:text-surface-700 prose-p:leading-8 prose-headings:text-surface-950">
        {paragraphs.map((paragraph, index) => (
          <p key={`${id}-${index}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export default function Disclosures() {
  const { t } = useLanguage();

  const summaryCards = useMemo(
    () =>
      summaryCardDefinitions.map(({ labelKey, valueKey }) => ({
        label: t(labelKey),
        value: t(valueKey),
      })),
    [t]
  );

  const sections = useMemo(
    () =>
      sectionDefinitions.map(({ id, key, paragraphs }) => ({
        id,
        title: t(`disclosures.${key}.title`),
        paragraphs: paragraphs.map((paragraphKey) =>
          t(`disclosures.${key}.${paragraphKey}`)
        ),
      })),
    [t]
  );

  return (
    <main className="min-h-screen bg-surface-50 text-surface-900">
      <section className="border-b border-surface-800 bg-surface-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex items-center rounded-full border border-surface-700 bg-surface-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-surface-300">
              {t('disclosures.eyebrow')}
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white">
              {t('disclosures.pageTitle')}
            </h1>

            <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-surface-300">
              {t('disclosures.heroDescription')}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-surface-800 bg-surface-900 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                  {card.label}
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-500">
                {t('disclosures.onThisPage')}
              </h2>

              <nav className="mt-4 space-y-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm leading-6 text-surface-600 transition-colors hover:text-surface-950"
                  >
                    {section.title}
                  </a>
                ))}

                <a
                  href="#contact-us"
                  className="block text-sm leading-6 text-surface-600 transition-colors hover:text-surface-950"
                >
                  {t('disclosures.contact.title')}
                </a>

                <a
                  href="#important-notice"
                  className="block text-sm leading-6 text-surface-600 transition-colors hover:text-surface-950"
                >
                  {t('disclosures.notice.title')}
                </a>
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                {t('disclosures.legalNotice.title')}
              </h2>
              <p className="mt-3 text-sm leading-7 text-amber-900">
                {t('disclosures.legalNotice.body')}
              </p>
            </div>

            <div className="space-y-6">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  paragraphs={section.paragraphs}
                />
              ))}

              <section
                id="contact-us"
                className="rounded-3xl border border-surface-200 bg-white p-6 md:p-8 shadow-sm"
              >
                <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight text-surface-950">
                  {t('disclosures.contact.title')}
                </h2>

                <p className="mt-5 text-base leading-8 text-surface-700">
                  {t('disclosures.contact.p1')}
                </p>

                <div className="mt-6 rounded-2xl border border-surface-200 bg-surface-50 p-6">
                  <p className="font-semibold text-surface-950">
                    {t('disclosures.contact.office')}
                  </p>
                  <p className="mt-2 text-surface-700">
                    {t('disclosures.contact.department')}
                  </p>
                  <div className="mt-4 space-y-2 text-surface-700">
                    <p>{t('disclosures.contact.address1')}</p>
                    <p>{t('disclosures.contact.address2')}</p>
                    <p>{t('disclosures.contact.email')}</p>
                    <p>{t('disclosures.contact.phone')}</p>
                  </div>
                </div>
              </section>

              <section
                id="important-notice"
                className="rounded-3xl border border-surface-950 bg-surface-950 p-6 md:p-8 text-white shadow-sm"
              >
                <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight">
                  {t('disclosures.notice.title')}
                </h2>

                <p className="mt-5 text-base leading-8 text-surface-200">
                  {t('disclosures.notice.body')}
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
