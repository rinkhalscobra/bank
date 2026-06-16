import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export type CookiePreferences = Record<CookieCategory, boolean>;

export interface StoredCookieConsent {
  version: string;
  preferences: CookiePreferences;
  updatedAt: string;
}

interface CookieConsentContextType {
  preferences: CookiePreferences;
  hasStoredConsent: boolean;
  isBannerVisible: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  hasConsentFor: (category: CookieCategory) => boolean;
}

const COOKIE_CONSENT_VERSION = '2026-06-13';
const STORAGE_KEY = 'skok-cookie-consent';
const CONSENT_COOKIE_NAME = 'skok_cookie_consent';
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const ALL_ACCEPTED_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: true,
};

const OPTIONAL_COOKIE_PATTERNS: Record<
  Exclude<CookieCategory, 'necessary'>,
  { names: string[]; prefixes: string[] }
> = {
  functional: {
    names: ['skok_functional', 'skok_branch', 'skok_live_chat'],
    prefixes: ['skok_pref_', 'skok_functional_'],
  },
  analytics: {
    names: ['_ga', '_gid', '_gat', '_hjSession', '_hjFirstSeen', 'skok_analytics'],
    prefixes: ['_ga_', '_hj', 'skok_analytics_'],
  },
  marketing: {
    names: ['_fbp', '_fbc', 'skok_campaign', 'skok_marketing'],
    prefixes: ['_gcl_', 'skok_campaign_', 'skok_marketing_'],
  },
};

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

function normalizePreferences(value: unknown): CookiePreferences | null {
  if (!value || typeof value !== 'object') return null;
  const preferences = value as Partial<CookiePreferences>;

  return {
    necessary: true,
    functional: Boolean(preferences.functional),
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
  };
}

function readStoredConsent(): StoredCookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredCookieConsent>;
    const preferences = normalizePreferences(parsed.preferences);
    if (!preferences || !parsed.updatedAt) return null;

    return {
      version: parsed.version || COOKIE_CONSENT_VERSION,
      preferences,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

function buildConsentCookieValue(consent: StoredCookieConsent) {
  return encodeURIComponent(
    JSON.stringify({
      version: consent.version,
      preferences: consent.preferences,
      updatedAt: consent.updatedAt,
    })
  );
}

function setConsentCookie(consent: StoredCookieConsent) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=${buildConsentCookieValue(
    consent
  )}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

function getCookieNames() {
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter(Boolean);
}

function getDomainCandidates() {
  const hostname = window.location.hostname;
  if (!hostname || hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return [''];
  }

  const parts = hostname.split('.');
  const candidates = new Set<string>(['', hostname, `.${hostname}`]);

  for (let index = 0; index < parts.length - 1; index += 1) {
    const domain = parts.slice(index).join('.');
    candidates.add(domain);
    candidates.add(`.${domain}`);
  }

  return Array.from(candidates);
}

function deleteCookie(name: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const domains = getDomainCandidates();

  domains.forEach((domain) => {
    const domainAttribute = domain ? `; Domain=${domain}` : '';
    document.cookie = `${name}=; Max-Age=0; Path=/${domainAttribute}; SameSite=Lax${secure}`;
  });
}

function cookieMatchesPattern(
  name: string,
  pattern: { names: string[]; prefixes: string[] }
) {
  return pattern.names.includes(name) || pattern.prefixes.some((prefix) => name.startsWith(prefix));
}

function removeDisabledOptionalCookies(preferences: CookiePreferences) {
  const cookieNames = getCookieNames();

  (Object.keys(OPTIONAL_COOKIE_PATTERNS) as Exclude<CookieCategory, 'necessary'>[]).forEach(
    (category) => {
      if (preferences[category]) return;

      cookieNames
        .filter((name) => cookieMatchesPattern(name, OPTIONAL_COOKIE_PATTERNS[category]))
        .forEach(deleteCookie);
    }
  );
}

function persistConsent(preferences: CookiePreferences): StoredCookieConsent {
  const consent: StoredCookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    preferences: { ...preferences, necessary: true },
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  setConsentCookie(consent);
  removeDisabledOptionalCookies(consent.preferences);
  window.dispatchEvent(new CustomEvent('skok:cookie-consent-updated', { detail: consent }));

  return consent;
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [storedConsent, setStoredConsent] = useState<StoredCookieConsent | null>(() =>
    readStoredConsent()
  );
  const [isBannerVisible, setIsBannerVisible] = useState(() => !readStoredConsent());
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const preferences = storedConsent?.preferences || DEFAULT_PREFERENCES;
  const hasStoredConsent = Boolean(storedConsent);

  const applyPreferences = useCallback((nextPreferences: CookiePreferences) => {
    const consent = persistConsent(nextPreferences);
    setStoredConsent(consent);
    setIsBannerVisible(false);
    setIsPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    applyPreferences(ALL_ACCEPTED_PREFERENCES);
  }, [applyPreferences]);

  const rejectOptional = useCallback(() => {
    applyPreferences(DEFAULT_PREFERENCES);
  }, [applyPreferences]);

  const savePreferences = useCallback(
    (nextPreferences: CookiePreferences) => {
      applyPreferences(nextPreferences);
    },
    [applyPreferences]
  );

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
    setIsBannerVisible(false);
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
    setIsBannerVisible(!storedConsent);
  }, [storedConsent]);

  const hasConsentFor = useCallback(
    (category: CookieCategory) => {
      return Boolean(preferences[category]);
    },
    [preferences]
  );

  useEffect(() => {
    if (storedConsent) {
      removeDisabledOptionalCookies(storedConsent.preferences);
      setConsentCookie(storedConsent);
    }
  }, [storedConsent]);

  useEffect(() => {
    const handleOpenPreferences = () => {
      setIsPreferencesOpen(true);
      setIsBannerVisible(false);
    };

    window.addEventListener('skok:open-cookie-preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('skok:open-cookie-preferences', handleOpenPreferences);
    };
  }, []);

  useEffect(() => {
    window.SKOKCookieConsent = {
      getPreferences: () => preferences,
      hasConsentFor: (category: CookieCategory) => Boolean(preferences[category]),
      openPreferences,
    };

    return () => {
      delete window.SKOKCookieConsent;
    };
  }, [openPreferences, preferences]);

  const value = useMemo<CookieConsentContextType>(
    () => ({
      preferences,
      hasStoredConsent,
      isBannerVisible,
      isPreferencesOpen,
      acceptAll,
      rejectOptional,
      savePreferences,
      openPreferences,
      closePreferences,
      hasConsentFor,
    }),
    [
      acceptAll,
      closePreferences,
      hasConsentFor,
      hasStoredConsent,
      isBannerVisible,
      isPreferencesOpen,
      openPreferences,
      preferences,
      rejectOptional,
      savePreferences,
    ]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return context;
}

declare global {
  interface Window {
    SKOKCookieConsent?: {
      getPreferences: () => CookiePreferences;
      hasConsentFor: (category: CookieCategory) => boolean;
      openPreferences: () => void;
    };
  }
}
