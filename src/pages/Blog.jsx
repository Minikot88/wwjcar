import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import InternalLinkCluster from '../components/seo/InternalLinkCluster.jsx';
import Seo from '../components/seo/Seo.jsx';
import { siteConfig } from '../config/site.js';
import { blogCategories, blogPosts, getBlogCategoryName } from '../data/blog.js';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';

export { blogPosts };

function createBlogItemListSchema() {
  const baseUrl = siteConfig.siteUrl.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'คู่มือรถเช่าหาดใหญ่ WWJ Car Rent',
    itemListElement: blogPosts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/blog/${post.slug}`,
      name: post.title,
      description: post.description
    }))
  };
}

export default function Blog() {
  return (
    <>
      <Seo
        title="บทความรถเช่าหาดใหญ่"
        description="คู่มือรถเช่าหาดใหญ่ รถเช่าสนามบินหาดใหญ่ รถเช่ารายเดือน หาดใหญ่ไปเบตง ปากบารา สงขลา และข้อมูลสำหรับนักท่องเที่ยวมาเลเซีย"
        canonical="/blog"
        schema={[
          createBreadcrumbSchema([
            { name: 'หน้าแรก', path: '/' },
            { name: 'บทความ', path: '/blog' }
          ]),
          createBlogItemListSchema()
        ]}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="คู่มือรถเช่า"
          title="บทความรถเช่าหาดใหญ่และเส้นทางยอดนิยม"
          description="รวมข้อมูลสำหรับวางแผนเช่ารถในหาดใหญ่ รับรถสนามบิน เดินทางไปสงขลา เบตง ปากบารา และลูกค้าจากมาเลเซีย"
        />

        <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
          {blogCategories.map((category) => (
            <Typography
              key={category.slug}
              variant="caption"
              sx={{
                bgcolor: colors.canvas,
                border: `1px solid ${colors.hairlineSoft}`,
                borderRadius: '999px',
                color: colors.body,
                px: 1.6,
                py: 0.8
              }}
            >
              {category.name}
            </Typography>
          ))}
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {blogPosts.map((post) => (
            <ButtonBase
              key={post.slug}
              component={Link}
              to={`/blog/${post.slug}`}
              sx={{
                alignItems: 'stretch',
                bgcolor: colors.canvas,
                border: `1px solid ${colors.hairlineSoft}`,
                borderRadius: '24px',
                boxShadow: '0 18px 45px rgba(15,17,21,0.05)',
                display: 'block',
                p: { xs: 3, md: 4 },
                textAlign: 'left',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  boxShadow: '0 24px 60px rgba(15,17,21,0.08)',
                  transform: 'translateY(-3px)'
                }
              }}
            >
              <Typography variant="caption" color="primary">
                {getBlogCategoryName(post.category)}
              </Typography>
              <Typography component="h2" variant="h3" sx={{ mt: 1.25 }}>
                {post.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                {post.description}
              </Typography>
            </ButtonBase>
          ))}
        </Box>

        <InternalLinkCluster
          title="อ่านต่อก่อนจองรถเช่าหาดใหญ่"
          description="ดูรุ่นรถ เงื่อนไขการเช่า คำถามที่พบบ่อย และช่องทางติดต่อเพื่อเช็ครถว่างกับ WWJ Car Rent"
        />
      </Stack>
    </>
  );
}
