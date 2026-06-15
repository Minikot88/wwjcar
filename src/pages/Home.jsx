import Seo from '../components/seo/Seo.jsx';
import { createLocalSeoGraph } from '../features/seo/schemas.js';
import FaqPreviewSection from '../features/home/FaqPreviewSection.jsx';
import FeaturedCarsSection from '../features/home/FeaturedCarsSection.jsx';
import HomeCtaSection from '../features/home/HomeCtaSection.jsx';
import HomeHero from '../features/home/HomeHero.jsx';
import RentalProcessSection from '../features/home/RentalProcessSection.jsx';
import WhyChooseSection from '../features/home/WhyChooseSection.jsx';
import { preloadImageHref } from '../utils/imageAssets.js';

export default function Home() {
  return (
    <>
      <Seo
        title="รถเช่าหาดใหญ่"
        description="รถเช่าหาดใหญ่ WWJ Car Rent บริการรถเช่าราคาดี รับรถสนามบินหาดใหญ่ รถใหม่ สะอาด จองง่ายผ่าน LINE พร้อมบริการ 24 ชั่วโมง"
        canonical="/"
        ogTitle="รถเช่าหาดใหญ่ | WWJ Car Rent"
        ogDescription="เช่ารถหาดใหญ่ราคาดี รับรถสนามบินหาดใหญ่ รถใหม่ สะอาด จองง่ายผ่าน LINE"
        preloadImage={preloadImageHref('home-hero')}
        schema={createLocalSeoGraph()}
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
