import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import JsonEditor, { parseJsonInput } from '../../components/admin/JsonEditor.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const emptyCondition = {
  sectionKey: '',
  title: '',
  content: '[]',
  sortOrder: 0
};

export default function AdminRentalConditions() {
  const { data } = useCmsResource(() => cmsService.getRentalConditions(), [], []);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyCondition);
  const [message, setMessage] = useState('');

  const selectItem = (item) => {
    setSelected(item.id);
    setForm({ ...item, content: JSON.stringify(item.content || [], null, 2) });
    setMessage('');
  };

  const payload = () => ({ ...form, content: parseJsonInput(form.content, []) });

  const save = async () => {
    if (selected) {
      await cmsService.updateRentalCondition(selected, payload());
      setMessage('บันทึกเงื่อนไขแล้ว');
    } else {
      const created = await cmsService.createRentalCondition(payload());
      setSelected(created.id);
      setMessage('สร้างเงื่อนไขใหม่แล้ว');
    }
  };

  const remove = async () => {
    if (!selected) return;
    await cmsService.deleteRentalCondition(selected);
    setSelected(null);
    setForm(emptyCondition);
    setMessage('ลบเงื่อนไขแล้ว');
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <AdminPanel title="เงื่อนไขการเช่า" description="แก้ไขเอกสาร เงินมัดจำ ประกันภัย น้ำมัน การคืนล่าช้า และเงื่อนไขเพิ่มเติม" actionLabel="เพิ่มหัวข้อ" onAction={() => { setSelected(null); setForm(emptyCondition); }}>
      <Stack spacing={3}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '0.8fr 1.2fr' } }}>
          <Stack spacing={1}>
            {data.map((item) => (
              <Button
                key={item.id}
                onClick={() => selectItem(item)}
                sx={{
                  bgcolor: selected === item.id ? 'rgba(255,0,0,0.08)' : colors.canvasElevated,
                  color: selected === item.id ? colors.primary : 'text.primary',
                  justifyContent: 'flex-start'
                }}
              >
                {item.title}
              </Button>
            ))}
          </Stack>
          <Stack spacing={2}>
            <TextField label="Section Key" value={form.sectionKey} onChange={(event) => update('sectionKey', event.target.value)} required />
            <TextField label="หัวข้อ" value={form.title} onChange={(event) => update('title', event.target.value)} required />
            <TextField label="ลำดับ" type="number" value={form.sortOrder} onChange={(event) => update('sortOrder', Number(event.target.value))} />
            <JsonEditor label="รายการเงื่อนไข JSON" value={form.content} onChange={(value) => update('content', value)} />
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
