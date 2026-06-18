import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCmsContent } from './cms-content-source.mjs';

const root = process.cwd();
const publicDir = resolve(root, 'public');

const staticRoutes = [
  '/',
  '/cars',
  '/rental-conditions',
  '/how-to-rent',
  '/contact',
  '/availability',
  '/faq',
  '/monthly-car-rental',
  '/car-rental-for-malaysian',
  '/reviews',
  '/blog',
  '/about-us',
  '/privacy-policy',
  '/terms-and-conditions'
];

function uniqueRoutes(routes) {
  return [...new Set(routes.filter(Boolean))];
}

function routePriority(route) {
  if (route === '/') return '1.0';
  if (route.startsWith('/cars')) return '0.8';
  if (route === '/contact' || route === '/availability') return '0.7';
  return '0.6';
}

function changeFrequency(route) {
  if (route === '/' || route === '/cars' || route === '/availability') return 'weekly';
  return 'monthly';
}

const content = await loadCmsContent();
const today = new Date().toISOString().slice(0, 10);
const routes = uniqueRoutes([
  ...staticRoutes,
  ...content.cars.map((car) => car.slug && `/cars/${car.slug}`),
  ...content.blogPosts.map((post) => post.slug && `/blog/${post.slug}`),
  ...content.pages.map((page) => page.slug && `/${page.slug.replace(/^\//, '')}`)
]);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${content.siteUrl}${route === '/' ? '' : route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changeFrequency(route)}</changefreq>
    <priority>${routePriority(route)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${content.siteUrl}/sitemap.xml
`;

await mkdir(publicDir, { recursive: true });
await writeFile(resolve(publicDir, 'sitemap.xml'), sitemap);
await writeFile(resolve(publicDir, 'robots.txt'), robots);

console.log(`Generated sitemap from ${content.source} content with ${routes.length} routes.`);
