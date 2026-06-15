import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const distDir = resolve(root, 'dist');
const envPath = resolve(root, '.env');
const template = await readFile(resolve(distDir, 'index.html'), 'utf8');

async function readSiteUrl() {
  try {
    const env = await readFile(envPath, 'utf8');
    const match = env.match(/^VITE_SITE_URL=(.+)$/m);
    return (match?.[1] || 'http://localhost:5180').replace(/\/$/, '');
  } catch {
    return 'http://localhost:5180';
  }
}

const siteUrl = await readSiteUrl();
const siteName = 'WWJ Car Rent';
const defaultDescription = 'รถเช่าหาดใหญ่ ราคาดี รับรถสนามบินหาดใหญ่ จองง่ายผ่าน LINE บริการทุกวัน 24 ชั่วโมง';

const cars = [
  ['toyota-yaris', 'Toyota Yaris', 'Toyota', 900, 5],
  ['toyota-new-yaris', 'Toyota New Yaris', 'Toyota', 1100, 5],
  ['toyota-vios', 'Toyota Vios', 'Toyota', 900, 5],
  ['toyota-new-vios', 'Toyota New Vios', 'Toyota', 1100, 5],
  ['toyota-altis', 'Toyota Altis', 'Toyota', 1400, 5],
  ['honda-brio', 'Honda Brio', 'Honda', 900, 5],
  ['nissan-almera', 'Nissan Almera', 'Nissan', 1000, 5],
  ['nissan-march', 'Nissan March', 'Nissan', 800, 5],
  ['suzuki-swift', 'Suzuki Swift', 'Suzuki', 900, 5],
  ['suzuki-ciaz', 'Suzuki Ciaz', 'Suzuki', 1000, 5],
  ['mitsubishi-attrage', 'Mitsubishi Attrage', 'Mitsubishi', 900, 5]
];

const faqItems = [
  'เช่ารถหาดใหญ่ต้องใช้เอกสารอะไรบ้าง',
  'รับรถที่สนามบินหาดใหญ่ได้ไหม',
  'คืนรถที่สนามบินหาดใหญ่ได้หรือไม่',
  'จองรถผ่าน LINE ได้ไหม',
  'มี WhatsApp สำหรับลูกค้าต่างชาติหรือไม่',
  'ต้องวางเงินมัดจำเท่าไร',
  'ชำระเงินค่าเช่ารถได้ช่องทางไหนบ้าง',
  'ราคาเช่ารวมประกันภัยหรือไม่',
  'หากเกิดอุบัติเหตุระหว่างเช่ารถต้องทำอย่างไร',
  'ผู้เช่าชาวต่างชาติเช่ารถได้ไหม',
  'ต้องมีใบขับขี่สากลหรือไม่',
  'ขับรถข้ามจังหวัดได้ไหม',
  'ขับรถไปเบตงได้ไหม',
  'ขับรถไปปากบาราได้ไหม',
  'เช่ารถขั้นต่ำกี่วัน',
  'รับรถนอกเวลาทำการได้ไหม',
  'คืนรถช้ากว่าเวลาที่กำหนดได้ไหม',
  'น้ำมันต้องคืนอย่างไร',
  'ยกเลิกการจองได้ไหม',
  'มีรถสำหรับครอบครัวไหม'
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteName,
    url: siteUrl,
    image: `${siteUrl}/photo/wwj-carrent.webp`,
    telephone: '+6674000000',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hat Yai',
      addressRegion: 'Songkhla',
      addressCountry: 'TH'
    },
    areaServed: ['Hat Yai', 'Hat Yai International Airport', 'Songkhla'],
    priceRange: '฿฿'
  };
}

function breadcrumbSchema(route, name) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: siteUrl },
      { '@type': 'ListItem', position: 2, name, item: `${siteUrl}${route}` }
    ]
  };
}

