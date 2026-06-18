import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { loadCmsContent } from './cms-content-source.mjs';

const root = process.cwd();
const distDir = resolve(root, 'dist');
const template = await readFile(resolve(distDir, 'index.html'), 'utf8');
const content = await loadCmsContent();

const siteName = 'WWJ Car Rent';
const siteUrl = content.siteUrl;
const settings = content.settings || {};
const seoDefaults = settings.seoDefaults || {};
const homeSettings = settings.home || {};
const aboutSettings = settings.about || {};
const contactSettings = settings.contact || {};
const officialSocialUrls = [
  'https://www.facebook.com/profile.php?id=61583770207206',
  'https://www.instagram.com/wwj.car/'
];
const ogImage = absoluteUrl(seoDefaults.ogImage || homeSettings.heroImage || '/images/optimized/home-hero-600.webp');
const defaultDescription = seoDefaults.description || 'รถเช่าหาดใหญ่ ราคาดี รับรถสนามบินหาดใหญ่ จองง่ายผ่าน LINE บริการทุกวัน เหมาะสำหรับลูกค้ารายวัน รายเดือน และนักท่องเที่ยวมาเลเซีย';

const pageBySlug = new Map(content.pages.map((page) => [String(page.slug || '').replace(/^\//, ''), page]));

function absoluteUrl(value) {
  if (!value) return `${siteUrl}/images/optimized/home-hero-600.webp`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${String(value).startsWith('/') ? value : `/${value}`}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function textBlock(value) {
  if (Array.isArray(value)) return value.map(textBlock).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(textBlock).join(' ');
  return String(value || '');
}

function jsonLd(schema) {
  return schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : '';
}

function repairThaiMojibake(value) {
  return String(value).replace(/[\u0080-\u00ff]{2,}/g, (match) => {
    try {
      const decoded = Buffer.from(match, 'latin1').toString('utf8');
      return decoded.includes('\uFFFD') ? match : decoded;
    } catch {
      return match;
    }
  });
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: absoluteUrl(settings.brand?.logoUrl || '/images/brand/logo.png'),
    sameAs: socialUrls()
  };
}

function socialUrls() {
  const fromSettings = [contactSettings.facebook || contactSettings.facebookUrl, contactSettings.instagram || contactSettings.instagramUrl].filter(Boolean);
  return fromSettings.length ? fromSettings : officialSocialUrls;
}

function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'AutoRental'],
    '@id': `${siteUrl}/#localbusiness`,
    name: siteName,
    alternateName: ['WWJ Car', 'รถเช่าหาดใหญ่ WWJ Car Rent'],
    url: siteUrl,
    image: ogImage,
    telephone: contactSettings.phone || undefined,
    email: contactSettings.email || undefined,
    priceRange: '฿฿',
    sameAs: socialUrls(),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hat Yai',
      addressRegion: 'Songkhla',
      addressCountry: 'TH'
    },
    areaServed: ['Hat Yai', 'Hat Yai International Airport', 'Songkhla', 'Betong', 'Pak Bara'],
    knowsAbout: ['รถเช่าหาดใหญ่', 'รถเช่าสนามบินหาดใหญ่', 'รถเช่าสงขลา', 'รถเช่ารายเดือนหาดใหญ่', 'Car Rental Hat Yai'],
    openingHours: contactSettings.businessHours || undefined
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

function webPageSchema(route, name, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}${route}#webpage`,
    url: `${siteUrl}${route}`,
    name,
    description,
    inLanguage: 'th-TH',
    isPartOf: { '@id': `${siteUrl}/#website` },
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

function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

function productSchema(car) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/cars/${car.slug}#product`,
    name: car.name,
    image: absoluteUrl(car.image || car.coverImage || `/images/optimized/${car.slug}-600.webp`),
    brand: { '@type': 'Brand', name: car.brand },
    category: 'Car Rental',
    description: `${car.name} รถเช่าหาดใหญ่ รับรถสนามบินหาดใหญ่ จองผ่าน LINE กับ WWJ Car Rent`,
    offers: {
      '@type': 'Offer',
      price: car.pricePerDay,
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${siteUrl}/#localbusiness` }
    }
  };
}

