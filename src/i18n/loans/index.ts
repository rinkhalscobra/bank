import { registerTranslations, type Language } from '../../contexts/LanguageContext';
import { en } from './en';
import { fr } from './fr';
import { de } from './de';
import { es } from './es';
import { it } from './it';
import { el } from './el';

const loansTranslations: Record<Language, Record<string, string>> = {
  en, fr, de, es, it, el,
};

registerTranslations(loansTranslations);
