import { useEffect } from 'react';

const DEFAULT_SITE_URL = 'https://www.lequeproducoes.com.br';
const DEFAULT_IMAGE_URL =
  'https://g5vcbby14l69mxgk.public.blob.vercel-storage.com/Fotos_Ibira/TesteLuana.webp';
const TITLE_SUFFIX = 'Leque Produções';

export const siteConfig = {
  siteName: 'Leque Produções',
  siteUrl: normalizeSiteUrl(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL),
  defaultImage: DEFAULT_IMAGE_URL,
  defaultTitle: 'Fotografia e producao audiovisual em Sao Paulo',
  defaultDescription:
    'Portfolio de Luana Leque com fotografia, retratos, eventos e producao audiovisual em Sao Paulo.',
};

type SeoConfig = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  robots?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function usePageSeo({
  title,
  description = siteConfig.defaultDescription,
  path = '/',
  image = siteConfig.defaultImage,
  type = 'website',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  structuredData,
}: SeoConfig) {
  useEffect(() => {
    const resolvedTitle = !title
      ? `${TITLE_SUFFIX} | ${siteConfig.defaultTitle}`
      : title === TITLE_SUFFIX
        ? title
        : `${title} | ${TITLE_SUFFIX}`;
    const canonicalUrl = buildCanonicalUrl(path);

    document.title = resolvedTitle;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:locale', 'pt_BR');
    upsertMeta('property', 'og:site_name', siteConfig.siteName);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
    upsertLink('canonical', canonicalUrl);
    upsertAlternate('pt-BR', canonicalUrl);

    if (structuredData) {
      upsertStructuredData('page-seo-structured-data', structuredData);
      return;
    }

    removeStructuredData('page-seo-structured-data');
  }, [description, image, path, robots, structuredData, title, type]);
}

export function buildCanonicalUrl(pathname: string) {
  if (!pathname || pathname === '/') {
    return `${siteConfig.siteUrl}/`;
  }

  return `${siteConfig.siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function upsertAlternate(hreflang: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${hreflang}"]`
  );

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'alternate');
    element.setAttribute('hreflang', hreflang);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function upsertStructuredData(
  id: string,
  data: Record<string, unknown> | Array<Record<string, unknown>>
) {
  let element = document.getElementById(id) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

function removeStructuredData(id: string) {
  document.getElementById(id)?.remove();
}
