import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema, createWebPageSchema } from '../features/seo/schemas.js';
import { useCmsResource } from '../hooks/useCmsResource.js';
import { usePublicContactSettings } from '../hooks/usePublicContactSettings.js';
import { cmsService } from '../services/cmsService.js';

const termsContentFallback = {
  title: 'ข้อกำหนดและเงื่อนไขการใช้บริการ',
  eyebrow: 'ข้อมูลทางกฎหมาย',
  description: 'ข้อกำหนดสำหรับการใช้บริการรถเช่าและเว็บไซต์ของ WWJ Car Rent',
  updatedAt: '17 มิถุนายน 2569',
  intro:
    'ข้อกำหนดและเงื่อนไขฉบับนี้จัดทำขึ้นเพื่อให้ลูกค้าเข้าใจหลักเกณฑ์เบื้องต้นในการใช้บริการรถเช่าของ WWJ Car Rent การติดต่อสอบถาม การจองรถ การรับและคืนรถ รวมถึงการใช้งานเว็บไซต์',
  sections: [
    {
      id: 'car-rental-service',
      title: '1. การใช้บริการรถเช่า',
      body:
        'การใช้บริการรถเช่าของ WWJ Car Rent ขึ้นอยู่กับรถว่างในวันที่ลูกค้าต้องการเช่า เงื่อนไขการเช่า ราคา จุดรับรถ จุดคืนรถ และรายละเอียดบริการจะได้รับการยืนยันจากทีมงานก่อนการจองทุกครั้ง'
    },
    {
      id: 'renter-qualification',
      title: '2. คุณสมบัติผู้เช่า',
      body:
        'ผู้เช่าต้องมีอายุและคุณสมบัติตามที่ WWJ Car Rent กำหนด มีใบอนุญาตขับขี่ที่ถูกต้อง สามารถติดต่อได้จริง และต้องให้ข้อมูลที่ถูกต้องครบถ้วนเพื่อใช้ในการยืนยันการเช่ารถ'
    },
    {
      id: 'required-documents',
      title: '3. เอกสารที่ใช้',
      body:
        'เอกสารที่ใช้ประกอบการเช่าอาจรวมถึงบัตรประชาชน ใบอนุญาตขับขี่ หนังสือเดินทางสำหรับชาวต่างชาติ ข้อมูลการติดต่อ และเอกสารเพิ่มเติมตามประเภทการเช่า ทีมงานจะแจ้งรายการเอกสารที่ต้องใช้ก่อนยืนยันการจอง'
    },
    {
      id: 'pickup-return',
      title: '4. การรับและคืนรถ',
      body:
        'ลูกค้าต้องรับและคืนรถตามวัน เวลา และสถานที่ที่ตกลงไว้ หากต้องการเปลี่ยนแปลงเวลาหรือสถานที่รับคืนรถ กรุณาแจ้งทีมงานล่วงหน้าเพื่อยืนยันความพร้อมและค่าใช้จ่ายเพิ่มเติมหากมี'
    },
    {
      id: 'booking-changes',
      title: '5. การยกเลิกและเปลี่ยนแปลงการจอง',
      body:
        'การยกเลิกหรือเปลี่ยนแปลงการจองควรแจ้งให้เร็วที่สุด เงื่อนไขการคืนเงินมัดจำหรือการเปลี่ยนวันเช่าอาจแตกต่างกันตามช่วงเวลา รุ่นรถ ระยะเวลาเช่า และข้อตกลงที่ยืนยันไว้กับทีมงาน'
    },
    {
      id: 'renter-responsibility',
      title: '6. ความรับผิดชอบของผู้เช่า',
      body:
        'ผู้เช่าต้องดูแลรถให้อยู่ในสภาพเหมาะสม ใช้งานตามกฎหมายจราจร ไม่ให้บุคคลที่ไม่ได้รับอนุญาตขับรถ และต้องรับผิดชอบต่อความเสียหาย ค่าปรับ หรือค่าใช้จ่ายที่เกิดจากการใช้งานผิดเงื่อนไข'
    },
    {
      id: 'accident-damage',
      title: '7. อุบัติเหตุและความเสียหาย',
      body:
        'หากเกิดอุบัติเหตุ รถเสีย หรือความเสียหายระหว่างการเช่า ลูกค้าต้องแจ้ง WWJ Car Rent โดยเร็วที่สุด และปฏิบัติตามขั้นตอนที่ทีมงานแจ้ง ห้ามซ่อม เปลี่ยนอะไหล่ หรือดำเนินการใด ๆ กับรถโดยไม่ได้รับอนุญาต'
    },
    {
      id: 'fees',
      title: '8. ค่าปรับและค่าใช้จ่ายเพิ่มเติม',
      body:
        'อาจมีค่าใช้จ่ายเพิ่มเติมในกรณีคืนรถล่าช้า น้ำมันไม่ตรงตามเงื่อนไข รถสกปรกผิดปกติ อุปกรณ์สูญหาย ค่าปรับจราจร ความเสียหาย หรือการใช้งานนอกเหนือจากข้อตกลงที่ยืนยันไว้'
    },
    {
      id: 'website-use',
      title: '9. การใช้งานเว็บไซต์',
      body:
        'ข้อมูลบนเว็บไซต์จัดทำขึ้นเพื่อแนะนำบริการ รถเช่า ราคาโดยประมาณ เงื่อนไข และช่องทางติดต่อ ข้อมูลอาจมีการเปลี่ยนแปลงได้ตามความเหมาะสม รายละเอียดที่ใช้ยืนยันการเช่าจริงจะอ้างอิงจากการติดต่อกับทีมงาน WWJ Car Rent'
    },
    {
      id: 'changes',
      title: '10. การเปลี่ยนแปลงข้อกำหนด',
      body:
        'WWJ Car Rent อาจปรับปรุงข้อกำหนดและเงื่อนไขนี้เป็นครั้งคราวเพื่อให้สอดคล้องกับบริการ กฎหมาย หรือการดำเนินงาน โดยฉบับล่าสุดที่เผยแพร่บนเว็บไซต์จะถือเป็นข้อมูลอ้างอิงปัจจุบัน'
    },
    {
      id: 'contact',
      title: '11. ช่องทางติดต่อ',
      body:
        'หากมีคำถามเกี่ยวกับข้อกำหนดและเงื่อนไขการใช้บริการ สามารถติดต่อ WWJ Car Rent ผ่านช่องทางติดต่ออย่างเป็นทางการของเราได้'
    }
  ]
};

