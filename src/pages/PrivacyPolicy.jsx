import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema, createWebPageSchema } from '../features/seo/schemas.js';
import { useCmsResource } from '../hooks/useCmsResource.js';
import { usePublicContactSettings } from '../hooks/usePublicContactSettings.js';
import { cmsService } from '../services/cmsService.js';

const privacyContentFallback = {
  title: 'นโยบายความเป็นส่วนตัว',
  eyebrow: 'ข้อมูลทางกฎหมาย',
  description: 'WWJ Car Rent ให้ความสำคัญกับความเป็นส่วนตัวของลูกค้า และดูแลข้อมูลส่วนบุคคลอย่างเหมาะสม',
  updatedAt: '17 มิถุนายน 2569',
  intro:
    'นโยบายฉบับนี้อธิบายวิธีที่ WWJ Car Rent เก็บ ใช้งาน จัดเก็บ และคุ้มครองข้อมูลส่วนบุคคลของลูกค้าที่ติดต่อสอบถาม จองรถ หรือใช้บริการรถเช่าในหาดใหญ่และพื้นที่ใกล้เคียง',
  sections: [
    {
      id: 'information-collected',
      title: '1. ข้อมูลที่เราเก็บรวบรวม',
      body:
        'เราเก็บข้อมูลเท่าที่จำเป็นต่อการให้บริการรถเช่า ได้แก่ ชื่อ เบอร์โทรศัพท์ อีเมล ข้อมูลการจอง วันที่รับและคืนรถ รุ่นรถที่เช่า ข้อมูลการเช่ารถ เอกสารที่ใช้ประกอบการเช่า และข้อมูลการติดต่อที่ลูกค้าให้ไว้กับเรา'
    },
    {
      id: 'purpose-of-use',
      title: '2. วัตถุประสงค์ในการใช้ข้อมูล',
      body:
        'ข้อมูลของลูกค้าถูกใช้เพื่อการติดต่อกลับ ยืนยันการจอง จัดการการเช่ารถ เตรียมรถให้ตรงตามวันเวลา ให้บริการรับรถสนามบินหาดใหญ่ ดูแลลูกค้าระหว่างการเช่า และปรับปรุงคุณภาพบริการของ WWJ Car Rent'
    },
    {
      id: 'data-storage',
      title: '3. การจัดเก็บข้อมูล',
      body:
        'ข้อมูลส่วนบุคคลจะถูกจัดเก็บอย่างปลอดภัยในระบบที่มีการจำกัดการเข้าถึง เฉพาะพนักงานหรือผู้ดูแลที่ได้รับอนุญาตและจำเป็นต้องใช้ข้อมูลเพื่อให้บริการลูกค้าเท่านั้น'
    },
    {
      id: 'data-sharing',
      title: '4. การเปิดเผยหรือแบ่งปันข้อมูล',
      body:
        'WWJ Car Rent จะไม่ขาย แลกเปลี่ยน หรือให้เช่าข้อมูลส่วนบุคคลของลูกค้าแก่บุคคลภายนอก ข้อมูลอาจถูกเปิดเผยเฉพาะเมื่อจำเป็นต่อการให้บริการ หรือเมื่อมีกฎหมาย คำสั่งศาล หรือหน่วยงานรัฐที่มีอำนาจร้องขอ'
    },
    {
      id: 'customer-rights',
      title: '5. สิทธิของลูกค้า',
      body:
        'ลูกค้าสามารถติดต่อ WWJ Car Rent เพื่อขอตรวจสอบข้อมูล ขอแก้ไขข้อมูลที่ไม่ถูกต้อง ขอรับรายละเอียดเกี่ยวกับการใช้ข้อมูล หรือขอลบข้อมูลส่วนบุคคลเมื่อไม่มีความจำเป็นในการเก็บรักษาอีกต่อไป ทั้งนี้อาจเป็นไปตามข้อจำกัดของกฎหมายหรือภาระผูกพันด้านการให้บริการ'
    },
    {
      id: 'security',
      title: '6. การรักษาความปลอดภัย',
      body:
        'เราใช้มาตรการด้านความปลอดภัย เช่น การป้องกันฐานข้อมูล การยืนยันตัวตนของผู้ดูแลระบบ การควบคุมสิทธิ์การเข้าถึง และการจำกัดการใช้งานข้อมูล เพื่อช่วยลดความเสี่ยงจากการเข้าถึง แก้ไข หรือเปิดเผยข้อมูลโดยไม่ได้รับอนุญาต'
    },
    {
      id: 'cookies',
      title: '7. คุกกี้และข้อมูลการใช้งานเว็บไซต์',
      body:
        'เว็บไซต์อาจใช้คุกกี้หรือเทคโนโลยีที่คล้ายกันเพื่อช่วยให้เว็บไซต์ทำงานได้ดีขึ้น วิเคราะห์การใช้งาน และปรับปรุงประสบการณ์ของผู้เข้าชม ลูกค้าสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้บางประเภทได้ แต่อาจทำให้บางส่วนของเว็บไซต์ทำงานไม่สมบูรณ์'
    },
    {
      id: 'contact',
      title: '8. ช่องทางติดต่อ',
      body:
        'หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือต้องการใช้สิทธิด้านข้อมูลส่วนบุคคล สามารถติดต่อ WWJ Car Rent ผ่านช่องทางอย่างเป็นทางการของเราได้'
    }
  ]
};