function getPage(slug) {
  return pageBySlug.get(slug.replace(/^\//, ''));
}

function pageMeta(route, fallback) {
  const page = getPage(route);
  return {
    title: page?.metaTitle || page?.title || fallback.title,
    description: page?.metaDescription || fallback.description || defaultDescription,
    ogTitle: page?.ogTitle || page?.metaTitle || page?.title || fallback.title,
    ogDescription: page?.ogDescription || page?.metaDescription || fallback.description || defaultDescription,
    ogImage: absoluteUrl(page?.ogImage || fallback.ogImage || ogImage),
    schema: page?.schema || null
  };
}

function renderCmsSections(sections = []) {
  if (!Array.isArray(sections)) return '';
  return sections
    .map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`)
    .join('');
}

function renderPage({ route, title, description = defaultDescription, ogTitle, ogDescription, pageOgImage = ogImage, body, schemas = [], preloadHero = false }) {
  const canonical = `${siteUrl}${route === '/' ? '' : route}`;
  const pageTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
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
    <meta property="og:title" content="${escapeHtml(ogTitle || pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDescription || description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(pageOgImage)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:locale" content="th_TH" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle || pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDescription || description)}" />
    <meta name="twitter:image" content="${escapeHtml(pageOgImage)}" />
    ${schemas.map(jsonLd).join('\n')}`;

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
  await writeFile(file, repairThaiMojibake(html));
}

function carListHtml(cars = content.cars) {
  return cars
    .map((car) => `<article><h2><a href="/cars/${car.slug}">${escapeHtml(car.name)}</a></h2><p>${escapeHtml(car.brand)} ${escapeHtml(transmissionLabel(car.transmission))} ${escapeHtml(car.seats || 5)} ที่นั่ง เริ่มต้น ฿${Number(car.pricePerDay || 0).toLocaleString('th-TH')} / วัน</p><a href="/cars/${car.slug}">ดูรายละเอียด</a></article>`)
    .join('');
}

function transmissionLabel(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'automatic' || normalized === 'auto') return 'เกียร์อัตโนมัติ';
  if (normalized === 'manual') return 'เกียร์ธรรมดา';
  return value || 'เกียร์อัตโนมัติ';
}

function conditionHtml() {
  return content.rentalConditions
    .map((section) => `<section><h2>${escapeHtml(section.title)}</h2><ul>${[].concat(section.content || []).map((item) => `<li>${escapeHtml(textBlock(item))}</li>`).join('')}</ul></section>`)
    .join('');
}

function blogListHtml() {
  return content.blogPosts
    .map((post) => `<article><h2><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.description)}</p></article>`)
    .join('');
}

const routes = [];
const homeTitle = homeSettings.heroTitle || 'รถเช่าหาดใหญ่ จองง่าย รับรถไว';
const homeDescription = homeSettings.heroSubtitle || defaultDescription;

routes.push({
  route: '/',
  title: seoDefaults.title || 'รถเช่าหาดใหญ่',
  description: homeDescription,
  body: `<main><h1>${escapeHtml(homeTitle)}</h1><p>${escapeHtml(homeDescription)}</p><img src="${escapeHtml(homeSettings.heroImage || '/images/optimized/home-hero-600.webp')}" alt="รถเช่าหาดใหญ่ WWJ Car Rent รับรถสนามบินหาดใหญ่" width="600" height="345" /><p><a href="/cars">${escapeHtml(homeSettings.secondaryCtaText || 'ดูรถทั้งหมด')}</a> <a href="https://line.me/R/ti/p/@wwjcarrent">${escapeHtml(homeSettings.primaryCtaText || 'จองผ่าน LINE')}</a></p>${carListHtml(content.cars.slice(0, 6))}</main>`,
  preloadHero: true,
  schemas: [organizationSchema(), websiteSchema(), localBusinessSchema()]
});

routes.push({
  route: '/cars',
  title: 'รถเช่าหาดใหญ่',
  description: 'เลือกรถเช่าหาดใหญ่ รถประหยัด รถครอบครัว รถยอดนิยม และรถเช่ารายเดือน พร้อมราคาเริ่มต้นและจองผ่าน LINE',
  body: `<main><h1>รถเช่าหาดใหญ่</h1><p>เปรียบเทียบรถเช่ารายวันหาดใหญ่ รถเช่าสนามบินหาดใหญ่ รถเช่าสงขลา และรถเช่ารายเดือนกับ WWJ Car Rent</p>${carListHtml()}</main>`,
  schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'รถเช่า', path: '/cars' }])]
});

