import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_BRANDING } from '../../contexts/BrandingContext';

type BrandLogoProps = {
  src: string;
  alt: string;
  className?: string;
};

function getPublicAssetUrl(path: string) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function normalizeLogoSrc(value: string) {
  const src = value.trim();

  if (!src) return getPublicAssetUrl(DEFAULT_BRANDING.navbarLogoUrl);
  if (/^(data:|blob:|https?:\/\/|\/\/)/i.test(src)) return src;

  return getPublicAssetUrl(src);
}

export default function BrandLogo({ src, alt, className }: BrandLogoProps) {
  const fallbackSrc = useMemo(() => getPublicAssetUrl(DEFAULT_BRANDING.navbarLogoUrl), []);
  const preferredSrc = useMemo(() => normalizeLogoSrc(src), [src]);
  const [currentSrc, setCurrentSrc] = useState(preferredSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(preferredSrc);
    setFailed(false);
  }, [preferredSrc]);

  if (failed) {
    return <span className={className}>{alt}</span>;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          return;
        }

        setFailed(true);
      }}
    />
  );
}
