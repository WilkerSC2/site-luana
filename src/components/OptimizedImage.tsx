import React, { useMemo, useState } from 'react';
import {
  getSupabasePublicVariantUrl,
  getSupabaseRenderUrl,
  getSupabaseSrcSet,
  SupabaseImageFormat,
} from '../lib/supabaseImage';

type OptimizedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  src: string;
  widths?: number[];
  quality?: number;
  format?: SupabaseImageFormat;
  variant?: 'thumb' | 'display';
};

const transformsEnabled =
  String(import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORMS ?? '').toLowerCase() === '1' ||
  String(import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORMS ?? '').toLowerCase() === 'true';

export default function OptimizedImage({
  src,
  widths = [480, 768, 1024, 1280],
  quality = 70,
  format = 'webp',
  variant,
  sizes,
  onError,
  ...imgProps
}: OptimizedImageProps) {
  const [mode, setMode] = useState<'primary' | 'fallback'>('primary');

  const primary = useMemo(() => {
    if (mode !== 'primary') return null;

    if (transformsEnabled) {
      const maxWidth = Math.max(...widths);
      return getSupabaseRenderUrl(src, { width: maxWidth, quality, format });
    }

    if (variant) {
      return getSupabasePublicVariantUrl(src, variant);
    }

    return null;
  }, [format, mode, quality, src, variant, widths]);

  const srcSet = useMemo(() => {
    if (mode !== 'primary') return undefined;
    if (!transformsEnabled) return undefined;
    return getSupabaseSrcSet(src, widths, { quality, format }) ?? undefined;
  }, [format, mode, quality, src, widths]);

  return (
    <img
      {...imgProps}
      src={primary ?? src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      onError={(e) => {
        setMode('fallback');
        onError?.(e);
      }}
    />
  );
}
