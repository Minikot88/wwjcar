import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import { Alert, Box, Button, Chip, Drawer, IconButton, Stack, TextField, Typography } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const today = new Date().toISOString().slice(0, 10);
const emptyForm = { vehicleId: '', startDate: today, endDate: today, reason: '', status: 'maintenance' };
const statusLabels = { maintenance: 'กำลังซ่อม', completed: 'เสร็จแล้ว', cancelled: 'ยกเลิก' };

function normalizeDate(value) { return String(value || '').slice(0, 10); }
function inProgress(item) { return normalizeDate(item.startDate) <= today && normalizeDate(item.endDate) >= today && item.status !== 'completed' && item.status !== 'cancelled'; }
function upcoming(item) { return normalizeDate(item.startDate) > today && item.status !== 'completed' && item.status !== 'cancelled'; }
function completed(item) { return item.status === 'completed' || normalizeDate(item.endDate) < today; }
function getCarName(cars, id) { return cars.find((car) => Number(car.id) === Number(id))?.name || 'ไม่พบชื่อรถ'; }
function toForm(item) { return item ? { vehicleId: item.vehicleId || '', startDate: normalizeDate(item.startDate) || today, endDate: normalizeDate(item.endDate) || today, reason: item.reason || '', status: item.status || 'maintenance' } : emptyForm; }

function MaintenanceCard({ record, carName, onClick }) {
  const active = inProgress(record);
  const done = completed(record);
  const color = done ? '#6B7280' : active ? '#F97316' : '#2563EB';
  return (
    <Stack spacing={1.25} onClick={onClick} sx={{ bgcolor: 'background.paper', borderRadius: '26px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', cursor: 'pointer', p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 950 }} noWrap>{carName}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.86rem', mt: 0.4 }}>{record.reason || 'ไม่ระบุเหตุผล'}</Typography>
        </Box>
        <Chip label={statusLabels[record.status] || record.status || 'กำลังซ่อม'} size="small" sx={{ bgcolor: `${color}20`, color, fontWeight: 900 }} />
      </Stack>
      <Box sx={{ bgcolor: colors.canvasElevated, borderRadius: '18px', display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, p: 1.5 }}>
        <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>เริ่ม: {normalizeDate(record.startDate)}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>สิ้นสุด: {normalizeDate(record.endDate)}</Typography>
      </Box>
    </Stack>
  );
}

function EditDrawer({ open, form, cars, selected, action, onClose, onUpdate, onSave, onDelete }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100vw', sm: 560 }, maxWidth: '100vw' } }}>
      <Stack sx={{ minHeight: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', borderBottom: `1px solid ${colors.hairlineSoft}`, p: { xs: 2, md: 3 } }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '1.45rem', fontWeight: 950 }}>{selected ? 'แก้ไขรายการซ่อม' : 'เพิ่มรายการรถซ่อม'}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>รายการซ่อมจะบล็อกความพร้อมของรถในช่วงวันที่กำหนด</Typography>
          </Box>
          <IconButton aria-label="ปิด" onClick={onClose}><CloseOutlinedIcon /></IconButton>
        </Stack>
        <Stack spacing={2.25} sx={{ p: { xs: 2, md: 3 } }}>
          <TextField select SelectProps={{ native: true }} label="เลือกรถ" value={form.vehicleId} onChange={(event) => onUpdate('vehicleId', event.target.value)}>
            <option value="">เลือกรถ</option>
            {cars.map((car) => <option key={car.id} value={car.id}>{car.name}</option>)}
          </TextField>
          <TextField label="วันที่เริ่ม" type="date" value={form.startDate} onChange={(event) => onUpdate('startDate', event.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="วันที่สิ้นสุด" type="date" value={form.endDate} onChange={(event) => onUpdate('endDate', event.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="เหตุผล" value={form.reason} onChange={(event) => onUpdate('reason', event.target.value)} multiline minRows={3} />
          <TextField select SelectProps={{ native: true }} label="สถานะ" value={form.status} onChange={(event) => onUpdate('status', event.target.value)}>
            <option value="maintenance">กำลังซ่อม</option>
            <option value="completed">เสร็จแล้ว</option>
            <option value="cancelled">ยกเลิก</option>
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="contained" onClick={onSave} disabled={action.isBusy}>{action.isBusy ? 'กำลังบันทึก...' : 'บันทึกรายการ'}</Button>
            {selected ? <Button variant="outlined" color="error" onClick={onDelete} disabled={action.isBusy}>ลบรายการ</Button> : null}
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default function AdminMaintenance() {
  const { data: cars = [] } = useCmsResource(() => cmsService.getCars(true), [], []);
  const { data = [], isLoading, error } = useCmsResource(() => cmsService.getMaintenanceRecords({ pageSize: 200 }), [], []);
  const action = useAdminAction();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const records = Array.isArray(data) ? data : data.items || [];
  const groups = useMemo(() => ({ active: records.filter(inProgress), upcoming: records.filter(upcoming), completed: records.filter(completed) }), [records]);

  const openRecord = (record) => { setSelected(record || null); setForm(toForm(record)); setOpen(true); action.clearFeedback(); };
  const save = async () => {
    const payload = { ...form, vehicleId: Number(form.vehicleId) };
    if (!payload.vehicleId) { action.setError('กรุณาเลือกรถ'); return; }
    const result = selected ? await action.run(() => cmsService.updateMaintenanceRecord(selected.id, payload), 'บันทึกรายการซ่อมแล้ว') : await action.run(() => cmsService.createMaintenanceRecord(payload), 'เพิ่มรายการซ่อมแล้ว');
    if (result) setOpen(false);
  };
  const remove = async () => { if (!selected) return; const result = await action.run(() => cmsService.deleteMaintenanceRecord(selected.id), 'ลบรายการซ่อมแล้ว'); if (result) setOpen(false); };

  return (
    <AdminPanel title="จัดการรถซ่อม" description="ดูรถที่กำลังซ่อม งานซ่อมล่วงหน้า และประวัติการซ่อม" actionLabel="เพิ่มรายการซ่อม" onAction={() => openRecord(null)}>
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error.message}</Alert> : null}
        {action.error ? <Alert severity="error">{action.error}</Alert> : null}
        {action.success ? <Alert severity="success">{action.success}</Alert> : null}
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดรายการรถซ่อม..." /> : null}
        {[
          ['รถกำลังซ่อม', groups.active, '#F97316'],
          ['งานซ่อมล่วงหน้า', groups.upcoming, '#2563EB'],
          ['งานซ่อมเสร็จแล้ว', groups.completed, '#6B7280']
        ].map(([title, items, color]) => (
          <Stack key={title} spacing={2}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}><Box sx={{ bgcolor: color, borderRadius: 999, height: 10, width: 10 }} /><Typography sx={{ fontSize: '1.15rem', fontWeight: 950 }}>{title}</Typography></Stack>
            {!items.length ? <AdminEmptyState label={`ไม่มี${title}`} /> : null}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>{items.map((record) => <MaintenanceCard key={record.id} record={record} carName={getCarName(cars, record.vehicleId)} onClick={() => openRecord(record)} />)}</Box>
          </Stack>
        ))}
      </Stack>
      <EditDrawer open={open} form={form} cars={cars} selected={selected} action={action} onClose={() => setOpen(false)} onUpdate={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onSave={save} onDelete={remove} />
    </AdminPanel>
  );
}
