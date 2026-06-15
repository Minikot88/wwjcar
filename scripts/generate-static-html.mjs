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
const ogImage = `${siteUrl}/images/optimized/home-hero-600.webp`;
const defaultDescription = 'รถเช่าหาดใหญ่ ราคาดี รับรถสนามบินหาดใหญ่ จองง่ายผ่าน LINE บริการทุกวัน เหมาะสำหรับลูกค้ารายวัน รายเดือน และนักท่องเที่ยวมาเลเซีย';

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

const blogPosts = [
  ['hat-yai-airport-car-rental', 'เช่ารถสนามบินหาดใหญ่ต้องเตรียมอะไรบ้าง', 'รถเช่าสนามบินหาดใหญ่ เอกสาร จุดนัดรับรถ และวิธีจองกับ WWJ Car Rent'],
  ['hat-yai-driving-guide', 'ขับรถเที่ยวหาดใหญ่แบบสบายใจ', 'คู่มือเลือกรถเช่าหาดใหญ่สำหรับเที่ยวในเมือง สนามบิน และจังหวัดใกล้เคียง'],
  ['monthly-car-rental-hat-yai', 'เช่ารถรายเดือนหาดใหญ่เหมาะกับใคร', 'ข้อมูลรถเช่ารายเดือนหาดใหญ่สำหรับทำงานและเดินทางระยะยาว'],
  ['hat-yai-to-betong-car-rental', 'เช่ารถจากหาดใหญ่ไปเบตงควรรู้อะไร', 'ข้อควรรู้ก่อนเช่ารถหาดใหญ่ไปเบตงและเส้นทางข้ามจังหวัด'],
  ['hat-yai-to-pak-bara-car-rental', 'เช่ารถหาดใหญ่ไปปากบารา วางแผนอย่างไร', 'แนะนำการเลือกรถและแจ้งเส้นทางสำหรับหาดใหญ่ไปปากบารา'],
  ['malaysian-tourist-car-rental-hat-yai', 'รถเช่าหาดใหญ่สำหรับนักท่องเที่ยวมาเลเซีย', 'เอกสารและช่องทางติดต่อสำหรับลูกค้ามาเลเซียที่ต้องการเช่ารถในหาดใหญ่']
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

function jsonLd(schema) {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/optimized/logo-320.webp`,
    sameAs: []
  };
}

function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'AutoRental'],
    '@id': `${siteUrl}/#localbusiness`,
    name: siteName,
    alternateName: ['WWJ Car', 'รถเช่าหาดใหญ่ WWJ'],
    url: siteUrl,
    image: ogImage,
    telephone: '+6674000000',
    priceRange: '฿฿',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hat Yai',
      addressRegion: 'Songkhla',
      addressCountry: 'TH'
    },
    areaServed: ['Hat Yai', 'Hat Yai International Airport', 'Songkhla', 'Betong', 'Pak Bara'],
    knowsAbout: ['รถเช่าหาดใหญ่', 'รถเช่าสนามบินหาดใหญ่', 'รถเช่าสงขลา', 'รถเช่ารายเดือนหาดใหญ่', 'Car Rental Hat Yai'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '120'
    }
  };
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    inLanguage: 'th-TH',
    publisher: { '@id': `${siteUrl}/#organization` }
  };
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path === '/' ? '' : item.path}`
    }))
  };
}

function productSchema([slug, name, brand, price]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/cars/${slug}#product`,
    name,
    image: `${siteUrl}/images/optimized/${slug}-600.webp`,
    brand: { '@type': 'Brand', name: brand },
    category: 'Car Rental',
    description: `${name} รถเช่าหาดใหญ่ รับรถสนามบินหาดใหญ่ จองผ่าน LINE กับ WWJ Car Rent`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '120'
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${siteUrl}/#localbusiness` }
    }
  };
}