routes.push({
  route: '/faq',
  title: 'คำถามที่พบบ่อย',
  description: 'คำถามที่พบบ่อยเกี่ยวกับรถเช่าหาดใหญ่ เอกสาร รับรถสนามบิน เงินมัดจำ ประกันภัย การคืนรถ และการเดินทาง',
  body: `<main><h1>คำถามที่พบบ่อย</h1>${content.faqs.map((item) => `<section><h2>${escapeHtml(item.question)}</h2><p>${escapeHtml(item.answer)}</p></section>`).join('')}<a href="/cars">ดูรถเช่า</a><a href="/rental-conditions">เงื่อนไขการเช่า</a></main>`,
  schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'คำถามที่พบบ่อย', path: '/faq' }]), faqSchema(content.faqs)]
});

const privacyPage = getPage('/privacy-policy');
const privacyMeta = pageMeta('/privacy-policy', {
  title: 'นโยบายความเป็นส่วนตัว',
  description: 'นโยบายความเป็นส่วนตัวของ WWJ Car Rent เกี่ยวกับการเก็บ ใช้งาน และคุ้มครองข้อมูลส่วนบุคคลของลูกค้า'
});
const privacyContent = privacyPage?.content || {};
const privacySections = Array.isArray(privacyContent.sections) && privacyContent.sections.length
  ? privacyContent.sections
  : [
      {
        title: '1. ข้อมูลที่เราเก็บรวบรวม',
        body: 'เราเก็บข้อมูลเท่าที่จำเป็นต่อการให้บริการรถเช่า ได้แก่ ชื่อ เบอร์โทรศัพท์ อีเมล ข้อมูลการจอง วันที่รับและคืนรถ รุ่นรถที่เช่า ข้อมูลการเช่ารถ เอกสารที่ใช้ประกอบการเช่า และข้อมูลการติดต่อที่ลูกค้าให้ไว้กับเรา'
      },
      {
        title: '2. วัตถุประสงค์ในการใช้ข้อมูล',
        body: 'ข้อมูลของลูกค้าถูกใช้เพื่อการติดต่อกลับ ยืนยันการจอง จัดการการเช่ารถ เตรียมรถให้ตรงตามวันเวลา ให้บริการรับรถสนามบินหาดใหญ่ ดูแลลูกค้าระหว่างการเช่า และปรับปรุงคุณภาพบริการของ WWJ Car Rent'
      },
      {
        title: '3. การจัดเก็บข้อมูล',
        body: 'ข้อมูลส่วนบุคคลจะถูกจัดเก็บอย่างปลอดภัยในระบบที่มีการจำกัดการเข้าถึง เฉพาะพนักงานหรือผู้ดูแลที่ได้รับอนุญาตและจำเป็นต้องใช้ข้อมูลเพื่อให้บริการลูกค้าเท่านั้น'
      },
      {
        title: '4. การเปิดเผยหรือแบ่งปันข้อมูล',
        body: 'WWJ Car Rent จะไม่ขาย แลกเปลี่ยน หรือให้เช่าข้อมูลส่วนบุคคลของลูกค้าแก่บุคคลภายนอก ข้อมูลอาจถูกเปิดเผยเฉพาะเมื่อจำเป็นต่อการให้บริการ หรือเมื่อมีกฎหมาย คำสั่งศาล หรือหน่วยงานรัฐที่มีอำนาจร้องขอ'
      },
      {
        title: '5. สิทธิของลูกค้า',
        body: 'ลูกค้าสามารถติดต่อ WWJ Car Rent เพื่อขอตรวจสอบข้อมูล ขอแก้ไขข้อมูลที่ไม่ถูกต้อง ขอรับรายละเอียดเกี่ยวกับการใช้ข้อมูล หรือขอลบข้อมูลส่วนบุคคลเมื่อไม่มีความจำเป็นในการเก็บรักษาอีกต่อไป'
      },
      {
        title: '6. การรักษาความปลอดภัย',
        body: 'เราใช้มาตรการด้านความปลอดภัย เช่น การป้องกันฐานข้อมูล การยืนยันตัวตนของผู้ดูแลระบบ การควบคุมสิทธิ์การเข้าถึง และการจำกัดการใช้งานข้อมูล'
      },
      {
        title: '7. คุกกี้และข้อมูลการใช้งานเว็บไซต์',
        body: 'เว็บไซต์อาจใช้คุกกี้หรือเทคโนโลยีที่คล้ายกันเพื่อช่วยให้เว็บไซต์ทำงานได้ดีขึ้น วิเคราะห์การใช้งาน และปรับปรุงประสบการณ์ของผู้เข้าชม'
      },
      {
        title: '8. ช่องทางติดต่อ',
        body: 'หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือต้องการใช้สิทธิด้านข้อมูลส่วนบุคคล สามารถติดต่อ WWJ Car Rent ผ่าน Facebook หรือ Instagram อย่างเป็นทางการของเราได้'
      }
    ];

