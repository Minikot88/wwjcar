import { contactConfig } from '../../config/contact.js';
import { siteConfig } from '../../config/site.js';

export function createBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.siteUrl}${item.path}`
    }))
  };
}

export function createLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    image: `${siteConfig.siteUrl}${siteConfig.defaultOgImage}`,
    url: siteConfig.siteUrl,
    telephone: contactConfig.phone,
    email: contactConfig.email,
    priceRange: '฿฿',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hat Yai',
      addressRegion: 'Songkhla',
      addressCountry: 'TH'
    },
    areaServed: ['Hat Yai', 'Hat Yai International Airport', 'Songkhla'],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59'
      }
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: contactConfig.phone,
        contactType: 'customer service',
        areaServed: 'TH',
        availableLanguage: ['Thai', 'English']
      }
    ]
  };
}

export function createFaqSchema(items) {
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
