import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const outputDir = path.join(root, 'public', 'images', 'optimized');
const manifestDir = path.join(root, 'src', 'data', 'generated');
const manifestPath = path.join(manifestDir, 'imageManifest.json');

const imageJobs = [
  {
    key: 'toyota-yaris',
    source: 'photo/yaris.webp',
    alt: 'Toyota Yaris รถเช่าหาดใหญ่ WWJ Car Rent',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'toyota-new-yaris',
    source: 'photo/new-yaris.webp',
    alt: 'Toyota New Yaris รถเช่าหาดใหญ่รายวัน WWJ Car Rent',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'toyota-vios',
    source: 'photo/vios.webp',
    alt: 'Toyota Vios รถเช่าสนามบินหาดใหญ่',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'toyota-new-vios',
    source: 'photo/new-vios.webp',
    alt: 'Toyota New Vios รถเช่าสงขลาและสนามบินหาดใหญ่',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'toyota-altis',
    source: 'photo/new-altis.webp',
    alt: 'Toyota Altis รถเช่าหาดใหญ่สำหรับครอบครัว',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'honda-brio',
    source: 'photo/brio.webp',
    alt: 'Honda Brio รถเช่ารายวันหาดใหญ่',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'nissan-almera',
    source: 'photo/almera.webp',
    alt: 'Nissan Almera รถเช่าหาดใหญ่รายวัน',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'nissan-march',
    source: 'photo/march.webp',
    alt: 'Nissan March รถเช่าประหยัดหาดใหญ่',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'suzuki-swift',
    source: 'photo/swift.webp',
    alt: 'Suzuki Swift รถเช่าหาดใหญ่ WWJ Car Rent',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'suzuki-ciaz',
    source: 'photo/ciaz.webp',
    alt: 'Suzuki Ciaz รถเช่าสงขลาและหาดใหญ่',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'mitsubishi-attrage',
    source: 'photo/attage.webp',
    alt: 'Mitsubishi Attrage รถเช่ารายเดือนหาดใหญ่',
    widths: [320, 640, 960, 1280]
  },
  {
    key: 'home-hero',
    source: 'photo/wwj-carrent.webp',
    alt: 'รถเช่าหาดใหญ่ WWJ Car Rent รับรถสนามบินหาดใหญ่',
    widths: [640, 960, 1280, 1600]
  },
  {
    key: 'identity-card',
    source: 'photo/บัตรประชาชน.webp',
    alt: 'เอกสารบัตรประชาชนสำหรับเช่ารถหาดใหญ่ WWJ Car Rent',
    widths: [320, 640, 960]
  },
  {
    key: 'logo',
    source: 'public/images/brand/logo.png',
    alt: 'WWJ Car Rent Hat Yai logo',
    widths: [96, 160, 320]
  }
];

function publicPath(fileName) {
  return `/images/optimized/${fileName}`;
}

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(manifestDir, { recursive: true });

const manifest = {};

for (const job of imageJobs) {
  const sourcePath = path.join(root, job.source);
  const sourceImage = sharp(sourcePath);
  const metadata = await sourceImage.metadata();
  const widths = [...new Set([
    ...job.widths.filter((width) => !metadata.width || width <= metadata.width || job.key === 'logo'),
    ...(metadata.width ? [metadata.width] : [])
  ])].sort((a, b) => a - b);
  const variants = [];

  for (const width of widths) {
    const fileName = `${job.key}-${width}.webp`;
    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: job.key !== 'logo' })
      .webp({ quality: width <= 320 ? 72 : 80, effort: 6 })
      .toFile(path.join(outputDir, fileName));
    variants.push({ width, src: publicPath(fileName) });
  }

  const thumbFile = `${job.key}-thumb.webp`;
  await sharp(sourcePath)
    .resize({ width: 240, height: 160, fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 })
    .toFile(path.join(outputDir, thumbFile));

  const defaultVariant = variants[Math.min(variants.length - 1, Math.max(0, variants.findIndex((item) => item.width >= 960)))];
  manifest[job.key] = {
    alt: job.alt,
    src: defaultVariant?.src || variants.at(-1)?.src || publicPath(thumbFile),
    thumbnail: publicPath(thumbFile),
    width: metadata.width || null,
    height: metadata.height || null,
    srcSet: variants.map((item) => `${item.src} ${item.width}w`).join(', '),
    sizes: job.key === 'home-hero'
      ? '(max-width: 900px) 100vw, 52vw'
      : '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw',
    variants
  };
}

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated ${Object.keys(manifest).length} optimized image entries.`);
