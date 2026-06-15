import { Stack, Typography } from '@mui/material';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';

const sections = [
  'เราเก็บข้อมูลติดต่อและข้อมูลการจองเท่าที่จำเป็นสำหรับตอบคำถามและยืนยันการเช่ารถ',
  'ข้อมูลลูกค้าจะใช้เพื่อการติดต่อกลับ การยืนยันการจอง และการให้บริการระหว่างเช่ารถ',
  'เราไม่ขายข้อมูลลูกค้าให้บุคคลภายนอก บริการแผนที่ ข้อความ หรือการวิเคราะห์อาจถูกใช้งานในอนาคตตามความเหมาะสม',
  'ลูกค้าสามารถติดต่อ WWJ Car Rent เพื่อขอแก้ไขหรือลบข้อมูลของตนเองได้'
];

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="นโยบายความเป็นส่วนตัว"
        description="นโยบายความเป็นส่วนตัวของ WWJ Car Rent สำหรับข้อมูลติดต่อและข้อมูลการจองรถเช่า"
        canonical="/privacy-policy"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'นโยบายความเป็นส่วนตัว', path: '/privacy-policy' }
        ])}
      />
      <Stack spacing={4}>
        <PageHeader eyebrow="ข้อมูลทางกฎหมาย" title="นโยบายความเป็นส่วนตัว" description="วิธีที่ WWJ Car Rent ดูแลข้อมูลลูกค้าและข้อมูลการสอบถามเช่ารถ" />
        {sections.map((section) => (
          <Typography key={section} color="text.secondary">
            {section}
          </Typography>
        ))}
      </Stack>
    </>
  );
}