const termsPage = getPage('/terms-and-conditions');
const termsMeta = pageMeta('/terms-and-conditions', {
  title: 'ข้อกำหนดและเงื่อนไขการใช้บริการ',
  description: 'ข้อกำหนดและเงื่อนไขการใช้บริการรถเช่าของ WWJ Car Rent สำหรับลูกค้าทุกท่าน'
});
const termsContent = termsPage?.content || {};
const termsSections = Array.isArray(termsContent.sections) && termsContent.sections.length
  ? termsContent.sections
  : [
      {
        title: '1. การใช้บริการรถเช่า',
        body: 'การใช้บริการรถเช่าของ WWJ Car Rent ขึ้นอยู่กับรถว่าง เงื่อนไขการเช่า ราคา จุดรับรถ จุดคืนรถ และรายละเอียดบริการที่ได้รับการยืนยันจากทีมงานก่อนการจอง'
      },
      {
        title: '2. คุณสมบัติผู้เช่า',
        body: 'ผู้เช่าต้องมีคุณสมบัติตามที่ WWJ Car Rent กำหนด มีใบอนุญาตขับขี่ที่ถูกต้อง สามารถติดต่อได้จริง และให้ข้อมูลครบถ้วน'
      },
      {
        title: '3. เอกสารที่ใช้',
        body: 'เอกสารที่ใช้ประกอบการเช่าอาจรวมถึงบัตรประชาชน ใบอนุญาตขับขี่ หนังสือเดินทางสำหรับชาวต่างชาติ และเอกสารเพิ่มเติมตามประเภทการเช่า'
      },
      {
        title: '4. การรับและคืนรถ',
        body: 'ลูกค้าต้องรับและคืนรถตามวัน เวลา และสถานที่ที่ตกลงไว้ หากต้องการเปลี่ยนแปลงกรุณาแจ้งทีมงานล่วงหน้า'
      },
      {
        title: '5. การยกเลิกและเปลี่ยนแปลงการจอง',
        body: 'การยกเลิกหรือเปลี่ยนแปลงการจองควรแจ้งให้เร็วที่สุด เงื่อนไขอาจแตกต่างกันตามช่วงเวลา รุ่นรถ ระยะเวลาเช่า และข้อตกลงที่ยืนยันไว้'
      },
      {
        title: '6. ความรับผิดชอบของผู้เช่า',
        body: 'ผู้เช่าต้องดูแลรถ ใช้งานตามกฎหมายจราจร ไม่ให้บุคคลที่ไม่ได้รับอนุญาตขับรถ และรับผิดชอบต่อความเสียหายหรือค่าใช้จ่ายจากการใช้งานผิดเงื่อนไข'
      },
      {
        title: '7. อุบัติเหตุและความเสียหาย',
        body: 'หากเกิดอุบัติเหตุ รถเสีย หรือความเสียหายระหว่างการเช่า ลูกค้าต้องแจ้ง WWJ Car Rent โดยเร็วที่สุดและปฏิบัติตามขั้นตอนที่ทีมงานแจ้ง'
      },
      {
        title: '8. ค่าปรับและค่าใช้จ่ายเพิ่มเติม',
        body: 'อาจมีค่าใช้จ่ายเพิ่มเติมในกรณีคืนรถล่าช้า น้ำมันไม่ตรงตามเงื่อนไข รถสกปรกผิดปกติ อุปกรณ์สูญหาย ค่าปรับจราจร หรือความเสียหาย'
      },
      {
        title: '9. การใช้งานเว็บไซต์',
        body: 'ข้อมูลบนเว็บไซต์จัดทำขึ้นเพื่อแนะนำบริการ รถเช่า ราคาโดยประมาณ เงื่อนไข และช่องทางติดต่อ รายละเอียดที่ใช้ยืนยันการเช่าจริงจะอ้างอิงจากการติดต่อกับทีมงาน'
      },
      {
        title: '10. การเปลี่ยนแปลงข้อกำหนด',
        body: 'WWJ Car Rent อาจปรับปรุงข้อกำหนดและเงื่อนไขนี้เป็นครั้งคราว โดยฉบับล่าสุดที่เผยแพร่บนเว็บไซต์จะถือเป็นข้อมูลอ้างอิงปัจจุบัน'
      },
      {
        title: '11. ช่องทางติดต่อ',
        body: 'หากมีคำถามเกี่ยวกับข้อกำหนดและเงื่อนไขการใช้บริการ สามารถติดต่อ WWJ Car Rent ผ่านช่องทางติดต่ออย่างเป็นทางการของเราได้'
      }
    ];

