import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import InternalLinkCluster from '../components/seo/InternalLinkCluster.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';
import { contactActions, externalLinkProps } from '../utils/contactActions.js';

const documents = ['Passport', 'Driving license ที่ใช้ได้ในประเทศไทย', 'ข้อมูลที่พักหรือแผนการเดินทาง', 'เบอร์ติดต่อ WhatsApp หรือ LINE'];
const notes = [
  'สามารถรับรถที่สนามบินหาดใหญ่หรือจุดนัดหมายในตัวเมืองได้',
  'หากต้องการเดินทางไปสงขลา เบตง ปากบารา หรือจังหวัดใกล้เคียง ให้แจ้งเส้นทางก่อนจอง',
  'ไม่อนุญาตให้นำรถข้ามพรมแดนออกนอกประเทศไทยโดยไม่ได้รับอนุญาต',
  'WhatsApp เหมาะสำหรับลูกค้ามาเลเซียที่ต้องการสื่อสารก่อนเดินทางถึงหาดใหญ่'
];

export default function MalaysianCustomers() {
  return (
    <>
      <Seo
        title="รถเช่าหาดใหญ่สำหรับลูกค้ามาเลเซีย"
        description="รถเช่าหาดใหญ่สำหรับนักท่องเที่ยวมาเลเซีย ใช้พาสปอร์ต ใบขับขี่ ติดต่อผ่าน WhatsApp รับรถสนามบินหาดใหญ่ได้"
        canonical="/car-rental-for-malaysian"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'ลูกค้ามาเลเซีย', path: '/car-rental-for-malaysian' }
        ])}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="Malaysian Customers"
          title="รถเช่าหาดใหญ่สำหรับลูกค้ามาเลเซีย"
          description="ติดต่อผ่าน WhatsApp หรือ LINE เพื่อเช็ครถว่าง เอกสาร จุดรับรถ และเงื่อนไขการเดินทางก่อนมาถึงหาดใหญ่"
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
          <InfoList title="เอกสารที่แนะนำ" items={documents} />
          <InfoList title="ข้อมูลสำคัญก่อนจอง" items={notes} />
        </Box>

        <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
          <Typography component="h2" variant="h2">
            ติดต่อทีมงานก่อนเดินทาง
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            ส่งวันเดินทาง จำนวนผู้โดยสาร จุดรับรถ และเส้นทางที่ต้องการไป ทีมงานจะช่วยแนะนำรุ่นรถและเงื่อนไขที่เหมาะสม
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            <Button component="a" href={contactActions.whatsapp.href} {...externalLinkProps(contactActions.whatsapp)} variant="contained">
              ติดต่อผ่าน WhatsApp
            </Button>
            <Button component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} variant="outlined">
              ติดต่อผ่าน LINE
            </Button>
            <Button component={Link} to="/cars" variant="text">
              ดูรถทั้งหมด
            </Button>
          </Stack>
        </Box>

        <InternalLinkCluster
          title="วางแผนเช่ารถหาดใหญ่ก่อนเดินทาง"
          description="เปรียบเทียบรุ่นรถ เงื่อนไขการเช่า คำถามที่พบบ่อย ตัวเลือกเช่ารายเดือน และช่องทางจองก่อนเดินทางถึงหาดใหญ่"
        />
      </Stack>
    </>
  );
}

function InfoList({ title, items }) {
  return (
    <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
      <Typography component="h2" variant="h2">
        {title}
      </Typography>
      <Stack component="ul" spacing={1.5} sx={{ pl: 2.5, mt: 3, color: colors.body }}>
        {items.map((item) => (
          <Typography component="li" key={item}>
            {item}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}
