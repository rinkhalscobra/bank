import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

const BRANDING_ROW_ID = 'default';
const BRANDING_CACHE_KEY = 'site-branding:settings';
const BRANDING_REMOTE_DISABLED_KEY = 'site-branding:remote-disabled';
const LEGACY_BRAND_WORD = 'SKOK';
const FALLBACK_LOGO_MAX_WIDTH = 1600;
const FALLBACK_LOGO_MAX_HEIGHT = 600;
const FALLBACK_LOGO_QUALITY = 0.88;

export type BrandingSettings = {
  brandName: string;
  brandKeyword: string;
  navbarLogoUrl: string;
  footerLogoUrl: string;
  updatedAt: string | null;
};

type BrandingRow = {
  brand_name?: string | null;
  brand_keyword?: string | null;
  navbar_logo_url?: string | null;
  footer_logo_url?: string | null;
  updated_at?: string | null;
};

export type BrandingUpdate = Pick<
  BrandingSettings,
  'brandName' | 'brandKeyword' | 'navbarLogoUrl' | 'footerLogoUrl'
>;

export type BrandingSaveResult = {
  branding: BrandingSettings;
  persisted: 'remote' | 'local';
  error?: string;
};

type LogoSlot = 'navbar' | 'footer';

type BrandingContextType = {
  branding: BrandingSettings;
  loading: boolean;
  remoteAvailable: boolean;
  refreshBranding: () => Promise<void>;
  saveBranding: (updates: BrandingUpdate) => Promise<BrandingSaveResult>;
  uploadLogo: (file: File, slot: LogoSlot) => Promise<string>;
  applyBranding: (value: string) => string;
};

export const DEFAULT_BRANDING: BrandingSettings = {
  brandName: 'SKOK Bank',
  brandKeyword: LEGACY_BRAND_WORD,
  navbarLogoUrl: '/skok7.svg',
  footerLogoUrl: '/skok7.svg',
  updatedAt: null,
};

const BrandingContext = createContext<BrandingContextType | null>(null);

function cleanText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeBranding(value: Partial<BrandingSettings> | BrandingRow | null | undefined): BrandingSettings {
  return {
    brandName: cleanText('brandName' in (value || {}) ? (value as Partial<BrandingSettings>).brandName : (value as BrandingRow | null | undefined)?.brand_name, DEFAULT_BRANDING.brandName),
    brandKeyword: cleanText('brandKeyword' in (value || {}) ? (value as Partial<BrandingSettings>).brandKeyword : (value as BrandingRow | null | undefined)?.brand_keyword, DEFAULT_BRANDING.brandKeyword),
    navbarLogoUrl: cleanText('navbarLogoUrl' in (value || {}) ? (value as Partial<BrandingSettings>).navbarLogoUrl : (value as BrandingRow | null | undefined)?.navbar_logo_url, DEFAULT_BRANDING.navbarLogoUrl),
    footerLogoUrl: cleanText('footerLogoUrl' in (value || {}) ? (value as Partial<BrandingSettings>).footerLogoUrl : (value as BrandingRow | null | undefined)?.footer_logo_url, DEFAULT_BRANDING.footerLogoUrl),
    updatedAt: cleanText('updatedAt' in (value || {}) ? (value as Partial<BrandingSettings>).updatedAt : (value as BrandingRow | null | undefined)?.updated_at, '') || null,
  };
}

function readCachedBranding() {
  if (typeof window === 'undefined') return DEFAULT_BRANDING;

  try {
    const cached = window.localStorage.getItem(BRANDING_CACHE_KEY);
    if (!cached) return DEFAULT_BRANDING;
    return normalizeBranding(JSON.parse(cached) as Partial<BrandingSettings>);
  } catch {
    return DEFAULT_BRANDING;
  }
}

function cacheBranding(branding: BrandingSettings) {
  try {
    window.localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(branding));
  } catch {
    // Branding still works without local cache; the next load will fetch Supabase again.
  }
}