const simpleRoutes = [
  {
    route: '/contact',
    title: 'ติดต่อเรา',
    description: 'ติดต่อ WWJ Car Rent รถเช่าหาดใหญ่ รับรถสนามบินหาดใหญ่ จองง่ายผ่าน LINE โทร หรือ WhatsApp',
    body: `<main><h1>ติดต่อ WWJ Car Rent</h1><p>สอบถามรถว่าง ราคาเช่ารถ จุดรับรถสนามบินหาดใหญ่ และรายละเอียดการจองได้โดยตรง</p><p>${escapeHtml(contactSettings.phone || '')} ${escapeHtml(contactSettings.line || '')}</p><a href="/availability">เช็กคิวรถ</a><a href="/cars">ดูรถทั้งหมด</a></main>`,
    schemas: [localBusinessSchema()]
  },
  {
    route: '/rental-conditions',
    title: pageMeta('/rental-conditions', { title: 'เงื่อนไขการเช่ารถ' }).title,
    description: pageMeta('/rental-conditions', { title: 'เงื่อนไขการเช่ารถ', description: 'เอกสาร เงินมัดจำ ประกันภัย น้ำมัน และการคืนรถสำหรับรถเช่าหาดใหญ่' }).description,
    body: `<main><h1>เงื่อนไขการเช่ารถ</h1>${conditionHtml()}<a href="/contact">ติดต่อจองรถ</a></main>`,
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'เงื่อนไขการเช่า', path: '/rental-conditions' }])]
  },
  {
    route: '/how-to-rent',
    title: 'วิธีเช่ารถ',
    description: 'ขั้นตอนเช่ารถหาดใหญ่ง่าย ๆ เลือกรถ ติดต่อ WWJ ยืนยันการจอง และรับรถ',
    body: '<main><h1>วิธีเช่ารถ</h1><h2>เลือกรถ</h2><p>เลือกตามจำนวนผู้โดยสาร งบประมาณ และเส้นทาง</p><h2>ติดต่อ WWJ</h2><p>เช็กรถว่างผ่าน LINE โทร หรือ WhatsApp</p><h2>ยืนยันการจอง</h2><p>แจ้งวัน เวลา จุดรับรถ และเอกสาร</p><h2>รับรถ</h2><p>ตรวจสภาพรถและเริ่มเดินทาง</p><a href="/cars">ดูรถทั้งหมด</a></main>',
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'วิธีเช่ารถ', path: '/how-to-rent' }])]
  },
  {
    route: '/about-us',
    title: pageMeta('/about-us', { title: 'เกี่ยวกับ WWJ Car Rent' }).title,
    description: pageMeta('/about-us', { title: 'เกี่ยวกับ WWJ Car Rent', description: 'WWJ Car Rent บริการรถเช่าหาดใหญ่ รับรถสนามบินหาดใหญ่ ดูแลลูกค้ารายวัน รายเดือน และนักท่องเที่ยวมาเลเซีย' }).description,
    body: `<main><h1>เกี่ยวกับ WWJ Car Rent</h1><p>${escapeHtml(aboutSettings.companyStory || 'บริการรถเช่าหาดใหญ่ที่เน้นความชัดเจน ความสะดวก และความสบายใจ')}</p><p>${escapeHtml(aboutSettings.airportPickupContent || 'รองรับการนัดรับรถที่สนามบินหาดใหญ่')}</p><a href="/cars">ดูรถทั้งหมด</a></main>`,
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'เกี่ยวกับเรา', path: '/about-us' }]), localBusinessSchema()]
  },
  {
    route: '/monthly-car-rental',
    title: 'รถเช่ารายเดือนหาดใหญ่',
    description: 'รถเช่ารายเดือนหาดใหญ่สำหรับทำงาน ท่องเที่ยวระยะยาว และลูกค้าที่ต้องใช้รถหลายสัปดาห์ สอบถามแพ็กเกจผ่าน LINE',
    body: '<main><h1>รถเช่ารายเดือนหาดใหญ่</h1><p>เหมาะสำหรับลูกค้าที่ต้องใช้รถต่อเนื่องหลายสัปดาห์หรือหลายเดือนในหาดใหญ่ สงขลา และสนามบินหาดใหญ่</p><a href="https://line.me/R/ti/p/@wwjcarrent">สอบถามผ่าน LINE</a></main>'
  },
  {
    route: '/car-rental-for-malaysian',
    title: 'รถเช่าหาดใหญ่สำหรับลูกค้ามาเลเซีย',
    description: 'รถเช่าหาดใหญ่สำหรับนักท่องเที่ยวมาเลเซีย ใช้พาสปอร์ต ใบขับขี่ ติดต่อผ่าน WhatsApp และรับรถสนามบินหาดใหญ่ได้',
    body: '<main><h1>รถเช่าหาดใหญ่สำหรับลูกค้ามาเลเซีย</h1><p>เตรียม Passport, Driving license และติดต่อผ่าน WhatsApp หรือ LINE ก่อนเดินทางถึงหาดใหญ่</p><a href="/cars">ดูรถเช่า</a></main>'
  },
  {
    route: '/availability',
    title: 'เช็กคิวรถเช่าหาดใหญ่',
    description: 'เช็กคิวรถเช่าหาดใหญ่ เลือกวันรับรถและวันคืนรถเพื่อดูรถที่ว่าง รถที่ไม่ว่าง และวันว่างถัดไป',
    body: '<main><h1>เช็กคิวรถเช่าหาดใหญ่</h1><p>เลือกวันรับรถและวันคืนรถเพื่อดูรถที่พร้อมให้บริการ ก่อนติดต่อจองผ่าน LINE</p><a href="/cars">ดูรถเช่าทั้งหมด</a><a href="/contact">ติดต่อจองรถ</a></main>'
  },
  {
    route: '/blog',
    title: 'บทความรถเช่าหาดใหญ่',
    description: 'คู่มือรถเช่าหาดใหญ่ รถเช่าสนามบิน รถเช่ารายเดือน หาดใหญ่ไปเบตง ปากบารา สงขลา และนักท่องเที่ยวมาเลเซีย',
    body: `<main><h1>บทความรถเช่าหาดใหญ่และเส้นทางยอดนิยม</h1>${blogListHtml()}</main>`
  },
  {
    route: '/reviews',
    title: 'รีวิวลูกค้า WWJ Car Rent',
    description: 'รีวิวลูกค้า WWJ Car Rent จากผู้ใช้บริการรถเช่าหาดใหญ่ รับรถสนามบินหาดใหญ่ รถสะอาด จองง่าย และบริการเป็นกันเอง',
    body: `<main><h1>รีวิวลูกค้า WWJ Car Rent</h1>${content.reviews.map((review) => `<article><h2>${escapeHtml(review.customerName || 'ลูกค้า WWJ')}</h2><p>${escapeHtml(review.content || '')}</p></article>`).join('')}<a href="/cars">ดูรถเช่าทั้งหมด</a></main>`,
    schemas: [localBusinessSchema()]
  },
  {
    route: '/privacy-policy',
    title: privacyMeta.title,
    description: privacyMeta.description,
    ogTitle: privacyMeta.ogTitle,
    ogDescription: privacyMeta.ogDescription,
    pageOgImage: privacyMeta.ogImage,
    body: `<main><h1>${escapeHtml(privacyContent.title || privacyPage?.title || 'นโยบายความเป็นส่วนตัว')}</h1><p>${escapeHtml(privacyContent.intro || privacyContent.body || privacyMeta.description)}</p><nav aria-label="สารบัญนโยบายความเป็นส่วนตัว"><h2>สารบัญ</h2><ol>${privacySections.map((section) => `<li>${escapeHtml(section.title)}</li>`).join('')}</ol></nav>${renderCmsSections(privacySections)}<p><a href="${escapeHtml(socialUrls()[0] || '')}">Facebook</a> <a href="${escapeHtml(socialUrls()[1] || '')}">Instagram</a></p></main>`,
    schemas: [
      breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'นโยบายความเป็นส่วนตัว', path: '/privacy-policy' }]),
      webPageSchema('/privacy-policy', 'นโยบายความเป็นส่วนตัว', privacyMeta.description)
    ]
  },
  {
    route: '/terms-and-conditions',
    title: termsMeta.title,
    description: termsMeta.description,
    ogTitle: termsMeta.ogTitle,
    ogDescription: termsMeta.ogDescription,
    pageOgImage: termsMeta.ogImage,
    body: `<main><h1>${escapeHtml(termsContent.title || termsPage?.title || 'ข้อกำหนดและเงื่อนไขการใช้บริการ')}</h1><p>${escapeHtml(termsContent.intro || termsContent.body || termsMeta.description)}</p><nav aria-label="สารบัญข้อกำหนดและเงื่อนไขการใช้บริการ"><h2>สารบัญ</h2><ol>${termsSections.map((section) => `<li>${escapeHtml(section.title)}</li>`).join('')}</ol></nav>${renderCmsSections(termsSections)}<p><a href="/rental-conditions">อ่านเงื่อนไขการเช่า</a> <a href="/contact">ติดต่อเรา</a></p></main>`,
    schemas: [
      breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'ข้อกำหนดและเงื่อนไขการใช้บริการ', path: '/terms-and-conditions' }]),
      webPageSchema('/terms-and-conditions', 'ข้อกำหนดและเงื่อนไขการใช้บริการ', termsMeta.description)
    ]
  }
];

