import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const publicDir = resolve(root, 'public');
const envPath = resolve(root, '.env');

async function readSiteUrl() {
  try {
    const env = await readFile(envPath, 'utf8');
    const match = env.match(/^VITE_SITE_URL=(.+)$/m);
    return (match?.[1] || 'http://localhost:5180').replace(/\/$/, '');
  } catch {
    return 'http://localhost:5180';
  }
}

const staticRoutes = [
  '/',
  '/cars',
  '/rental-conditions',
  '/how-to-rent',
  '/contact',
  '/faq',
  '/monthly-car-rental',
  '/car-rental-for-malaysian',
  '/reviews',
  '/blog',
  '/about-us',
  '/privacy-policy',
  '/terms-and-conditions'
];

const carSlugs = [
  'toyota-yaris',
  'toyota-new-yaris',
  'toyota-vios',
  'toyota-new-vios',
  'toyota-altis',
  'honda-brio',
  'nissan-almera',
  'nissan-march',
  'suzuki-swift',
  'suzuki-ciaz',
  'mitsubishi-attrage'
];

const blogSlugs = ['hat-yai-airport-car-rental', 'hat-yai-driving-guide'];

const siteUrl = await readSiteUrl();
const today = new Date().toISOString().slice(0, 10);
const routes = [
  ...staticRoutes,
  ...carSlugs.map((slug) => `/cars/${slug}`),
  ...blogSlugs.map((slug) => `/blog/${slug}`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/cars') ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await mkdir(publicDir, { recursive: true });
await writeFile(resolve(publicDir, 'sitemap.xml'), sitemap);
await writeFile(resolve(publicDir, 'robots.txt'), robots);
