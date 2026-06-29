import { Alert, Box, Button, Chip, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const fallbackAbout = { story: '', airportPickup: '', philosophy: '', serviceAreas: [], whyChoose: [], imageBlocks: [] };
function valueOf(settings) { return settings.find((item) => item.key === 'about')?.value || fallbackAbout; }
function TagEditor({ label, items = [], onChange }) { const [value, setValue] = useState(''); return <Stack spacing={1.25}><Typography sx={{ fontWeight: 900 }}>{label}</Typography><Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>{items.map((item) => <Chip key={item} label={item} onDelete={() => onChange(items.filter((x) => x !== item))} />)}</Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><TextField value={value} onChange={(e) => setValue(e.target.value)} placeholder="เพิ่มรายการ" size="small" /><Button variant="outlined" onClick={() => { if (value.trim()) onChange([...items, value.trim()]); setValue(''); }}>เพิ่ม</Button></Stack></Stack>; }
function Section({ title, children }) { return <Stack spacing={2} sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', p: { xs: 2.25, md: 3 } }}><Typography sx={{ fontSize: '1.15rem', fontWeight: 950 }}>{title}</Typography>{children}</Stack>; }

export default function AdminAboutContent() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getAdminSettings(), [], []);
  const action = useAdminAction();
  const [tab, setTab] = useState('edit');
  const settings = Array.isArray(data) ? data : [];
  const [form, setForm] = useState(fallbackAbout);
  useEffect(() => { if (settings.length) setForm({ ...fallbackAbout, ...valueOf(settings) }); }, [settings.length]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => { await action.run(() => cmsService.updateSetting('about', form), 'บันทึกหน้าเกี่ยวกับเราแล้ว'); };

  return <AdminPanel title="เกี่ยวกับเรา" description="แก้ไขเรื่องราวบริษัท พื้นที่ให้บริการ รูปประกอบ และข้อความสร้างความน่าเชื่อถือ"><Stack spacing={3}>{error ? <Alert severity="error">{error.message}</Alert> : null}{action.error ? <Alert severity="error">{action.error}</Alert> : null}{action.success ? <Alert severity="success">{action.success}</Alert> : null}{isLoading ? <AdminLoadingBlock label="กำลังโหลดเนื้อหาเกี่ยวกับเรา..." /> : null}<Tabs value={tab} onChange={(_, value) => setTab(value)}><Tab label="แก้ไข" value="edit" /><Tab label="ตัวอย่าง" value="preview" /></Tabs>{tab === 'edit' ? <Stack spacing={3}><Section title="เรื่องราวบริษัท"><TextField label="เนื้อหา" value={form.story} onChange={(e) => update('story', e.target.value)} multiline minRows={7} /></Section><Section title="รับรถสนามบิน"><TextField label="รายละเอียดบริการ" value={form.airportPickup} onChange={(e) => update('airportPickup', e.target.value)} multiline minRows={5} /></Section><Section title="แนวคิดการบริการ"><TextField label="ข้อความสั้น" value={form.philosophy} onChange={(e) => update('philosophy', e.target.value)} multiline minRows={4} /></Section><Section title="พื้นที่ให้บริการ"><TagEditor label="พื้นที่" items={form.serviceAreas} onChange={(items) => update('serviceAreas', items)} /></Section><Section title="เหตุผลที่เลือก WWJ"><TagEditor label="เหตุผล" items={form.whyChoose} onChange={(items) => update('whyChoose', items)} /></Section><Button variant="contained" onClick={save} disabled={action.isBusy} sx={{ alignSelf: 'flex-start' }}>บันทึกเนื้อหา</Button></Stack> : <Stack spacing={3} sx={{ bgcolor: 'background.paper', borderRadius: '28px', p: { xs: 2.25, md: 3 } }}><Typography sx={{ fontSize: '1.35rem', fontWeight: 950 }}>ตัวอย่างหน้าเกี่ยวกับเรา</Typography><Typography sx={{ whiteSpace: 'pre-line' }}>{form.story || 'ยังไม่มีเนื้อหา'}</Typography><Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{form.airportPickup}</Typography><Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{form.serviceAreas.map((item) => <Chip key={item} label={item} />)}</Box></Stack>}</Stack></AdminPanel>;
}
