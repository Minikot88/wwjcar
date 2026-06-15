import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import InternalLinkCluster from '../components/seo/InternalLinkCluster.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';
import { contactActions, externalLinkProps } from '../utils/contactActions.js';

const conditions = [
  {
    title: 'เอกสารที่ต้องใช้',
    items: [
      'คนไทย: บัตรประชาชนตัวจริง และใบขับขี่ตัวจริงที่ยังไม่หมดอายุ',
      'ชาวต่างชาติ: พาสปอร์ต ใบขับขี่ที่ใช้ได้ในประเทศไทย และข้อมูลที่พักหรือแผนการเดินทาง',
      'ผู้เช่าต้องเป็นผู้รับรถและลงนามยืนยันสภาพรถก่อนออกเดินทาง'
    ]
  },
  {
    title: 'เงินมัดจำ',
    items: [
      'แจ้งยอดเงินมัดจำก่อนยืนยันการจองทุกครั้ง',
      'ตัวอย่าง: รถเล็กหรือรถประหยัดมักใช้เงินมัดจำน้อยกว่ารถรุ่นใหญ่หรือเช่าหลายวัน',
      'คืนเงินมัดจำหลังคืนรถและตรวจสภาพเรียบร้อยตามเงื่อนไขที่ตกลง'
    ]
  },
  {
    title: 'นโยบายน้ำมัน',
    items: [
      'รับรถด้วยระดับน้ำมันเท่าไร ให้คืนรถในระดับใกล้เคียงเดิม',
      'หากน้ำมันขาดจากระดับที่ตกลง อาจมีค่าเติมน้ำมันตามจริง',
      'ทีมงานจะแจ้งระดับน้ำมันและถ่ายรูปสภาพรถก่อนส่งมอบ'
    ]
  },
  {
    title: 'คืนรถล่าช้า',
    items: [
      'ควรแจ้งทีมงานทันทีหากคาดว่าจะคืนรถช้ากว่าเวลานัด',
      'การคืนล่าช้าอาจมีค่าใช้จ่ายเพิ่มตามระยะเวลาที่เกิน',
      'หากกระทบคิวลูกค้าถัดไป ทีมงานจะแนะนำทางเลือกที่เหมาะสม'
    ]
  },
  {
    title: 'ความเสียหายและอุบัติเหตุ',
    items: [
      'รถมีประกันภัยตามเงื่อนไขของบริษัทและประเภทความคุ้มครองของรถ',
      'หากเกิดเหตุ ให้หยุดรถในจุดปลอดภัยและติดต่อ WWJ Car Rent ทันที',
      'ความเสียหายที่เกิดจากการใช้งานผิดเงื่อนไขอาจมีค่าใช้จ่ายตามจริง'
    ]
  },
  {
    title: 'การเดินทางข้ามจังหวัด',
    items: [
      'แจ้งเส้นทางก่อนจอง เช่น เบตง ปากบารา สงขลา สตูล หรือจังหวัดใกล้เคียง',
      'ทีมงานจะยืนยันรุ่นรถ ระยะเวลา และเงื่อนไขประกันให้เหมาะกับแผนเดินทาง',
      'ไม่อนุญาตให้นำรถออกนอกประเทศโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร'
    ]
  }
];

export default function RentalConditions() {
  return (
    <>
      <Seo
        title="เงื่อนไขการเช่ารถหาดใหญ่"
        description="เงื่อนไขรถเช่าหาดใหญ่ WWJ Car Rent เอกสาร เงินมัดจำ น้ำมัน คืนรถล่าช้า ความเสียหาย และการขับข้ามจังหวัด"
        canonical="/rental-conditions"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'เงื่อนไขการเช่า', path: '/rental-conditions' }
        ])}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="เงื่อนไขการเช่า"
          title="เงื่อนไขการเช่ารถ"
          description="สรุปข้อมูลสำคัญก่อนจองรถเช่าหาดใหญ่ เพื่อให้เตรียมเอกสาร รับรถ และคืนรถได้ชัดเจน"
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: { xs: 3, md: 4 } }}>
          {conditions.map((condition) => (
            <Box key={condition.title} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
              <Typography component="h2" variant="h3">
                {condition.title}
              </Typography>
              <Stack component="ul" spacing={1.5} sx={{ pl: 2.5, mt: 3, color: colors.body }}>
                {condition.items.map((item) => (
                  <Typography component="li" key={item}>
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
          <Typography component="h2" variant="h2">
            ต้องการให้ทีมงานช่วยเช็กเงื่อนไขก่อนจอง?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            ส่งวันเดินทาง รุ่นรถที่สนใจ จุดรับรถ และเส้นทางให้ทีมงานทาง LINE เพื่อยืนยันยอดรวมก่อนตัดสินใจ
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            <Button component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} variant="contained">
              ถามผ่าน LINE
            </Button>
            <Button component={Link} to="/cars" variant="outlined">
              ดูรถทั้งหมด
            </Button>
          </Stack>
        </Box>

        <InternalLinkCluster
          title="ต่อยอดจากเงื่อนไขการเช่า"
          description="เลือกประเภทรถที่เหมาะกับทริป อ่าน FAQ หรือสอบถามทีมงานเพื่อเช็คเงินมัดจำและรถว่างก่อนจอง"
        />
      </Stack>
    </>
  );
}
