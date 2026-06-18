import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const groups = [
  { key: 'documents', title: 'เอกสารที่ใช้' },
  { key: 'deposit', title: 'เงินมัดจำ' },
  { key: 'insurance', title: 'ประกันภัย' },
  { key: 'fuelPolicy', title: 'นโยบายน้ำมัน' },
  { key: 'lateReturn', title: 'คืนรถล่าช้า' }
];
function asArray(data) { return Array.isArray(data) ? data : data?.items || []; }
function SectionCard({ item, onEdit }) { return <Stack spacing={1.25} sx={{ bgcolor: 'background.paper', borderRadius: '26px', boxShadow: '0 14px 36px rgba(15,17,21,0.04)', p: 2.5 }}><Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}><Typography sx={{ fontSize: '1.08rem', fontWeight: 950 }}>{item.title}</Typography><Chip label={item.status || 'เผยแพร่'} size="small" sx={{ fontWeight: 900 }} /></Stack><Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{item.content || item.description || 'ยังไม่มีรายละเอียด'}</Typography><Button variant="outlined" onClick={onEdit} sx={{ alignSelf: 'flex-start' }}>แก้ไข</Button></Stack>; }

export default function AdminRentalConditions() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getRentalConditions(), [], []);
  const action = useAdminAction();
  const items = asArray(data);
  const [activeKey, setActiveKey] = useState('documents');
  const activeGroup = groups.find((group) => group.key === activeKey) || groups[0];
  const selected = useMemo(() => items.find((item) => item.key === activeKey || item.slug === activeKey || item.category === activeKey), [items, activeKey]);
  const [content, setContent] = useState('');
  useMemo(() => setContent(selected?.content || selected?.description || ''), [selected?.id, activeKey]);
  const save = async () => {
    const payload = { key: activeKey, title: activeGroup.title, content, status: 'published', sortOrder: groups.findIndex((group) => group.key === activeKey) + 1 };
    if (selected?.id) await action.run(() => cmsService.updateRentalCondition(selected.id, payload), 'บันทึกเงื่อนไขแล้ว');
    else await action.run(() => cmsService.createRentalCondition(payload), 'เพิ่มเงื่อนไขแล้ว');
  };

  return <AdminPanel title="เงื่อนไขการเช่า" description="จัดการข้อมูลสำคัญที่ลูกค้าต้องรู้ก่อนเช่ารถแบบแบ่งหมวด อ่านง่าย ไม่ต้องแก้ JSON"><Stack spacing={3}>{error ? <Alert severity="error">{error.message}</Alert> : null}{action.error ? <Alert severity="error">{action.error}</Alert> : null}{action.success ? <Alert severity="success">{action.success}</Alert> : null}{isLoading ? <AdminLoadingBlock label="กำลังโหลดเงื่อนไขการเช่า..." /> : null}<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>{groups.map((group) => <Chip key={group.key} label={group.title} color={activeKey === group.key ? 'primary' : 'default'} onClick={() => setActiveKey(group.key)} />)}</Stack><Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: '0.9fr 1.1fr' } }}><Stack spacing={2}>{items.length ? items.map((item) => <SectionCard key={item.id || item.key} item={item} onEdit={() => { setActiveKey(item.key || item.slug || item.category || 'documents'); setContent(item.content || item.description || ''); }} />) : <AdminEmptyState label="ยังไม่มีเงื่อนไขการเช่า" />}</Stack><Stack spacing={2.25} sx={{ bgcolor: colors.canvasElevated, borderRadius: '28px', p: { xs: 2.25, md: 3 } }}><Typography sx={{ fontSize: '1.2rem', fontWeight: 950 }}>{activeGroup.title}</Typography><TextField label="รายละเอียด" value={content} onChange={(e) => setContent(e.target.value)} multiline minRows={10} /><Button variant="contained" onClick={save} disabled={action.isBusy} sx={{ alignSelf: 'flex-start' }}>บันทึกหมวดนี้</Button></Stack></Box></Stack></AdminPanel>;
}
