import ChatIcon from '@mui/icons-material/Chat';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import MapIcon from '@mui/icons-material/Map';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import PageHeader from '../components/layout/PageHeader.jsx';
import InternalLinkCluster from '../components/seo/InternalLinkCluster.jsx';
import Seo from '../components/seo/Seo.jsx';
import { contactConfig } from '../config/contact.js';
import { createBreadcrumbSchema, createLocalBusinessSchema } from '../features/seo/schemas.js';
import { colors } from '../theme/colors.js';
import { contactActions, externalLinkProps } from '../utils/contactActions.js';

const pickupLocations = ['สนามบินหาดใหญ่', 'ตัวเมืองหาดใหญ่', 'สถานีรถไฟหาดใหญ่', 'โรงแรมในตัวเมือง', 'จุดนัดหมายในสงขลา'];
const contactReasons = ['เช็ครถว่างวันนี้', 'สอบถามราคาเช่ารายวัน', 'จองรับรถสนามบิน', 'สอบถามเช่ารายเดือน', 'ถามเอกสารและเงินมัดจำ', 'สอบถามเส้นทางไปเบตงหรือปากบารา'];
const trustItems = ['ตอบไวผ่าน LINE', 'นัดรับรถสนามบินได้', 'แจ้งเงื่อนไขก่อนจอง', 'รถสะอาดพร้อมเดินทาง'];

export default function Contact() {
  return (
    <>
      <Seo
        title="ติดต่อจองรถเช่าหาดใหญ่"
        description="ติดต่อ WWJ Car Rent เพื่อจองรถเช่าหาดใหญ่ โทร LINE หรือ WhatsApp รับรถสนามบินหาดใหญ่ เช็ครถว่างและราคาได้ทันที"
        canonical="/contact"
        schema={[
          createBreadcrumbSchema([
            { name: 'หน้าแรก', path: '/' },
            { name: 'ติดต่อเรา', path: '/contact' }
          ]),
          createLocalBusinessSchema()
        ]}
      />
      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="จองรถเช่าหาดใหญ่"
          title="ติดต่อ WWJ Car Rent"
          description="เช็ครถว่าง ราคาเช่า นัดรับรถสนามบินหาดใหญ่ และยืนยันการจองผ่านช่องทางที่สะดวกที่สุด"
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: { xs: 4, md: 6 } }}>
          <Stack spacing={2}>
            <ContactButton icon={<LocalPhoneIcon />} title="โทรสอบถามทันที" value={contactConfig.phoneDisplay} action={contactActions.phone} primary />
            <ContactButton icon={<ChatIcon />} title="จองผ่าน LINE" value={contactConfig.lineId} action={contactActions.line} primary />
            <ContactButton icon={<WhatsAppIcon />} title="WhatsApp สำหรับลูกค้าต่างชาติ" value={contactConfig.whatsapp} action={contactActions.whatsapp} />
          </Stack>

          <Stack spacing={3}>
            <InfoPanel title="เวลาติดต่อ" text={contactConfig.businessHours} />
            <InfoPanel title="รับรถสนามบินหาดใหญ่" text="แจ้งเที่ยวบิน เวลาถึง และเบอร์ติดต่อ ทีมงานจะยืนยันจุดนัดรับรถก่อนวันเดินทาง" icon={<FlightTakeoffIcon />} />
            <InfoPanel title="พื้นที่ให้บริการ" text="หาดใหญ่ สนามบินหาดใหญ่ สงขลา และเส้นทางท่องเที่ยวภาคใต้ตามเงื่อนไขการเช่า" />
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {trustItems.map((item) => (
            <Box key={item} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '20px', boxShadow: '0 14px 32px rgba(15,17,21,0.05)', p: 3 }}>
              <Typography variant="h3">✓ {item}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 4, md: 6 } }}>
          <Stack spacing={3} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
            <Typography component="h2" variant="h2">
              จุดรับรถที่นัดหมายได้
            </Typography>
            <Stack component="ul" spacing={1.5} sx={{ pl: 2.5, color: colors.body }}>
              {pickupLocations.map((item) => (
                <Typography component="li" key={item}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Stack>

          <Stack spacing={3} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
            <Typography component="h2" variant="h2">
              ลูกค้าติดต่อบ่อยเรื่อง
            </Typography>
            <Stack component="ul" spacing={1.5} sx={{ pl: 2.5, color: colors.body }}>
              {contactReasons.map((item) => (
                <Typography component="li" key={item}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            minHeight: { xs: 320, md: 420 },
              border: `1px solid ${colors.hairlineSoft}`,
              borderRadius: '24px',
              boxShadow: '0 18px 45px rgba(15,17,21,0.06)',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            p: 4,
            bgcolor: colors.canvasElevated
          }}
        >
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <MapIcon sx={{ color: colors.primary, fontSize: 48 }} />
            <Typography component="h2" variant="h2">
              แผนที่และจุดนัดรับรถ
            </Typography>
            <Typography color="text.secondary">{contactConfig.location}</Typography>
            <Button component="a" href={contactConfig.googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="outlined">
              เปิดแผนที่
            </Button>
          </Stack>
        </Box>

        <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: '0 18px 45px rgba(15,17,21,0.06)', p: { xs: 3, md: 4 } }}>
          <Typography component="h2" variant="h2">
            ต้องการดูรถก่อนจอง?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            เลือกรุ่นรถและราคาเริ่มต้นได้จากหน้ารถเช่า จากนั้นกดจองผ่าน LINE หรือโทรสอบถามเพื่อยืนยันรถว่าง
          </Typography>
          <Button component={Link} to="/cars" variant="contained" sx={{ mt: 3 }}>
            ดูรถทั้งหมด
          </Button>
        </Box>

        <InternalLinkCluster
          title="ข้อมูลที่ช่วยให้จองรถได้เร็วขึ้น"
          description="ดูรุ่นรถ ราคา เงื่อนไขการเช่า และคำถามที่พบบ่อยก่อนติดต่อทีมงานเพื่อยืนยันรถว่าง"
        />
      </Stack>
    </>
  );
}

function ContactButton({ icon, title, value, action, primary = false }) {
  return (
    <Button
      component="a"
      href={action.href}
      {...externalLinkProps(action)}
      aria-label={action.ariaLabel}
      variant={primary ? 'contained' : 'outlined'}
      sx={{ justifyContent: 'flex-start', minHeight: 84, p: 2.5, textAlign: 'left' }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {icon}
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2">{value}</Typography>
        </Box>
      </Stack>
    </Button>
  );
}

function InfoPanel({ title, text, icon }) {
  return (
    <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '20px', boxShadow: '0 14px 32px rgba(15,17,21,0.05)', p: 3 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        {icon ? <Box sx={{ color: colors.primary }}>{icon}</Box> : null}
        <Typography component="h2" variant="h3">
          {title}
        </Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        {text}
      </Typography>
    </Box>
  );
}