function normalizeSections(content) {
  if (Array.isArray(content?.sections) && content.sections.length) return content.sections;
  return privacyContentFallback.sections;
}

function normalizePage(pages) {
  const cmsPage = Array.isArray(pages) ? pages.find((item) => item.slug === 'privacy-policy') : null;
  const content = cmsPage?.content || {};

  return {
    title: content.title || cmsPage?.title || privacyContentFallback.title,
    eyebrow: content.eyebrow || privacyContentFallback.eyebrow,
    description: content.description || cmsPage?.metaDescription || privacyContentFallback.description,
    updatedAt: content.updatedAt || privacyContentFallback.updatedAt,
    intro: content.intro || content.body || privacyContentFallback.intro,
    sections: normalizeSections(content),
    metaTitle: cmsPage?.metaTitle || 'นโยบายความเป็นส่วนตัว',
    metaDescription:
      cmsPage?.metaDescription ||
      'นโยบายความเป็นส่วนตัวของ WWJ Car Rent เกี่ยวกับการเก็บ ใช้งาน และคุ้มครองข้อมูลส่วนบุคคลของลูกค้า',
    canonical: cmsPage?.canonical || '/privacy-policy',
    ogTitle: cmsPage?.ogTitle || cmsPage?.metaTitle || 'นโยบายความเป็นส่วนตัว | WWJ Car Rent',
    ogDescription:
      cmsPage?.ogDescription ||
      cmsPage?.metaDescription ||
      'นโยบายความเป็นส่วนตัวของ WWJ Car Rent เกี่ยวกับการเก็บ ใช้งาน และคุ้มครองข้อมูลส่วนบุคคลของลูกค้า',
    ogImage: cmsPage?.ogImage
  };
}

export default function PrivacyPolicy() {
  const { data: pages } = useCmsResource(() => cmsService.getPages(), [], []);
  const contact = usePublicContactSettings();
  const page = normalizePage(pages);

  const schemas = [
    createBreadcrumbSchema([
      { name: 'หน้าแรก', path: '/' },
      { name: 'นโยบายความเป็นส่วนตัว', path: '/privacy-policy' }
    ]),
    createWebPageSchema({
      path: '/privacy-policy',
      name: 'นโยบายความเป็นส่วนตัว',
      description: page.metaDescription
    })
  ];

  return (
    <>
      <Seo
        title={page.metaTitle.replace(/\s\|\sWWJ Car Rent$/i, '')}
        description={page.metaDescription}
        canonical={page.canonical}
        ogTitle={page.ogTitle}
        ogDescription={page.ogDescription}
        ogImage={page.ogImage}
        schema={schemas}
      />

      <Stack spacing={4.5}>
        <PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description} />

        <Stack spacing={2.5}>
          <Typography color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.06rem' }, lineHeight: 1.9 }}>
            {page.intro}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            อัปเดตล่าสุด: {page.updatedAt}
          </Typography>
        </Stack>

        <Box
          component="nav"
          aria-label="สารบัญนโยบายความเป็นส่วนตัว"
          sx={{
            bgcolor: 'background.default',
            borderRadius: '24px',
            p: { xs: 2, md: 2.5 }
          }}
        >
          <Typography fontWeight={900} sx={{ mb: 1.5 }}>
            สารบัญ
          </Typography>
          <Stack component="ol" spacing={1} sx={{ m: 0, pl: 2.25 }}>
            {page.sections.map((section) => (
              <Typography component="li" key={section.id} color="text.secondary" sx={{ pl: 0.5 }}>
                <Typography
                  component="a"
                  href={`#${section.id}`}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                    '&:focus-visible': { borderRadius: 1, outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 3 }
                  }}
                >
                  {section.title}
                </Typography>
              </Typography>
            ))}
          </Stack>
        </Box>

        <Stack spacing={3.25}>
          {page.sections.map((section, index) => (
            <Box id={section.id} component="section" key={section.id} sx={{ scrollMarginTop: 112 }}>
              <Stack spacing={1.5}>
                <Typography variant="h2" sx={{ fontSize: { xs: '1.3rem', md: '1.55rem' } }}>
                  {section.title}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.9 }}>
                  {section.body}
                </Typography>
                {section.id === 'contact' ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ pt: 1 }}>
                    <Button href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" variant="outlined">
                      Facebook
                    </Button>
                    <Button href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" variant="outlined">
                      Instagram
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
              {index < page.sections.length - 1 ? <Divider sx={{ mt: 3.25 }} /> : null}
            </Box>
          ))}
        </Stack>
      </Stack>
    </>
  );
}
