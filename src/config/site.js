import { APP_NAME, SITE_URL } from './env.js';

export const siteConfig = {
  name: APP_NAME,
  description: 'รถเช่าหาดใหญ่ ราคาดี รับรถสนามบิน จองง่ายผ่าน LINE พร้อมบริการดูแลลูกค้า 24 ชั่วโมง',
  siteUrl: SITE_URL,
  defaultOgImage: '/images/optimized/home-hero-600.webp'
};

export const navigationItems = [
  {
    label: 'หน้าแรก',
    href: '/'
  },
  {
    label: 'รถเช่า',
    href: '/cars'
  },
  {
    label: 'เช่ารายเดือน',
    href: '/monthly-car-rental'
  },
  {
    label: 'เงื่อนไขการเช่า',
    href: '/rental-conditions'
  },
  {
    label: 'วิธีเช่ารถ',
    href: '/how-to-rent'
  },
  {
    label: 'คำถามที่พบบ่อย',
    href: '/faq'
  }
];

export const secondaryNavigationItems = [
  {
    label: 'ติดต่อเรา',
    href: '/contact'
  },
  {
    label: 'เกี่ยวกับเรา',
    href: '/about-us'
  }
];
