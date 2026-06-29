import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import Section from '../../components/layout/Section.jsx';
import { colors } from '../../theme/colors.js';
import { faqPreviewItems } from './homeContent.js';

const previewAnswers = [
  'โดยทั่วไปใช้บัตรประชาชนหรือพาสปอร์ต พร้อมใบขับขี่ตัวจริง ทีมงานจะแจ้งรายละเอียดก่อนยืนยันการจอง',
  'สามารถนัดรับรถที่สนามบินหาดใหญ่ได้ แจ้งเที่ยวบินและเวลาถึงเพื่อให้ทีมงานยืนยันจุดนัดรับ',
  'ได้ สามารถส่งวันเดินทาง รุ่นรถที่สนใจ และจุดรับรถผ่าน LINE เพื่อเช็ครถว่างได้ทันที',
  'รองรับการนัดหมายนอกเวลาตามคิวรถและเงื่อนไขที่ตกลง กรุณาแจ้งล่วงหน้าเพื่อจัดเตรียมรถ'
];

export default function FaqPreviewSection() {
  return (
    <Section surface="light" spacing="compact" sx={{ mx: 'calc(50% - 50vw)' }}>
      <Stack spacing={{ xs: 3.5, md: 5 }}>
        <Box>
          <Typography variant="caption" sx={{ color: colors.primary }}>
            คำถามยอดนิยม
          </Typography>
          <Typography component="h2" variant="h1" sx={{ color: colors.bodyOnLight, mt: 1 }}>
            ก่อนจองรถ ลูกค้ามักถามเรื่องอะไรบ้าง
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: 'background.paper',
            border: `1px solid ${colors.hairlineSoft}`,
            borderRadius: '28px',
            boxShadow: colors.shadowSoft,
            overflow: 'hidden',
            p: { xs: 1, md: 1.5 }
          }}
        >
          {faqPreviewItems.map((question, index) => (
            <Accordion
              key={question}
              disableGutters
              sx={{
                bgcolor: 'transparent',
                border: 0,
                borderBottom: index === faqPreviewItems.length - 1 ? 0 : `1px solid ${colors.hairlineSoft}`,
                borderRadius: '0 !important',
                mb: 0
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: { xs: 2, md: 2.5 } }}>
                <Typography component="h3" variant="h3">
                  {question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2, md: 2.5 }, pb: 3 }}>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {previewAnswers[index]}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Button
          component={Link}
          to="/faq"
          endIcon={<ArrowForwardIcon />}
          sx={{
            alignSelf: 'flex-start',
            color: colors.bodyOnLight,
            px: 0,
            '&:hover': {
              bgcolor: 'transparent',
              color: colors.primary
            }
          }}
        >
          ดูคำถามทั้งหมด
        </Button>
      </Stack>
    </Section>
  );
}
