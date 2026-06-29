import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import { useParams } from 'react-router';
import InternalLinkCluster from '../components/seo/InternalLinkCluster.jsx';
import Seo from '../components/seo/Seo.jsx';
import CarBreadcrumbs from '../features/cars/CarBreadcrumbs.jsx';
import CarAvailabilityCalendar from '../features/cars/CarAvailabilityCalendar.jsx';
import CarDetailHero from '../features/cars/CarDetailHero.jsx';
import RelatedCars from '../features/cars/RelatedCars.jsx';
import { createCarProductSchema, createCarsBreadcrumbSchema } from '../features/cars/carSchemas.js';
import { getCarBySlug, getTransmissionLabel } from '../features/cars/carUtils.js';
import PageLoader from '../components/loading/PageLoader.jsx';
import { useCmsResource } from '../hooks/useCmsResource.js';
import { cmsService } from '../services/cmsService.js';
import { colors } from '../theme/colors.js';
import { contactActions, externalLinkProps } from '../utils/contactActions.js';
import NotFound from './NotFound.jsx';

export default function CarDetail() {
  const { slug } = useParams();
  const staticCar = getCarBySlug(slug);
  const { data: car, isLoading } = useCmsResource(() => cmsService.getCar(slug), staticCar, [slug]);

  if (!car && isLoading) {
    return <PageLoader />;
  }

  if (!car) {
    return <NotFound />;
  }

  const description = `${car.name} รถเช่าหาดใหญ่ ราคาเริ่มต้น ฿${car.pricePerDay} ต่อวัน ${getTransmissionLabel(car.transmission)} ${car.seats} ที่นั่ง ตรวจสอบคิวรถและวันว่างกับ WWJ Car Rent`;

  return (
    <>
      <Seo
        title={car.name}
        description={description}
        canonical={`/cars/${car.slug}`}
        ogTitle={`${car.name} | WWJ Car Rent`}
        ogDescription={description}
        ogImage={car.image}
        schema={[createCarsBreadcrumbSchema(car), createCarProductSchema(car)]}
      />

      <Stack spacing={{ xs: 5, md: 8 }}>
        <CarBreadcrumbs car={car} />
        <CarDetailHero car={car} />
        <CarAvailabilityCalendar car={car} />
        <CarRentalDecisionSection car={car} />
        <RelatedCars car={car} />
        <InternalLinkCluster
          title={`ข้อมูลเพิ่มเติมก่อนเช่า ${car.name}`}
          description="อ่านเงื่อนไขการเช่า คำถามที่พบบ่อย และตัวเลือกเช่ารายเดือนหรือรถเช่าสำหรับลูกค้ามาเลเซียก่อนติดต่อทีมงาน"
        />
      </Stack>
    </>
  );
}

function CarRentalDecisionSection({ car }) {
  const details = [
    { title: 'เหมาะสำหรับ', value: car.suitableFor?.join(' · ') || 'เดินทางในหาดใหญ่และจังหวัดใกล้เคียง' },
    { title: 'จำนวนผู้โดยสาร', value: `${car.seats} ที่นั่ง` },
    { title: 'สัมภาระ', value: `ประมาณ ${car.luggage || 2} ใบ` },
    { title: 'รับรถสนามบิน', value: 'นัดรับรถที่สนามบินหาดใหญ่ได้' },
    { title: 'เอกสารที่ใช้', value: 'บัตรประชาชนหรือพาสปอร์ต พร้อมใบขับขี่ตัวจริง' },
    { title: 'เงินมัดจำ', value: 'แจ้งยอดชัดเจนก่อนยืนยันการเช่า ตามรุ่นรถและระยะเวลาเช่า' }
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' }, gap: { xs: 4, md: 6 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
        {details.map((item) => (
          <Box key={item.title} sx={{ bgcolor: 'background.paper', border: `1px solid ${colors.hairlineSoft}`, borderRadius: '22px', boxShadow: colors.shadowSoft, p: 3 }}>
            <Typography variant="caption" color="primary">
              {item.title}
            </Typography>
            <Typography component="h2" variant="h3" sx={{ mt: 1 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Stack spacing={3} sx={{ bgcolor: 'background.paper', border: `1px solid ${colors.hairlineSoft}`, borderRadius: '28px', boxShadow: colors.shadowMedium, p: { xs: 3, md: 4 }, alignSelf: 'start', position: { lg: 'sticky' }, top: { lg: 104 } }}>
        <Box>
          <Typography variant="caption" color="primary">
            สรุปเงื่อนไขก่อนเช่า
          </Typography>
          <Typography component="h2" variant="h3" sx={{ mt: 1 }}>
            ตรวจรถก่อนรับ คืนตามเวลานัด และเติมน้ำมันตามระดับเดิม
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            หากต้องการขับข้ามจังหวัด ไปเบตง ปากบารา หรือเช่ารายเดือน กรุณาแจ้งเส้นทางก่อนเช่าเพื่อให้ทีมงานแนะนำรุ่นรถและเงื่อนไขที่เหมาะสม
          </Typography>
        </Box>
        <Stack spacing={1.5}>
          <Button component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} variant="contained" aria-label={`สอบถาม ${car.name} ผ่าน LINE`}>
            สอบถามผ่าน LINE
          </Button>
          <Button component="a" href={contactActions.phone.href} variant="outlined" aria-label={contactActions.phone.ariaLabel}>
            โทรสอบถาม
          </Button>
          <Button component={Link} to="/monthly-car-rental" variant="outlined">
            สอบถามเช่ารายเดือน
          </Button>
          <Button component={Link} to="/rental-conditions" variant="text">
            อ่านเงื่อนไขการเช่า
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
