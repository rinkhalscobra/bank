import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_BRANDING, applyBrandingToText, useOptionalBranding } from './BrandingContext';

export type Language = 'en' | 'fr' | 'de' | 'es' | 'it' | 'el';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

export const languages: LanguageOption[] = [
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'de', label: 'Deutsch', flag: 'https://flagcdn.com/w40/de.png' },
  { code: 'es', label: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
  { code: 'it', label: 'Italiano', flag: 'https://flagcdn.com/w40/it.png' },
  { code: 'el', label: 'Ελληνικά', flag: 'https://flagcdn.com/w40/gr.png' },
];

type Translations = Record<string, string>;
type AllTranslations = Record<Language, Translations>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const translationRegistry: AllTranslations = {
  en: {}, fr: {}, de: {}, es: {}, it: {}, el: {},
};

export function registerTranslations(translations: AllTranslations) {
  for (const lang of Object.keys(translations) as Language[]) {
    translationRegistry[lang] = { ...translationRegistry[lang], ...translations[lang] };
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const brandingContext = useOptionalBranding();
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('SKOK-lang');
    return (stored as Language) || 'en';
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('SKOK-lang', lang);
  }, []);

  const t = useCallback((key: string): string => {
    const value = translationRegistry[language]?.[key] || translationRegistry['en']?.[key] || key;
    return applyBrandingToText(value, brandingContext?.branding || DEFAULT_BRANDING);
  }, [brandingContext?.branding, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
