import { Box, Stack, Typography } from '@mui/material';
import { LogoFull } from '../../components/brand/Logo.jsx';
import AppContainer from '../../components/layout/AppContainer.jsx';
import { OutlineButton, PrimaryButton } from '../../components/ui/buttons/index.js';
import { colors } from '../../theme/colors.js';
import { contactActions, externalLinkProps } from '../../utils/contactActions.js';
import { getImageAsset, responsiveImageProps } from '../../utils/imageAssets.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';

const heroImage = getImageAsset('home-hero');

export default function HomeHero() {
  const { data: settings } = useCmsResource(() => cmsService.getSettings(), [], []);
  const home = settings.find((item) => item.key === 'home')?.value || {};
  const heroSrc = home.heroImage || heroImage.src;
  const heroProps = home.heroImage
    ? { alt: 'WWJ Car Rent Hat Yai hero' }
    : responsiveImageProps(heroImage, 'WWJ Car Rent Hat Yai hero');

  return (
    <Box
      component="section"
      sx={{
        mx: 'calc(50% - 50vw)',
        mt: { xs: -6, md: -10 },
        bgcolor: colors.canvas,
        overflow: 'hidden',
        pt: { xs: 7, md: 10 },
        pb: { xs: 8, md: 12 }
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
            gap: { xs: 4, md: 8 },
            alignItems: 'center'
          }}
        >
          <Stack spacing={{ xs: 2.5, md: 3.5 }} sx={{ gridArea: 'intro' }}>
            <LogoFull to={null} markSize={{ xs: 34, md: 40 }} priority />

            <Box>
              <Typography component="h1" variant="display" sx={{ maxWidth: 660, fontSize: { xs: '2.25rem', md: '3.35rem' }, lineHeight: 1.16 }}>
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
          </Stack>

          <Box sx={{ position: 'relative', gridArea: 'media' }}>
            <Box
              component="img"
              src={heroSrc}
              {...heroProps}
              fetchPriority="high"
              sx={{
                display: 'block',
                width: '100%',
                aspectRatio: { xs: '16 / 11', md: '16 / 11' },
                objectFit: 'cover',
                borderRadius: { xs: '20px', md: '24px' },
                boxShadow: '0 28px 74px rgba(15, 17, 21, 0.10)'
              }}
            />
          </Box>
        </Box>
      </AppContainer>
    </Box>
  );
}
