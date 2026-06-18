import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import { Alert, Box, Button, Chip, Divider, Drawer, IconButton, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminAlerts, AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const today = toDateKey(new Date());

const emptyBooking = {
  customerId: '',
  vehicleId: '',
  customerName: '',
  phone: '',
  startDate: today,
  endDate: today,
  status: 'reserved',
  revenueAmount: '',
  note: ''
};

const statusOptions = [
  { value: 'reserved', label: 'จองแล้ว' },
  { value: 'active', label: 'กำลังเช่า' },
  { value: 'returned', label: 'คืนรถแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
  { value: 'maintenance', label: 'รถซ่อม' }
];

const statusTone = {
  available: { label: 'ว่าง', color: '#15803D', bg: 'rgba(21,128,61,0.12)', dot: '#15803D' },
  booked: { label: 'ถูกจอง', color: '#DC2626', bg: 'rgba(220,38,38,0.13)', dot: '#DC2626' },
  maintenance: { label: 'ซ่อม', color: '#F97316', bg: 'rgba(249,115,22,0.16)', dot: '#F97316' },
  returned: { label: 'คืนแล้ว', color: '#6B7280', bg: 'rgba(107,114,128,0.14)', dot: '#6B7280' }
};

function toDateKey(value) {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return date.toISOString().slice(0, 10);
}

function normalizeDate(value) {
  return String(value || '').slice(0, 10);
}

function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

function monthKey(dateKey) {
  return normalizeDate(dateKey).slice(0, 7);
}

function monthDays(monthValue) {
  const [year, month] = monthValue.split('-').map(Number);
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, index) => `${monthValue}-${String(index + 1).padStart(2, '0')}`);
}

function startOfWeek(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return toDateKey(date);
}

function weekDays(dateKey) {
  const start = startOfWeek(dateKey);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function formatThaiShortDate(dateKey) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(new Date(`${dateKey}T00:00:00`));
}

function isBetween(dateKey, startDate, endDate) {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  return start <= dateKey && end >= dateKey;
}

function getBookingStatus(booking) {
  if (booking.status === 'returned') return 'returned';
  if (booking.status === 'maintenance') return 'maintenance';
  if (booking.status === 'cancelled') return 'available';
  return 'booked';
}

function getCellState(vehicleId, dateKey, bookings, maintenanceRecords) {
  const maintenance = maintenanceRecords.find((item) => String(item.vehicleId) === String(vehicleId) && item.status === 'maintenance' && isBetween(dateKey, item.startDate, item.endDate));
  if (maintenance) return { status: 'maintenance', item: maintenance, type: 'maintenance' };

  const booking = bookings.find((item) => String(item.vehicleId) === String(vehicleId) && isBetween(dateKey, item.startDate, item.endDate) && item.status !== 'cancelled');
  if (!booking) return { status: 'available', item: null, type: 'available' };

  return { status: getBookingStatus(booking), item: booking, type: 'booking' };
}

function toForm(booking) {
  return {
    vehicleId: booking.vehicleId || '',
    customerId: booking.customerId || '',
    customerName: booking.customerName || '',
    phone: booking.customerPhone || booking.phone || '',
    startDate: normalizeDate(booking.startDate) || today,
    endDate: normalizeDate(booking.endDate) || today,
    status: booking.status || 'reserved',
    revenueAmount: booking.revenueAmount ?? '',
    note: booking.note || ''
  };
}

function toPayload(form) {
  return {
    vehicleId: Number(form.vehicleId),
    customerId: form.customerId ? Number(form.customerId) : null,
    customerName: form.customerName.trim(),
    customerPhone: form.phone.trim(),
    phone: form.phone.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    status: form.status,
    revenueAmount: Number(form.revenueAmount) || 0,
    note: form.note.trim()
  };
}

function getVehicleName(cars, vehicleId, fallback = '-') {
  return cars.find((car) => String(car.id) === String(vehicleId))?.name || fallback;
}

function StatusLegend() {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
      {['available', 'booked', 'maintenance'].map((key) => (
        <Chip
          key={key}
          size="small"
          label={statusTone[key].label}
          sx={{ bgcolor: statusTone[key].bg, color: statusTone[key].color, fontWeight: 900 }}
        />
      ))}
    </Stack>
  );
}

