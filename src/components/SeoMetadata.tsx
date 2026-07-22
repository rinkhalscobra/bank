import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.skokwybrzeze.com';
const DEFAULT_TITLE = 'SKOK Bank | Skok Wybrzeże Bank';
const DEFAULT_DESCRIPTION =
  'SKOK Bank, also known as Skok Wybrzeże Bank, provides secure online banking, personal and business accounts, cards, transfers, loans, and multi-currency services.';

const PUBLIC_METADATA: Record<string, { title: string; description: string }> = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/services': {
    title: 'Banking Services | SKOK Bank',
    description: 'Explore secure personal and business accounts, cards, payments, transfers, and financial services from SKOK Bank.',
  },
  '/about': {
    title: 'About SKOK Bank | Skok Wybrzeże Bank',
    description: 'Learn how SKOK Bank supports individuals, families, and businesses through secure, transparent, and customer-focused banking.',
  },
  '/business-banking': {
    title: 'Business Banking | SKOK Bank',
    description: 'Business accounts, payments, financing, and international banking solutions designed to help companies operate with confidence.',
  },
  '/cards': {
    title: 'Bank Cards | SKOK Bank',
    description: 'Discover secure SKOK Bank card options with digital controls, payment protection, and practical benefits for everyday spending.',
  },
  '/loans': {
    title: 'Loans and Financing | SKOK Bank',
    description: 'Explore personal, home, auto, and business financing solutions with clear terms and support from SKOK Bank.',
  },
  '/investments': {
    title: 'Investments and Wealth Management | SKOK Bank',
    description: 'Build and manage your wealth with research-driven investment strategies, portfolio management, and dedicated financial guidance.',
  },
  '/international': {
    title: 'International Banking | SKOK Bank',
    description: 'Manage international transfers, foreign exchange, and multi-currency banking securely with SKOK Bank.',
  },
  '/online-banking': {
    title: 'Secure Online Banking | SKOK Bank',
    description: 'Sign in securely to manage your SKOK Bank accounts, balances, cards, payments, transfers, and financial services online.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | SKOK Bank',
    description: 'Read how SKOK Bank collects, uses, stores, and protects personal information across its banking services.',
  },
  '/terms-of-service': {
    title: 'Terms of Service | SKOK Bank',
    description: 'Review the terms and conditions governing access to SKOK Bank websites, accounts, and financial services.',
  },
  '/disclosures': {
    title: 'Legal Disclosures | SKOK Bank',
    description: 'Review important legal, banking, investment, and digital-service disclosures from SKOK Bank.',
  },
};

function setMetaContent(selector: string, content: string) {
  document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

export default function SeoMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = PUBLIC_METADATA[pathname];
    const isPublicPage = Boolean(metadata);
    const title = metadata?.title || 'Online Banking | SKOK Bank';
    const description = metadata?.description || 'Secure SKOK Bank account access.';
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;

    document.title = title;
    document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[name="robots"]', isPublicPage
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow, noarchive');
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);
  }, [pathname]);

  return null;
}
