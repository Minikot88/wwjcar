import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import { Alert, Box, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const statusMeta = {
  available: { label: 'ว่าง', color: '#15803D', bg: 'rgba(21, 128, 61, 0.12)' },
  booked: { label: 'ไม่ว่าง', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.14)' },
  returned: { label: 'คืนรถแล้ว', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.16)' },
  maintenance: { label: 'เข้าศูนย์/ซ่อมบำรุง', color: '#F97316', bg: 'rgba(249, 115, 22, 0.16)' }
};

function localDateString(date = new Date()) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return offsetDate.toISOString().slice(0, 10);
}

function currentMonthValue() {
  return localDateString().slice(0, 7);
}

function normalizeDate(value) {
  return String(value || '').slice(0, 10);
}

function monthDays(monthValue) {
  const [year, month] = monthValue.split('-').map(Number);
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, index) => `${monthValue}-${String(index + 1).padStart(2, '0')}`);
}

function getCalendarStatus(day, blocks) {
  const block = blocks.find((item) => (
    normalizeDate(item.startDate) <= day
    && normalizeDate(item.endDate) >= day
    && item.status !== 'cancelled'
  ));

  if (!block) return 'available';
  if (block.status === 'maintenance' || block.source === 'maintenance') return 'maintenance';
  if (block.status === 'returned') return 'returned';
  return 'booked';
}

function formatThaiDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`));
}

function CalendarDay({ day, status }) {
  const item = statusMeta[status] || statusMeta.available;

  return (
    <Box
      title={`${formatThaiDate(day)}: ${item.label}`}
      aria-label={`${formatThaiDate(day)} ${item.label}`}
      sx={{
        alignItems: 'center',
        bgcolor: item.bg,
        borderRadius: '14px',
        color: item.color,
        display: 'flex',
        flexDirection: 'column',
        fontWeight: 900,
        gap: 0.5,
        minHeight: { xs: 54, sm: 62 },
        p: 0.9
      }}
    >
      <Typography sx={{ color: 'inherit', fontSize: 13, fontWeight: 900 }}>
        {Number(day.slice(-2))}
      </Typography>
      <Box sx={{ bgcolor: item.color, borderRadius: '999px', height: 6, width: 6 }} />
    </Box>
  );
}

function SummaryCard({ icon, label, value, tone = 'default' }) {
  const toneColor = tone === 'primary' ? colors.primary : tone === 'success' ? '#15803D' : 'text.primary';

  return (
    <Stack
      spacing={1}
      sx={{
        bgcolor: colors.canvasElevated,
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '22px',
        p: { xs: 2, md: 2.5 }
      }}
    >
      <Box sx={{ color: toneColor, display: 'inline-flex' }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ color: toneColor, fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 900, lineHeight: 1.15 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function CarAvailabilityCalendar({ car }) {
  const [month, setMonth] = useState(currentMonthValue());
  const [blocks, setBlocks] = useState([]);
  const [nextAvailableDate, setNextAvailableDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCalendar() {
      const [year, monthNumber] = month.split('-').map(Number);
      const today = localDateString();

      setIsLoading(true);
      setError('');

      try {
        const [calendarData, todayAvailability] = await Promise.all([
          cmsService.getVehicleCalendar(car.id, { year, month: monthNumber }),
          cmsService.getAvailability({ startDate: today, endDate: today })
        ]);

        if (!isMounted) return;

        const calendarBlocks = calendarData?.bookings || [];
        const isAvailableToday = todayAvailability?.availableVehicles?.some((vehicle) => String(vehicle.id) === String(car.id));
        const unavailableCar = todayAvailability?.unavailableVehicles?.find((vehicle) => String(vehicle.id) === String(car.id));

        setBlocks(calendarBlocks);
        setNextAvailableDate(isAvailableToday ? today : unavailableCar?.nextAvailableDate || '');
      } catch (calendarError) {
        if (!isMounted) return;
        setError(calendarError.message || 'ไม่สามารถโหลดปฏิทินคิวรถได้');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCalendar();

    return () => {
      isMounted = false;
    };
  }, [car.id, month]);

  const days = useMemo(() => monthDays(month), [month]);
  const daysWithStatus = useMemo(() => (
    days.map((day) => ({ day, status: getCalendarStatus(day, blocks) }))
  ), [blocks, days]);

  const availableDays = daysWithStatus.filter((item) => item.status === 'available').length;
  const bookedDays = daysWithStatus.filter((item) => item.status === 'booked').length;
  const maintenanceDays = daysWithStatus.filter((item) => item.status === 'maintenance').length;

  return (
    <Box
      component="section"
      aria-labelledby="car-availability-calendar-title"
      sx={{
        bgcolor: colors.canvas,
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '28px',
        p: { xs: 2.5, md: 4 }
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography id="car-availability-calendar-title" component="h2" variant="h2">
              ปฏิทินคิวรถ
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
              ตรวจสอบวันว่างและวันที่ไม่ว่างของ {car.name} แบบอ่านอย่างเดียว หน้านี้ไม่ใช่ระบบจองออนไลน์
            </Typography>
          </Box>
          <TextField
            label="เลือกเดือน"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: { md: 220 } }}
          />
        </Stack>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
          <SummaryCard icon={<EventAvailableOutlinedIcon />} label="วันว่างในเดือนนี้" value={`${availableDays} วัน`} tone="success" />
          <SummaryCard icon={<EventBusyOutlinedIcon />} label="วันที่มีการใช้งาน" value={`${bookedDays} วัน`} tone="primary" />
          <SummaryCard icon={<EventBusyOutlinedIcon />} label="วันซ่อมบำรุง" value={`${maintenanceDays} วัน`} />
          <SummaryCard icon={<EventAvailableOutlinedIcon />} label="วันว่างถัดไป" value={formatThaiDate(nextAvailableDate)} tone="success" />
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {Object.entries(statusMeta).map(([key, item]) => (
            <Chip
              key={key}
              label={item.label}
              sx={{ bgcolor: item.bg, color: item.color, fontWeight: 850 }}
            />
          ))}
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {isLoading ? (
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <CircularProgress size={18} />
            <Typography>กำลังโหลดปฏิทินคิวรถ</Typography>
          </Stack>
        ) : (
          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
            {daysWithStatus.map(({ day, status }) => (
              <CalendarDay key={day} day={day} status={status} />
            ))}
          </Box>
        )}

        <Alert severity="info" sx={{ borderRadius: '18px' }}>
          ผู้ใช้งานสาธารณะสามารถดูสถานะรถและวันว่างได้เท่านั้น หากต้องการให้ทีมงานตรวจสอบรายละเอียดเพิ่มเติม กรุณาติดต่อ WWJ Car Rent โดยตรง
        </Alert>
      </Stack>
    </Box>
  );
}
