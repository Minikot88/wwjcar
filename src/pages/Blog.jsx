import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';

const posts = [
  {
    slug: 'hat-yai-airport-car-rental',
    title: 'เช่ารถสนามบินหาดใหญ่ต้องเตรียมอะไรบ้าง',
    description: 'แนวทางเตรียมเอกสาร เวลา และจุดนัดรับรถสำหรับลูกค้าที่เดินทางมาถึงสนามบินหาดใหญ่'
  },
  {
    slug: 'hat-yai-driving-guide',
    title: 'ขับรถเที่ยวหาดใหญ่แบบสบายใจ',
    description: 'คำแนะนำสำหรับการเลือกรถและวางแผนเดินทางในหาดใหญ่และพื้นที่ใกล้เคียง'
  }
];

export { posts as blogPosts };

export default function Blog() {
  return (
    <>
      <Seo
        title="บทความ"
        description="บทความรถเช่าหาดใหญ่ การรับรถที่สนามบิน และคำแนะนำสำหรับนักท่องเที่ยว"
        canonical="/blog"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'บทความ', path: '/blog' }
        ])}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader eyebrow="บทความ" title="คู่มือรถเช่าหาดใหญ่" description="ข้อมูลสั้น ๆ สำหรับวางแผนเช่ารถและเดินทางในหาดใหญ่" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {posts.map((post) => (
            <ButtonBase
              key={post.slug}
              component={Link}
              to={`/blog/${post.slug}`}
              sx={{ display: 'block', textAlign: 'left', border: `1px solid ${colors.hairline}`, p: 4 }}
            >
              <Typography component="h2" variant="h3">
                {post.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                {post.description}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      </Stack>
    </>
  );
}
