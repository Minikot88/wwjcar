import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Stack, Typography } from '@mui/material';
import { OutlineButton, PrimaryButton } from '../../components/ui/buttons/index.js';
import { colors } from '../../theme/colors.js';
import { contactActions, externalLinkProps } from '../../utils/contactActions.js';
import { getCarImageAsset, responsiveImageProps } from '../../utils/imageAssets.js';
import { getFuelLabel, getTransmissionLabel } from './carUtils.js';

const formatter = new Intl.NumberFormat('th-TH');

export default function CarDetailHero({ car }) {
  const imageAsset = getCarImageAsset(car);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.25fr) minmax(360px, 0.75fr)' },
        gap: { xs: 4, lg: 7 },
        alignItems: 'stretch'
      }}
    >
      <Box
        sx={{
          borderRadius: '24px',
          boxShadow: '0 26px 80px rgba(15,17,21,0.07)',
          minHeight: { xs: 320, md: 520 },
          overflow: 'hidden'
        }}
      >
        <Box
          component="img"
          src={imageAsset?.src || car.image}
          {...responsiveImageProps(imageAsset, `${car.name} รถเช่าหาดใหญ่ WWJ Car Rent`)}
          fetchPriority="high"
          sx={{
            display: 'block',
            height: '100%',
            minHeight: { xs: 320, md: 520 },
            objectFit: 'cover',
            width: '100%'
          }}
        />
      </Box>

      <Stack
        spacing={4.5}
        sx={{
          bgcolor: colors.canvas,
          borderRadius: '24px',
          border: `1px solid ${colors.hairlineSoft}`,
          boxShadow: 'none',
          p: { xs: 3, md: 4.5 }
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: colors.primary }}>
            {car.brand}
          </Typography>
          <Typography component="h1" variant="h1" sx={{ mt: 1 }}>
            {car.name}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: colors.body }}>
            ราคาเช่าต่อวัน
          </Typography>
          <Typography sx={{ color: colors.primary, fontSize: { xs: '2.4rem', md: '3.05rem' }, fontWeight: 850, lineHeight: 1 }}>
            ฿{formatter.format(car.pricePerDay)}
          </Typography>
        </Box>

        <Box
          sx={{
            borderTop: `1px solid ${colors.hairlineSoft}`,
            borderBottom: `1px solid ${colors.hairlineSoft}`,
            py: 1.25
          }}
        >
          <Spec icon={<SettingsIcon />} label="ระบบเกียร์" value={getTransmissionLabel(car.transmission)} />
          <Spec icon={<AirlineSeatReclineNormalIcon />} label="จำนวนที่นั่ง" value={`${car.seats} ที่นั่ง`} />
          <Spec icon={<LocalGasStationIcon />} label="เชื้อเพลิง" value={getFuelLabel(car.fuel)} />
        </Box>

        <Stack spacing={2.25}>
          <PrimaryButton component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} aria-label={`จอง ${car.name} ผ่าน LINE`}>
            จองรถรุ่นนี้
          </PrimaryButton>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <OutlineButton component="a" href={contactActions.phone.href} aria-label={contactActions.phone.ariaLabel} sx={{ flex: 1 }} startIcon={<PhoneIcon />}>
              โทรสอบถาม
            </OutlineButton>
            <OutlineButton component="a" href={contactActions.line.href} {...externalLinkProps(contactActions.line)} aria-label={contactActions.line.ariaLabel} sx={{ flex: 1 }}>
              ติดต่อผ่าน LINE
            </OutlineButton>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

function Spec({ icon, label, value }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.75,
        '& + &': {
          borderTop: `1px solid ${colors.hairlineSoft}`
        }
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <Box sx={{ color: colors.primary, display: 'inline-flex' }}>{icon}</Box>
        <Typography variant="caption" sx={{ color: colors.body }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontWeight: 850 }}>{value}</Typography>
    </Stack>
  );
}
