import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { faqItems } from '../../data/faqs.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const emptyFaq = {
  categoryId: '',
  question: '',
  answer: '',
  sortOrder: 0,
  status: 'published'
};

export default function AdminFaqs() {
  const { data: faqs } = useCmsResource(() => cmsService.getFaqs(true), faqItems, []);
  const { data: categories } = useCmsResource(() => cmsService.getFaqCategories(), [], []);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyFaq);
  const [message, setMessage] = useState('');

  const selectFaq = (faq) => {
    setSelected(faq.id);
    setForm({ ...emptyFaq, ...faq, categoryId: faq.categoryId || '' });
    setMessage('');
  };

  const save = async () => {
    if (selected) {
      await cmsService.updateFaq(selected, form);
      setMessage('บันทึก FAQ แล้ว');
    } else {
      const created = await cmsService.createFaq(form);
      setSelected(created.id);
      setMessage('สร้าง FAQ ใหม่แล้ว');
    }
  };

  const remove = async () => {
    if (!selected) return;
    await cmsService.deleteFaq(selected);
    setSelected(null);
    setForm(emptyFaq);
    setMessage('ลบ FAQ แล้ว');
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <AdminPanel title="FAQ" description="สร้าง แก้ไข ลบ จัดลำดับ และกำหนดหมวดหมู่คำถาม" actionLabel="เพิ่ม FAQ" onAction={() => { setSelected(null); setForm(emptyFaq); }}>
      <Stack spacing={3}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' } }}>
          <Stack spacing={1}>
            {faqs.map((faq, index) => (
              <Button
                key={faq.id || faq.question}
                onClick={() => selectFaq({ ...faq, sortOrder: faq.sortOrder || index + 1 })}
                sx={{
                  bgcolor: selected === faq.id ? 'rgba(255,0,0,0.08)' : colors.canvasElevated,
                  color: selected === faq.id ? colors.primary : 'text.primary',
                  justifyContent: 'flex-start',
                  textAlign: 'left'
                }}
              >
                {faq.question}
              </Button>
            ))}
          </Stack>
          <Stack spacing={2}>
            <TextField label="หมวดหมู่" select SelectProps={{ native: true }} value={form.categoryId} onChange={(event) => update('categoryId', event.target.value || null)}>
              <option value="">ไม่ระบุ</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </TextField>
            <TextField label="คำถาม" value={form.question} onChange={(event) => update('question', event.target.value)} required />
            <TextField label="คำตอบ" value={form.answer} onChange={(event) => update('answer', event.target.value)} multiline minRows={5} required />
            <TextField label="ลำดับ" type="number" value={form.sortOrder} onChange={(event) => update('sortOrder', Number(event.target.value))} />
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
