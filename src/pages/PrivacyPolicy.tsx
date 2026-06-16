import { useMemo } from 'react';
import { useBranding } from '../contexts/BrandingContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../i18n/privacypolicy/translations';

function SectionCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-3xl border border-surface-200 bg-white p-6 md:p-8 shadow-sm"
    >
      <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight text-surface-950">
        {title}
      </h2>

      <div className="mt-5 prose prose-slate max-w-none prose-p:text-surface-700 prose-p:leading-8 prose-li:text-surface-700 prose-li:leading-8 prose-strong:text-surface-950 prose-headings:text-surface-950">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  const { branding } = useBranding();

  const sections = useMemo(
    () => [
      {
        id: 'section-1-scope',
        title: t('privacyPolicy.section1.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section1.p1')}</p>
            <p>{t('privacyPolicy.section1.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-2-information-we-collect',
        title: t('privacyPolicy.section2.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section2.p1')}</p>
            <ul>
              <li>{t('privacyPolicy.section2.li1')}</li>
              <li>{t('privacyPolicy.section2.li2')}</li>
              <li>{t('privacyPolicy.section2.li3')}</li>
              <li>{t('privacyPolicy.section2.li4')}</li>
              <li>{t('privacyPolicy.section2.li5')}</li>
              <li>{t('privacyPolicy.section2.li6')}</li>
              <li>{t('privacyPolicy.section2.li7')}</li>
              <li>{t('privacyPolicy.section2.li8')}</li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-3-how-we-collect-information',
        title: t('privacyPolicy.section3.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section3.p1')}</p>
            <ul>
              <li>{t('privacyPolicy.section3.li1')}</li>
              <li>{t('privacyPolicy.section3.li2')}</li>
              <li>{t('privacyPolicy.section3.li3')}</li>
              <li>{t('privacyPolicy.section3.li4')}</li>
              <li>{t('privacyPolicy.section3.li5')}</li>
              <li>{t('privacyPolicy.section3.li6')}</li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-4-why-we-use-personal-information',
        title: t('privacyPolicy.section4.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section4.p1')}</p>
            <ul>
              <li>{t('privacyPolicy.section4.li1')}</li>
              <li>{t('privacyPolicy.section4.li2')}</li>
              <li>{t('privacyPolicy.section4.li3')}</li>
              <li>{t('privacyPolicy.section4.li4')}</li>
              <li>{t('privacyPolicy.section4.li5')}</li>
              <li>{t('privacyPolicy.section4.li6')}</li>
              <li>{t('privacyPolicy.section4.li7')}</li>
              <li>{t('privacyPolicy.section4.li8')}</li>
              <li>{t('privacyPolicy.section4.li9')}</li>
              <li>{t('privacyPolicy.section4.li10')}</li>
              <li>{t('privacyPolicy.section4.li11')}</li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-5-sensitive-compliance-and-verification-activities',
        title: t('privacyPolicy.section5.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section5.p1')}</p>
            <p>{t('privacyPolicy.section5.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-6-blockchain-and-digital-asset-disclosures',
        title: t('privacyPolicy.section6.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section6.p1')}</p>
            <p>{t('privacyPolicy.section6.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-7-legal-bases-for-processing',
        title: t('privacyPolicy.section7.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section7.p1')}</p>
            <ul>
              <li>{t('privacyPolicy.section7.li1')}</li>
              <li>{t('privacyPolicy.section7.li2')}</li>
              <li>{t('privacyPolicy.section7.li3')}</li>
              <li>{t('privacyPolicy.section7.li4')}</li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-8-how-we-share-information',
        title: t('privacyPolicy.section8.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section8.p1')}</p>
            <ul>
              <li>{t('privacyPolicy.section8.li1')}</li>
              <li>{t('privacyPolicy.section8.li2')}</li>
              <li>{t('privacyPolicy.section8.li3')}</li>
              <li>{t('privacyPolicy.section8.li4')}</li>
              <li>{t('privacyPolicy.section8.li5')}</li>
              <li>{t('privacyPolicy.section8.li6')}</li>
            </ul>
            <p>{t('privacyPolicy.section8.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-9-international-transfers',
        title: t('privacyPolicy.section9.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section9.p1')}</p>
            <p>{t('privacyPolicy.section9.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-10-data-retention',
        title: t('privacyPolicy.section10.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section10.p1')}</p>
            <p>{t('privacyPolicy.section10.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-11-security',
        title: t('privacyPolicy.section11.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section11.p1')}</p>
            <p>{t('privacyPolicy.section11.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-12-cookies-and-similar-technologies',
        title: t('privacyPolicy.section12.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section12.p1')}</p>
            <p>{t('privacyPolicy.section12.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-13-your-rights',
        title: t('privacyPolicy.section13.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section13.p1')}</p>
            <p>{t('privacyPolicy.section13.p2')}</p>
            <p>{t('privacyPolicy.section13.p3')}</p>
          </>
        ),
      },
      {
        id: 'section-14-marketing-communications',
        title: t('privacyPolicy.section14.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section14.p1')}</p>
            <p>{t('privacyPolicy.section14.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-15-childrens-privacy',
        title: t('privacyPolicy.section15.title'),
        content: <p>{t('privacyPolicy.section15.p1')}</p>,
      },
      {
        id: 'section-16-changes-to-this-policy',
        title: t('privacyPolicy.section16.title'),
        content: (
          <>
            <p>{t('privacyPolicy.section16.p1')}</p>
            <p>{t('privacyPolicy.section16.p2')}</p>
          </>
        ),
      },
    ],
    [t]
  );

  return (
    <main className="min-h-screen bg-surface-50 text-surface-900">
      <section className="border-b border-surface-800 bg-surface-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white">
              {t('privacyPolicy.pageTitle')}
            </h1>

            <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-surface-300">
              {t('privacyPolicy.heroDescription')}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-500">
                {t('privacyPolicy.onThisPage')}
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
                  {t('privacyPolicy.contactUsNav')}
                </a>

                <a
                  href="#important-notice"
                  className="block text-sm leading-6 text-surface-600 transition-colors hover:text-surface-950"
                >
                  {t('privacyPolicy.importantNoticeNav')}
                </a>
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                {t('privacyPolicy.legalNotice.title')}
              </h2>
              <p className="mt-3 text-sm leading-7 text-amber-900">
                {t('privacyPolicy.legalNotice.body')}
              </p>
            </div>

            <div className="space-y-6">
              {sections.map((section) => (
                <SectionCard key={section.id} id={section.id} title={section.title}>
                  {section.content}
                </SectionCard>
              ))}

              <section
                id="contact-us"
                className="rounded-3xl border border-surface-200 bg-white p-6 md:p-8 shadow-sm"
              >
                <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight text-surface-950">
                  {t('privacyPolicy.contact.title')}
                </h2>

                <p className="mt-5 text-base leading-8 text-surface-700">
                  {t('privacyPolicy.contact.p1')}
                </p>

                <div className="mt-6 rounded-2xl border border-surface-200 bg-surface-50 p-6">
                  <p className="font-semibold text-surface-950">{branding.brandName}</p>
                  <p className="mt-2 text-surface-700">
                    {t('privacyPolicy.contact.office')}
                  </p>
                  <div className="mt-4 space-y-2 text-surface-700">
                    <p>{t('privacyPolicy.contact.address1')}</p>
                    <p>{t('privacyPolicy.contact.address2')}</p>
                    <p>{t('privacyPolicy.contact.email')}</p>
                    <p>{t('privacyPolicy.contact.phone')}</p>
                  </div>
                </div>
              </section>

              <section
                id="important-notice"
                className="rounded-3xl border border-surface-950 bg-surface-950 p-6 md:p-8 text-white shadow-sm"
              >
                <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight">
                  {t('privacyPolicy.notice.title')}
                </h2>

                <p className="mt-5 text-base leading-8 text-surface-200">
                  {t('privacyPolicy.notice.body')}
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
