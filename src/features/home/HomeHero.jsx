import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { LogoFull } from '../../components/brand/Logo.jsx';
import AppContainer from '../../components/layout/AppContainer.jsx';
import { OutlineButton, PrimaryButton } from '../../components/ui/buttons/index.js';
import { colors } from '../../theme/colors.js';
import { contactActions, externalLinkProps } from '../../utils/contactActions.js';
import { getImageAsset, responsiveImageProps } from '../../utils/imageAssets.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';

const heroImage = getImageAsset('home-hero');

const trustIndicators = [
  { label: 'รับรถสนามบิน', icon: AirportShuttleIcon },
  { label: 'บริการ 24 ชั่วโมง', icon: AccessTimeIcon },
  { label: 'รถสะอาด', icon: CleaningServicesIcon },
  { label: 'ประกันภัยครบ', icon: VerifiedUserOutlinedIcon }
];

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
        overflow: 'hidden',
        position: 'relative',
        pt: { xs: 6.5, md: 9 },
        pb: { xs: 5.5, md: 6 },
        background:
          'radial-gradient(circle at 78% 16%, rgba(255,0,0,0.08), transparent 28%), linear-gradient(180deg, var(--wwj-bg) 0%, var(--wwj-surface) 100%)'
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          bgcolor: colors.primary,
          borderRadius: '999px',
          filter: 'blur(48px)',
          height: 140,
          opacity: 0.08,
          position: 'absolute',
          right: { xs: -60, md: '10%' },
          top: { xs: 120, md: 90 },
          width: 140
        }}
      />
      <AppContainer size="editorial">
        <Box
          sx={{
            display: 'grid',
            gridTemplateAreas: {
              xs: '"intro" "media" "actions"',
              lg: '"intro media" "actions media"'
            },
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.92fr) minmax(420px, 1.08fr)' },
            gap: { xs: 3.5, md: 6, lg: 7 },
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <Stack spacing={{ xs: 2.25, md: 3 }} sx={{ gridArea: 'intro' }}>
            <LogoFull to={null} markSize={{ xs: 34, md: 40 }} priority />

            <Box>
              <Typography
                component="h1"
                variant="display"
                sx={{
                  maxWidth: 680,
                  fontSize: { xs: '2.05rem', sm: '2.4rem', md: '3.05rem' },
                  lineHeight: 1.14
                }}
              >
                รถเช่าหาดใหญ่ จองง่าย รับรถไว
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 2.25, maxWidth: 610, fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.85 }}
              >
                เลือกรถที่เหมาะกับทริปของคุณ เช็ครถว่างผ่าน LINE โทรสอบถามได้ทันที พร้อมนัดรับรถที่สนามบินหาดใหญ่และจุดนัดหมายในเมือง
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ gridArea: 'actions' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <PrimaryButton
                component="a"
                href={contactActions.line.href}
                {...externalLinkProps(contactActions.line)}
                aria-label={contactActions.line.ariaLabel}
                sx={{ minHeight: 54, px: 3.5 }}
              >
                จองผ่าน LINE
              </PrimaryButton>
              <OutlineButton component="a" href="/cars" onLight sx={{ minHeight: 54, px: 3.5 }}>
                ดูรถทั้งหมด
              </OutlineButton>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {trustIndicators.map((item) => {
                const Icon = item.icon;
                return (
                  <Chip
                    key={item.label}
                    icon={<Icon />}
                    label={item.label}
                    sx={{
                      bgcolor: 'color-mix(in srgb, var(--wwj-bg) 84%, transparent)',
                      border: `1px solid ${colors.hairlineSoft}`,
                      color: 'text.primary',
                      fontWeight: 800,
                      height: 38,
                      px: 0.5,
                      '& .MuiChip-icon': {
                        color: colors.primary
                      }
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>

          <Box sx={{ position: 'relative', gridArea: 'media' }}>
            <Box
              sx={{
                bgcolor: 'color-mix(in srgb, var(--wwj-bg) 92%, transparent)',
                border: `1px solid ${colors.hairlineSoft}`,
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F9FB 100%)',
                borderRadius: { xs: '24px', md: '32px' },
                boxShadow: '0 28px 72px rgba(15,17,21,0.10)',
                overflow: 'hidden',
                p: { xs: 1, md: 1.25 },
                transform: { lg: 'translateY(4px)' }
              }}
            >
              <Box
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: { xs: '19px', md: '26px' },
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Box
                  component="img"
                  src={heroSrc}
                  {...heroProps}
                  fetchPriority="high"
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    maxHeight: { xs: 360, md: 520 },
                    minHeight: { xs: 260, md: 420 },
                    aspectRatio: { xs: '16 / 10.7', md: '16 / 9.9' },
                    objectFit: 'cover',
                    objectPosition: 'center 62%',
                    borderRadius: { xs: '19px', md: '26px' },
                    filter: 'saturate(1.03) contrast(1.02)'
                  }}
                />
                <Box
                  aria-hidden="true"
                  sx={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.54) 0%, rgba(255,255,255,0.16) 28%, transparent 62%)',
                    inset: 0,
                    pointerEvents: 'none',
                    position: 'absolute'
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                border: `1px solid ${colors.hairlineSoft}`,
                borderRadius: '20px',
                bottom: { xs: 12, md: 18 },
                boxShadow: colors.shadowSoft,
                left: { xs: 12, md: 18 },
                px: 2,
                py: 1.25,
                position: 'absolute'
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>รับรถสนามบินหาดใหญ่</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                คุยกับทีมงานก่อนจองได้ทันที
              </Typography>
            </Box>
          </Box>
        </Box>
      </AppContainer>
    </Box>
  );
}
