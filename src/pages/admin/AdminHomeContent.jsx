import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const fallbackHome = {
  heroTitle: 'รถเช่าหาดใหญ่ จองง่าย รับรถไว',
  heroSubtitle: 'รับรถสนามบินหาดใหญ่ เลือกรถสะดวก และคุยกับทีมงานได้โดยตรงก่อนจอง',
  heroImage: '/photo/wwj-carrent.webp',
  primaryCtaText: 'จองผ่าน LINE',
  secondaryCtaText: 'ดูรถทั้งหมด',
  trustItems: ['รถสะอาด', 'รับรถสนามบิน', 'จองผ่าน LINE']
};

function normalizeHome(value = {}) {
  return {
    ...fallbackHome,
    ...value,
    trustItems: Array.isArray(value.trustItems) ? value.trustItems : fallbackHome.trustItems
  };
}

export default function AdminHomeContent() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getAdminSettings(), [{ key: 'home', value: fallbackHome }], []);
  const [form, setForm] = useState(fallbackHome);
  const [heroFile, setHeroFile] = useState(null);
  const [trustText, setTrustText] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const homeSetting = useMemo(() => data.find((item) => item.key === 'home'), [data]);

  useEffect(() => {
    if (homeSetting?.value) setForm(normalizeHome(homeSetting.value));
  }, [homeSetting]);

  const update = (key, value) => {
    setMessage('');
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addTrustItem = () => {
    const trimmed = trustText.trim();
    if (!trimmed) return;
    setForm((current) => ({ ...current, trustItems: [...new Set([...(current.trustItems || []), trimmed])] }));
    setTrustText('');
  };

  const removeTrustItem = (item) => {
    setForm((current) => ({ ...current, trustItems: current.trustItems.filter((value) => value !== item) }));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await cmsService.updateSetting('home', form);
      setMessage('บันทึกหน้าแรกแล้ว');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadHero = async () => {
    if (!heroFile) return;
    const result = await cmsService.uploadSettingImage('home', heroFile, { fieldPath: 'heroImage', usageType: 'hero_image' });
    setHeroFile(null);
    if (result?.setting?.value) setForm(normalizeHome(result.setting.value));
    setMessage('อัปโหลดรูป Hero แล้ว');
  };

  return (
    <AdminPanel title="หน้าแรก" description="แก้ไขข้อความ Hero ปุ่มหลัก ปุ่มรอง รูปหน้าแรก และข้อความสร้างความเชื่อมั่น">
      <Stack spacing={3}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error?.message ? <Alert severity="error">{error.message}</Alert> : null}
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดข้อมูลหน้าแรก..." /> : null}

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: '1.1fr 0.9fr' } }}>
          <Stack spacing={2.5} sx={{ bgcolor: colors.canvasElevated, borderRadius: '24px', p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h3">ข้อความหน้าแรก</Typography>
            <TextField label="หัวข้อหลัก" value={form.heroTitle} onChange={(event) => update('heroTitle', event.target.value)} />
            <TextField label="คำอธิบายใต้หัวข้อ" value={form.heroSubtitle} onChange={(event) => update('heroSubtitle', event.target.value)} multiline minRows={4} />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <TextField label="ข้อความปุ่มหลัก" value={form.primaryCtaText} onChange={(event) => update('primaryCtaText', event.target.value)} />
              <TextField label="ข้อความปุ่มรอง" value={form.secondaryCtaText} onChange={(event) => update('secondaryCtaText', event.target.value)} />
            </Box>
            <TextField label="URL รูป Hero" value={form.heroImage} onChange={(event) => update('heroImage', event.target.value)} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="outlined" component="label">
                เลือกรูป Hero
                <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setHeroFile(event.target.files?.[0] || null)} />
              </Button>
              <Button variant="contained" onClick={uploadHero} disabled={!heroFile || isSaving}>
                อัปโหลดรูป Hero
              </Button>
            </Stack>
            {heroFile ? <Typography color="text.secondary">ไฟล์ที่เลือก: {heroFile.name}</Typography> : null}

            <Stack spacing={1.5}>
              <Typography variant="caption" color="primary">ข้อความสร้างความเชื่อมั่น</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <TextField value={trustText} onChange={(event) => setTrustText(event.target.value)} placeholder="เช่น รถสะอาดพร้อมใช้งาน" fullWidth />
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addTrustItem}>เพิ่ม</Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                {form.trustItems.map((item) => (
                  <Chip key={item} label={item} onDelete={() => removeTrustItem(item)} deleteIcon={<CloseIcon />} />
                ))}
              </Stack>
            </Stack>

            <Button variant="contained" onClick={save} disabled={isSaving} sx={{ alignSelf: { sm: 'flex-start' } }}>
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกหน้าแรก'}
            </Button>
          </Stack>

          <Stack spacing={2.25} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', p: { xs: 2.5, md: 3 }, alignSelf: 'start' }}>
            <Typography variant="h3">ตัวอย่าง Hero</Typography>
            {form.heroImage ? <Box component="img" src={form.heroImage} alt="ตัวอย่างรูป Hero" sx={{ aspectRatio: '16 / 9', borderRadius: '18px', objectFit: 'cover', width: '100%' }} /> : null}
            <Typography sx={{ fontSize: '1.55rem', fontWeight: 900, lineHeight: 1.25 }}>{form.heroTitle}</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>{form.heroSubtitle}</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {form.trustItems.map((item) => <Chip key={item} label={item} />)}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </AdminPanel>
  );
}
