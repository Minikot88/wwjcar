import { siteConfig } from '../../config/site.js';
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.name,
    brand: {
      '@type': 'Brand',
      name: car.brand
    },
    image: car.image,
    description: `${car.name} รถเช่าหาดใหญ่กับ WWJ Car Rent ${getTransmissionLabel(car.transmission)} ${car.seats} ที่นั่ง เชื้อเพลิง${getFuelLabel(car.fuel)}`,
    offers: {
      '@type': 'Offer',
      price: car.pricePerDay,
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.siteUrl}/cars/${car.slug}`,
      seller: {
        '@type': 'LocalBusiness',
        name: siteConfig.name
      }
    }
  };
}
