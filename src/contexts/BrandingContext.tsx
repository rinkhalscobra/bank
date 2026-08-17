import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

const BRANDING_ROW_ID = 'default';
const BRANDING_CACHE_KEY = 'site-branding:settings';
const BRANDING_REMOTE_DISABLED_KEY = 'site-branding:remote-disabled';
const LEGACY_BRAND_WORD = 'SKOK';
const FALLBACK_LOGO_MAX_WIDTH = 1600;
const FALLBACK_LOGO_MAX_HEIGHT = 600;
const FALLBACK_LOGO_QUALITY = 0.88;
const MAX_FAVICON_SOURCE_BYTES = 10 * 1024 * 1024;
const BRANDING_SELECT = [
  'brand_name',
  'brand_keyword',
  'navbar_logo_url',
  'footer_logo_url',
  'favicon_ico_url',
  'favicon_16_url',
  'favicon_32_url',
  'apple_touch_icon_url',
  'favicon_192_url',
  'favicon_512_url',
  'mfi_id',
  'country_code',
  'mfi_code',
  'institutional_title',
  'institutional_description',
  'mfi_id_note',
  'depositor_protection_title',
  'depositor_protection_description',
  'depositor_protection_url',
  'legal_contact_email',
  'updated_at',
].join(', ');
const LEGACY_BRANDING_SELECT = 'brand_name, brand_keyword, navbar_logo_url, footer_logo_url, updated_at';

export type BrandingSettings = {
  brandName: string;
  brandKeyword: string;
  navbarLogoUrl: string;
  footerLogoUrl: string;
  faviconIcoUrl: string;
  favicon16Url: string;
  favicon32Url: string;
  appleTouchIconUrl: string;
  favicon192Url: string;
  favicon512Url: string;
  mfiId: string;
  countryCode: string;
  mfiCode: string;
  institutionalTitle: string;
  institutionalDescription: string;
  mfiIdNote: string;
  depositorProtectionTitle: string;
  depositorProtectionDescription: string;
  depositorProtectionUrl: string;
  legalContactEmail: string;
  updatedAt: string | null;
};

type BrandingRow = {
  brand_name?: string | null;
  brand_keyword?: string | null;
  navbar_logo_url?: string | null;
  footer_logo_url?: string | null;
  favicon_ico_url?: string | null;
  favicon_16_url?: string | null;
  favicon_32_url?: string | null;
  apple_touch_icon_url?: string | null;
  favicon_192_url?: string | null;
  favicon_512_url?: string | null;
  mfi_id?: string | null;
  country_code?: string | null;
  mfi_code?: string | null;
  institutional_title?: string | null;
  institutional_description?: string | null;
  mfi_id_note?: string | null;
  depositor_protection_title?: string | null;
  depositor_protection_description?: string | null;
  depositor_protection_url?: string | null;
  legal_contact_email?: string | null;
  updated_at?: string | null;
};

export type BrandingUpdate = Omit<BrandingSettings, 'updatedAt'>;

export type BrandingFaviconUrls = Pick<
  BrandingSettings,
  'faviconIcoUrl' | 'favicon16Url' | 'favicon32Url' | 'appleTouchIconUrl' | 'favicon192Url' | 'favicon512Url'
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
  uploadFavicon: (file: File) => Promise<BrandingFaviconUrls>;
  applyBranding: (value: string) => string;
};

export const DEFAULT_BRANDING: BrandingSettings = {
  brandName: 'SKOK Bank',
  brandKeyword: LEGACY_BRAND_WORD,
  navbarLogoUrl: '/skok7.svg',
  footerLogoUrl: '/skok7.svg',
  faviconIcoUrl: '/favicon.ico',
  favicon16Url: '/favicon-16x16.png',
  favicon32Url: '/favicon-32x32.png',
  appleTouchIconUrl: '/apple-touch-icon.png',
  favicon192Url: '/android-chrome-192x192.png',
  favicon512Url: '/android-chrome-512x512.png',
  mfiId: 'PL10026',
  countryCode: 'PL',
  mfiCode: '10026',
  institutionalTitle: '',
  institutionalDescription: '',
  mfiIdNote: '',
  depositorProtectionTitle: '',
  depositorProtectionDescription: '',
  depositorProtectionUrl: 'https://www.gov.pl/web/finance/protection-of-depositors',
  legalContactEmail: 'legal@skokwybrzeze.com',
  updatedAt: null,
};

