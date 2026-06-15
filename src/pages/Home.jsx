import Seo from '../components/seo/Seo.jsx';
import { siteConfig } from '../config/site.js';
import FaqPreviewSection from '../features/home/FaqPreviewSection.jsx';
import FeaturedCarsSection from '../features/home/FeaturedCarsSection.jsx';
import HomeCtaSection from '../features/home/HomeCtaSection.jsx';
import HomeHero from '../features/home/HomeHero.jsx';
import RentalProcessSection from '../features/home/RentalProcessSection.jsx';
import WhyChooseSection from '../features/home/WhyChooseSection.jsx';

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'WWJ Car Rent',
  image: `${siteConfig.siteUrl}/photo/wwj-carrent.webp`,
  url: siteConfig.siteUrl,
  description: 'รถเช่าหาดใหญ่ บริการรับรถสนามบินหาดใหญ่ รถใหม่ สะอาด จองง่ายผ่าน LINE',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hat Yai',
    addressRegion: 'Songkhla',
    addressCountry: 'TH'
  },
  areaServed: ['Hat Yai', 'Hat Yai International Airport', 'Songkhla'],
  priceRange: '฿฿'
};

export default function Home() {
  return (
    <>
      <Seo
        title="รถเช่าหาดใหญ่"
        description="รถเช่าหาดใหญ่ WWJ Car Rent บริการรถเช่าราคาดี รับรถสนามบินหาดใหญ่ รถใหม่ สะอาด จองง่ายผ่าน LINE พร้อมบริการ 24 ชั่วโมง"
        canonical="/"
        ogTitle="รถเช่าหาดใหญ่ | WWJ Car Rent"
        ogDescription="เช่ารถหาดใหญ่ราคาดี รับรถสนามบินหาดใหญ่ รถใหม่ สะอาด จองง่ายผ่าน LINE"
        schema={localBusinessSchema}
      />
      <HomeHero />
      <FeaturedCarsSection />
      <WhyChooseSection />
      <RentalProcessSection />
      <FaqPreviewSection />
      <HomeCtaSection />
    </>
  );
}
