import { contactConfig } from '../../config/contact.js';
import { siteConfig } from '../../config/site.js';

const sameAs = [
  contactConfig.facebookUrl,
  contactConfig.instagramUrl,
  'https://www.google.com/search?q=WWJ+Car+Rent+Hat+Yai',
  'https://www.google.com/search?q=Hat+Yai+Airport+Car+Rental'
].filter(Boolean);

export const localEntities = [
  { '@type': 'Place', name: 'Hat Yai', alternateName: 'หาดใหญ่' },
  { '@type': 'Place', name: 'Hat Yai Airport', alternateName: 'สนามบินหาดใหญ่' },
  { '@type': 'Place', name: 'Songkhla', alternateName: 'สงขลา' },
  { '@type': 'Service', name: 'Car Rental', alternateName: 'รถเช่า' },
  { '@type': 'Service', name: 'Airport Pickup', alternateName: 'รับรถสนามบิน' },
  { '@type': 'Service', name: 'Monthly Car Rental', alternateName: 'รถเช่ารายเดือน' }
];

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

export function createLocalBusinessSchema(options = {}) {
  const schemaSameAs = options.sameAs?.filter(Boolean)?.length ? options.sameAs.filter(Boolean) : sameAs;

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'AutoRental'],
    '@id': `${siteConfig.siteUrl}/#localbusiness`,
    name: siteConfig.name,
    alternateName: ['WWJ Car', 'WWJ Car Rent Hat Yai', 'รถเช่าหาดใหญ่ WWJ Car Rent'],
    image: `${siteConfig.siteUrl}${siteConfig.defaultOgImage}`,
    url: siteConfig.siteUrl,
    telephone: contactConfig.phone,
    email: contactConfig.email,
    priceRange: '฿฿',
    sameAs: schemaSameAs,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hat Yai',
      addressRegion: 'Songkhla',
      addressCountry: 'TH'
    },
    areaServed: ['Hat Yai', 'Hat Yai International Airport', 'Songkhla', 'Betong', 'Pak Bara'],
    knowsAbout: [
      'รถเช่าหาดใหญ่',
      'รถเช่าสนามบินหาดใหญ่',
      'รถเช่าสงขลา',
      'รถเช่ารายวันหาดใหญ่',
      'รถเช่ารายเดือนหาดใหญ่',
      'Hat Yai Airport Car Rental'
    ],
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'รถเช่าหาดใหญ่' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'รถเช่าสนามบินหาดใหญ่' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'รถเช่ารายเดือนหาดใหญ่' } }
    ],
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
        reviewBody: 'จองง่าย รับรถสะดวก รถสะอาด เหมาะกับทริปหาดใหญ่'
      }
    ],
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

export function createOrganizationSchema(options = {}) {
  const schemaSameAs = options.sameAs?.filter(Boolean)?.length ? options.sameAs.filter(Boolean) : sameAs;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/images/optimized/logo-320.webp`,
    sameAs: schemaSameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contactConfig.phone,
      contactType: 'customer service',
      areaServed: 'TH',
      availableLanguage: ['Thai', 'English', 'Malay']
    }
  };
}

export function createWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.siteUrl}/#website`,
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    inLanguage: 'th-TH',
    publisher: {
      '@id': `${siteConfig.siteUrl}/#organization`
    },
    about: localEntities,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.siteUrl}/cars?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function createWebPageSchema({ path, name, description }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteConfig.siteUrl}${path}#webpage`,
    url: `${siteConfig.siteUrl}${path}`,
    name,
    description,
    inLanguage: 'th-TH',
    isPartOf: {
      '@id': `${siteConfig.siteUrl}/#website`
    },
    publisher: {
      '@id': `${siteConfig.siteUrl}/#organization`
    }
  };
}

export function createLocalSeoGraph() {
  return [createOrganizationSchema(), createWebsiteSchema(), createLocalBusinessSchema()];
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