const BrandingContext = createContext<BrandingContextType | null>(null);

function cleanText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readBrandingField(
  value: Partial<BrandingSettings> | BrandingRow | null | undefined,
  camelKey: keyof BrandingSettings,
  rowKey: keyof BrandingRow,
) {
  if (value && camelKey in value) return (value as Partial<BrandingSettings>)[camelKey];
  return (value as BrandingRow | null | undefined)?.[rowKey];
}

function normalizeBranding(value: Partial<BrandingSettings> | BrandingRow | null | undefined): BrandingSettings {
  return {
    brandName: cleanText(readBrandingField(value, 'brandName', 'brand_name'), DEFAULT_BRANDING.brandName),
    brandKeyword: cleanText(readBrandingField(value, 'brandKeyword', 'brand_keyword'), DEFAULT_BRANDING.brandKeyword),
    navbarLogoUrl: cleanText(readBrandingField(value, 'navbarLogoUrl', 'navbar_logo_url'), DEFAULT_BRANDING.navbarLogoUrl),
    footerLogoUrl: cleanText(readBrandingField(value, 'footerLogoUrl', 'footer_logo_url'), DEFAULT_BRANDING.footerLogoUrl),
    faviconIcoUrl: cleanText(readBrandingField(value, 'faviconIcoUrl', 'favicon_ico_url'), DEFAULT_BRANDING.faviconIcoUrl),
    favicon16Url: cleanText(readBrandingField(value, 'favicon16Url', 'favicon_16_url'), DEFAULT_BRANDING.favicon16Url),
    favicon32Url: cleanText(readBrandingField(value, 'favicon32Url', 'favicon_32_url'), DEFAULT_BRANDING.favicon32Url),
    appleTouchIconUrl: cleanText(readBrandingField(value, 'appleTouchIconUrl', 'apple_touch_icon_url'), DEFAULT_BRANDING.appleTouchIconUrl),
    favicon192Url: cleanText(readBrandingField(value, 'favicon192Url', 'favicon_192_url'), DEFAULT_BRANDING.favicon192Url),
    favicon512Url: cleanText(readBrandingField(value, 'favicon512Url', 'favicon_512_url'), DEFAULT_BRANDING.favicon512Url),
    mfiId: cleanText(readBrandingField(value, 'mfiId', 'mfi_id'), DEFAULT_BRANDING.mfiId),
    countryCode: cleanText(readBrandingField(value, 'countryCode', 'country_code'), DEFAULT_BRANDING.countryCode),
    mfiCode: cleanText(readBrandingField(value, 'mfiCode', 'mfi_code'), DEFAULT_BRANDING.mfiCode),
    institutionalTitle: cleanText(readBrandingField(value, 'institutionalTitle', 'institutional_title'), DEFAULT_BRANDING.institutionalTitle),
    institutionalDescription: cleanText(readBrandingField(value, 'institutionalDescription', 'institutional_description'), DEFAULT_BRANDING.institutionalDescription),
    mfiIdNote: cleanText(readBrandingField(value, 'mfiIdNote', 'mfi_id_note'), DEFAULT_BRANDING.mfiIdNote),
    depositorProtectionTitle: cleanText(readBrandingField(value, 'depositorProtectionTitle', 'depositor_protection_title'), DEFAULT_BRANDING.depositorProtectionTitle),
    depositorProtectionDescription: cleanText(readBrandingField(value, 'depositorProtectionDescription', 'depositor_protection_description'), DEFAULT_BRANDING.depositorProtectionDescription),
    depositorProtectionUrl: cleanText(readBrandingField(value, 'depositorProtectionUrl', 'depositor_protection_url'), DEFAULT_BRANDING.depositorProtectionUrl),
    legalContactEmail: cleanText(readBrandingField(value, 'legalContactEmail', 'legal_contact_email'), DEFAULT_BRANDING.legalContactEmail),
    updatedAt: cleanText(readBrandingField(value, 'updatedAt', 'updated_at'), '') || null,
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
    favicon_ico_url: branding.faviconIcoUrl,
    favicon_16_url: branding.favicon16Url,
    favicon_32_url: branding.favicon32Url,
    apple_touch_icon_url: branding.appleTouchIconUrl,
    favicon_192_url: branding.favicon192Url,
    favicon_512_url: branding.favicon512Url,
    mfi_id: branding.mfiId,
    country_code: branding.countryCode,
    mfi_code: branding.mfiCode,
    institutional_title: branding.institutionalTitle,
    institutional_description: branding.institutionalDescription,
    mfi_id_note: branding.mfiIdNote,
    depositor_protection_title: branding.depositorProtectionTitle,
    depositor_protection_description: branding.depositorProtectionDescription,
    depositor_protection_url: branding.depositorProtectionUrl,
    legal_contact_email: branding.legalContactEmail,
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

async function renderSquarePng(file: File, size: number) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Could not prepare the favicon image.'));
      element.src = objectUrl;
    });
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) throw new Error('The favicon image has invalid dimensions.');

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create the favicon canvas.');

    context.clearRect(0, 0, size, size);
    const scale = Math.min(size / sourceWidth, size / sourceHeight);
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    context.drawImage(image, Math.round((size - width) / 2), Math.round((size - height) / 2), width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not generate the favicon image.')), 'image/png');
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function createIcoBlob(images: Array<{ size: number; blob: Blob }>) {
  const buffers = await Promise.all(images.map(({ blob }) => blob.arrayBuffer()));
  const headerLength = 6 + images.length * 16;
  const totalLength = headerLength + buffers.reduce((total, buffer) => total + buffer.byteLength, 0);
  const output = new Uint8Array(totalLength);
  const view = new DataView(output.buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);

  let payloadOffset = headerLength;
  images.forEach(({ size }, index) => {
    const entryOffset = 6 + index * 16;
    const buffer = buffers[index];
    view.setUint8(entryOffset, size === 256 ? 0 : size);
    view.setUint8(entryOffset + 1, size === 256 ? 0 : size);
    view.setUint8(entryOffset + 2, 0);
    view.setUint8(entryOffset + 3, 0);
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, buffer.byteLength, true);
    view.setUint32(entryOffset + 12, payloadOffset, true);
    output.set(new Uint8Array(buffer), payloadOffset);
    payloadOffset += buffer.byteLength;
  });

  return new Blob([output], { type: 'image/x-icon' });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Could not read the generated favicon.'));
    reader.onerror = () => reject(new Error('Could not read the generated favicon.'));
    reader.readAsDataURL(blob);
  });
}