function renderPage({ route, title, description = defaultDescription, body, schemas = [], preloadHero = false }) {
  const canonical = `${siteUrl}${route === '/' ? '' : route}`;
  const pageTitle = `${title} | ${siteName}`;
  const schemaTags = schemas.map(jsonLd).join('\n');
  const headTags = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow" />
    <meta name="language" content="Thai" />
    <meta name="geo.region" content="TH-90" />
    <meta name="geo.placename" content="Hat Yai, Songkhla, Thailand" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="manifest" href="/manifest.webmanifest" />
    ${preloadHero ? '<link rel="preload" as="image" href="/images/optimized/home-hero-600.webp" fetchpriority="high" />' : ''}
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:locale" content="th_TH" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${schemaTags}`;

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
  .map(([slug, name, brand, price, seats]) => `<article><h2><a href="/cars/${slug}">${name}</a></h2><p>${brand} เกียร์อัตโนมัติ ${seats} ที่นั่ง เริ่มต้น ฿${price.toLocaleString('th-TH')} / วัน</p><a href="/cars/${slug}">ดูรายละเอียด</a></article>`)
  .join('');

const blogListHtml = blogPosts
  .map(([slug, title, description]) => `<article><h2><a href="/blog/${slug}">${title}</a></h2><p>${description}</p></article>`)
  .join('');

const routes = [
  {
    route: '/',
    title: 'รถเช่าหาดใหญ่',
    body: `<main><h1>รถเช่าหาดใหญ่ ราคาดี บริการ 24 ชั่วโมง</h1><p>รับรถสนามบินหาดใหญ่ รถใหม่สะอาด จองง่ายผ่าน LINE สำหรับลูกค้ารายวัน รายเดือน นักท่องเที่ยวไทย และนักท่องเที่ยวมาเลเซีย</p><img src="/images/optimized/home-hero-600.webp" alt="รถเช่าหาดใหญ่ WWJ Car Rent รับรถสนามบินหาดใหญ่" width="600" height="345" /><p><a href="/cars">ดูรถทั้งหมด</a> <a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a></p>${carListHtml}</main>`,
    preloadHero: true,
    schemas: [organizationSchema(), websiteSchema(), localBusinessSchema()]
  },
  {
    route: '/cars',
    title: 'รถเช่าหาดใหญ่',
    description: 'เลือกรถเช่าหาดใหญ่ รถประหยัด รถครอบครัว รถยอดนิยม และรถเช่ารายเดือน พร้อมราคาเริ่มต้นและจองผ่าน LINE',
    body: `<main><h1>รถเช่าหาดใหญ่</h1><p>เปรียบเทียบรถเช่ารายวันหาดใหญ่ รถเช่าสนามบินหาดใหญ่ รถเช่าสงขลา และรถเช่ารายเดือนกับ WWJ Car Rent</p>${carListHtml}</main>`,
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'รถเช่า', path: '/cars' }])]
  },
  {
    route: '/faq',
    title: 'คำถามที่พบบ่อย',
    description: 'คำถามที่พบบ่อยเกี่ยวกับรถเช่าหาดใหญ่ เอกสาร รับรถสนามบิน เงินมัดจำ ประกันภัย ลูกค้าต่างชาติ เบตง ปากบารา และการขับข้ามจังหวัด',
    body: `<main><h1>คำถามที่พบบ่อย</h1>${faqItems.map((question) => `<section><h2>${question}</h2><p>ติดต่อ WWJ Car Rent เพื่อยืนยันรายละเอียดล่าสุดก่อนจองรถเช่าหาดใหญ่</p></section>`).join('')}<a href="/cars">ดูรถทั้งหมด</a><a href="/contact">ติดต่อจองรถ</a></main>`,
    schemas: [
      breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'คำถามที่พบบ่อย', path: '/faq' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((question) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: 'ติดต่อ WWJ Car Rent เพื่อยืนยันรายละเอียดล่าสุดก่อนจองรถเช่าหาดใหญ่' }
        }))
      }
    ]
  },
  {
    route: '/contact',
    title: 'ติดต่อจองรถเช่าหาดใหญ่',
    description: 'ติดต่อ WWJ Car Rent โทร LINE WhatsApp รับรถสนามบินหาดใหญ่ เช็ครถว่างและราคาได้ทันที',
    body: '<main><h1>ติดต่อ WWJ Car Rent</h1><p>โทร 074-000-000 LINE @wwjcarrent WhatsApp +6674000000 รับรถสนามบินหาดใหญ่ได้</p><a href="tel:+6674000000">โทรเลย</a><a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a><a href="https://wa.me/6674000000">WhatsApp</a></main>',
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'ติดต่อเรา', path: '/contact' }]), localBusinessSchema()]
  },
  {
    route: '/rental-conditions',
    title: 'เงื่อนไขการเช่ารถหาดใหญ่',
    description: 'เอกสาร เงินมัดจำ น้ำมัน คืนรถล่าช้า ความเสียหาย และการขับข้ามจังหวัดสำหรับรถเช่าหาดใหญ่',
    body: '<main><h1>เงื่อนไขการเช่ารถ</h1><h2>เอกสารที่ต้องใช้</h2><p>บัตรประชาชนหรือพาสปอร์ต และใบขับขี่ตัวจริง</p><h2>เงินมัดจำ</h2><p>แจ้งยอดก่อนยืนยันการจองตามรุ่นรถและระยะเวลาเช่า</p><h2>นโยบายน้ำมัน</h2><p>คืนรถตามระดับน้ำมันที่ตกลงก่อนรับรถ</p><a href="/faq">อ่านคำถามที่พบบ่อย</a></main>',
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'เงื่อนไขการเช่า', path: '/rental-conditions' }])]
  },
  {
    route: '/how-to-rent',
    title: 'วิธีเช่ารถหาดใหญ่',
    description: 'ขั้นตอนเช่ารถหาดใหญ่ เลือกรถ ติดต่อ WWJ ยืนยันการจอง และรับรถสนามบินหาดใหญ่หรือในเมือง',
    body: '<main><h1>ขั้นตอนการเช่ารถ</h1><h2>เลือกรถ</h2><p>เลือกตามจำนวนผู้โดยสาร งบประมาณ และเส้นทาง</p><h2>ติดต่อ WWJ</h2><p>เช็ครถว่างผ่าน LINE โทร หรือ WhatsApp</p><h2>ยืนยันการจอง</h2><p>แจ้งวัน เวลา จุดรับรถ และเอกสาร</p><h2>รับรถ</h2><p>ตรวจสภาพรถและเริ่มเดินทาง</p><a href="/cars">ดูรถทั้งหมด</a></main>',
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'วิธีเช่ารถ', path: '/how-to-rent' }])]
  },
  {
    route: '/about-us',
    title: 'เกี่ยวกับ WWJ Car Rent',
    description: 'WWJ Car Rent บริการรถเช่าหาดใหญ่ รับรถสนามบินหาดใหญ่ ดูแลลูกค้ารายวัน รายเดือน และนักท่องเที่ยวมาเลเซีย',
    body: '<main><h1>บริการรถเช่าหาดใหญ่ที่เน้นความชัดเจนและความสบายใจ</h1><p>WWJ Car Rent ให้บริการรถเช่าสำหรับนักท่องเที่ยว ลูกค้าสนามบิน ลูกค้ารายวัน และลูกค้ารายเดือนในหาดใหญ่และสงขลา</p><a href="/cars">ดูรถทั้งหมด</a></main>',
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'เกี่ยวกับเรา', path: '/about-us' }]), localBusinessSchema()]
  },
  {
    route: '/monthly-car-rental',
    title: 'รถเช่ารายเดือนหาดใหญ่',
    description: 'รถเช่ารายเดือนหาดใหญ่สำหรับทำงาน ท่องเที่ยวระยะยาว และลูกค้าที่ต้องใช้รถหลายสัปดาห์ สอบถามแพ็กเกจผ่าน LINE',
    body: '<main><h1>รถเช่ารายเดือนหาดใหญ่</h1><p>เหมาะสำหรับลูกค้าที่ต้องใช้รถต่อเนื่องหลายสัปดาห์หรือหลายเดือนในหาดใหญ่ สงขลา และสนามบินหาดใหญ่</p><a href="https://line.me/R/ti/p/@wwjcarrent">สอบถามผ่าน LINE</a></main>',
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'รถเช่ารายเดือน', path: '/monthly-car-rental' }])]
  },
  {
    route: '/car-rental-for-malaysian',
    title: 'รถเช่าหาดใหญ่สำหรับลูกค้ามาเลเซีย',
    description: 'รถเช่าหาดใหญ่สำหรับนักท่องเที่ยวมาเลเซีย ใช้พาสปอร์ต ใบขับขี่ ติดต่อผ่าน WhatsApp และรับรถสนามบินหาดใหญ่ได้',
    body: '<main><h1>รถเช่าหาดใหญ่สำหรับลูกค้ามาเลเซีย</h1><p>เตรียม Passport, Driving license และติดต่อผ่าน WhatsApp หรือ LINE ก่อนเดินทางถึงหาดใหญ่</p><a href="https://wa.me/6674000000">ติดต่อ WhatsApp</a></main>',
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'ลูกค้ามาเลเซีย', path: '/car-rental-for-malaysian' }])]
  },
  {
    route: '/blog',
    title: 'บทความรถเช่าหาดใหญ่',
    description: 'คู่มือรถเช่าหาดใหญ่ รถเช่าสนามบิน รถเช่ารายเดือน หาดใหญ่ไปเบตง ปากบารา สงขลา และนักท่องเที่ยวมาเลเซีย',
    body: `<main><h1>บทความรถเช่าหาดใหญ่และเส้นทางยอดนิยม</h1>${blogListHtml}</main>`,
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'บทความ', path: '/blog' }])]
  }
];

