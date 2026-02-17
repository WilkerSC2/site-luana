export type SupabaseImageFormat = 'origin' | 'webp' | 'avif';

export type SupabaseImageTransform = {
  width?: number;
  height?: number;
  quality?: number;
  format?: SupabaseImageFormat;
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
};

function isSupabaseStorageObjectPath(pathname: string) {
  return pathname.includes('/storage/v1/object/');
}

function toSupabaseRenderPathname(pathname: string) {
  return pathname.replace('/storage/v1/object/', '/storage/v1/render/image/');
}

function withVariantSuffix(pathname: string, suffix: string) {
  const lastSlash = pathname.lastIndexOf('/');
  if (lastSlash === -1) return null;
  const dir = pathname.slice(0, lastSlash + 1);
  const file = pathname.slice(lastSlash + 1);
  if (!file) return null;

  const dot = file.lastIndexOf('.');
  const base = dot === -1 ? file : file.slice(0, dot);
  return `${dir}${base}-${suffix}.webp`;
}

export function getSupabaseRenderUrl(
  inputUrl: string,
  transform: SupabaseImageTransform,
): string | null {
  if (!inputUrl) return null;

  let url: URL;
  try {
    url = new URL(inputUrl);
  } catch {
    return null;
  }

  if (!isSupabaseStorageObjectPath(url.pathname)) return null;

  url.pathname = toSupabaseRenderPathname(url.pathname);

  if (transform.width) url.searchParams.set('width', String(transform.width));
  if (transform.height) url.searchParams.set('height', String(transform.height));
  if (transform.quality) url.searchParams.set('quality', String(transform.quality));
  if (transform.resize) url.searchParams.set('resize', transform.resize);
  if (transform.format && transform.format !== 'origin') {
    url.searchParams.set('format', transform.format);
  }

  return url.toString();
}

export function getSupabasePublicVariantUrl(inputUrl: string, suffix: string): string | null {
  if (!inputUrl) return null;

  let url: URL;
  try {
    url = new URL(inputUrl);
  } catch {
    return null;
  }

  if (!isSupabaseStorageObjectPath(url.pathname)) return null;

  const variantPathname = withVariantSuffix(url.pathname, suffix);
  if (!variantPathname) return null;

  url.pathname = variantPathname;
  url.search = '';
  return url.toString();
}

export function getSupabaseSrcSet(
  inputUrl: string,
  widths: number[],
  baseTransform: Omit<SupabaseImageTransform, 'width'>,
): string | null {
  const candidates = widths
    .map((width) => {
      const candidateUrl = getSupabaseRenderUrl(inputUrl, { ...baseTransform, width });
      if (!candidateUrl) return null;
      return `${candidateUrl} ${width}w`;
    })
    .filter(Boolean);

  if (candidates.length === 0) return null;
  return candidates.join(', ');
}
