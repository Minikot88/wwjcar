import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import JsonEditor, { parseJsonInput } from '../../components/admin/JsonEditor.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const emptyPage = {
  slug: '',
  title: '',
  metaTitle: '',
  metaDescription: '',
  content: '{}',
  status: 'published'
};

export default function AdminPages() {
  const { data: pages } = useCmsResource(() => cmsService.getPages(true), [], []);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyPage);
  const [message, setMessage] = useState('');

  const selectPage = (page) => {
    setSelected(page.id);
    setForm({ ...page, content: JSON.stringify(page.content || {}, null, 2) });
    setMessage('');
  };

  const payload = () => ({
    ...form,
    content: parseJsonInput(form.content, {})
  });

  const save = async () => {
    if (selected) {
      await cmsService.updatePage(selected, payload());
      setMessage('บันทึกหน้าเว็บแล้ว');
    } else {
      const created = await cmsService.createPage(payload());
      setSelected(created.id);
      setMessage('สร้างหน้าเว็บใหม่แล้ว');
    }
  };

  const remove = async () => {
    if (!selected) return;
    await cmsService.deletePage(selected);
    setSelected(null);
    setForm(emptyPage);
    setMessage('ลบหน้าเว็บแล้ว');
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <AdminPanel title="หน้าเว็บ" description="แก้ไขเนื้อหา SEO และ JSON content blocks สำหรับทุกหน้า" actionLabel="เพิ่มหน้า" onAction={() => { setSelected(null); setForm(emptyPage); }}>
      <Stack spacing={3}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '0.8fr 1.2fr' } }}>
          <Stack spacing={1}>
            {pages.map((page) => (
              <Button
                key={page.id}
                onClick={() => selectPage(page)}
                sx={{
                  bgcolor: selected === page.id ? 'rgba(255,0,0,0.08)' : colors.canvasElevated,
                  color: selected === page.id ? colors.primary : 'text.primary',
                  justifyContent: 'flex-start'
                }}
              >
                {page.title}
              </Button>
            ))}
          </Stack>
          <Stack spacing={2}>
            <TextField label="Slug" value={form.slug} onChange={(event) => update('slug', event.target.value)} required />
            <TextField label="Title" value={form.title} onChange={(event) => update('title', event.target.value)} required />
            <TextField label="Meta Title" value={form.metaTitle || ''} onChange={(event) => update('metaTitle', event.target.value)} />
            <TextField label="Meta Description" value={form.metaDescription || ''} onChange={(event) => update('metaDescription', event.target.value)} multiline minRows={3} />
            <JsonEditor label="Content JSON" value={form.content} onChange={(value) => update('content', value)} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={save}>
                บันทึก
              </Button>
              {selected ? (
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
