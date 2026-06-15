export const blogCategories = [
  { slug: 'hat-yai-travel', name: 'ท่องเที่ยวหาดใหญ่' },
  { slug: 'hat-yai-airport', name: 'สนามบินหาดใหญ่' },
  { slug: 'betong', name: 'เบตง' },
  { slug: 'pak-bara', name: 'ปากบารา' },
  { slug: 'car-rental', name: 'รถเช่า' },
  { slug: 'songkhla-travel', name: 'เที่ยวสงขลา' },
  { slug: 'malaysia-travel', name: 'Malaysia Travel' }
];

export const blogPosts = [
  {
    slug: 'hat-yai-airport-car-rental',
    category: 'hat-yai-airport',
    title: 'เช่ารถสนามบินหาดใหญ่ต้องเตรียมอะไรบ้าง',
    description: 'แนวทางเตรียมเอกสาร เวลา และจุดนัดรับรถสำหรับลูกค้าที่เดินทางมาถึงสนามบินหาดใหญ่',
    keywords: ['รถเช่าสนามบินหาดใหญ่', 'รถเช่าใกล้สนามบินหาดใหญ่', 'Hat Yai Airport Car Rental']
  },
  {
    slug: 'hat-yai-driving-guide',
    category: 'hat-yai-travel',
    title: 'ขับรถเที่ยวหาดใหญ่แบบสบายใจ',
    description: 'คำแนะนำสำหรับการเลือกรถและวางแผนเดินทางในหาดใหญ่และพื้นที่ใกล้เคียง',
    keywords: ['รถเช่าหาดใหญ่', 'รถเช่ารายวันหาดใหญ่', 'Car Rental Hat Yai']
  },
  {
    slug: 'monthly-car-rental-hat-yai',
    category: 'car-rental',
    title: 'เช่ารถรายเดือนหาดใหญ่เหมาะกับใคร',
    description: 'สรุปสถานการณ์ที่เหมาะกับการเช่ารถรายเดือนในหาดใหญ่ สงขลา และการใช้งานระยะยาว',
    keywords: ['รถเช่ารายเดือนหาดใหญ่', 'รถเช่าสงขลา']
  },
  {
    slug: 'hat-yai-to-betong-car-rental',
    category: 'betong',
    title: 'เช่ารถจากหาดใหญ่ไปเบตงควรรู้อะไร',
    description: 'ข้อมูลเบื้องต้นสำหรับลูกค้าที่วางแผนเช่ารถขับจากหาดใหญ่ไปเบตง พร้อมข้อควรแจ้งก่อนจอง',
    keywords: ['รถเช่าไปเบตง', 'รถเช่าหาดใหญ่']
  },
  {
    slug: 'hat-yai-to-pak-bara-car-rental',
    category: 'pak-bara',
    title: 'เช่ารถหาดใหญ่ไปปากบารา วางแผนอย่างไร',
    description: 'คำแนะนำการเลือกรถและแจ้งเส้นทางสำหรับลูกค้าที่เดินทางจากหาดใหญ่ไปปากบารา',
    keywords: ['รถเช่าไปปากบารา', 'รถเช่าสงขลา']
  },
  {
    slug: 'malaysian-tourist-car-rental-hat-yai',
    category: 'malaysia-travel',
    title: 'รถเช่าหาดใหญ่สำหรับนักท่องเที่ยวมาเลเซีย',
    description: 'เอกสาร ช่องทางติดต่อ และข้อควรรู้สำหรับนักท่องเที่ยวมาเลเซียที่ต้องการเช่ารถในหาดใหญ่',
    keywords: ['รถเช่าสำหรับนักท่องเที่ยวมาเลเซีย', 'Car Rental Hat Yai', 'WWJ Car Rent']
  }
];

export function getBlogPostBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogCategoryName(slug) {
  return blogCategories.find((category) => category.slug === slug)?.name || 'รถเช่า';
}
