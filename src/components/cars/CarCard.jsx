import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { Link } from 'react-router';
import { getFuelLabel, getTransmissionLabel } from '../../features/cars/carUtils.js';
import { colors } from '../../theme/colors.js';
import { getCarImageAsset, responsiveImageProps } from '../../utils/imageAssets.js';

const formatter = new Intl.NumberFormat('th-TH');

function CarCard({ car }) {
  const primaryBadge = car.categories?.[0] || 'รถเช่า';
  const imageAsset = getCarImageAsset(car);
  const imageSrc = car.image || imageAsset?.src;
  const imageProps = car.image
    ? { alt: `${car.name} รถเช่าหาดใหญ่ WWJ Car Rent` }
    : responsiveImageProps(imageAsset, `${car.name} รถเช่าหาดใหญ่ WWJ Car Rent`);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '26px',
        boxShadow: colors.shadowSoft,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          borderColor: 'color-mix(in srgb, var(--wwj-border) 68%, #ff0000)',
          transform: { md: 'translateY(-4px)' },
          boxShadow: colors.shadowMedium,
          img: {
            transform: { md: 'scale(1.025)' }
          }
        },
        '&:focus-within': {
          borderColor: colors.primary,
          boxShadow: '0 0 0 4px rgba(255,0,0,0.08)'
        }
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 78%, var(--wwj-surface) 100%)',
          p: { xs: 1, md: 1.2 },
          position: 'relative'
        }}
      >
        <Link to={`/cars/${car.slug}`} aria-label={`ดูรายละเอียด ${car.name}`}>
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '21px',
              display: 'grid',
              minHeight: { xs: 172, sm: 178, md: 182 },
              overflow: 'hidden',
              placeItems: 'center',
              position: 'relative',
              '&::after': {
                background: 'linear-gradient(180deg, transparent 72%, rgba(255,255,255,0.92) 100%)',
                content: '""',
                inset: 0,
                pointerEvents: 'none',
                position: 'absolute'
              }
            }}
          >
            <Box
              component="img"
              src={imageSrc}
              {...imageProps}
              loading="lazy"
              sx={{
                height: { xs: 172, sm: 178, md: 182 },
                display: 'block',
                objectFit: 'contain',
                objectPosition: 'center center',
                p: { xs: 1.6, md: 1.8 },
                position: 'relative',
                width: '100%',
                transition: 'transform 240ms ease',
                zIndex: 1
              }}
            />
          </Box>
        </Link>
        <Chip
          label={primaryBadge}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.92)',
            border: `1px solid ${colors.hairlineSoft}`,
            color: '#212121',
            fontWeight: 850,
            left: 18,
            position: 'absolute',
            top: 18,
            backdropFilter: 'blur(12px)'
          }}
        />
      </Box>

      <Stack spacing={1.8} sx={{ flex: 1, minWidth: 0, p: { xs: 2.25, md: 2.5 } }}>
        <Box>
          <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 850 }}>
            {car.brand}
          </Typography>
          <Typography
            component={Link}
            to={`/cars/${car.slug}`}
            variant="h3"
            sx={{
              color: 'text.primary',
              display: 'block',
              mt: 0.65,
              overflowWrap: 'anywhere',
              textDecoration: 'none',
              '&:hover': { color: colors.primary }
            }}
          >
            {car.name}
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: colors.canvasElevated,
            borderRadius: '18px',
            px: 1.75,
            py: 1.25
          }}
        >
          <Typography variant="caption" sx={{ color: colors.muted }}>
            เริ่มต้น
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Typography sx={{ color: colors.primary, fontSize: { xs: '1.55rem', md: '1.72rem' }, fontWeight: 950, lineHeight: 1.05 }}>
              ฿{formatter.format(car.pricePerDay)}
            </Typography>
            <Typography color="text.secondary">/ วัน</Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={0.85} useFlexGap flexWrap="wrap">
          <Spec icon={<SettingsIcon fontSize="small" />} label={getTransmissionLabel(car.transmission)} />
          <Spec icon={<AirlineSeatReclineNormalIcon fontSize="small" />} label={`${car.seats} ที่นั่ง`} />
          <Spec icon={<LocalGasStationIcon fontSize="small" />} label={getFuelLabel(car.fuel)} />
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Button
          component={Link}
          to={`/cars/${car.slug}`}
          variant="contained"
          fullWidth
          aria-label={`ดูรายละเอียด ${car.name}`}
          sx={{
            mt: 0.25,
            minHeight: 48,
            '&:hover': {
              transform: { md: 'translateY(-1px)' }
            }
          }}
        >
          ดูรายละเอียด
        </Button>
      </Stack>
    </Box>
  );
}

function Spec({ icon, label }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        alignItems: 'center',
        bgcolor: 'transparent',
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '999px',
        color: colors.body,
        minWidth: 0,
        px: 1.1,
        py: 0.65
      }}
    >
      <Box sx={{ color: colors.primary, display: 'inline-flex' }}>{icon}</Box>
      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
        {label}
      </Typography>
    </Stack>
  );
}

export default memo(CarCard);
