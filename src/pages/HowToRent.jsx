import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { createBreadcrumbSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';
import { contactActions, externalLinkProps } from '../utils/contactActions.js';

const steps = [
  {
    title: 'เลือกรถ',
    description: 'เลือกรถที่เหมาะกับจำนวนผู้โดยสาร งบประมาณ และแผนการเดินทาง'
  },
  {
    title: 'ติดต่อ WWJ',
    description: 'ติดต่อผ่านโทรศัพท์ LINE หรือ WhatsApp เพื่อเช็ครถว่างและราคา'
  },
  {
    title: 'ยืนยันการจอง',
    description: 'แจ้งวันเวลา จุดรับรถ และยืนยันเอกสารตามเงื่อนไขการเช่า'
  },
  {
    title: 'รับรถ',
    description: 'รับรถที่สนามบินหาดใหญ่หรือจุดนัดหมาย พร้อมตรวจสภาพก่อนเดินทาง'
  }
];

export default function HowToRent() {
  return (
    <>
      <Seo
        title="วิธีเช่ารถ"
        description="วิธีเช่ารถหาดใหญ่กับ WWJ Car Rent เลือกรถ ติดต่อทีมงาน ยืนยันการจอง และรับรถที่สนามบินหาดใหญ่หรือในเมือง"
        canonical="/how-to-rent"
        schema={createBreadcrumbSchema([
          { name: 'หน้าแรก', path: '/' },
          { name: 'วิธีเช่ารถ', path: '/how-to-rent' }
        ])}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="วิธีเช่ารถ"
          title="ขั้นตอนการเช่ารถ"
          description="จองง่าย ชัดเจน และพร้อมเดินทางในหาดใหญ่"
        />
        <Stack spacing={0} sx={{ position: 'relative' }}>
          {steps.map((step, index) => (
            <Box
              key={step.title}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '56px 1fr', md: '90px 1fr' },
                gap: { xs: 2, md: 3 },
                pb: index === steps.length - 1 ? 0 : { xs: 3, md: 4 },
                position: 'relative',
                '&::before': index === steps.length - 1 ? {} : {
                  content: '""',
                  position: 'absolute',
                  left: { xs: 27, md: 44 },
                  top: 58,
                  bottom: 0,
                  width: 2,
                  bgcolor: colors.hairlineSoft
                }
              }}
            >
              <Typography
                sx={{
                  bgcolor: 'rgba(255,0,0,0.08)',
                  color: colors.primary,
                  width: { xs: 56, md: 72 },
                  height: { xs: 56, md: 72 },
                  borderRadius: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </Typography>
              <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
                <Typography component="h2" variant="h3">
                  {step.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  {step.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
          <Typography component="h2" variant="h2">
            พร้อมจองรถแล้ว?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            เลือกรุ่นรถที่สนใจ หรือส่งวันเดินทางและจุดรับรถให้ทีมงานเช็กคิวรถว่างผ่าน LINE ได้ทันที
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            <Button component={Link} to="/cars" variant="outlined">
              ดูรถทั้งหมด
            </Button>
            <Button component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} variant="contained">
              จองผ่าน LINE
            </Button>
            <Button component={Link} to="/rental-conditions" variant="text">
              อ่านเงื่อนไขการเช่า
            </Button>
          </Stack>
        </Box>
      </Stack>
    </>
  );
}
