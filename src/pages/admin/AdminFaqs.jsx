import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Box, Button, Chip, Collapse, IconButton, InputAdornment, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminAlerts, AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { faqItems } from '../../data/faqs.js';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';
import { firstError, required } from '../../utils/adminValidation.js';

const emptyFaq = {
  categoryId: '',
  question: '',
  answer: '',
  sortOrder: 0,
  status: 'published'
};

const fallbackCategories = [
  { id: 'booking', name: 'การจอง' },
  { id: 'documents', name: 'เอกสาร' },
  { id: 'pickup', name: 'การรับรถ' },
  { id: 'insurance', name: 'ประกันภัย' },
  { id: 'travel', name: 'การเดินทาง' }
];

const statusLabels = {
  published: 'เผยแพร่',
  draft: 'แบบร่าง'
};

function categoryName(categories, id) {
  return categories.find((category) => String(category.id) === String(id))?.name || 'ไม่ระบุหมวด';
}

function toForm(faq, categoryId = '') {
  return { ...emptyFaq, ...faq, categoryId: faq?.categoryId || categoryId || '' };
}

function normalizeFaqPayload(form) {
  return { ...form, categoryId: form.categoryId || null, sortOrder: Number(form.sortOrder) || 0 };
}

function matchesSearch(faq, query) {
  const value = query.trim().toLowerCase();
  if (!value) return true;
  return [faq.question, faq.answer].some((field) => String(field || '').toLowerCase().includes(value));
}

