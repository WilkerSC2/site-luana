import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_SITE_URL = 'https://www.lequeproducoes.com.br';
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || DEFAULT_SITE_URL);
const today = new Date().toISOString().slice(0, 10);

const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/collections', priority: '0.8', changefreq: 'weekly' },
];

const publicDir = path.resolve(process.cwd(), 'public');

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${buildUrl(route.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
await writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/, '');
}

function buildUrl(routePath) {
  if (routePath === '/') {
    return `${siteUrl}/`;
  }

  return `${siteUrl}${routePath}`;
}
