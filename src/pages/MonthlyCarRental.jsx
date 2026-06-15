import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { cars } from '../data/cars.js';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';
import { contactActions, externalLinkProps } from '../utils/contactActions.js';

const benefits = [
  'เหมาะสำหรับทำงานในหาดใหญ่หรือสงขลาหลายสัปดาห์',
  'มีรถประหยัดและรถครอบครัวให้เลือกตามงบประมาณ',
  'แจ้งเงื่อนไข เงินมัดจำ และรอบชำระก่อนยืนยัน',
  'นัดรับรถที่สนามบินหาดใหญ่หรือในตัวเมืองได้'
];

export default function MonthlyCarRental() {
  const monthlyCars = cars.filter((car) => car.categories?.includes('รถเช่ารายเดือน'));

  return (
    <>
      <Seo
        title="รถเช่ารายเดือนหาดใหญ่"
        description="รถเช่ารายเดือนหาดใหญ่ WWJ Car Rent สำหรับทำงาน ท่องเที่ยวระยะยาว และลูกค้าที่ต้องใช้รถหลายสัปดาห์ สอบถามราคาเดือนผ่าน LINE"
        canonical="/monthly-car-rental"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'รถเช่ารายเดือน', path: '/monthly-car-rental' }
        ])}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="เช่ารายเดือน"
          title="รถเช่ารายเดือนหาดใหญ่"
          description="ตัวเลือกสำหรับลูกค้าที่ต้องใช้รถต่อเนื่องหลายสัปดาห์หรือหลายเดือน พร้อมเงื่อนไขที่แจ้งก่อนจอง"
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: { xs: 4, md: 6 } }}>
          <Stack spacing={3} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 5 } }}>
            <Typography component="h2" variant="h2">
              เหมาะกับใคร
            </Typography>
            <Stack component="ul" spacing={1.5} sx={{ pl: 2.5, color: colors.body }}>
              {benefits.map((item) => (
                <Typography component="li" key={item}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Stack>

          <Stack spacing={2} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 }, alignSelf: 'start' }}>
            <Typography component="h2" variant="h3">
              ขอราคาเช่ารายเดือน
            </Typography>
            <Typography color="text.secondary">
              ส่งวันที่เริ่มเช่า ระยะเวลาที่ต้องใช้รถ รุ่นรถที่สนใจ และจุดรับรถให้ทีมงานเช็กแพ็กเกจที่เหมาะสม
            </Typography>
            <Button component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} variant="contained">
              สอบถามผ่าน LINE
            </Button>
            <Button component="a" href={contactActions.phone.href} variant="outlined">
              โทรสอบถาม
            </Button>
          </Stack>
        </Box>

        <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
          <Typography component="h2" variant="h2">
            รุ่นที่เหมาะกับการเช่ารายเดือน
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 3 }}>
            {monthlyCars.slice(0, 6).map((car) => (
              <Box key={car.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, borderTop: `1px solid ${colors.hairlineSoft}`, pt: 2 }}>
                <Typography>{car.name}</Typography>
                <Typography color="primary">เริ่มต้น ฿{new Intl.NumberFormat('th-TH').format(car.pricePerDay)} / วัน</Typography>
              </Box>
            ))}
          </Stack>
          <Button component={Link} to="/cars" variant="text" sx={{ mt: 3 }}>
            ดูรถทั้งหมด
          </Button>
        </Box>
      </Stack>
    </>
  );
}
