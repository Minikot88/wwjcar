import { Box, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import { colors } from '../../theme/colors.js';
import { LogoFull } from '../brand/Logo.jsx';
import AppContainer from '../layout/AppContainer.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  const legalLinks = [
    { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy-policy' },
    { label: 'ข้อกำหนดการใช้งาน', href: '/terms-and-conditions' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: colors.canvas,
        borderTop: `1px solid ${colors.hairlineSoft}`,
        color: colors.body,
        py: { xs: 4, md: 5 }
      }}
    >
      <AppContainer size="editorial">
        <Box
          sx={{
            alignItems: { xs: 'flex-start', md: 'center' },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 6 },
            justifyContent: 'space-between'
          }}
        >
          <Stack spacing={1.25} sx={{ maxWidth: 500 }}>
            <LogoFull markSize={{ xs: 34, md: 38 }} />
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 460 }}>
              รถเช่าหาดใหญ่สำหรับการเดินทางที่ง่าย สะอาด และมั่นใจ
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.25, sm: 3 }}
            sx={{
              alignItems: { xs: 'flex-start', sm: 'center' }
            }}
          >
            {legalLinks.map((item) => (
              <Typography
                key={item.href}
                component={Link}
                to={item.href}
                sx={{
                  color: colors.body,
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { color: colors.primary }
                }}
              >
                {item.label}
              </Typography>
            ))}
            <Typography variant="caption" sx={{ color: colors.muted }}>
              © {year}
            </Typography>
          </Stack>
        </Box>
      </AppContainer>
    </Box>
  );
}
