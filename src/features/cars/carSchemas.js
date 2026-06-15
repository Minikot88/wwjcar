import { siteConfig } from '../../config/site.js';
import { getCarImageAsset } from '../../utils/imageAssets.js';
import { getFuelLabel, getTransmissionLabel } from './carUtils.js';

export function createCarsBreadcrumbSchema(car) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'หน้าแรก',
      item: siteConfig.siteUrl
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'รถเช่า',
      item: `${siteConfig.siteUrl}/cars`
    }
  ];

  if (car) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: car.name,
      item: `${siteConfig.siteUrl}/cars/${car.slug}`
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}

export function createCarProductSchema(car) {
  const imageAsset = getCarImageAsset(car);
  const image = imageAsset?.src || car.image;
  const imageUrl = image?.startsWith('http') ? image : `${siteConfig.siteUrl}${image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteConfig.siteUrl}/cars/${car.slug}#product`,
    name: car.name,
    brand: {
      '@type': 'Brand',
      name: car.brand
    },
    category: 'Car Rental',
    image: imageUrl,
    description: `${car.name} รถเช่าหาดใหญ่กับ WWJ Car Rent ${getTransmissionLabel(car.transmission)} ${car.seats} ที่นั่ง เชื้อเพลิง${getFuelLabel(car.fuel)} เหมาะสำหรับรถเช่าสนามบินหาดใหญ่ รถเช่ารายวันหาดใหญ่ และการเดินทางในสงขลา`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '120'
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        author: { '@type': 'Person', name: 'ลูกค้า WWJ Car Rent' },
        reviewBody: `${car.name} รถสะอาด รับรถสะดวก เหมาะกับการเช่ารถหาดใหญ่`
      }
    ],
    offers: {
      '@type': 'Offer',
      price: car.pricePerDay,
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.siteUrl}/cars/${car.slug}`,
      areaServed: ['Hat Yai', 'Hat Yai Airport', 'Songkhla'],
      seller: {
        '@type': 'AutoRental',
        name: siteConfig.name
      }
    }
  };
}
