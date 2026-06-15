import { Alert, Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { cars as fallbackCars } from '../../data/cars.js';
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

function toPayload(form) {
  return {
    ...form,
    coverImage: form.image,
    pricePerDay: Number(form.pricePerDay),
    seats: Number(form.seats),
    luggage: Number(form.luggage),
    categories: form.categories.split(',').map((item) => item.trim()).filter(Boolean),
    suitableFor: form.suitableFor.split(',').map((item) => item.trim()).filter(Boolean)
  };
}

export default function AdminCars() {
  const { data, error } = useCmsResource(() => cmsService.getCars(true), fallbackCars, []);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyCar);
  const [message, setMessage] = useState('');

  const selectedCar = useMemo(() => data.find((car) => car.id === selectedId), [data, selectedId]);

  useEffect(() => {
    if (selectedCar) setForm(toForm(selectedCar));
  }, [selectedCar]);

  const startCreate = () => {
    setSelectedId(null);
    setForm(emptyCar);
    setMessage('');
  };

  const save = async () => {
    const payload = toPayload(form);
    if (selectedId) {
      await cmsService.updateCar(selectedId, payload);
      setMessage('บันทึกข้อมูลรถแล้ว');
    } else {
      const created = await cmsService.createCar(payload);
      setSelectedId(created.id);
      setMessage('สร้างรถใหม่แล้ว');
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    await cmsService.deleteCar(selectedId);
    startCreate();
    setMessage('ลบรถแล้ว');
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <AdminPanel title="รถเช่า" description="สร้าง แก้ไข ลบ และตั้งค่าข้อมูลรถที่แสดงบนหน้าเว็บไซต์" actionLabel="เพิ่มรถใหม่" onAction={startCreate}>
      <Stack spacing={3}>
        {error ? <Alert severity="warning">เชื่อมต่อ API ไม่สำเร็จ กำลังแสดงข้อมูลสำรอง</Alert> : null}
        {message ? <Alert severity="success">{message}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 3.5, gridTemplateColumns: { xs: '1fr', lg: '0.78fr 1.22fr' } }}>
          <Stack spacing={1}>
            {data.map((car) => (
              <Button
                key={car.id}
                onClick={() => setSelectedId(car.id)}
                sx={{
                  bgcolor: selectedId === car.id ? 'rgba(255,0,0,0.06)' : 'transparent',
                  border: `1px solid ${selectedId === car.id ? 'rgba(255,0,0,0.16)' : 'transparent'}`,
                  borderRadius: '16px',
                  color: selectedId === car.id ? colors.primary : 'text.primary',
                  justifyContent: 'space-between',
                  minHeight: 56,
                  px: 2,
                  textAlign: 'left',
                  '&:hover': {
                    bgcolor: colors.canvasElevated
                  }
                }}
              >
                <span>{car.name}</span>
                <Typography component="span" variant="caption">
                  ฿{Number(car.pricePerDay).toLocaleString('th-TH')}
                </Typography>
              </Button>
            ))}
          </Stack>

          <Stack spacing={3}>
            <Stack spacing={2.25}>
              <Typography variant="caption" color="primary">ข้อมูลหลัก</Typography>
              <TextField label="ชื่อรถ" value={form.name} onChange={(event) => update('name', event.target.value)} required />
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField label="Slug" value={form.slug} onChange={(event) => update('slug', event.target.value)} required />
                <TextField label="แบรนด์" value={form.brand} onChange={(event) => update('brand', event.target.value)} required />
              </Box>
              <TextField label="Cover Image URL" value={form.image} onChange={(event) => update('image', event.target.value)} />
            </Stack>

            <Stack spacing={2.25}>
              <Typography variant="caption" color="primary">ราคาและสเปกรถ</Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
                <TextField label="ราคา/วัน" type="number" value={form.pricePerDay} onChange={(event) => update('pricePerDay', event.target.value)} />
                <TextField label="ที่นั่ง" type="number" value={form.seats} onChange={(event) => update('seats', event.target.value)} />
                <TextField label="กระเป๋า" type="number" value={form.luggage} onChange={(event) => update('luggage', event.target.value)} />
              </Box>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                <TextField label="เกียร์" value={form.transmission} onChange={(event) => update('transmission', event.target.value)} />
                <TextField label="เชื้อเพลิง" value={form.fuel} onChange={(event) => update('fuel', event.target.value)} />
              </Box>
            </Stack>

            <Stack spacing={2.25}>
              <Typography variant="caption" color="primary">เนื้อหาและสถานะ</Typography>
              <TextField label="คำอธิบาย" value={form.description} onChange={(event) => update('description', event.target.value)} multiline minRows={3} />
              <TextField label="หมวดหมู่ (คั่นด้วย comma)" value={form.categories} onChange={(event) => update('categories', event.target.value)} />
              <TextField label="เหมาะสำหรับ (คั่นด้วย comma)" value={form.suitableFor} onChange={(event) => update('suitableFor', event.target.value)} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <FormControlLabel control={<Checkbox checked={form.featured} onChange={(event) => update('featured', event.target.checked)} />} label="แนะนำ" />
                <FormControlLabel control={<Checkbox checked={form.airportPickup} onChange={(event) => update('airportPickup', event.target.checked)} />} label="รับรถสนามบิน" />
                <FormControlLabel control={<Checkbox checked={form.monthlyRental} onChange={(event) => update('monthlyRental', event.target.checked)} />} label="เช่ารายเดือน" />
              </Stack>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={save}>
                บันทึก
              </Button>
              {selectedId ? (
                <Button variant="outlined" color="error" onClick={remove}>
                  ลบ
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </AdminPanel>
  );
}