routes.push(...simpleRoutes);

for (const car of content.cars) {
  routes.push({
    route: `/cars/${car.slug}`,
    title: car.name,
    description: `${car.name} รถเช่าหาดใหญ่ ราคาเริ่มต้น ฿${Number(car.pricePerDay || 0).toLocaleString('th-TH')} ต่อวัน ${car.transmission || 'เกียร์อัตโนมัติ'} ${car.seats || 5} ที่นั่ง รับรถสนามบินหาดใหญ่ได้`,
    body: `<main><h1>${escapeHtml(car.name)}</h1><img src="${escapeHtml(car.image || car.coverImage || `/images/optimized/${car.slug}-600.webp`)}" alt="${escapeHtml(car.name)} รถเช่าหาดใหญ่ WWJ Car Rent" width="600" height="516" loading="eager" /><p>${escapeHtml(car.brand)} รถเช่าหาดใหญ่ ราคาเริ่มต้น ฿${Number(car.pricePerDay || 0).toLocaleString('th-TH')} ต่อวัน ${escapeHtml(transmissionLabel(car.transmission))} ${escapeHtml(car.seats || 5)} ที่นั่ง</p><a href="https://line.me/R/ti/p/@wwjcarrent">จองผ่าน LINE</a><a href="/availability">เช็กคิวรถ</a></main>`,
    schemas: [
      breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'รถเช่า', path: '/cars' }, { name: car.name, path: `/cars/${car.slug}` }]),
      productSchema(car)
    ]
  });
}

for (const post of content.blogPosts) {
  routes.push({
    route: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    body: `<main><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.description)}</p><p>ก่อนจองรถควรเตรียมวันรับรถ วันคืนรถ จำนวนผู้โดยสาร จุดรับรถ และเส้นทางที่ต้องการเดินทาง ทีมงาน WWJ Car Rent จะช่วยแนะนำรุ่นรถและเงื่อนไขที่เหมาะกับทริปของคุณ</p><a href="/cars">ดูรถเช่าทั้งหมด</a><a href="/rental-conditions">อ่านเงื่อนไขการเช่า</a></main>`,
    schemas: [breadcrumbSchema([{ name: 'หน้าแรก', path: '/' }, { name: 'บทความ', path: '/blog' }, { name: post.title, path: `/blog/${post.slug}` }])]
  });
}

for (const route of routes) {
  await writeRoute(route.route, renderPage(route));
}

console.log(`Generated static HTML from ${content.source} content for ${routes.length} routes.`);
