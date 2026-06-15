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

  return (
    <Box
      sx={{
        bgcolor: colors.canvas,
        borderRadius: '24px',
        boxShadow: '0 16px 44px rgba(15, 17, 21, 0.045)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: { md: 'translateY(-4px)' },
          boxShadow: '0 24px 62px rgba(15, 17, 21, 0.085)',
          img: {
            transform: { md: 'scale(1.025)' }
          }
        }
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Link to={`/cars/${car.slug}`} aria-label={`ดูรายละเอียด ${car.name}`}>
          <Box
            component="img"
            src={imageAsset?.src || car.image}
            {...responsiveImageProps(imageAsset, `${car.name} รถเช่าหาดใหญ่ WWJ Car Rent`)}
            loading="lazy"
            sx={{
              aspectRatio: '16 / 10.5',
              bgcolor: colors.surfaceSoftLight,
              display: 'block',
              objectFit: 'cover',
              width: '100%',
              transition: 'transform 240ms ease'
            }}
          />
        </Link>
        <Chip
          label={primaryBadge}
          sx={{
            position: 'absolute',
            top: 18,
            left: 18,
            borderRadius: '999px',
            bgcolor: 'color-mix(in srgb, var(--wwj-bg) 88%, transparent)',
            color: 'text.primary',
            fontWeight: 700,
            boxShadow: 'none',
            backdropFilter: 'blur(12px)'
          }}
        />
      </Box>

      <Stack spacing={2.5} sx={{ flex: 1, p: { xs: 2.75, md: 3.25 } }}>
        <Box>
          <Typography variant="caption" sx={{ color: colors.primary }}>
            {car.brand}
          </Typography>
          <Typography
            component={Link}
            to={`/cars/${car.slug}`}
            variant="h3"
            sx={{ color: colors.ink, mt: 0.75, display: 'block', textDecoration: 'none' }}
          >
            {car.name}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: colors.muted }}>
            เริ่มต้น
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
            <Typography sx={{ color: colors.primary, fontSize: '1.75rem', fontWeight: 850, lineHeight: 1.1 }}>
              ฿{formatter.format(car.pricePerDay)}
            </Typography>
            <Typography color="text.secondary">/ วัน</Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ pt: 0.5 }}>
          <Spec icon={<SettingsIcon fontSize="small" />} label={getTransmissionLabel(car.transmission)} />
          <Spec icon={<AirlineSeatReclineNormalIcon fontSize="small" />} label={`${car.seats} ที่นั่ง`} />
          <Spec icon={<LocalGasStationIcon fontSize="small" />} label={getFuelLabel(car.fuel)} />
        </Stack>

        <Stack>
          <Button component={Link} to={`/cars/${car.slug}`} variant="contained" fullWidth aria-label={`ดูรายละเอียด ${car.name}`} sx={{ mt: 0.5 }}>
            ดูรายละเอียด
          </Button>
        </Stack>
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
        bgcolor: colors.canvasElevated,
        borderRadius: '999px',
        color: colors.body,
        px: 1.35,
        py: 0.85
      }}
    >
      {icon}
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

export default memo(CarCard);
