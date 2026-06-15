import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import { colors } from '../../theme/colors.js';

const defaultLinks = [
  { label: 'รถเช่าหาดใหญ่', href: '/cars' },
  { label: 'รถเช่าสนามบินหาดใหญ่', href: '/contact' },
  { label: 'รถเช่ารายเดือนหาดใหญ่', href: '/monthly-car-rental' },
  { label: 'เงื่อนไขการเช่า', href: '/rental-conditions' },
  { label: 'คำถามที่พบบ่อย', href: '/faq' },
  { label: 'ลูกค้าชาวมาเลเซีย', href: '/car-rental-for-malaysian' },
  { label: 'บทความรถเช่า', href: '/blog' }
];

export default function InternalLinkCluster({
  title = 'วางแผนเช่ารถในหาดใหญ่',
  description = 'ดูข้อมูลสำคัญสำหรับรถเช่าหาดใหญ่ รถเช่าสนามบินหาดใหญ่ รถเช่าสงขลา และรถเช่ารายเดือนกับ WWJ Car Rent',
  links = defaultLinks
}) {
  return (
    <Box
      sx={{
        bgcolor: colors.canvas,
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '24px',
        p: { xs: 3, md: 4.5 }
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography component="h2" variant="h2">
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 760, lineHeight: 1.8 }}>
            {description}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
          {links.map((item) => (
            <Button key={item.href} component={Link} to={item.href} variant="outlined" size="small">
              {item.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
