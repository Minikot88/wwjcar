import { Box, Stack, Typography } from '@mui/material';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';

const reviews = [
  'รถสะอาด รับรถสะดวกที่สนามบินหาดใหญ่',
  'ติดต่อผ่าน LINE ง่าย ทีมงานตอบเร็ว',
  'ราคาเข้าใจง่าย เหมาะกับทริปครอบครัว'
];

export default function Reviews() {
  return (
    <>
      <Seo
        title="รีวิวลูกค้า"
        description="รีวิวและความประทับใจจากลูกค้า WWJ Car Rent รถเช่าหาดใหญ่"
        canonical="/reviews"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'รีวิวลูกค้า', path: '/reviews' }
        ])}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader eyebrow="รีวิวลูกค้า" title="เสียงจากลูกค้า" description="ตัวอย่างความคิดเห็นจากผู้ใช้บริการรถเช่า WWJ Car Rent" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {reviews.map((review) => (
            <Box key={review} sx={{ border: `1px solid ${colors.hairline}`, p: 4 }}>
              <Typography variant="h3" component="blockquote">
                “{review}”
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </>
  );
}
