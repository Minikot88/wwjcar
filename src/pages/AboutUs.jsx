import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import InternalLinkCluster from '../components/seo/InternalLinkCluster.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema, createLocalBusinessSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';
import { contactActions, externalLinkProps } from '../utils/contactActions.js';

const values = [
  'แจ้งราคาและเงื่อนไขก่อนจอง',
  'ดูแลรถให้สะอาดพร้อมใช้งาน',
  'นัดรับรถสนามบินหาดใหญ่ได้',
  'ติดต่อทีมงานได้รวดเร็วผ่าน LINE โทรศัพท์ และ WhatsApp'
];

const serviceAreas = ['สนามบินหาดใหญ่', 'ตัวเมืองหาดใหญ่', 'สงขลา', 'เส้นทางไปเบตง', 'เส้นทางไปปากบารา', 'จังหวัดใกล้เคียงตามเงื่อนไข'];

export default function AboutUs() {
  return (
    <>
      <Seo
        title="เกี่ยวกับ WWJ Car Rent"
        description="รู้จัก WWJ Car Rent บริการรถเช่าหาดใหญ่ รับรถสนามบินหาดใหญ่ ดูแลลูกค้ารายวัน รายเดือน และนักท่องเที่ยวมาเลเซีย"
        canonical="/about-us"
        schema={[
          createBreadcrumbSchema([
            { name: 'หน้าแรก', path: '/' },
            { name: 'เกี่ยวกับเรา', path: '/about-us' }
          ]),
          createLocalBusinessSchema()
        ]}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="เกี่ยวกับ WWJ"
          title="บริการรถเช่าหาดใหญ่ที่เน้นความชัดเจนและความสบายใจ"
          description="WWJ Car Rent ให้บริการรถเช่าสำหรับนักท่องเที่ยว ลูกค้าสนามบิน ลูกค้าเช่ารายวัน และลูกค้าเช่ารายเดือนในหาดใหญ่"
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: { xs: 4, md: 6 } }}>
          <Stack spacing={3} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 5 } }}>
            <Typography component="h2" variant="h2">
              เรื่องราวของเรา
            </Typography>
            <Typography color="text.secondary">
              WWJ Car Rent เริ่มจากความตั้งใจให้การเช่ารถในหาดใหญ่เป็นเรื่องง่ายสำหรับคนที่เดินทางมาถึงสนามบิน
              นักท่องเที่ยวที่ต้องการเที่ยวภาคใต้ และลูกค้าในพื้นที่ที่ต้องการรถใช้ระยะสั้นหรือรายเดือน
            </Typography>
            <Typography color="text.secondary">
              เราให้ความสำคัญกับการตอบกลับรวดเร็ว รถพร้อมใช้งาน เงื่อนไขที่อธิบายก่อนจอง และจุดรับรถที่นัดหมายได้สะดวก
              เพื่อให้ลูกค้าเริ่มทริปได้มั่นใจตั้งแต่รับรถจนคืนรถ
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '20px', boxShadow: '0 14px 32px rgba(15,17,21,0.05)', p: 3 }}>
              <Typography variant="caption" color="primary">
                ประสบการณ์บริการ
              </Typography>
              <Typography component="h2" variant="h3" sx={{ mt: 1 }}>
                ให้บริการลูกค้าในหาดใหญ่และสนามบินอย่างต่อเนื่อง
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                ทีมงานพร้อมดูแลทั้งการจองล่วงหน้า การรับรถนอกเวลานัดหมาย และคำถามเรื่องเอกสารหรือเส้นทาง
              </Typography>
            </Box>
            <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '20px', boxShadow: '0 14px 32px rgba(15,17,21,0.05)', p: 3 }}>
              <Typography variant="caption" color="primary">
                Customer-first
              </Typography>
              <Typography component="h2" variant="h3" sx={{ mt: 1 }}>
                ลูกค้าต้องเข้าใจราคาและเงื่อนไขก่อนตัดสินใจ
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {values.map((value) => (
            <Box key={value} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '20px', boxShadow: '0 14px 32px rgba(15,17,21,0.05)', p: 3 }}>
              <Typography component="h2" variant="h3">
                ✓ {value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
          <Typography component="h2" variant="h2">
            พื้นที่ให้บริการ
          </Typography>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mt: 3 }}>
            {serviceAreas.map((area) => (
              <Typography key={area} variant="caption" sx={{ border: `1px solid ${colors.hairlineSoft}`, borderRadius: '999px', px: 1.5, py: 0.75 }}>
                {area}
              </Typography>
            ))}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
            <Button component={Link} to="/cars" variant="outlined">
              ดูรถทั้งหมด
            </Button>
            <Button component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} variant="contained">
              ติดต่อผ่าน LINE
            </Button>
          </Stack>
        </Box>

        <InternalLinkCluster
          title="เริ่มวางแผนเช่ารถกับ WWJ"
          description="ดูรุ่นรถยอดนิยม เงื่อนไขการเช่า และคำถามที่พบบ่อยสำหรับรถเช่าหาดใหญ่และรถเช่าสนามบินหาดใหญ่"
        />
      </Stack>
    </>
  );
}