function FaqRow({ faq, categories, isEditing, form, action, onEdit, onCancel, onUpdate, onSave, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  const status = statusLabels[faq.status] || faq.status || 'เผยแพร่';

  return (
    <Stack sx={{ bgcolor: 'background.paper', borderRadius: '24px', boxShadow: '0 14px 36px rgba(15,17,21,0.04)', overflow: 'hidden' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', p: 2 }}>
        <Stack sx={{ alignItems: 'center', pt: 0.3 }}>
          <IconButton size="small" aria-label="เลื่อนขึ้น" onClick={onMoveUp} disabled={!canMoveUp || action.isBusy}>
            <ArrowUpwardOutlinedIcon fontSize="small" />
          </IconButton>
          <Typography color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 950 }}>{Number(faq.sortOrder || 0)}</Typography>
          <IconButton size="small" aria-label="เลื่อนลง" onClick={onMoveDown} disabled={!canMoveDown || action.isBusy}>
            <ArrowDownwardOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 950 }} noWrap={!isEditing}>{faq.question || 'คำถามใหม่'}</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Chip size="small" label={categoryName(categories, faq.categoryId)} sx={{ bgcolor: colors.canvasElevated, fontWeight: 850 }} />
              <Chip size="small" label={status} color={faq.status === 'draft' ? 'default' : 'primary'} />
            </Stack>
          </Stack>
          {!isEditing ? (
            <Typography color="text.secondary" sx={{ mt: 1, WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, display: '-webkit-box', overflow: 'hidden' }}>
              {faq.answer}
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="แก้ไขคำถาม" onClick={onEdit} disabled={action.isBusy}>
            <EditOutlinedIcon />
          </IconButton>
          <IconButton aria-label="ลบคำถาม" color="error" onClick={onRemove} disabled={action.isBusy}>
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={isEditing} timeout="auto" unmountOnExit>
        <Stack spacing={2} sx={{ borderTop: `1px solid ${colors.hairlineSoft}`, p: 2 }}>
          <TextField label="คำถาม" value={form.question} onChange={(event) => onUpdate('question', event.target.value)} required error={!form.question.trim()} />
          <TextField label="คำตอบ" value={form.answer} onChange={(event) => onUpdate('answer', event.target.value)} multiline minRows={4} required error={!form.answer.trim()} />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 160px 160px' } }}>
            <TextField label="หมวดหมู่" select SelectProps={{ native: true }} value={form.categoryId} onChange={(event) => onUpdate('categoryId', event.target.value || '')}>
              <option value="">ไม่ระบุหมวด</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </TextField>
            <TextField label="ลำดับ" type="number" value={form.sortOrder} onChange={(event) => onUpdate('sortOrder', event.target.value)} />
            <TextField label="สถานะ" select SelectProps={{ native: true }} value={form.status} onChange={(event) => onUpdate('status', event.target.value)}>
              <option value="published">เผยแพร่</option>
              <option value="draft">แบบร่าง</option>
            </TextField>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={onSave} disabled={action.isBusy}>บันทึก</Button>
            <Button variant="outlined" startIcon={<CloseOutlinedIcon />} onClick={onCancel} disabled={action.isBusy}>ปิด</Button>
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
}

export default function AdminFaqs() {
  const { data: faqs, isLoading, error } = useCmsResource(() => cmsService.getFaqs(true), faqItems, []);
  const { data: categoryData } = useCmsResource(() => cmsService.getFaqCategories(), fallbackCategories, []);
  const categories = Array.isArray(categoryData) && categoryData.length ? categoryData : fallbackCategories;
  const action = useAdminAction();
  const [editingId, setEditingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyFaq);

  const sortedFaqs = useMemo(() => (
    [...faqs].sort((a, b) => (Number(a.sortOrder || 0) - Number(b.sortOrder || 0)) || String(a.question || '').localeCompare(String(b.question || '')))
  ), [faqs]);

  const filteredFaqs = useMemo(() => sortedFaqs.filter((faq) => {
    const categoryMatch = activeCategory === 'all' || String(faq.categoryId || '') === String(activeCategory);
    return categoryMatch && matchesSearch(faq, search);
  }), [activeCategory, search, sortedFaqs]);

  const beginEdit = (faq) => {
    setEditingId(faq.id);
    setForm(toForm(faq, activeCategory === 'all' ? '' : activeCategory));
    action.clearFeedback();
  };

  const beginCreate = () => {
    const categoryId = activeCategory === 'all' ? categories[0]?.id || '' : activeCategory;
    const nextOrder = filteredFaqs.length ? Math.max(...filteredFaqs.map((item) => Number(item.sortOrder || 0))) + 1 : 1;
    setEditingId('new');
    setForm({ ...emptyFaq, categoryId, sortOrder: nextOrder });
    action.clearFeedback();
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => firstError([
    required(form.question, 'กรุณากรอกคำถาม'),
    required(form.answer, 'กรุณากรอกคำตอบ')
  ]);

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      action.setError(validationError);
      return;
    }

    const payload = normalizeFaqPayload(form);
    if (editingId && editingId !== 'new') {
      await action.run(() => cmsService.updateFaq(editingId, payload), 'บันทึกคำถามแล้ว');
    } else {
      const created = await action.run(() => cmsService.createFaq(payload), 'เพิ่มคำถามแล้ว');
      if (created?.id) setEditingId(created.id);
    }
  };

  const remove = async (faq) => {
    if (!faq.id) return;
    const removed = await action.run(() => cmsService.deleteFaq(faq.id), 'ลบคำถามแล้ว');
    if (removed && editingId === faq.id) {
      setEditingId(null);
      setForm(emptyFaq);
    }
  };

  const moveFaq = async (faq, direction) => {
    const index = filteredFaqs.findIndex((item) => item.id === faq.id);
    const target = filteredFaqs[index + direction];
    if (!target) return;

    const currentOrder = Number(faq.sortOrder || index + 1);
    const targetOrder = Number(target.sortOrder || index + direction + 1);
    await action.run(
      async () => {
        await cmsService.updateFaq(faq.id, normalizeFaqPayload({ ...faq, sortOrder: targetOrder }));
        await cmsService.updateFaq(target.id, normalizeFaqPayload({ ...target, sortOrder: currentOrder }));
        return { ok: true };
      },
      'บันทึกลำดับคำถามแล้ว'
    );
  };

  return (
    <AdminPanel title="คำถามที่พบบ่อย" description="จัดการ FAQ แบบ knowledge base ค้นหาเร็ว แก้ไขในรายการ และเรียงลำดับได้ทันที" actionLabel="เพิ่มคำถาม" onAction={beginCreate}>
      <Stack spacing={3}>
        <AdminAlerts error={action.error || error?.message} success={action.success} />
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดคำถาม..." /> : null}

        <Box sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 16px 42px rgba(15,17,21,0.04)', p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={2}>
            <TextField
              label="ค้นหาคำถาม"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon /></InputAdornment> }}
              fullWidth
            />
            <Tabs value={activeCategory} onChange={(_event, value) => setActiveCategory(value)} variant="scrollable" allowScrollButtonsMobile>
              <Tab label={`ทั้งหมด (${faqs.length})`} value="all" />
              {categories.map((category) => {
                const count = faqs.filter((faq) => String(faq.categoryId || '') === String(category.id)).length;
                return <Tab key={category.id} label={`${category.name} (${count})`} value={category.id} />;
              })}
            </Tabs>
          </Stack>
        </Box>

        {editingId === 'new' ? (
          <FaqRow
            faq={{ ...form, id: 'new' }}
            categories={categories}
            isEditing
            form={form}
            action={action}
            canMoveUp={false}
            canMoveDown={false}
            onEdit={() => {}}
            onCancel={() => setEditingId(null)}
            onUpdate={update}
            onSave={save}
            onRemove={() => setEditingId(null)}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
          />
        ) : null}

        <Stack spacing={1.5}>
          {!filteredFaqs.length && !isLoading ? <AdminEmptyState label="ไม่พบคำถามที่ตรงกับเงื่อนไข" /> : null}
          {filteredFaqs.map((faq, index) => (
            <FaqRow
              key={faq.id || faq.question}
              faq={{ ...faq, sortOrder: faq.sortOrder || index + 1 }}
              categories={categories}
              isEditing={editingId === faq.id}
              form={form}
              action={action}
              canMoveUp={index > 0}
              canMoveDown={index < filteredFaqs.length - 1}
              onEdit={() => beginEdit({ ...faq, sortOrder: faq.sortOrder || index + 1 })}
              onCancel={() => setEditingId(null)}
              onUpdate={update}
              onSave={save}
              onRemove={() => remove(faq)}
              onMoveUp={() => moveFaq(faq, -1)}
              onMoveDown={() => moveFaq(faq, 1)}
            />
          ))}
        </Stack>
      </Stack>
    </AdminPanel>
  );
}
