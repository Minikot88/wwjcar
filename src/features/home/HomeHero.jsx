import { Box, Stack, Typography } from '@mui/material';
import heroImage from '../../../photo/wwj-carrent.webp';
import { LogoFull } from '../../components/brand/Logo.jsx';
import AppContainer from '../../components/layout/AppContainer.jsx';
import { OutlineButton, PrimaryButton } from '../../components/ui/buttons/index.js';
import { colors } from '../../theme/colors.js';
import { contactActions, externalLinkProps } from '../../utils/contactActions.js';

export default function HomeHero() {
  return (
    <Box
      component="section"
      sx={{
        mx: 'calc(50% - 50vw)',
        mt: { xs: -6, md: -10 },
        bgcolor: colors.canvas,
        overflow: 'hidden',
        pt: { xs: 7, md: 10 },
        pb: { xs: 7, md: 10 }
      }}
    >
      <AppContainer size="editorial">
        <Box
          sx={{
            display: 'grid',
            gridTemplateAreas: {
              xs: '"intro" "media" "actions"',
              lg: '"intro media" "actions media"'
            },
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.95fr) minmax(420px, 1.05fr)' },
            gap: { xs: 3.5, md: 7 },
            alignItems: 'center'
          }}
        >
          <Stack spacing={{ xs: 2.5, md: 3.5 }} sx={{ gridArea: 'intro' }}>
            <LogoFull to={null} markSize={{ xs: 34, md: 40 }} priority />

            <Box>
              <Typography component="h1" variant="display" sx={{ maxWidth: 680, fontSize: { xs: '2.35rem', md: '3.9rem' }, lineHeight: 1.12 }}>
                รถเช่าหาดใหญ่ จองง่าย รับรถไว
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 600, fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.8 }}>
                เลือกรถที่เหมาะกับทริปของคุณ เช็ครถว่างผ่าน LINE โทรสอบถามได้ทันที พร้อมนัดรับรถที่สนามบินหาดใหญ่และจุดนัดหมายในเมือง
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ gridArea: 'actions' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <PrimaryButton component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} aria-label={contactActions.line.ariaLabel}>
                จองผ่าน LINE
              </PrimaryButton>
              <OutlineButton component="a" href="/cars" onLight>
                ดูรถทั้งหมด
              </OutlineButton>
            </Stack>

            <Typography color="text.secondary" sx={{ maxWidth: 520, lineHeight: 1.8 }}>
              รับรถสนามบินหาดใหญ่ เลือกรถสะดวก และคุยกับทีมงานได้โดยตรงก่อนจอง
            </Typography>
          </Stack>

          <Box sx={{ position: 'relative', gridArea: 'media' }}>
            <Box
              component="img"
              src={heroImage}
              alt="รถเช่าหาดใหญ่ WWJ Car Rent"
              fetchpriority="high"
              sx={{
                display: 'block',
                width: '100%',
                aspectRatio: { xs: '16 / 11', md: '16 / 11' },
                objectFit: 'cover',
                borderRadius: { xs: '20px', md: '24px' },
                boxShadow: '0 30px 70px rgba(15, 17, 21, 0.14)'
              }}
            />
          </Box>
        </Box>
      </AppContainer>
    </Box>
  );
}