function renderPage({ route, title, description = defaultDescription, body, schemas = [] }) {
  const canonical = `${siteUrl}${route === '/' ? '' : route}`;
  const pageTitle = `${title} | ${siteName}`;
  const jsonLd = schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('\n');
  const headTags = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${siteUrl}/photo/wwj-carrent.webp" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    ${jsonLd}`;

  return template
    .replace(/<title>.*?<\/title>/, '')
    .replace('</head>', `${headTags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

function routeFile(route) {
  if (route === '/') return resolve(distDir, 'index.html');
  return resolve(distDir, route.replace(/^\//, ''), 'index.html');
}

async function writeRoute(route, html) {
  const file = routeFile(route);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

const carListHtml = cars
  .map(([slug, name, brand, price, seats]) => `<article><h2><a href="/cars/${slug}">${name}</a></h2><p>${brand} เกียร์อัตโนมัติ ${seats} ที่นั่ง เริ่มต้น ฿${price.toLocaleString('th-TH')} / วัน</p><a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a></article>`)
  .join('');

const routes = [
  {
    route: '/',
    title: 'รถเช่าหาดใหญ่',
    description: defaultDescription,
    body: `<main><h1>รถเช่าหาดใหญ่ ราคาดี บริการ 24 ชั่วโมง</h1><p>รับรถสนามบินหาดใหญ่ รถใหม่สะอาด จองง่ายผ่าน LINE โทร 074-000-000 LINE @wwjcarrent มีรถ ${cars.length} รุ่นพร้อมให้เช่า</p><p>รับรถสนามบินหาดใหญ่ รถใหม่สะอาด จองง่ายผ่าน LINE บริการ 24 ชั่วโมง</p><a href="/cars">ดูรถทั้งหมด</a> <a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a>${carListHtml}</main>`,
    schemas: [localBusinessSchema()]
  },
  {
    route: '/cars',
    title: 'รถเช่าหาดใหญ่',
    description: 'เลือกรถเช่าหาดใหญ่พร้อมราคา รถประหยัด รถครอบครัว รถยอดนิยม และรถเช่ารายเดือน',
    body: `<main><h1>รถเช่าหาดใหญ่</h1><p>ค้นหารถเช่าตามราคา ยี่ห้อ และประเภทการใช้งาน</p>${carListHtml}</main>`,
    schemas: [breadcrumbSchema('/cars', 'รถเช่า')]
  },
  {
    route: '/faq',
    title: 'คำถามที่พบบ่อย',
    description: 'คำถามที่พบบ่อยเกี่ยวกับรถเช่าหาดใหญ่ เอกสาร รับรถสนามบิน เงินมัดจำ ประกันภัย และการเดินทาง',
    body: `<main><h1>คำถามที่พบบ่อย</h1>${faqItems.map((q) => `<section><h2>${q}</h2><p>ติดต่อ WWJ Car Rent เพื่อยืนยันรายละเอียดล่าสุดก่อนจองรถเช่า</p></section>`).join('')}<a href="/cars">ดูรถทั้งหมด</a><a href="/contact">ติดต่อจองรถ</a></main>`,
    schemas: [
      breadcrumbSchema('/faq', 'คำถามที่พบบ่อย'),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((q) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: 'ติดต่อ WWJ Car Rent เพื่อยืนยันรายละเอียดล่าสุดก่อนจองรถเช่า' }
        }))
      }
    ]
  },
  {
    route: '/contact',
    title: 'ติดต่อจองรถเช่าหาดใหญ่',
    description: 'ติดต่อ WWJ Car Rent โทร LINE WhatsApp รับรถสนามบินหาดใหญ่ เช็ครถว่างและราคาได้ทันที',
    body: '<main><h1>ติดต่อ WWJ Car Rent</h1><p>โทร 074-000-000 LINE @wwjcarrent WhatsApp +6674000000 รับรถสนามบินหาดใหญ่ได้</p><a href="tel:+6674000000">โทรเลย</a><a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a><a href="https://wa.me/6674000000">WhatsApp</a></main>',
    schemas: [breadcrumbSchema('/contact', 'ติดต่อเรา'), localBusinessSchema()]
  },
  {
    route: '/rental-conditions',
    title: 'เงื่อนไขการเช่ารถหาดใหญ่',
    description: 'เอกสาร เงินมัดจำ น้ำมัน คืนรถล่าช้า ความเสียหาย และการขับข้ามจังหวัดสำหรับรถเช่าหาดใหญ่',
    body: '<main><h1>เงื่อนไขการเช่ารถ</h1><h2>เอกสารที่ต้องใช้</h2><p>บัตรประชาชนหรือพาสปอร์ต และใบขับขี่ตัวจริง</p><h2>เงินมัดจำ</h2><p>แจ้งยอดก่อนยืนยันการจอง</p><h2>นโยบายน้ำมัน</h2><p>คืนรถตามระดับน้ำมันที่ตกลง</p></main>',
    schemas: [breadcrumbSchema('/rental-conditions', 'เงื่อนไขการเช่า')]
  },
  {
    route: '/how-to-rent',
    title: 'วิธีเช่ารถหาดใหญ่',
    description: 'ขั้นตอนเช่ารถหาดใหญ่ เลือกรถ ติดต่อ WWJ ยืนยันการจอง และรับรถสนามบินหาดใหญ่',
    body: '<main><h1>ขั้นตอนการเช่ารถ</h1><h2>เลือกรถ</h2><h2>ติดต่อ WWJ</h2><h2>ยืนยันการจอง</h2><h2>รับรถ</h2><a href="/cars">ดูรถทั้งหมด</a><a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a></main>',
    schemas: [breadcrumbSchema('/how-to-rent', 'วิธีเช่ารถ')]
  },
  {
    route: '/about-us',
    title: 'เกี่ยวกับ WWJ Car Rent',
    description: 'บริการรถเช่าหาดใหญ่ รับรถสนามบินหาดใหญ่ ดูแลลูกค้ารายวัน รายเดือน และนักท่องเที่ยวมาเลเซีย',
    body: '<main><h1>บริการรถเช่าหาดใหญ่ที่เน้นความชัดเจนและความสบายใจ</h1><p>WWJ Car Rent ให้บริการรถเช่าสำหรับนักท่องเที่ยว ลูกค้าสนามบิน ลูกค้าเช่ารายวัน และรายเดือน</p></main>',
    schemas: [breadcrumbSchema('/about-us', 'เกี่ยวกับเรา'), localBusinessSchema()]
  },
  {
    route: '/monthly-car-rental',
    title: 'รถเช่ารายเดือนหาดใหญ่',
    description: 'รถเช่ารายเดือนหาดใหญ่สำหรับทำงาน ท่องเที่ยวระยะยาว และลูกค้าที่ต้องใช้รถหลายสัปดาห์',
    body: '<main><h1>รถเช่ารายเดือนหาดใหญ่</h1><p>สอบถามราคาเช่ารายเดือนผ่าน LINE แจ้งวันที่เริ่มเช่า ระยะเวลา รุ่นรถ และจุดรับรถ</p><a href="https://line.me/R/ti/p/@wwjcarrent">สอบถามผ่าน LINE</a></main>',
    schemas: [breadcrumbSchema('/monthly-car-rental', 'รถเช่ารายเดือน')]
  },
  {
    route: '/car-rental-for-malaysian',
    title: 'รถเช่าหาดใหญ่สำหรับลูกค้ามาเลเซีย',
    description: 'รถเช่าหาดใหญ่สำหรับนักท่องเที่ยวมาเลเซีย ใช้พาสปอร์ต ใบขับขี่ ติดต่อผ่าน WhatsApp รับรถสนามบินได้',
    body: '<main><h1>รถเช่าหาดใหญ่สำหรับลูกค้ามาเลเซีย</h1><p>เตรียม Passport, Driving license และติดต่อผ่าน WhatsApp หรือ LINE ก่อนเดินทางถึงหาดใหญ่</p><a href="https://wa.me/6674000000">ติดต่อ WhatsApp</a></main>',
    schemas: [breadcrumbSchema('/car-rental-for-malaysian', 'ลูกค้ามาเลเซีย')]
  }
];

for (const car of cars) {
  const [slug, name, brand, price, seats] = car;
  routes.push({
    route: `/cars/${slug}`,
    title: name,
    description: `${name} รถเช่าหาดใหญ่ ราคาเริ่มต้น ฿${price.toLocaleString('th-TH')} ต่อวัน เกียร์อัตโนมัติ ${seats} ที่นั่ง จองผ่าน LINE`,
    body: `<main><h1>${name}</h1><p>${brand} รถเช่าหาดใหญ่ ราคาเริ่มต้น ฿${price.toLocaleString('th-TH')} ต่อวัน เกียร์อัตโนมัติ ${seats} ที่นั่ง รับรถสนามบินหาดใหญ่ได้</p><a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a><a href="tel:+6674000000">โทรสอบถาม</a></main>`,
    schemas: [
      breadcrumbSchema(`/cars/${slug}`, name),
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        brand: { '@type': 'Brand', name: brand },
        offers: { '@type': 'Offer', price, priceCurrency: 'THB', availability: 'https://schema.org/InStock' }
      }
    ]
  });
}

for (const route of routes) {
  await writeRoute(route.route, renderPage(route));
}
