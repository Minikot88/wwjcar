import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminAlerts, AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';
import { firstError, positiveNumber, required } from '../../utils/adminValidation.js';

const emptyReview = {
  customerName: '',
  rating: 5,
  content: '',
  source: '',
  imageUploadId: null,
  imageUrl: '',
  sortOrder: 0,
  status: 'published'
};

export default function AdminReviews() {
  const { data: reviews, isLoading, error } = useCmsResource(() => cmsService.getReviews(true), [], []);
  const action = useAdminAction();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyReview);
  const [imageFile, setImageFile] = useState(null);

  const selectReview = (review) => {
    setSelected(review.id);
    setForm({ ...emptyReview, ...review });
    setImageFile(null);
    action.clearFeedback();
  };

  const startCreate = () => {
    setSelected(null);
    setForm(emptyReview);
    setImageFile(null);
    action.clearFeedback();
  };

  const validate = () => firstError([
    required(form.customerName, 'กรุณากรอกชื่อลูกค้า'),
    required(form.content, 'กรุณากรอกข้อความรีวิว'),
    positiveNumber(form.rating, 'กรุณากรอกคะแนนรีวิว')
  ]);

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      action.setError(validationError);
      return;
    }

    const payload = { ...form, rating: Number(form.rating), sortOrder: Number(form.sortOrder) || 0 };
    if (selected) {
      await action.run(() => cmsService.updateReview(selected, payload), 'บันทึกรีวิวแล้ว');
    } else {
      const created = await action.run(() => cmsService.createReview(payload), 'เพิ่มรีวิวแล้ว');
      if (created?.id) setSelected(created.id);
    }
  };

  const uploadImage = async () => {
    if (!selected || !imageFile) return;
    const result = await action.run(() => cmsService.uploadReviewImage(selected, imageFile), 'อัปโหลดรูปรีวิวแล้ว');
    if (result?.review) {
      setForm({ ...emptyReview, ...result.review });
      setImageFile(null);
    }
  };

  const remove = async () => {
    if (!selected) return;
    const removed = await action.run(() => cmsService.deleteReview(selected), 'ลบรีวิวแล้ว');
    if (removed) startCreate();
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <AdminPanel title="รีวิวลูกค้า" description="เพิ่ม แก้ไข เผยแพร่ และจัดลำดับรีวิวที่ใช้สร้างความน่าเชื่อถือ" actionLabel="เพิ่มรีวิว" onAction={startCreate}>
      <Stack spacing={3}>
        <AdminAlerts error={action.error || error?.message} success={action.success} />
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดรีวิว..." /> : null}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '0.8fr 1.2fr' } }}>
          <Stack spacing={1}>
            {!reviews.length && !isLoading ? <AdminEmptyState label="ยังไม่มีรีวิว" /> : null}
            {reviews.map((review) => (
              <Button key={review.id} onClick={() => selectReview(review)} sx={{ bgcolor: selected === review.id ? 'rgba(255,0,0,0.08)' : colors.canvasElevated, color: selected === review.id ? colors.primary : 'text.primary', justifyContent: 'space-between', textAlign: 'left' }}>
                <Typography component="span" sx={{ overflowWrap: 'anywhere' }}>{review.customerName}</Typography>
                <Typography component="span" variant="caption">{review.rating}/5</Typography>
              </Button>
            ))}
          </Stack>
          <Stack spacing={2}>
            <TextField label="ชื่อลูกค้า" value={form.customerName} onChange={(event) => update('customerName', event.target.value)} required error={!form.customerName.trim()} />
            <TextField label="คะแนนรีวิว" type="number" inputProps={{ min: 1, max: 5 }} value={form.rating} onChange={(event) => update('rating', event.target.value)} required />
            <TextField label="ข้อความรีวิว" value={form.content} onChange={(event) => update('content', event.target.value)} multiline minRows={4} required error={!form.content.trim()} />
            <TextField label="แหล่งที่มา" value={form.source || ''} onChange={(event) => update('source', event.target.value)} />
            <TextField label="ลิงก์รูปรีวิว" value={form.imageUrl || ''} onChange={(event) => update('imageUrl', event.target.value)} />
            {form.imageUrl ? (
              <Box component="img" src={form.imageUrl} alt={`ตัวอย่างรีวิวของ ${form.customerName || 'ลูกค้า'}`} sx={{ aspectRatio: '16 / 10', borderRadius: '18px', objectFit: 'cover', width: '100%' }} />
            ) : null}
            {selected ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="outlined" component="label">
                  เลือกรูปรีวิว
                  <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
                </Button>
                <Button variant="contained" onClick={uploadImage} disabled={!imageFile || action.isBusy}>อัปโหลดรูปรีวิว</Button>
              </Stack>
            ) : null}
            {imageFile ? <Typography variant="caption" color="text.secondary">ไฟล์ที่เลือก: {imageFile.name}</Typography> : null}
            <TextField label="ลำดับการแสดงผล" type="number" value={form.sortOrder || 0} onChange={(event) => update('sortOrder', event.target.value)} />
            <TextField label="สถานะ" select SelectProps={{ native: true }} value={form.status} onChange={(event) => update('status', event.target.value)}>
              <option value="published">เผยแพร่</option>
              <option value="draft">แบบร่าง</option>
            </TextField>
            {error ? <Alert severity="warning">โหลดรีวิวจากระบบไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ Backend</Alert> : null}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={save} disabled={action.isBusy}>{action.isBusy ? 'กำลังบันทึก...' : 'บันทึกรีวิว'}</Button>
              {selected ? <Button variant="outlined" color="error" onClick={remove} disabled={action.isBusy}>ลบรีวิว</Button> : null}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </AdminPanel>
  );
}