function isRemoteBrandingDisabled() {
  try {
    return window.localStorage.getItem(BRANDING_REMOTE_DISABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

function setRemoteBrandingDisabled(disabled: boolean) {
  try {
    if (disabled) {
      window.localStorage.setItem(BRANDING_REMOTE_DISABLED_KEY, 'true');
    } else {
      window.localStorage.removeItem(BRANDING_REMOTE_DISABLED_KEY);
    }
  } catch {
    // Local branding still works without this preference.
  }
}

function matchReplacementCase(match: string, replacement: string) {
  if (match === match.toUpperCase()) return replacement.toUpperCase();
  if (match === match.toLowerCase()) return replacement.toLowerCase();
  return replacement;
}

export function applyBrandingToText(value: string, branding: BrandingSettings = DEFAULT_BRANDING) {
  const replacement = branding.brandKeyword.trim() || DEFAULT_BRANDING.brandKeyword;
  if (!value || replacement === LEGACY_BRAND_WORD) return value;

  return value.replace(/\bSKOK\b/gi, (match) => matchReplacementCase(match, replacement));
}

export function getBrandReferencePrefix(branding: BrandingSettings) {
  const clean = (branding.brandKeyword || branding.brandName)
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 12)
    .toUpperCase();

  return clean || DEFAULT_BRANDING.brandKeyword;
}

export function getBrandFileSlug(branding: BrandingSettings) {
  const clean = branding.brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return clean || 'skok-bank';
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function createGeneratedBrandLogo(branding: Pick<BrandingSettings, 'brandName' | 'brandKeyword'>) {
  const keyword = (branding.brandKeyword || branding.brandName || DEFAULT_BRANDING.brandKeyword).trim();
  const text = keyword || DEFAULT_BRANDING.brandKeyword;
  const initials = text
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'B';
  const displayText = text.length > 18 ? text.slice(0, 18) : text;
  const safeInitials = escapeSvgText(initials);
  const safeDisplayText = escapeSvgText(displayText);
  const textWidth = Math.max(170, Math.min(380, displayText.length * 24 + 48));
  const width = textWidth + 88;

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="96" viewBox="0 0 ${width} 96" role="img" aria-label="${safeDisplayText}">
      <rect width="${width}" height="96" fill="transparent"/>
      <g transform="translate(12 14)">
        <rect x="0" y="0" width="68" height="68" rx="18" fill="#006446"/>
        <text x="34" y="43" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="#ffffff">${safeInitials}</text>
      </g>
      <text x="96" y="59" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" letter-spacing="1" fill="#006446">${safeDisplayText}</text>
    </svg>
  `);
}

function isDefaultLogoUrl(value: string) {
  const trimmed = value.trim();
  return !trimmed || trimmed === DEFAULT_BRANDING.navbarLogoUrl || trimmed === DEFAULT_BRANDING.footerLogoUrl;
}

function shouldUseGeneratedLogo(branding: Pick<BrandingSettings, 'brandName' | 'brandKeyword'>) {
  return branding.brandName.trim() !== DEFAULT_BRANDING.brandName || branding.brandKeyword.trim() !== DEFAULT_BRANDING.brandKeyword;
}

function toRowPayload(branding: BrandingSettings) {
  return {
    id: BRANDING_ROW_ID,
    brand_name: branding.brandName,
    brand_keyword: branding.brandKeyword,
    navbar_logo_url: branding.navbarLogoUrl,
    footer_logo_url: branding.footerLogoUrl,
    updated_at: new Date().toISOString(),
  };
}

function safeFileName(name: string) {
  const clean = name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return clean || 'logo';
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the uploaded logo.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read the uploaded logo.'));
    reader.readAsDataURL(file);
  });
}

async function imageFileToOptimizedDataUrl(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not prepare the uploaded logo.'));
      img.src = objectUrl;
    });

    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;

    if (!sourceWidth || !sourceHeight) {
      return fileToDataUrl(file);
    }

    const scale = Math.min(
      1,
      FALLBACK_LOGO_MAX_WIDTH / sourceWidth,
      FALLBACK_LOGO_MAX_HEIGHT / sourceHeight
    );
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      return fileToDataUrl(file);
    }

    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/webp', FALLBACK_LOGO_QUALITY);
  } catch {
    return fileToDataUrl(file);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(() => readCachedBranding());
  const [loading, setLoading] = useState(true);
  const [remoteAvailable, setRemoteAvailable] = useState(() => !isRemoteBrandingDisabled());

  const refreshBranding = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('site_branding')
      .select('brand_name, brand_keyword, navbar_logo_url, footer_logo_url, updated_at')
      .eq('id', BRANDING_ROW_ID)
      .maybeSingle();

    if (!error && data) {
      setRemoteBrandingDisabled(false);
      setRemoteAvailable(true);
      const nextBranding = normalizeBranding(data as BrandingRow);
      setBranding(nextBranding);
      cacheBranding(nextBranding);
    } else if (!error) {
      setRemoteBrandingDisabled(false);
      setRemoteAvailable(true);
    } else if (error) {
      setRemoteBrandingDisabled(true);
      setRemoteAvailable(false);
      console.warn('Could not load site branding settings:', error.message);
    }

    setLoading(false);
  }, []);

  const saveBranding = useCallback(async (updates: BrandingUpdate): Promise<BrandingSaveResult> => {
    const baseBranding = normalizeBranding({ ...branding, ...updates });
    const generatedLogo = shouldUseGeneratedLogo(baseBranding) ? createGeneratedBrandLogo(baseBranding) : '';
    const nextBranding = {
      ...baseBranding,
      navbarLogoUrl: generatedLogo && isDefaultLogoUrl(baseBranding.navbarLogoUrl) ? generatedLogo : baseBranding.navbarLogoUrl,
      footerLogoUrl: generatedLogo && isDefaultLogoUrl(baseBranding.footerLogoUrl) ? generatedLogo : baseBranding.footerLogoUrl,
    };
    const localSavedBranding = {
      ...nextBranding,
      updatedAt: new Date().toISOString(),
    };

    setBranding(localSavedBranding);
    cacheBranding(localSavedBranding);

    const { data, error } = await supabase
      .from('site_branding')
      .upsert(toRowPayload(nextBranding), { onConflict: 'id' })
      .select('brand_name, brand_keyword, navbar_logo_url, footer_logo_url, updated_at')
      .single();

    if (error) {
      setRemoteBrandingDisabled(true);
      setRemoteAvailable(false);
      console.warn('Could not save branding settings to Supabase; using local saved settings:', error.message);
      return {
        branding: localSavedBranding,
        persisted: 'local',
        error: error.message,
      };
    }

    setRemoteBrandingDisabled(false);
    setRemoteAvailable(true);
    const savedBranding = normalizeBranding(data as BrandingRow);
    setBranding(savedBranding);
    cacheBranding(savedBranding);
    return {
      branding: savedBranding,
      persisted: 'remote',
    };
  }, [branding]);

  const uploadLogo = useCallback(async (file: File, slot: LogoSlot) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file.');
    }

    const path = `logos/${slot}-${Date.now()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from('site-branding').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      setRemoteBrandingDisabled(true);
      setRemoteAvailable(false);
      console.warn('Could not upload logo to Supabase Storage; embedding an optimized logo in branding settings:', error.message);
      return imageFileToOptimizedDataUrl(file);
    }

    setRemoteBrandingDisabled(false);
    setRemoteAvailable(true);
    const { data } = supabase.storage.from('site-branding').getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const applyBranding = useCallback((value: string) => applyBrandingToText(value, branding), [branding]);

  useEffect(() => {
    void refreshBranding();
  }, [refreshBranding]);

  useEffect(() => {
    document.title = branding.brandName;
  }, [branding.brandName]);

  const value = useMemo<BrandingContextType>(() => ({
    branding,
    loading,
    remoteAvailable,
    refreshBranding,
    saveBranding,
    uploadLogo,
    applyBranding,
  }), [applyBranding, branding, loading, refreshBranding, remoteAvailable, saveBranding, uploadLogo]);

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
}

export function useOptionalBranding() {
  return useContext(BrandingContext);
}
