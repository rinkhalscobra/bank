import { useMemo } from 'react';
import { useBranding } from '../contexts/BrandingContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../i18n/termsofservice/translations';

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
      className="rounded-3xl border border-[#006446]/14 bg-white p-6 md:p-8 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]"
    >
      <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight text-slate-950">
        {title}
      </h2>

      <div className="mt-5 prose max-w-none prose-p:text-slate-700 prose-p:leading-8 prose-li:text-slate-700 prose-li:leading-8 prose-strong:text-slate-950 prose-headings:text-slate-950 prose-a:text-slate-950">
        {children}
      </div>
    </section>
  );
}

export default function TermsOfService() {
  const { t } = useLanguage();
  const { branding } = useBranding();

  const sections = useMemo(
    () => [
      {
        id: 'section-1-acceptance-of-terms',
        title: t('terms.section1.title'),
        content: (
          <>
            <p>{t('terms.section1.p1')}</p>
            <p>{t('terms.section1.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-2-eligibility',
        title: t('terms.section2.title'),
        content: (
          <>
            <p>{t('terms.section2.p1')}</p>
            <p>{t('terms.section2.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-3-nature-of-services',
        title: t('terms.section3.title'),
        content: (
          <>
            <p>{t('terms.section3.p1')}</p>
            <p>{t('terms.section3.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-4-no-offer-where-restricted',
        title: t('terms.section4.title'),
        content: (
          <>
            <p>{t('terms.section4.p1')}</p>
            <p>{t('terms.section4.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-5-account-registration-and-customer-due-diligence',
        title: t('terms.section5.title'),
        content: (
          <>
            <p>{t('terms.section5.p1')}</p>
            <p>{t('terms.section5.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-6-user-representations-and-warranties',
        title: t('terms.section6.title'),
        content: (
          <>
            <p>{t('terms.section6.p1')}</p>
            <ul>
              <li>{t('terms.section6.li1')}</li>
              <li>{t('terms.section6.li2')}</li>
              <li>{t('terms.section6.li3')}</li>
              <li>{t('terms.section6.li4')}</li>
              <li>{t('terms.section6.li5')}</li>
              <li>{t('terms.section6.li6')}</li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-7-fiat-services',
        title: t('terms.section7.title'),
        content: (
          <>
            <p>{t('terms.section7.p1')}</p>
            <p>{t('terms.section7.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-8-digital-asset-services',
        title: t('terms.section8.title'),
        content: (
          <>
            <p>{t('terms.section8.p1')}</p>
            <p>{t('terms.section8.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-9-blockchain-transactions-and-irreversibility',
        title: t('terms.section9.title'),
        content: (
          <>
            <p>{t('terms.section9.p1')}</p>
            <p>{t('terms.section9.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-10-compliance-monitoring-and-investigations',
        title: t('terms.section10.title'),
        content: (
          <>
            <p>{t('terms.section10.p1')}</p>
            <p>{t('terms.section10.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-11-fees-charges-and-pricing',
        title: t('terms.section11.title'),
        content: (
          <>
            <p>{t('terms.section11.p1')}</p>
            <p>{t('terms.section11.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-12-taxes',
        title: t('terms.section12.title'),
        content: (
          <>
            <p>{t('terms.section12.p1')}</p>
            <p>{t('terms.section12.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-13-intellectual-property',
        title: t('terms.section13.title'),
        content: (
          <>
            <p>{t('terms.section13.p1')}</p>
            <p>{t('terms.section13.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-14-prohibited-conduct',
        title: t('terms.section14.title'),
        content: (
          <>
            <p>{t('terms.section14.p1')}</p>
            <ul>
              <li>{t('terms.section14.li1')}</li>
              <li>{t('terms.section14.li2')}</li>
              <li>{t('terms.section14.li3')}</li>
              <li>{t('terms.section14.li4')}</li>
              <li>{t('terms.section14.li5')}</li>
              <li>{t('terms.section14.li6')}</li>
              <li>{t('terms.section14.li7')}</li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-15-security-and-credentials',
        title: t('terms.section15.title'),
        content: (
          <>
            <p>{t('terms.section15.p1')}</p>
            <p>{t('terms.section15.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-16-service-availability-and-no-guarantee',
        title: t('terms.section16.title'),
        content: (
          <>
            <p>{t('terms.section16.p1')}</p>
            <p>{t('terms.section16.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-17-suspension-restriction-and-termination',
        title: t('terms.section17.title'),
        content: (
          <>
            <p>{t('terms.section17.p1')}</p>
            <p>{t('terms.section17.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-18-third-party-providers-and-external-networks',
        title: t('terms.section18.title'),
        content: (
          <>
            <p>{t('terms.section18.p1')}</p>
            <p>{t('terms.section18.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-19-disclaimers',
        title: t('terms.section19.title'),
        content: (
          <>
            <p>{t('terms.section19.p1')}</p>
            <p>{t('terms.section19.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-20-limitation-of-liability',
        title: t('terms.section20.title'),
        content: (
          <>
            <p>{t('terms.section20.p1')}</p>
            <p>{t('terms.section20.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-21-indemnity',
        title: t('terms.section21.title'),
        content: <p>{t('terms.section21.p1')}</p>,
      },
      {
        id: 'section-22-privacy-and-data-use',
        title: t('terms.section22.title'),
        content: <p>{t('terms.section22.p1')}</p>,
      },
      {
        id: 'section-23-electronic-communications',
        title: t('terms.section23.title'),
        content: (
          <>
            <p>{t('terms.section23.p1')}</p>
            <p>{t('terms.section23.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-24-amendments',
        title: t('terms.section24.title'),
        content: (
          <>
            <p>{t('terms.section24.p1')}</p>
            <p>{t('terms.section24.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-25-governing-law-and-jurisdiction',
        title: t('terms.section25.title'),
        content: (
          <>
            <p>{t('terms.section25.p1')}</p>
            <p>{t('terms.section25.p2')}</p>
          </>
        ),
      },
      {
        id: 'section-26-severability',
        title: t('terms.section26.title'),
        content: <p>{t('terms.section26.p1')}</p>,
      },
      {
        id: 'section-27-entire-agreement',
        title: t('terms.section27.title'),
        content: <p>{t('terms.section27.p1')}</p>,
      },
    ],
    [t]
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-[#006446]/12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-slate-950">
              {t('terms.pageTitle')}
            </h1>

            <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-slate-700">
              {t('terms.heroDescription')}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[#006446]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-950">
                {t('terms.onThisPage')}
              </h2>

              <nav className="mt-4 space-y-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm leading-6 text-slate-700 transition-colors hover:text-slate-950"
                  >
                    {section.title}
                  </a>
                ))}

                <a
                  href="#contact-us"
                  className="block text-sm leading-6 text-slate-700 transition-colors hover:text-slate-950"
                >
                  {t('terms.contactNav')}
                </a>

                <a
                  href="#important-notice"
                  className="block text-sm leading-6 text-slate-700 transition-colors hover:text-slate-950"
                >
                  {t('terms.noticeNav')}
                </a>
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#006446]/14 bg-white p-5 md:p-6 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-950">
                {t('terms.legalNotice.title')}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {t('terms.legalNotice.body')}
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
                className="rounded-3xl border border-[#006446]/14 bg-white p-6 md:p-8 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]"
              >
                <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight text-slate-950">
                  {t('terms.contact.title')}
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-700">
                  {t('terms.contact.p1')}
                </p>

                <div className="mt-6 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.03] p-6">
                  <p className="font-semibold text-slate-950">{branding.brandName}</p>
                  <p className="mt-2 text-slate-700">
                    {t('terms.contact.office')}
                  </p>
                  <div className="mt-4 space-y-2 text-slate-700">
                    <p>{t('terms.contact.address1')}</p>
                    <p>{t('terms.contact.address2')}</p>
                    <p>{t('terms.contact.email')}</p>
                    <p>{t('terms.contact.phone')}</p>
                  </div>
                </div>
              </section>

              <section
                id="important-notice"
                className="rounded-3xl border border-[#006446]/14 bg-white p-6 md:p-8 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]"
              >
                <h2 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight text-slate-950">
                  {t('terms.notice.title')}
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-700">
                  {t('terms.notice.body')}
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
