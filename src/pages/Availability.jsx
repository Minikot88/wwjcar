import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import SettingsIcon from '@mui/icons-material/Settings';
import { Alert, Box, Button, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router';
import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import Seo from '../components/seo/Seo.jsx';
import { getTransmissionLabel } from '../features/cars/carUtils.js';
import { cmsService } from '../services/cmsService.js';
import { colors } from '../theme/colors.js';
import { getCarImageAsset, responsiveImageProps } from '../utils/imageAssets.js';

const formatter = new Intl.NumberFormat('th-TH');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatThaiDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`));
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

function VehicleAvailabilityCard({ car, unavailable = false }) {
  const imageAsset = getCarImageAsset(car);
  const imageSrc = car.image || imageAsset?.src;
  const imageProps = car.image
    ? { alt: `${car.name} WWJ Car Rent` }
    : responsiveImageProps(imageAsset, `${car.name} WWJ Car Rent`);

  return (
    <Box
      sx={{
        bgcolor: colors.canvas,
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '24px',
        boxShadow: '0 16px 44px rgba(15, 17, 21, 0.045)',
        display: 'grid',
        gap: 0,
        gridTemplateColumns: { xs: '1fr', md: '220px 1fr' },
        overflow: 'hidden'
      }}
    >
      <Box
        component="img"
        src={imageSrc}
        {...imageProps}
        loading="lazy"
        sx={{
          aspectRatio: { xs: '16 / 10', md: '1 / 1' },
          bgcolor: colors.canvasElevated,
          height: '100%',
          objectFit: 'cover',
          width: '100%'
        }}
      />
      <Stack spacing={2} sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 800 }}>
              {car.brand}
            </Typography>
            <Typography component="h3" variant="h3" sx={{ mt: 0.5 }}>
              {car.name}
            </Typography>
          </Box>
          <Chip
            label={unavailable ? 'ไม่ว่าง' : 'ว่าง'}
            color={unavailable ? 'error' : 'success'}
            sx={{ fontWeight: 800 }}
          />
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Spec icon={<SettingsIcon fontSize="small" />} label={getTransmissionLabel(car.transmission)} />
          <Spec icon={<AirlineSeatReclineNormalIcon fontSize="small" />} label={`${car.seats} ที่นั่ง`} />
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary">
            ราคาเริ่มต้น
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Typography sx={{ color: colors.primary, fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.1 }}>
              ฿{formatter.format(Number(car.pricePerDay || 0))}
            </Typography>
            <Typography color="text.secondary">/ วัน</Typography>
          </Stack>
        </Box>

        {unavailable ? (
          <Stack spacing={1}>
            <Typography color="text.secondary">
              วันว่างถัดไป:{' '}
              <Typography component="span" fontWeight={900} color="text.primary">
                {formatThaiDate(car.nextAvailableDate)}
              </Typography>
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {car.blockingBookings?.map((booking) => (
                <Chip
                  key={`${booking.source || 'booking'}-${booking.id}`}
                  label={booking.status === 'maintenance' ? 'ซ่อมบำรุง' : 'มีผู้ใช้งาน'}
                  color={booking.status === 'maintenance' ? 'warning' : 'primary'}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        ) : null}

        <Button component={Link} to={`/cars/${car.slug}`} variant={unavailable ? 'outlined' : 'contained'} fullWidth>
          ดูรายละเอียดรถ
        </Button>
      </Stack>
    </Box>
  );
}

export default function Availability() {
  const [dates, setDates] = useState({ startDate: today(), endDate: tomorrow() });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const check = async (event) => {
    event.preventDefault();
    setError('');

    if (new Date(dates.endDate) < new Date(dates.startDate)) {
      setError('วันคืนรถต้องไม่อยู่ก่อนวันรับรถ');
      return;
    }

    setIsLoading(true);
    try {
      setResult(await cmsService.getAvailability(dates));
    } catch (checkError) {
      setError(checkError.message || 'ไม่สามารถตรวจสอบคิวรถได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="เช็คคิวรถเช่าหาดใหญ่ | WWJ Car Rent"
        description="เช็คคิวรถเช่าหาดใหญ่ เลือกวันรับรถและวันคืนรถเพื่อดูรถที่ว่าง รถที่ไม่ว่าง ราคา ที่นั่ง เกียร์ และวันว่างถัดไปกับ WWJ Car Rent"
        canonical="/availability"
        ogTitle="เช็คคิวรถเช่าหาดใหญ่ | WWJ Car Rent"
        ogDescription="ตรวจสอบรถว่าง เลือกช่วงวันที่ต้องการเช่า และดูวันว่างถัดไปของรถแต่ละรุ่นในหาดใหญ่"
      />

      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="ตรวจสอบคิวรถ"
          title="เช็คคิวรถเช่าหาดใหญ่"
          description="เลือกวันรับรถและวันคืนรถ ระบบจะแสดงรถที่ว่าง รถที่ไม่ว่าง และวันว่างถัดไป หน้านี้ใช้สำหรับตรวจสอบสถานะรถเท่านั้น ไม่ใช่ระบบจองออนไลน์"
        />

        <Section surface="light" spacing="compact" sx={{ mx: 'calc(50% - 50vw)' }} containerSx={{ color: colors.bodyOnLight }}>
          <Stack
            component="form"
            onSubmit={check}
            spacing={2.5}
            sx={{
              bgcolor: colors.canvas,
              borderRadius: '24px',
              boxShadow: '0 18px 50px rgba(15,17,21,0.045)',
              p: { xs: 2.5, md: 4 }
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="วันรับรถ"
                type="date"
                value={dates.startDate}
                onChange={(event) => setDates({ ...dates, startDate: event.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                label="วันคืนรถ"
                type="date"
                value={dates.endDate}
                onChange={(event) => setDates({ ...dates, endDate: event.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <Button type="submit" variant="contained" disabled={isLoading} sx={{ minHeight: 56, minWidth: { md: 190 } }}>
                {isLoading ? (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CircularProgress size={18} color="inherit" />
                    <span>กำลังตรวจสอบ</span>
                  </Stack>
                ) : 'เช็คคิวรถ'}
              </Button>
            </Stack>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Alert severity="info" sx={{ borderRadius: '18px' }}>
              ผู้ใช้งานสาธารณะสามารถดูสถานะรถและวันว่างได้เท่านั้น การสร้าง แก้ไข หรือยกเลิก booking ทำได้เฉพาะในระบบ Admin
            </Alert>
          </Stack>
        </Section>

        {result ? (
          <Stack spacing={5}>
            <Stack spacing={1}>
              <Typography component="h2" variant="h2">ผลการตรวจสอบคิวรถ</Typography>
              <Typography color="text.secondary">
                ช่วงวันที่ {formatThaiDate(result.startDate)} ถึง {formatThaiDate(result.endDate)}
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <Box>
                <Typography component="h2" variant="h2">รถที่ว่าง</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  รถเหล่านี้ว่างในช่วงวันที่เลือก สามารถกดดูรายละเอียดรถเพื่อดูปฏิทินคิวรายคัน
                </Typography>
              </Box>
              {result.availableVehicles.length > 0 ? (
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, 1fr)' } }}>
                  {result.availableVehicles.map((car) => <VehicleAvailabilityCard key={car.id} car={car} />)}
                </Box>
              ) : (
                <Alert severity="warning">ไม่มีรถว่างในช่วงวันที่เลือก กรุณาดูวันว่างถัดไปด้านล่างหรือเลือกช่วงวันที่ใหม่</Alert>
              )}
            </Stack>

            <Stack spacing={3}>
              <Box>
                <Typography component="h2" variant="h2">รถที่ไม่ว่าง</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  ระบบแสดงวันว่างถัดไปเพื่อช่วยวางแผนวันเดินทาง
                </Typography>
              </Box>
              {result.unavailableVehicles.length > 0 ? (
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, 1fr)' } }}>
                  {result.unavailableVehicles.map((car) => <VehicleAvailabilityCard key={car.id} car={car} unavailable />)}
                </Box>
              ) : (
                <Alert severity="success">รถทุกคันในระบบว่างสำหรับช่วงวันที่เลือก</Alert>
              )}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </>
  );
}
