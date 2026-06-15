import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import NotFound from './NotFound.jsx';

const posts = {
  'hat-yai-airport-car-rental': {
    title: 'เช่ารถสนามบินหาดใหญ่ต้องเตรียมอะไรบ้าง',
    description: 'เตรียมเอกสาร จุดนัดรับรถ และช่องทางติดต่อก่อนเดินทางถึงสนามบินหาดใหญ่'
  },
  'hat-yai-driving-guide': {
    title: 'ขับรถเที่ยวหาดใหญ่แบบสบายใจ',
    description: 'คำแนะนำการเลือกรถและเตรียมตัวสำหรับการขับเที่ยวหาดใหญ่'
  }
};

export default function BlogDetail() {
  const { slug } = useParams();
  const post = posts[slug];

  if (!post) {
    return <NotFound />;
  }

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
      <Stack spacing={4}>
        <PageHeader eyebrow="บทความ" title={post.title} description={post.description} />
        <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
          บทความฉบับเต็มจะถูกเพิ่มในเฟสคอนเทนต์ถัดไป โดยหน้านี้เตรียมโครง SEO และ routing สำหรับบทความแบบ dynamic แล้ว
        </Typography>
      </Stack>
    </>
  );
}
