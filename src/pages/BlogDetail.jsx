import { Box, Button, Stack, Typography } from '@mui/material';
import { Link, useParams } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import InternalLinkCluster from '../components/seo/InternalLinkCluster.jsx';
import Seo from '../components/seo/Seo.jsx';
import { getBlogCategoryName, getBlogPostBySlug } from '../data/blog.js';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';
import NotFound from './NotFound.jsx';

export default function BlogDetail() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <NotFound />;
  }

  const categoryName = getBlogCategoryName(post.category);

  return (
    <>
      <Seo
        title={post.title}
        description={post.description}
        canonical={`/blog/${slug}`}
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'บทความ', path: '/blog' },
          { name: post.title, path: `/blog/${slug}` }
        ])}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader eyebrow={categoryName} title={post.title} description={post.description} />

        <Box
          component="article"
          sx={{
            bgcolor: colors.canvas,
            border: `1px solid ${colors.hairlineSoft}`,
            borderRadius: '24px',
            boxShadow: '0 18px 45px rgba(15,17,21,0.05)',
            p: { xs: 3, md: 5 }
          }}
        >
          <Stack spacing={3} sx={{ maxWidth: 860 }}>
            <Typography component="h2" variant="h2">
              สรุปสำหรับลูกค้าที่กำลังวางแผนเช่ารถ
            </Typography>
            <Typography color="text.secondary">
              ก่อนจองรถกับ WWJ Car Rent ควรเตรียมวันรับรถ วันคืนรถ จำนวนผู้โดยสาร จำนวนกระเป๋า จุดรับรถ และเส้นทางที่ต้องการเดินทาง
              โดยเฉพาะลูกค้าที่ต้องการรับรถที่สนามบินหาดใหญ่ เดินทางไปเบตง ปากบารา สงขลา หรือเช่ารถรายเดือนในหาดใหญ่
            </Typography>
            <Typography color="text.secondary">
              ทีมงานจะช่วยแนะนำรุ่นรถที่เหมาะกับทริป แจ้งเอกสารที่ใช้ เงื่อนไขเงินมัดจำ ประกันภัย และค่าใช้จ่ายที่เกี่ยวข้องก่อนยืนยันการจอง
              เพื่อให้ลูกค้าเปรียบเทียบและตัดสินใจได้ชัดเจน
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button component={Link} to="/cars" variant="contained">
                ดูรถเช่าทั้งหมด
              </Button>
              <Button component={Link} to="/rental-conditions" variant="outlined">
                อ่านเงื่อนไขการเช่า
              </Button>
            </Stack>
          </Stack>
        </Box>

        <InternalLinkCluster
          title="วางแผนต่อจากบทความนี้"
          description="ดูรุ่นรถ เช็คคำถามที่พบบ่อย หรือสอบถามทีมงานเพื่อยืนยันรถว่างและจุดรับรถที่เหมาะกับการเดินทางของคุณ"
        />
      </Stack>
    </>
  );
}
