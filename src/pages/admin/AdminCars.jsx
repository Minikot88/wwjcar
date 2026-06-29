import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { Alert, Box, Button, Checkbox, Chip, Drawer, FormControlLabel, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { cars as fallbackCars } from '../../data/cars.js';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const emptyCar = {
  name: '',
  slug: '',
  brand: '',
  image: '',
  pricePerDay: 0,
  transmission: 'Automatic',
  seats: 5,
  fuel: 'Petrol',
  description: '',
  categories: '',
  suitableFor: '',
  luggage: 2,
  featured: false,
  airportPickup: true,
  monthlyRental: false,
  status: 'published'
};

function toForm(car) {
  return {
    ...emptyCar,
    ...car,
    image: car.coverImage || car.image || '',
    categories: (car.categories || []).join(', '),
    suitableFor: (car.suitableFor || []).join(', ')
  };
}

function list(value) {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

function toPayload(form) {
  return {
    ...form,
    coverImage: form.image,
    pricePerDay: Number(form.pricePerDay),
    seats: Number(form.seats),
    luggage: Number(form.luggage),
    categories: list(form.categories),
    suitableFor: list(form.suitableFor)
  };
}

function getStatus(car) {
  if (car.status === 'hidden' || car.status === 'archived') return { label: 'ซ่อนอยู่', color: '#6B7280', bg: 'rgba(107,114,128,0.14)' };
  if (car.featured) return { label: 'รถแนะนำ', color: colors.primary, bg: colors.primarySoft };
  if (car.monthlyRental) return { label: 'เช่ารายเดือน', color: '#2563EB', bg: 'rgba(37,99,235,0.12)' };
  return { label: 'พร้อมแสดง', color: '#15803D', bg: 'rgba(21,128,61,0.12)' };
}

function VehicleCard({ car, onEdit }) {
  const image = car.coverImage || car.image || '/images/optimized/wwj-carrent-600.webp';
  const status = getStatus(car);

  return (
    <Stack
      spacing={1.75}
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '30px',
        boxShadow: colors.shadowSoft,
        minWidth: 0,
        overflow: 'hidden',
        p: 1.35,
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: { md: 'translateY(-3px)' },
          boxShadow: colors.shadowMedium
        }
      }}
    >
      <Box sx={{ bgcolor: colors.canvasElevated, borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
        <Box
          component="img"
          src={image}
          alt={`${car.name} รถเช่า`}
          loading="lazy"
          sx={{
            aspectRatio: '16 / 10',
            display: 'block',
            objectFit: 'contain',
            p: 1.5,
            width: '100%'
          }}
        />
        <Chip
          size="small"
          label={status.label}
          sx={{
            bgcolor: status.bg,
            color: status.color,
            fontWeight: 900,
            position: 'absolute',
            right: 14,
            top: 14
          }}
        />
      </Box>

      <Stack spacing={1.5} sx={{ px: 1, pb: 1 }}>
        <Box>
          <Typography sx={{ fontSize: '1.08rem', fontWeight: 950 }} noWrap>
            {car.name}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.86rem' }} noWrap>
            {car.brand} · {car.transmission} · {car.seats} ที่นั่ง
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" sx={{ fontSize: '0.76rem', fontWeight: 850 }}>
              ราคา/วัน
            </Typography>
            <Typography color="primary" sx={{ fontSize: '1.42rem', fontWeight: 950, lineHeight: 1.1 }}>
              ฿{Number(car.pricePerDay || 0).toLocaleString('th-TH')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75}>
            <IconButton component={Link} to="/admin/bookings" aria-label={`ดูปฏิทิน ${car.name}`} sx={{ bgcolor: colors.canvasElevated }}>
              <EventAvailableOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton component={Link} to="/admin/uploads" aria-label={`จัดการรูปภาพ ${car.name}`} sx={{ bgcolor: colors.canvasElevated }}>
              <CollectionsOutlinedIcon fontSize="small" />
            </IconButton>
            <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
              แก้ไข
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

function EditDrawer({ open, form, selectedId, action, onClose, onUpdate, onSave, onDelete }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 620 }, maxWidth: '100vw' } }}
    >
      <Stack sx={{ minHeight: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', borderBottom: `1px solid ${colors.hairlineSoft}`, p: { xs: 2, md: 3 } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '1.45rem', fontWeight: 950 }}>
              {selectedId ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถใหม่'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              แก้ไขข้อมูลที่ลูกค้าเห็นบนหน้าเว็บไซต์และข้อมูลที่ใช้บริหารฟลีทรถ
            </Typography>
          </Box>
          <IconButton aria-label="ปิด" onClick={onClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>

        <Stack spacing={2.25} sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
          <TextField label="ชื่อรถ" value={form.name} onChange={(e) => onUpdate('name', e.target.value)} required />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField label="Slug" value={form.slug} onChange={(e) => onUpdate('slug', e.target.value)} />
            <TextField label="ยี่ห้อ" value={form.brand} onChange={(e) => onUpdate('brand', e.target.value)} />
          </Box>
          <TextField label="ลิงก์รูปหลัก" value={form.image} onChange={(e) => onUpdate('image', e.target.value)} />
          {form.image ? (
            <Box component="img" src={form.image} alt={form.name || 'รูปรถ'} sx={{ aspectRatio: '16 / 9', bgcolor: colors.canvasElevated, borderRadius: '22px', objectFit: 'contain', p: 1.5, width: '100%' }} />
          ) : null}
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
            <TextField label="ราคา/วัน" type="number" value={form.pricePerDay} onChange={(e) => onUpdate('pricePerDay', e.target.value)} />
            <TextField label="ที่นั่ง" type="number" value={form.seats} onChange={(e) => onUpdate('seats', e.target.value)} />
            <TextField label="กระเป๋า" type="number" value={form.luggage} onChange={(e) => onUpdate('luggage', e.target.value)} />
          </Box>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField label="เกียร์" value={form.transmission} onChange={(e) => onUpdate('transmission', e.target.value)} />
            <TextField label="เชื้อเพลิง" value={form.fuel} onChange={(e) => onUpdate('fuel', e.target.value)} />
          </Box>
          <TextField label="รายละเอียดรถ" value={form.description} onChange={(e) => onUpdate('description', e.target.value)} multiline minRows={4} />
          <TextField label="หมวดหมู่ คั่นด้วย comma" value={form.categories} onChange={(e) => onUpdate('categories', e.target.value)} />
          <TextField label="เหมาะสำหรับ คั่นด้วย comma" value={form.suitableFor} onChange={(e) => onUpdate('suitableFor', e.target.value)} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <FormControlLabel control={<Checkbox checked={form.featured} onChange={(e) => onUpdate('featured', e.target.checked)} />} label="รถแนะนำ" />
            <FormControlLabel control={<Checkbox checked={form.airportPickup} onChange={(e) => onUpdate('airportPickup', e.target.checked)} />} label="รับรถสนามบิน" />
            <FormControlLabel control={<Checkbox checked={form.monthlyRental} onChange={(e) => onUpdate('monthlyRental', e.target.checked)} />} label="เช่ารายเดือน" />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="contained" onClick={onSave} disabled={action.isBusy}>
              {action.isBusy ? 'กำลังบันทึก...' : 'บันทึกข้อมูลรถ'}
            </Button>
            {selectedId ? (
              <Button variant="outlined" color="error" onClick={onDelete} disabled={action.isBusy}>
                ลบรถ
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default function AdminCars() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getCars(true), fallbackCars, []);
  const action = useAdminAction();
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyCar);
  const [open, setOpen] = useState(false);
  const selectedCar = useMemo(() => data.find((car) => car.id === selectedId), [data, selectedId]);

  const openEditor = (car) => {
    setSelectedId(car?.id || null);
    setForm(car ? toForm(car) : emptyCar);
    setOpen(true);
    action.clearFeedback();
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    const payload = toPayload(form);
    if (selectedId) {
      await action.run(() => cmsService.updateCar(selectedId, payload), 'บันทึกข้อมูลรถแล้ว');
    } else {
      const created = await action.run(() => cmsService.createCar(payload), 'เพิ่มรถใหม่แล้ว');
      if (created?.id) setSelectedId(created.id);
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    const confirmed = window.confirm(`ต้องการลบ "${selectedCar?.name || 'รถคันนี้'}" ใช่ไหม?`);
    if (!confirmed) return;
    const result = await action.run(() => cmsService.deleteCar(selectedId), 'ลบรถแล้ว');
    if (result) setOpen(false);
  };

  return (
    <AdminPanel title="จัดการรถเช่า" description="จัดการรถแบบการ์ด เห็นรูป ราคา สถานะ และแก้ไขได้รวดเร็ว" actionLabel="เพิ่มรถใหม่" onAction={() => openEditor(null)}>
      <Stack spacing={3}>
        {error ? <Alert severity="warning">โหลดข้อมูลจาก API ไม่สำเร็จ กำลังแสดงข้อมูลสำรอง</Alert> : null}
        {action.error ? <Alert severity="error">{action.error}</Alert> : null}
        {action.success ? <Alert severity="success">{action.success}</Alert> : null}
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดข้อมูลรถ..." /> : null}
        {!data.length && !isLoading ? <AdminEmptyState label="ยังไม่มีรถในระบบ" /> : null}
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' } }}>
          {data.map((car) => <VehicleCard key={car.id || car.slug} car={car} onEdit={() => openEditor(car)} />)}
        </Box>
      </Stack>
      <EditDrawer
        open={open}
        form={form}
        selectedId={selectedId}
        action={action}
        onClose={() => setOpen(false)}
        onUpdate={update}
        onSave={save}
        onDelete={remove}
      />
    </AdminPanel>
  );
}
