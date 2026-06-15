import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import InternalLinkCluster from '../components/seo/InternalLinkCluster.jsx';
import Seo from '../components/seo/Seo.jsx';
import { faqItems } from '../data/faqs.js';
import { createBreadcrumbSchema, createFaqSchema } from '../features/seo/schemas.js';
import { useCmsResource } from '../hooks/useCmsResource.js';
import { cmsService } from '../services/cmsService.js';
import { colors } from '../theme/colors.js';

const faqGroups = [
  { title: 'การจอง', match: ['จอง', 'เช่ารถขั้นต่ำ', 'รับรถนอกเวลา', 'เงินมัดจำ', 'ชำระเงิน', 'ราคา'] },
  { title: 'เอกสาร', match: ['เอกสาร'] },
  { title: 'การรับรถ', match: ['รับรถที่สนามบิน'] },
  { title: 'การคืนรถ', match: ['คืนรถ', 'น้ำมัน'] },
  { title: 'ประกันภัย', match: ['ประกัน', 'อุบัติเหตุ'] },
  { title: 'ชาวต่างชาติ', match: ['ต่างชาติ', 'WhatsApp', 'ใบขับขี่สากล'] },
  { title: 'การเดินทาง', match: ['ข้ามจังหวัด', 'เบตง', 'ปากบารา', 'ครอบครัว'] }
];

function groupFaqs(items) {
  const used = new Set();

  const groups = faqGroups
    .map((group) => {
      const groupItems = items.filter((item) => {
        if (used.has(item.question)) return false;
        const matched = group.match.some((keyword) => item.question.includes(keyword) || item.answer.includes(keyword));
        if (matched) used.add(item.question);
        return matched;
      });

      return { ...group, items: groupItems };
    })
    .filter((group) => group.items.length > 0);

  const remaining = items.filter((item) => !used.has(item.question));
  if (remaining.length > 0) {
    const booking = groups.find((group) => group.title === 'การจอง');
    if (booking) {
      booking.items.push(...remaining);
    } else {
      groups.unshift({ title: 'การจอง', items: remaining });
    }
  }

  return groups;
}

export default function FAQ() {
  const { data: cmsFaqs } = useCmsResource(() => cmsService.getFaqs(), faqItems, []);
  const groups = groupFaqs(cmsFaqs);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const activeGroup = groups[selectedGroup] || groups[0];

  return (
    <>
      <Seo
        title="คำถามที่พบบ่อย"
        description="คำถามที่พบบ่อยเกี่ยวกับรถเช่าหาดใหญ่ เอกสาร การรับรถที่สนามบิน การจองผ่าน LINE และเงื่อนไขการเช่า"
        canonical="/faq"
        schema={[
          createBreadcrumbSchema([
            { name: 'หน้าแรก', path: '/' },
            { name: 'คำถามที่พบบ่อย', path: '/faq' }
          ]),
          createFaqSchema(cmsFaqs)
        ]}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="คำถามที่พบบ่อย"
          title="คำถามที่พบบ่อย"
          description="ข้อมูลสำคัญก่อนจองรถเช่ากับ WWJ Car Rent ในหาดใหญ่"
        />
        <Box>
          <Tabs
            value={selectedGroup}
            onChange={(_, nextValue) => setSelectedGroup(nextValue)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="หมวดคำถามที่พบบ่อย"
            sx={{
              mb: { xs: 3, md: 4 },
              minHeight: 48,
              '.MuiTabs-indicator': {
                display: 'none'
              },
              '.MuiTabs-flexContainer': {
                gap: 1
              },
              '.MuiTab-root': {
                borderRadius: '999px',
                color: colors.body,
                minHeight: 46,
                px: 2.5,
                textTransform: 'none'
              },
              '.Mui-selected': {
                bgcolor: 'rgba(255,0,0,0.08)',
                color: `${colors.primary} !important`
              }
            }}
          >
            {groups.map((group) => (
              <Tab key={group.title} label={`${group.title} (${group.items.length})`} />
            ))}
          </Tabs>

          <Box
            sx={{
              bgcolor: colors.canvas,
              borderRadius: '24px',
              border: `1px solid ${colors.hairlineSoft}`,
              boxShadow: 'none',
              p: { xs: 1.25, md: 2.25 }
            }}
          >
            <Typography component="h2" variant="h2" sx={{ px: { xs: 1.5, md: 2 }, py: 2 }}>
              {activeGroup.title}
            </Typography>
            {activeGroup.items.map((item, index) => {
              const panelId = `faq-panel-${selectedGroup}-${index}`;

              return (
                <Accordion
                  key={item.question}
                  disableGutters
                  sx={{
                    bgcolor: 'transparent',
                    border: 0,
                    borderBottom: `1px solid ${colors.hairlineSoft}`,
                    borderRadius: '0 !important',
                    boxShadow: 'none',
                    mb: 0,
                    '&:last-of-type': {
                      borderBottom: 0
                    }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${panelId}-content`} id={`${panelId}-header`} sx={{ px: { xs: 1.5, md: 2.25 } }}>
                    <Typography component="span" variant="h3">
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 1.5, md: 2 }, pb: 3 }}>
                    <Typography color="text.secondary">{item.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: 'none', p: { xs: 3, md: 4.5 } }}>
          <Typography component="h2" variant="h2">
            ยังมีคำถามก่อนจอง?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            ดูรุ่นรถและราคา หรืออ่านเงื่อนไขเพิ่มเติมก่อนติดต่อทีมงานเพื่อยืนยันรถว่าง
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            <Button component={Link} to="/cars" variant="outlined">
              ดูรถทั้งหมด
            </Button>
            <Button component={Link} to="/contact" variant="contained">
              ติดต่อจองรถ
            </Button>
            <Button component={Link} to="/rental-conditions" variant="text">
              เงื่อนไขการเช่า
            </Button>
          </Stack>
        </Box>

        <InternalLinkCluster
          title="อ่านข้อมูลสำคัญก่อนเช่ารถ"
          description="เปรียบเทียบรถเช่าหาดใหญ่ ดูเงื่อนไข เอกสารที่ใช้ และช่องทางติดต่อเพื่อจองรถกับ WWJ Car Rent"
        />
      </Stack>
    </>
  );
}
