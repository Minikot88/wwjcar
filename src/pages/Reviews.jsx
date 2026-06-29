import { Box, Stack, Typography } from '@mui/material';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { useCmsResource } from '../hooks/useCmsResource.js';
import { cmsService } from '../services/cmsService.js';
import { colors } from '../theme/colors.js';

const fallbackReviews = [
  {
    id: 'fallback-1',
    customerName: 'คุณเมย์ กรุงเทพฯ',
    rating: 5,
    content: 'จองผ่าน LINE ง่าย รับรถที่สนามบินหาดใหญ่สะดวก รถสะอาดและทีมงานตอบไว'
  },
  {
    id: 'fallback-2',
    customerName: 'คุณอาหมัด มาเลเซีย',
    rating: 5,
    content: 'ติดต่อผ่าน WhatsApp ได้สะดวก อธิบายเอกสารสำหรับชาวต่างชาติชัดเจน'
  },
  {
    id: 'fallback-3',
    customerName: 'คุณวิน เชียงใหม่',
    rating: 5,
    content: 'ราคาและเงื่อนไขชัดเจน เหมาะกับทริปครอบครัวในหาดใหญ่และสงขลา'
  }
];

export default function Reviews() {
  const { data: reviews } = useCmsResource(() => cmsService.getReviews(), fallbackReviews, []);

  return (
    <>
      <Seo
        title="รีวิวลูกค้า"
        description="รีวิวจากลูกค้า WWJ Car Rent รถเช่าหาดใหญ่ รับรถสนามบิน รถสะอาด จองง่าย และบริการเป็นกันเอง"
        canonical="/reviews"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'รีวิวลูกค้า', path: '/reviews' }
        ])}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader eyebrow="รีวิวลูกค้า" title="เสียงจากลูกค้า WWJ Car Rent" description="ประสบการณ์จากลูกค้าที่ใช้บริการรถเช่าหาดใหญ่ รับรถสนามบิน และเช่ารถรายวันกับเรา" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {reviews.map((review) => (
            <Box
              key={review.id || review.content}
              sx={{
                bgcolor: 'background.paper',
                border: `1px solid ${colors.hairlineSoft}`,
                borderRadius: '26px',
                boxShadow: colors.shadowSoft,
                p: { xs: 3, md: 4 }
              }}
            >
              {review.imageUrl ? (
                <Box component="img" src={review.imageUrl} alt={review.customerName} sx={{ aspectRatio: '16 / 10', borderRadius: '20px', mb: 2.5, objectFit: 'cover', width: '100%' }} />
              ) : null}
              <Typography variant="h3" component="blockquote" sx={{ m: 0, lineHeight: 1.65 }}>
                "{review.content}"
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                {review.customerName} · {review.rating}/5
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </>
  );
}
