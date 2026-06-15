import { Stack, Typography } from '@mui/material';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';

const terms = [
  'รถว่าง ราคาเช่า จุดรับรถ และเงินมัดจำจะยืนยันก่อนทำการจองทุกครั้ง',
  'ลูกค้าต้องเตรียมเอกสารที่ถูกต้องและปฏิบัติตามเงื่อนไขการเช่าที่ตกลงไว้',
  'ความเสียหาย การคืนรถล่าช้า ระดับน้ำมันไม่ตรงเงื่อนไข หรือการใช้งานผิดข้อตกลงอาจมีค่าใช้จ่ายเพิ่มเติม',
  'เงื่อนไขสุดท้ายอาจแตกต่างตามรุ่นรถ ระยะเวลาเช่า และความต้องการของลูกค้า'
];

export default function TermsConditions() {
  return (
    <>
      <Seo
        title="ข้อกำหนดการใช้งาน"
        description="ข้อกำหนดการใช้งานเว็บไซต์และบริการรถเช่าของ WWJ Car Rent"
        canonical="/terms-and-conditions"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'ข้อกำหนดการใช้งาน', path: '/terms-and-conditions' }
        ])}
      />
      <Stack spacing={4}>
        <PageHeader eyebrow="ข้อมูลทางกฎหมาย" title="ข้อกำหนดการใช้งาน" description="เงื่อนไขทั่วไปสำหรับการใช้งานเว็บไซต์และการสอบถามบริการรถเช่า" />
        {terms.map((term) => (
          <Typography key={term} color="text.secondary">
            {term}
          </Typography>
        ))}
      </Stack>
    </>
  );
}
