import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const envPath = resolve(root, '.env');

const fallbackCars = [
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
].map(([slug, name, brand, pricePerDay, seats]) => ({
  id: slug,
  slug,
  name,
  brand,
  pricePerDay,
  seats,
  transmission: 'Automatic',
  fuel: 'Petrol',
  image: `/images/optimized/${slug}-600.webp`
}));

const fallbackBlogPosts = [
  {
    slug: 'hat-yai-airport-car-rental',
    title: 'เช่ารถสนามบินหาดใหญ่ต้องเตรียมอะไรบ้าง',
    description: 'เอกสาร จุดนัดรับรถ และวิธีจองรถเช่าสนามบินหาดใหญ่กับ WWJ Car Rent'
  },
  {
    slug: 'hat-yai-driving-guide',
    title: 'ขับรถเที่ยวหาดใหญ่แบบสบายใจ',
    description: 'คู่มือเลือกเช่ารถหาดใหญ่สำหรับเที่ยวในเมือง สนามบิน และจังหวัดใกล้เคียง'
  },
  {
    slug: 'monthly-car-rental-hat-yai',
    title: 'เช่ารถรายเดือนหาดใหญ่เหมาะกับใคร',
    description: 'ข้อมูลรถเช่ารายเดือนหาดใหญ่สำหรับทำงานและเดินทางระยะยาว'
  },
  {
    slug: 'hat-yai-to-betong-car-rental',
    title: 'เช่ารถจากหาดใหญ่ไปเบตงควรรู้อะไร',
    description: 'ข้อควรรู้ก่อนเช่ารถหาดใหญ่ไปเบตงและการเดินทางข้ามจังหวัด'
  },
  {
    slug: 'hat-yai-to-pak-bara-car-rental',
    title: 'เช่ารถหาดใหญ่ไปปากบารา วางแผนอย่างไร',
    description: 'คำแนะนำการเลือกรถและวางแผนเส้นทางจากหาดใหญ่ไปปากบารา'
  },
  {
    slug: 'malaysian-tourist-car-rental-hat-yai',
    title: 'รถเช่าหาดใหญ่สำหรับนักท่องเที่ยวมาเลเซีย',
    description: 'เอกสารและช่องทางติดต่อสำหรับลูกค้ามาเลเซียที่ต้องการเช่ารถในหาดใหญ่'
  }
];

const fallbackFaqs = [
  {
    question: 'เช่ารถหาดใหญ่ต้องใช้เอกสารอะไรบ้าง',
    answer: 'ใช้บัตรประชาชนหรือพาสปอร์ต ใบขับขี่ตัวจริง และข้อมูลติดต่อของผู้เช่า'
  },
  {
    question: 'รับรถที่สนามบินหาดใหญ่ได้ไหม',
    answer: 'สามารถนัดรับรถที่สนามบินหาดใหญ่ได้ โดยแจ้งวัน เวลา และเที่ยวบินล่วงหน้า'
  },
  {
    question: 'จองรถผ่าน LINE ได้ไหม',
    answer: 'สามารถติดต่อและจองรถผ่าน LINE ได้โดยตรง ทีมงานจะช่วยเช็กคิวรถให้'
  }
];

const fallbackRentalConditions = [
  { sectionKey: 'documents', title: 'เอกสารที่ใช้', content: ['บัตรประชาชนหรือพาสปอร์ต', 'ใบขับขี่ตัวจริง', 'ข้อมูลติดต่อผู้เช่า'] },
  { sectionKey: 'deposit', title: 'เงินมัดจำ', content: ['แจ้งยอดชัดเจนก่อนยืนยันการจอง', 'คืนตามเงื่อนไขหลังตรวจรับรถ'] },
  { sectionKey: 'fuel', title: 'นโยบายน้ำมัน', content: ['รับรถน้ำมันระดับใด คืนระดับเดียวกัน'] }
];

function stripTrailingSlash(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, '');
}

async function readEnvFile() {
  try {
    return await readFile(envPath, 'utf8');
  } catch {
    return '';
  }
}

function readEnvValue(envText, key, fallback = '') {
  if (process.env[key]) return process.env[key];
  const match = envText.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match?.[1] || fallback;
}

async function fetchJson(apiBaseUrl, path) {
  if (!apiBaseUrl) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { signal: controller.signal });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function asArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeSettings(settings) {
  return asArray(settings).reduce((accumulator, setting) => {
    accumulator[setting.key] = setting.value || {};
    return accumulator;
  }, {});
}

async function loadLocalBlogPosts() {
  try {
    const module = await import('../src/data/blog.js');
    return asArray(module.blogPosts).map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description
    }));
  } catch {
    return fallbackBlogPosts;
  }
}

export async function loadCmsContent() {
  const envText = await readEnvFile();
  const siteUrl = stripTrailingSlash(
    readEnvValue(envText, 'VITE_CANONICAL_URL')
    || readEnvValue(envText, 'VITE_SITE_URL')
    || 'http://localhost:5180'
  );
  const apiBaseUrl = stripTrailingSlash(readEnvValue(envText, 'VITE_API_BASE_URL', ''));

  const [
    cars,
    faqs,
    faqCategories,
    settings,
    pages,
    rentalConditions,
    reviews,
    blogPosts
  ] = await Promise.all([
    fetchJson(apiBaseUrl, '/cars'),
    fetchJson(apiBaseUrl, '/faqs'),
    fetchJson(apiBaseUrl, '/faq-categories'),
    fetchJson(apiBaseUrl, '/settings'),
    fetchJson(apiBaseUrl, '/pages'),
    fetchJson(apiBaseUrl, '/rental-conditions'),
    fetchJson(apiBaseUrl, '/reviews'),
    loadLocalBlogPosts()
  ]);

  return {
    source: cars || settings || pages ? 'api' : 'fallback',
    siteUrl,
    apiBaseUrl,
    cars: asArray(cars, fallbackCars),
    faqs: asArray(faqs, fallbackFaqs),
    faqCategories: asArray(faqCategories),
    settings: normalizeSettings(settings),
    pages: asArray(pages),
    rentalConditions: asArray(rentalConditions, fallbackRentalConditions),
    reviews: asArray(reviews),
    blogPosts: asArray(blogPosts, fallbackBlogPosts)
  };
}