function normalizeSections(content) {
  if (Array.isArray(content?.sections) && content.sections.length) return content.sections;
  return termsContentFallback.sections;
}

function normalizePage(pages) {
  const cmsPage = Array.isArray(pages) ? pages.find((item) => item.slug === 'terms-and-conditions') : null;
  const content = cmsPage?.content || {};

  return {
    title: content.title || cmsPage?.title || termsContentFallback.title,
    eyebrow: content.eyebrow || termsContentFallback.eyebrow,
    description: content.description || cmsPage?.metaDescription || termsContentFallback.description,
    updatedAt: content.updatedAt || termsContentFallback.updatedAt,
    intro: content.intro || content.body || termsContentFallback.intro,
    sections: normalizeSections(content),
    metaTitle: cmsPage?.metaTitle || 'ข้อกำหนดและเงื่อนไขการใช้บริการ',
    metaDescription:
      cmsPage?.metaDescription ||
      'ข้อกำหนดและเงื่อนไขการใช้บริการรถเช่าของ WWJ Car Rent สำหรับลูกค้าทุกท่าน',
    canonical: cmsPage?.canonical || '/terms-and-conditions',
    ogTitle: cmsPage?.ogTitle || cmsPage?.metaTitle || 'ข้อกำหนดและเงื่อนไขการใช้บริการ | WWJ Car Rent',
    ogDescription:
      cmsPage?.ogDescription ||
      cmsPage?.metaDescription ||
      'ข้อกำหนดและเงื่อนไขการใช้บริการรถเช่าของ WWJ Car Rent สำหรับลูกค้าทุกท่าน',
    ogImage: cmsPage?.ogImage
  };
}

export default function TermsConditions() {
  const { data: pages } = useCmsResource(() => cmsService.getPages(), [], []);
  const contact = usePublicContactSettings();
  const page = normalizePage(pages);

  const schemas = [
    createBreadcrumbSchema([
      { name: 'หน้าแรก', path: '/' },
      { name: 'ข้อกำหนดและเงื่อนไขการใช้บริการ', path: '/terms-and-conditions' }
    ]),
    createWebPageSchema({
      path: '/terms-and-conditions',
      name: 'ข้อกำหนดและเงื่อนไขการใช้บริการ',
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
          aria-label="สารบัญข้อกำหนดและเงื่อนไขการใช้บริการ"
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
