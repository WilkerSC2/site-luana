import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
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
  preferRender?: boolean;
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
  preferRender = false,
  sizes,
  onError,
  style,
  className,
  ...imgProps
}: OptimizedImageProps) {
  type Mode = 'render' | 'variant' | 'fallback';

  const variantUrl = useMemo(() => {
    if (!variant) return null;
    return getSupabasePublicVariantUrl(src, variant);
  }, [src, variant]);

  const renderUrl = useMemo(() => {
    const maxWidth = Math.max(...widths);
    return getSupabaseRenderUrl(src, { width: maxWidth, quality, format });
  }, [format, quality, src, widths]);

  const initialMode = useMemo<Mode>(() => {
    if ((transformsEnabled || preferRender) && renderUrl) return 'render';
    if (variantUrl) return 'variant';
    return 'fallback';
  }, [preferRender, renderUrl, variantUrl]);

  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const srcSet = useMemo(() => {
    if (mode !== 'render') return undefined;
    return getSupabaseSrcSet(src, widths, { quality, format }) ?? undefined;
  }, [format, mode, quality, src, widths]);

  const resolvedSrc = useMemo(() => {
    if (mode === 'render') return renderUrl ?? src;
    if (mode === 'variant') return variantUrl ?? src;
    return src;
  }, [mode, renderUrl, src, variantUrl]);

  return (
    <img
      {...imgProps}
      src={resolvedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      className={className}
      style={{
        // Prevents the browser from briefly painting `alt` text (often the filename/title)
        // while the image is still loading.
        color: 'transparent',
        fontSize: 0,
        ...style,
      }}
      onError={(e) => {
        if (mode === 'render' && variantUrl) {
          setMode('variant');
          return;
        }
        if (mode !== 'fallback') {
          setMode('fallback');
        }
        onError?.(e);
      }}
    />
  );
}
