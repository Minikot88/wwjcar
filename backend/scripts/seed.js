import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';
import { pool } from '../src/db/pool.js';
import { carsRepository } from '../src/repositories/carsRepository.js';
import { faqsRepository } from '../src/repositories/faqsRepository.js';
import { pagesRepository } from '../src/repositories/pagesRepository.js';
import { rentalConditionsRepository } from '../src/repositories/rentalConditionsRepository.js';
import { reviewsRepository } from '../src/repositories/reviewsRepository.js';
import { settingsRepository } from '../src/repositories/settingsRepository.js';
import { usersRepository } from '../src/repositories/usersRepository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

const carSeed = [
  ['toyota-yaris', 'Toyota Yaris', 'Toyota', 900, 5, 2, true],
  ['toyota-new-yaris', 'Toyota New Yaris', 'Toyota', 1100, 5, 2, true],
  ['toyota-vios', 'Toyota Vios', 'Toyota', 900, 5, 2, true],
  ['toyota-new-vios', 'Toyota New Vios', 'Toyota', 1100, 5, 2, true],
  ['toyota-altis', 'Toyota Altis', 'Toyota', 1400, 5, 3, true],
  ['honda-brio', 'Honda Brio', 'Honda', 900, 5, 1, true],
  ['nissan-almera', 'Nissan Almera', 'Nissan', 1000, 5, 3, false],
  ['nissan-march', 'Nissan March', 'Nissan', 800, 5, 1, false],
  ['suzuki-swift', 'Suzuki Swift', 'Suzuki', 900, 5, 2, false],
  ['suzuki-ciaz', 'Suzuki Ciaz', 'Suzuki', 1000, 5, 3, false],
  ['mitsubishi-attrage', 'Mitsubishi Attrage', 'Mitsubishi', 900, 5, 2, false]
];

function guessFaqCategoryId(question, answer) {
  const text = `${question} ${answer}`;
  if (text.includes('เอกสาร') || text.includes('ใบขับขี่') || text.includes('พาสปอร์ต')) return 2;
  if (text.includes('รับรถ') || text.includes('สนามบิน')) return 3;
  if (text.includes('คืนรถ') || text.includes('น้ำมัน')) return 4;
  if (text.includes('ประกัน') || text.includes('อุบัติเหตุ')) return 5;
  if (text.includes('ต่างชาติ') || text.includes('มาเลเซีย') || text.includes('WhatsApp')) return 6;
  if (text.includes('เบตง') || text.includes('ปากบารา') || text.includes('ข้ามจังหวัด')) return 7;
  return 1;
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(rootDir, relativePath), 'utf8'));
}

async function seed() {
  const [cmsSeed, imageManifest, { faqItems }] = await Promise.all([
    readJson('src/data/cms/cmsSeed.json'),
    readJson('src/data/generated/imageManifest.json'),
    import('../../src/data/faqs.js')
  ]);

  const passwordHash = await bcrypt.hash(env.admin.password, 12);
  await usersRepository.upsertAdmin({
    name: env.admin.name,
    email: env.admin.email,
    passwordHash
  });

  for (const item of carSeed) {
    const [slug, name, brand, pricePerDay, seats, luggage, featured] = item;
    const existing = await carsRepository.findBySlug(slug, true);
    const payload = {
      slug,
      name,
      brand,
      image: imageManifest[slug]?.src || `/images/optimized/${slug}-320.webp`,
      coverImage: imageManifest[slug]?.src || `/images/optimized/${slug}-320.webp`,
      pricePerDay,
      transmission: 'Automatic',
      seats,
      fuel: 'Petrol',
      description: `${name} รถเช่าหาดใหญ่สำหรับรับรถสนามบิน เดินทางในเมือง และเดินทางต่างจังหวัด`,
      categories: featured ? ['รถยอดนิยม', 'รถเช่ารายเดือน'] : ['รถเช่ารายวัน', 'รถเช่ารายเดือน'],
      suitableFor: ['รับรถสนามบินหาดใหญ่', 'เดินทางในหาดใหญ่', 'เช่ารถรายวัน'],
      luggage,
      featured,
      airportPickup: true,
      monthlyRental: true,
      status: 'published',
      sortOrder: carSeed.findIndex((car) => car[0] === slug) + 1
    };

    if (existing) await carsRepository.update(existing.id, payload);
    else await carsRepository.create(payload);
  }

  for (const category of cmsSeed.faqCategories) {
    await faqsRepository.upsertCategory(category);
  }

  const existingFaqs = await faqsRepository.list(true);
  if (existingFaqs.length === 0) {
    for (const [index, item] of faqItems.entries()) {
      await faqsRepository.create({
        categoryId: guessFaqCategoryId(item.question, item.answer),
        question: item.question,
        answer: item.answer,
        sortOrder: index + 1,
        status: 'published'
      });
    }
  }

  for (const setting of cmsSeed.settings) {
    await settingsRepository.upsert(setting.key, setting.value);
  }

  const existingPages = await pagesRepository.list(true);
  for (const page of cmsSeed.pages) {
    const existingPage = existingPages.find((item) => item.slug === page.slug);
    if (existingPage) await pagesRepository.update(existingPage.id, page);
    else await pagesRepository.create(page);
  }

  if ((await rentalConditionsRepository.list()).length === 0) {
    for (const condition of cmsSeed.rentalConditions) {
      await rentalConditionsRepository.create(condition);
    }
  }

  if ((await reviewsRepository.list(true)).length === 0) {
    for (const review of cmsSeed.reviews) {
      await reviewsRepository.create(review);
    }
  }

  await pool.end();
  console.log('Seed complete');
}

seed().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
