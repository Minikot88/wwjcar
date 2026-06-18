import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminAlerts, AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';
import { firstError, required } from '../../utils/adminValidation.js';

const emptyPage = {
  slug: '',
  title: '',
  metaTitle: '',
  metaDescription: '',
  canonical: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  contentTitle: '',
  contentBody: '',
  schema: {},
  content: {},
  status: 'published'
};

function pageToForm(page = {}) {
  const content = page.content || {};
  return {
    ...emptyPage,
    ...page,
    contentTitle: content.title || content.heading || page.title || '',
    contentBody: content.body || content.bodyText || content.description || '',
    schema: page.schema || {},
    content
  };
}

export default function AdminPages() {
  const { data: pages, isLoading, error } = useCmsResource(() => cmsService.getPages(true), [], []);
  const action = useAdminAction();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyPage);
  const [imageFile, setImageFile] = useState(null);

  const selectPage = (page) => {
    setSelected(page.id);
    setForm(pageToForm(page));
    action.clearFeedback();
  };

  const startCreate = () => {
    setSelected(null);
    setForm(emptyPage);
    setImageFile(null);
    action.clearFeedback();
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => firstError([
    required(form.slug, 'ที่อยู่หน้าเว็บ'),
    required(form.title, 'ชื่อหน้าเว็บ')
  ]);

  const payload = () => ({
    ...form,
    schema: form.schema || {},
    content: {
      ...(form.content || {}),
      title: form.contentTitle,
      body: form.contentBody
    }
  });

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      action.setError(validationError);
      return;
    }

    if (selected) {
      await action.run(() => cmsService.updatePage(selected, payload()), 'บันทึกหน้าเว็บแล้ว');
    } else {
      const created = await action.run(() => cmsService.createPage(payload()), 'เพิ่มหน้าเว็บแล้ว');
      if (created?.id) setSelected(created.id);
    }
  };

  const remove = async () => {
    if (!selected) return;
    const removed = await action.run(() => cmsService.deletePage(selected), 'ลบหน้าเว็บแล้ว');
    if (removed) startCreate();
  };

  const uploadPageImage = async (field = 'ogImage') => {
    if (!selected || !imageFile) return;
    const result = await action.run(
      () => cmsService.uploadPageImage(selected, imageFile, {
        field,
        fieldPath: field === 'content' ? 'heroImage' : undefined,
        usageType: field === 'content' ? 'page_hero_image' : 'page_og_image'
      }),
      field === 'content' ? 'อัปโหลดรูปเนื้อหาแล้ว' : 'อัปโหลดรูปแชร์แล้ว'
    );
    if (result?.page) selectPage(result.page);
    setImageFile(null);
  };

  return (
    <AdminPanel title="เนื้อหาหน้าเว็บ" description="แก้ไขข้อความหลักของแต่ละหน้าแบบง่าย ส่วน SEO ขั้นสูงซ่อนไว้สำหรับผู้ดูแลที่ต้องใช้" actionLabel="เพิ่มหน้าเว็บ" onAction={startCreate}>
      <Stack spacing={3}>
        <AdminAlerts error={action.error || error?.message} success={action.success} />
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดหน้าเว็บ..." /> : null}

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '0.82fr 1.18fr' } }}>
          <Stack spacing={1.25}>
            {!pages.length && !isLoading ? <AdminEmptyState label="ยังไม่มีหน้าเว็บ" /> : null}
            {pages.map((page) => (
              <Button
                key={page.id}
                onClick={() => selectPage(page)}
                sx={{
                  bgcolor: selected === page.id ? 'rgba(255,0,0,0.06)' : colors.canvasElevated,
                  border: `1px solid ${selected === page.id ? 'rgba(255,0,0,0.22)' : colors.hairlineSoft}`,
                  borderRadius: '18px',
                  color: 'text.primary',
                  display: 'block',
                  p: 2,
                  textAlign: 'left'
                }}
              >
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={900} noWrap>{page.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>/{page.slug}</Typography>
                  </Box>
                  <Chip size="small" label={page.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'} />
                </Stack>
              </Button>
            ))}
          </Stack>

          <Stack spacing={2.25} sx={{ bgcolor: colors.canvasElevated, borderRadius: '24px', p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h3">{selected ? 'แก้ไขหน้าเว็บ' : 'เพิ่มหน้าเว็บ'}</Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <TextField label="ที่อยู่หน้าเว็บ" helperText="ตัวอย่าง: about-us หรือ rental-conditions" value={form.slug} onChange={(event) => update('slug', event.target.value)} required error={!form.slug.trim()} />
              <TextField select SelectProps={{ native: true }} label="สถานะ" value={form.status} onChange={(event) => update('status', event.target.value)}>
                <option value="published">เผยแพร่</option>
                <option value="draft">แบบร่าง</option>
              </TextField>
            </Box>
            <TextField label="ชื่อหน้าเว็บ" value={form.title} onChange={(event) => update('title', event.target.value)} required error={!form.title.trim()} />

            <Stack spacing={1.5} sx={{ bgcolor: colors.canvas, borderRadius: '18px', p: 2 }}>
              <Typography fontWeight={900}>เนื้อหาหลัก</Typography>
              <TextField label="หัวข้อเนื้อหา" value={form.contentTitle} onChange={(event) => update('contentTitle', event.target.value)} />
              <TextField label="เนื้อหา" value={form.contentBody} onChange={(event) => update('contentBody', event.target.value)} multiline minRows={8} />
            </Stack>

            <Accordion disableGutters elevation={0} sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '18px !important', overflow: 'hidden' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack>
                  <Typography fontWeight={900}>ตั้งค่าการแสดงผลบน Google</Typography>
                  <Typography variant="caption" color="text.secondary">เปิดเฉพาะเมื่อต้องปรับชื่อผลการค้นหา คำอธิบาย รูปแชร์ หรือ URL หลัก</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.5}>
                  <TextField label="ชื่อที่แสดงบน Google" value={form.metaTitle || ''} onChange={(event) => update('metaTitle', event.target.value)} />
                  <TextField label="คำอธิบายที่แสดงบน Google" value={form.metaDescription || ''} onChange={(event) => update('metaDescription', event.target.value)} multiline minRows={3} />
                  <TextField label="URL หลักของหน้านี้" value={form.canonical || ''} onChange={(event) => update('canonical', event.target.value)} />
                  <TextField label="ชื่อเวลาแชร์ลิงก์" value={form.ogTitle || ''} onChange={(event) => update('ogTitle', event.target.value)} />
                  <TextField label="คำอธิบายเวลาแชร์ลิงก์" value={form.ogDescription || ''} onChange={(event) => update('ogDescription', event.target.value)} multiline minRows={2} />
                  <TextField label="รูปภาพเวลาแชร์ลิงก์" value={form.ogImage || ''} onChange={(event) => update('ogImage', event.target.value)} />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {selected ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="outlined" component="label">
                  เลือกรูป
                  <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
                </Button>
                <Button variant="contained" onClick={() => uploadPageImage('ogImage')} disabled={!imageFile || action.isBusy}>อัปโหลดรูปแชร์</Button>
                <Button variant="outlined" onClick={() => uploadPageImage('content')} disabled={!imageFile || action.isBusy}>อัปโหลดรูปเนื้อหา</Button>
              </Stack>
            ) : null}
            {imageFile ? <Typography variant="caption" color="text.secondary">ไฟล์ที่เลือก: {imageFile.name}</Typography> : null}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" onClick={save} disabled={action.isBusy}>{action.isBusy ? 'กำลังบันทึก...' : 'บันทึกหน้าเว็บ'}</Button>
              {selected ? <Button variant="outlined" color="error" onClick={remove} disabled={action.isBusy}>ลบหน้าเว็บ</Button> : null}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </AdminPanel>
  );
}