function CalendarCell({ car, dateKey, state, compact = false, onCreate, onSelect }) {
  const tone = statusTone[state.status] || statusTone.available;
  const isAvailable = state.status === 'available';
  const label = state.type === 'booking' ? state.item.customerName || state.item.customerPhone || tone.label : tone.label;

  return (
    <Button
      onClick={() => (isAvailable ? onCreate(car, dateKey) : onSelect(state.item, state.type))}
      aria-label={`${car.name} ${dateKey} ${tone.label}`}
      sx={{
        alignItems: 'stretch',
        bgcolor: tone.bg,
        border: '0',
        borderRadius: compact ? '14px' : '16px',
        color: tone.color,
        display: 'flex',
        justifyContent: 'flex-start',
        minHeight: compact ? 48 : 58,
        minWidth: 0,
        p: compact ? 0.9 : 1,
        textAlign: 'left',
        width: '100%',
        '&:hover': {
          bgcolor: tone.bg,
          boxShadow: '0 10px 24px rgba(15,17,21,0.08)',
          transform: 'translateY(-1px)'
        },
        transition: 'transform 160ms ease, box-shadow 160ms ease'
      }}
    >
      <Stack spacing={0.35} sx={{ minWidth: 0, width: '100%' }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box sx={{ bgcolor: tone.dot, borderRadius: 99, height: 8, flexShrink: 0, width: 8 }} />
          <Typography sx={{ fontSize: compact ? '0.68rem' : '0.75rem', fontWeight: 950 }} noWrap>
            {tone.label}
          </Typography>
        </Stack>
        {!compact && !isAvailable ? (
          <Typography sx={{ color: 'text.primary', fontSize: '0.76rem', fontWeight: 850 }} noWrap>
            {label}
          </Typography>
        ) : null}
      </Stack>
    </Button>
  );
}

function CalendarGrid({ view, cars, days, bookings, maintenanceRecords, onCreate, onSelect }) {
  if (!cars.length) return <AdminEmptyState label="ยังไม่มีรถในระบบ" />;

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: `minmax(172px, 220px) repeat(${days.length}, minmax(${view === 'month' ? 48 : 116}px, 1fr))`,
          minWidth: view === 'month' ? 1180 : 920
        }}
      >
        <Box sx={{ bgcolor: 'background.paper', borderRadius: '16px', left: 0, p: 1.5, position: 'sticky', zIndex: 2 }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.76rem', fontWeight: 950 }}>รถ</Typography>
        </Box>
        {days.map((day) => (
          <Box key={day} sx={{ bgcolor: 'background.paper', borderRadius: '16px', p: 1.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 950 }}>{formatThaiShortDate(day)}</Typography>
            {view !== 'month' ? <Typography color="text.secondary" sx={{ fontSize: '0.68rem' }}>{new Intl.DateTimeFormat('th-TH', { weekday: 'short' }).format(new Date(`${day}T00:00:00`))}</Typography> : null}
          </Box>
        ))}

        {cars.map((car) => (
          <Box key={car.id} sx={{ display: 'contents' }}>
            <Stack sx={{ bgcolor: 'background.paper', borderRadius: '18px', justifyContent: 'center', left: 0, minWidth: 0, p: 1.5, position: 'sticky', zIndex: 1 }}>
              <Typography sx={{ fontWeight: 950 }} noWrap>{car.name}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.76rem' }} noWrap>
                ฿{Number(car.pricePerDay || 0).toLocaleString('th-TH')} / วัน
              </Typography>
            </Stack>
            {days.map((day) => (
              <CalendarCell
                key={`${car.id}-${day}`}
                car={car}
                dateKey={day}
                compact={view === 'month'}
                state={getCellState(car.id, day, bookings, maintenanceRecords)}
                onCreate={onCreate}
                onSelect={onSelect}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function DayView({ cars, dateKey, bookings, maintenanceRecords, onCreate, onSelect }) {
  if (!cars.length) return <AdminEmptyState label="ยังไม่มีรถในระบบ" />;

  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' } }}>
      {cars.map((car) => {
        const state = getCellState(car.id, dateKey, bookings, maintenanceRecords);
        const tone = statusTone[state.status] || statusTone.available;
        return (
          <Stack key={car.id} spacing={1.5} sx={{ bgcolor: 'background.paper', borderRadius: '24px', boxShadow: '0 14px 36px rgba(15,17,21,0.045)', p: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box component="img" src={car.coverImage || car.image || '/images/optimized/wwj-carrent-600.webp'} alt={`${car.name} รถเช่า WWJ Car Rent`} loading="lazy" sx={{ aspectRatio: '1 / 1', borderRadius: '18px', objectFit: 'cover', width: 72 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 950 }} noWrap>{car.name}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }} noWrap>
                  ฿{Number(car.pricePerDay || 0).toLocaleString('th-TH')} / วัน
                </Typography>
              </Box>
              <Chip size="small" label={tone.label} sx={{ bgcolor: tone.bg, color: tone.color, fontWeight: 900 }} />
            </Stack>
            {state.status === 'available' ? (
              <Button variant="contained" onClick={() => onCreate(car, dateKey)}>เพิ่มคิวจอง</Button>
            ) : (
              <Button variant="outlined" onClick={() => onSelect(state.item, state.type)}>ดูรายละเอียด</Button>
            )}
          </Stack>
        );
      })}
    </Box>
  );
}

function BookingDrawer({ open, mode, form, cars, customers, selectedBooking, action, onClose, onUpdate, onCustomer, onSave, onDelete, onReturned, onCancelled }) {
  const canSave = form.vehicleId && form.customerName.trim() && form.phone.trim() && form.startDate && form.endDate;
  const title = mode === 'create' ? 'เพิ่มคิวจองด่วน' : 'รายละเอียดการจอง';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: '100vw', width: { xs: '100vw', sm: 540, md: 640 } } }}
    >
      <Stack sx={{ minHeight: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', borderBottom: `1px solid ${colors.hairlineSoft}`, p: { xs: 2, md: 3 } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.65rem' }, fontWeight: 950 }}>{title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {selectedBooking ? `รายการ #${selectedBooking.id}` : 'สร้างรายการจากปฏิทินโดยไม่ต้องเปิดฟอร์มใหญ่'}
            </Typography>
          </Box>
          <IconButton aria-label="ปิดหน้าต่าง" onClick={onClose}><CloseOutlinedIcon /></IconButton>
        </Stack>

        <Stack spacing={2.25} sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
          <TextField select label="รถ" value={form.vehicleId} onChange={(event) => onUpdate('vehicleId', event.target.value)} required>
            {cars.map((car) => <MenuItem key={car.id} value={car.id}>{car.name}</MenuItem>)}
          </TextField>
          <TextField select label="เลือกลูกค้าเดิม" value={form.customerId} onChange={(event) => onCustomer(event.target.value)}>
            <MenuItem value="">ไม่ผูกกับข้อมูลลูกค้าเดิม</MenuItem>
            {customers.map((customer) => <MenuItem key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</MenuItem>)}
          </TextField>
          <TextField label="ชื่อลูกค้า" value={form.customerName} onChange={(event) => onUpdate('customerName', event.target.value)} required />
          <TextField label="เบอร์โทร" value={form.phone} onChange={(event) => onUpdate('phone', event.target.value)} required />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="วันรับรถ" type="date" value={form.startDate} onChange={(event) => onUpdate('startDate', event.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
            <TextField label="วันคืนรถ" type="date" value={form.endDate} onChange={(event) => onUpdate('endDate', event.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
          </Stack>
          <TextField select label="สถานะ" value={form.status} onChange={(event) => onUpdate('status', event.target.value)}>
            {statusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <TextField label="รายได้จากรายการนี้" type="number" value={form.revenueAmount} onChange={(event) => onUpdate('revenueAmount', event.target.value)} helperText="ใส่ยอดจริงเมื่อทราบ หรือเว้นว่างไว้ก่อนได้" />
          <TextField label="หมายเหตุ" value={form.note} onChange={(event) => onUpdate('note', event.target.value)} multiline minRows={3} />

          <Divider />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="contained" onClick={onSave} disabled={action.isBusy || !canSave}>
              {mode === 'create' ? 'บันทึกคิวจอง' : 'บันทึกการแก้ไข'}
            </Button>
            <Button variant="outlined" onClick={onReturned} disabled={!selectedBooking || action.isBusy}>
              คืนรถแล้ว
            </Button>
            <Button variant="outlined" color="warning" onClick={onCancelled} disabled={!selectedBooking || action.isBusy}>
              ยกเลิก
            </Button>
            <Button variant="outlined" color="error" onClick={onDelete} disabled={!selectedBooking || action.isBusy}>
              ลบ
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}

function UpcomingReturns({ bookings, onSelect }) {
  const active = bookings
    .filter((item) => ['reserved', 'active'].includes(item.status))
    .sort((a, b) => normalizeDate(a.endDate).localeCompare(normalizeDate(b.endDate)))
    .slice(0, 6);

  return (
    <Stack spacing={1.25} sx={{ bgcolor: 'background.paper', borderRadius: '26px', p: 2.5 }}>
      <Typography sx={{ fontWeight: 950 }}>รถใกล้คืน</Typography>
      {!active.length ? <AdminEmptyState label="ยังไม่มีรถใกล้คืน" /> : null}
      {active.map((booking) => (
        <Button key={booking.id} onClick={() => onSelect(booking, 'booking')} sx={{ bgcolor: colors.canvasElevated, borderRadius: '18px', color: 'text.primary', justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}>
          <Stack spacing={0.4} sx={{ minWidth: 0, width: '100%' }}>
            <Typography sx={{ fontWeight: 900 }} noWrap>{booking.vehicleName}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }} noWrap>{booking.customerName} · คืน {normalizeDate(booking.endDate)}</Typography>
          </Stack>
        </Button>
      ))}
    </Stack>
  );
}

export default function AdminBookings() {
  const action = useAdminAction();
  const { data: carsData, isLoading: carsLoading } = useCmsResource(() => cmsService.getCars(true), { items: [] }, []);
  const { data: customersData } = useCmsResource(() => cmsService.getCustomers({ pageSize: 100 }), [], []);
  const { data: maintenanceData } = useCmsResource(() => cmsService.getMaintenanceRecords({ pageSize: 200 }), [], []);
  const [view, setView] = useState('month');
  const [focusDate, setFocusDate] = useState(today);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [form, setForm] = useState(emptyBooking);

  const cars = useMemo(() => (Array.isArray(carsData) ? carsData : carsData.items || []), [carsData]);
  const customers = useMemo(() => (Array.isArray(customersData) ? customersData : customersData.items || []), [customersData]);
  const maintenanceRecords = useMemo(() => (Array.isArray(maintenanceData) ? maintenanceData : maintenanceData.items || []), [maintenanceData]);
  const visibleCars = useMemo(() => (vehicleFilter ? cars.filter((car) => String(car.id) === String(vehicleFilter)) : cars), [cars, vehicleFilter]);

  const days = useMemo(() => {
    if (view === 'week') return weekDays(focusDate);
    if (view === 'day') return [focusDate];
    return monthDays(monthKey(focusDate));
  }, [focusDate, view]);

  const loadBookings = useCallback(async () => {
    const from = days[0];
    const to = days[days.length - 1];
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const data = await cmsService.getBookings({ from, to, pageSize: 200 });
      setBookings(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      setBookingsError(error.message || 'โหลดปฏิทินจองรถไม่สำเร็จ');
    } finally {
      setBookingsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const shiftPeriod = (direction) => {
    if (view === 'month') {
      const [year, month] = monthKey(focusDate).split('-').map(Number);
      const next = new Date(year, month - 1 + direction, 1);
      setFocusDate(toDateKey(next));
      return;
    }
    setFocusDate(addDays(focusDate, view === 'week' ? direction * 7 : direction));
  };

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const selectCustomer = (value) => {
    const customer = customers.find((item) => String(item.id) === String(value));
    setForm((current) => ({
      ...current,
      customerId: value,
      customerName: customer?.name || current.customerName,
      phone: customer?.phone || current.phone
    }));
  };

  const openCreate = (car = null, dateKey = focusDate) => {
    setSelectedBooking(null);
    setDrawerMode('create');
    setForm({ ...emptyBooking, vehicleId: car?.id || vehicleFilter || '', startDate: dateKey, endDate: dateKey });
    action.clearFeedback();
    setDrawerOpen(true);
  };

  const openBooking = async (item, type) => {
    if (!item || type !== 'booking') return;
    const fullBooking = await action.run(() => cmsService.getBooking(item.id));
    const booking = fullBooking || item;
    setSelectedBooking(booking);
    setDrawerMode('edit');
    setForm(toForm(booking));
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const save = async () => {
    const payload = toPayload(form);
    if (!payload.vehicleId || !payload.customerName || !payload.customerPhone || !payload.startDate || !payload.endDate) {
      action.setError('กรุณากรอกข้อมูลการจองให้ครบถ้วน');
      return;
    }

    const result = selectedBooking
      ? await action.run(() => cmsService.updateBooking(selectedBooking.id, payload), 'บันทึกการจองแล้ว')
      : await action.run(() => cmsService.createBooking(payload), 'เพิ่มคิวจองแล้ว');

    if (!result?.id) return;
    setSelectedBooking(result);
    setDrawerMode('edit');
    setForm(toForm(result));
    await loadBookings();
  };

  const remove = async () => {
    if (!selectedBooking) return;
    await action.run(() => cmsService.deleteBooking(selectedBooking.id), 'ลบรายการจองแล้ว');
    closeDrawer();
    await loadBookings();
  };

  const markReturned = async () => {
    if (!selectedBooking) return;
    const result = await action.run(() => cmsService.markBookingReturned(selectedBooking.id), 'บันทึกว่าคืนรถแล้ว');
    if (!result?.id) return;
    setSelectedBooking(result);
    setForm(toForm(result));
    await loadBookings();
  };

  const markCancelled = async () => {
    if (!selectedBooking) return;
    const result = await action.run(() => cmsService.markBookingCancelled(selectedBooking.id), 'ยกเลิกการจองแล้ว');
    if (!result?.id) return;
    setSelectedBooking(result);
    setForm(toForm(result));
    await loadBookings();
  };

  const periodLabel = view === 'month'
    ? new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date(`${monthKey(focusDate)}-01T00:00:00`))
    : view === 'week'
      ? `${formatThaiShortDate(days[0])} - ${formatThaiShortDate(days[days.length - 1])}`
      : new Intl.DateTimeFormat('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${focusDate}T00:00:00`));

  return (
    <AdminPanel
      title="ปฏิทินจองรถ"
      description="ดูสถานะรถก่อนเป็นอันดับแรก สร้างคิวจอง คืนรถ และจัดการช่วงเวลารถไม่ว่างได้จากปฏิทิน"
      actionLabel="เพิ่มคิวจอง"
      onAction={() => openCreate()}
    >
      <Stack spacing={3}>
        <AdminAlerts error={action.error || bookingsError} success={action.success} />
        {bookingsLoading || carsLoading ? <AdminLoadingBlock label="กำลังโหลดปฏิทินจองรถ..." /> : null}
        {bookingsError ? <Alert severity="warning">ระบบแสดงข้อมูลที่โหลดได้บางส่วน กรุณาลองใหม่อีกครั้ง</Alert> : null}

        <Box sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 18px 48px rgba(15,17,21,0.045)', p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}>
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CalendarMonthOutlinedIcon color="primary" />
                  <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.6rem' }, fontWeight: 950 }}>{periodLabel}</Typography>
                </Stack>
                <StatusLegend />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ alignItems: { sm: 'center' } }}>
                <TextField select label="กรองรถ" value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)} size="small" sx={{ minWidth: { sm: 220 } }}>
                  <MenuItem value="">รถทุกคัน</MenuItem>
                  {cars.map((car) => <MenuItem key={car.id} value={car.id}>{car.name}</MenuItem>)}
                </TextField>
                <Stack direction="row" spacing={0.75}>
                  <IconButton aria-label="ช่วงก่อนหน้า" onClick={() => shiftPeriod(-1)}><KeyboardArrowLeftOutlinedIcon /></IconButton>
                  <Button variant="outlined" onClick={() => setFocusDate(today)}>วันนี้</Button>
                  <IconButton aria-label="ช่วงถัดไป" onClick={() => shiftPeriod(1)}><KeyboardArrowRightOutlinedIcon /></IconButton>
                </Stack>
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
              <Tabs value={view} onChange={(_, value) => setView(value)} variant="scrollable" allowScrollButtonsMobile sx={{ minHeight: 44 }}>
                <Tab value="month" label="รายเดือน" />
                <Tab value="week" label="รายสัปดาห์" />
                <Tab value="day" label="รายวัน" />
              </Tabs>
              {view === 'month' ? (
                <TextField label="เดือน" type="month" value={monthKey(focusDate)} onChange={(event) => setFocusDate(`${event.target.value}-01`)} InputLabelProps={{ shrink: true }} size="small" sx={{ width: { xs: '100%', md: 220 } }} />
              ) : (
                <TextField label="วันที่" type="date" value={focusDate} onChange={(event) => setFocusDate(event.target.value)} InputLabelProps={{ shrink: true }} size="small" sx={{ width: { xs: '100%', md: 220 } }} />
              )}
            </Stack>

            {view === 'day' ? (
              <DayView cars={visibleCars} dateKey={focusDate} bookings={bookings} maintenanceRecords={maintenanceRecords} onCreate={openCreate} onSelect={openBooking} />
            ) : (
              <CalendarGrid view={view} cars={visibleCars} days={days} bookings={bookings} maintenanceRecords={maintenanceRecords} onCreate={openCreate} onSelect={openBooking} />
            )}
          </Stack>
        </Box>

        <UpcomingReturns bookings={bookings} onSelect={openBooking} />
      </Stack>

      <BookingDrawer
        open={drawerOpen}
        mode={drawerMode}
        form={form}
        cars={cars}
        customers={customers}
        selectedBooking={selectedBooking}
        action={action}
        onClose={closeDrawer}
        onUpdate={updateForm}
        onCustomer={selectCustomer}
        onSave={save}
        onDelete={remove}
        onReturned={markReturned}
        onCancelled={markCancelled}
      />
    </AdminPanel>
  );
}