for (const car of cars) {
  const [slug, name, brand, price, seats] = car;
  routes.push({
    route: `/cars/${slug}`,
    title: name,
    description: `${name} รถเช่าหาดใหญ่ ราคาเริ่มต้น ฿${price.toLocaleString('th-TH')} ต่อวัน เกียร์อัตโนมัติ ${seats} ที่นั่ง รับรถสนามบินหาดใหญ่ได้`,
    body: `<main><h1>${name}</h1><img src="/images/optimized/${slug}-600.webp" alt="${name} รถเช่าหาดใหญ่ WWJ Car Rent" width="600" height="516" loading="eager" /><p>${brand} รถเช่าหาดใหญ่ ราคาเริ่มต้น ฿${price.toLocaleString('th-TH')} ต่อวัน เกียร์อัตโนมัติ ${seats} ที่นั่ง รับรถสนามบินหาดใหญ่ได้</p><a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a><a href="tel:+6674000000">โทรสอบถาม</a></main>`,
    schemas: [
      breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'รถเช่า', path: '/cars' }, { name, path: `/cars/${slug}` }]),
      productSchema(car)
    ]
  });
}

for (const [slug, title, description] of blogPosts) {
  routes.push({
    route: `/blog/${slug}`,
    title,
    description,
    body: `<main><h1>${title}</h1><p>${description}</p><p>ก่อนจองรถควรเตรียมวันรับรถ วันคืนรถ จำนวนผู้โดยสาร จุดรับรถ และเส้นทางที่ต้องการเดินทาง ทีมงาน WWJ Car Rent จะช่วยแนะนำรุ่นรถและเงื่อนไขที่เหมาะกับทริปของคุณ</p><a href="/cars">ดูรถเช่าทั้งหมด</a><a href="/rental-conditions">อ่านเงื่อนไขการเช่า</a></main>`,
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'บทความ', path: '/blog' }, { name: title, path: `/blog/${slug}` }])]
  });
}

for (const route of routes) {
  await writeRoute(route.route, renderPage(route));
}