function setLinkHref(selector: string, attributes: Record<string, string>, href: string) {
  let link = document.head.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement('link');
    Object.entries(attributes).forEach(([key, value]) => link?.setAttribute(key, value));
    document.head.appendChild(link);
  }
  link.href = href;
}

function applyFaviconLinks(branding: BrandingSettings) {
  setLinkHref('link[rel="icon"][sizes="any"]', { rel: 'icon', sizes: 'any' }, branding.faviconIcoUrl);
  setLinkHref('link[rel="icon"][sizes="16x16"]', { rel: 'icon', type: 'image/png', sizes: '16x16' }, branding.favicon16Url);
  setLinkHref('link[rel="icon"][sizes="32x32"]', { rel: 'icon', type: 'image/png', sizes: '32x32' }, branding.favicon32Url);
  setLinkHref('link[rel="icon"][sizes="192x192"]', { rel: 'icon', type: 'image/png', sizes: '192x192' }, branding.favicon192Url);
  setLinkHref('link[rel="apple-touch-icon"]', { rel: 'apple-touch-icon', sizes: '180x180' }, branding.appleTouchIconUrl);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(() => readCachedBranding());
  const [loading, setLoading] = useState(true);
  const [remoteAvailable, setRemoteAvailable] = useState(() => !isRemoteBrandingDisabled());

  const refreshBranding = useCallback(async () => {
    setLoading(true);

    const expandedResult = await supabase
      .from('site_branding')
      .select(BRANDING_SELECT)
      .eq('id', BRANDING_ROW_ID)
      .maybeSingle();
    let data: unknown = expandedResult.data;
    let error: { message: string } | null = expandedResult.error;

    // Keep older deployments usable while the expanded branding migration is rolling out.
    if (error) {
      const legacyResult = await supabase
        .from('site_branding')
        .select(LEGACY_BRANDING_SELECT)
        .eq('id', BRANDING_ROW_ID)
        .maybeSingle();
      data = legacyResult.data;
      error = legacyResult.error;
    }

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
      .select(BRANDING_SELECT)
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

  const uploadFavicon = useCallback(async (file: File): Promise<BrandingFaviconUrls> => {
    if (!file.type.startsWith('image/')) throw new Error('Please upload an image file.');
    if (file.size > MAX_FAVICON_SOURCE_BYTES) throw new Error('The favicon source must be 10 MB or smaller.');

    const [png16, png32, png180, png192, png512] = await Promise.all(
      [16, 32, 180, 192, 512].map((size) => renderSquarePng(file, size)),
    );
    const ico = await createIcoBlob([
      { size: 16, blob: png16 },
      { size: 32, blob: png32 },
    ]);
    const generated = [
      { key: 'faviconIcoUrl', name: 'favicon.ico', blob: ico, contentType: 'image/x-icon' },
      { key: 'favicon16Url', name: 'favicon-16.png', blob: png16, contentType: 'image/png' },
      { key: 'favicon32Url', name: 'favicon-32.png', blob: png32, contentType: 'image/png' },
      { key: 'appleTouchIconUrl', name: 'apple-touch-180.png', blob: png180, contentType: 'image/png' },
      { key: 'favicon192Url', name: 'favicon-192.png', blob: png192, contentType: 'image/png' },
      { key: 'favicon512Url', name: 'favicon-512.png', blob: png512, contentType: 'image/png' },
    ] as const;
    const stamp = Date.now();
    const uploaded: Partial<BrandingFaviconUrls> = {};

    for (const asset of generated) {
      const path = `favicons/${stamp}-${asset.name}`;
      const { error } = await supabase.storage.from('site-branding').upload(path, asset.blob, {
        cacheControl: '31536000',
        contentType: asset.contentType,
        upsert: false,
      });

      if (error) {
        setRemoteBrandingDisabled(true);
        setRemoteAvailable(false);
        const fallbackEntries = await Promise.all(generated.map(async (item) => [item.key, await blobToDataUrl(item.blob)] as const));
        return Object.fromEntries(fallbackEntries) as BrandingFaviconUrls;
      }

      const { data } = supabase.storage.from('site-branding').getPublicUrl(path);
      uploaded[asset.key] = data.publicUrl;
    }

    setRemoteBrandingDisabled(false);
    setRemoteAvailable(true);
    return uploaded as BrandingFaviconUrls;
  }, []);

  const applyBranding = useCallback((value: string) => applyBrandingToText(value, branding), [branding]);

  useEffect(() => {
    void refreshBranding();
  }, [refreshBranding]);

  useEffect(() => {
    document.title = branding.brandName;
    applyFaviconLinks(branding);
  }, [branding]);

  const value = useMemo<BrandingContextType>(() => ({
    branding,
    loading,
    remoteAvailable,
    refreshBranding,
    saveBranding,
    uploadLogo,
    uploadFavicon,
    applyBranding,
  }), [applyBranding, branding, loading, refreshBranding, remoteAvailable, saveBranding, uploadFavicon, uploadLogo]);

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
