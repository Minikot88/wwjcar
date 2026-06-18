import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Alert, Box, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

function formatDate(value) { if (!value) return '-'; return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function tone(action = '') { const value = String(action).toLowerCase(); if (value.includes('login')) return ['เข้าสู่ระบบ', '#15803D']; if (value.includes('logout')) return ['ออกจากระบบ', '#6B7280']; if (value.includes('upload') || value.includes('replace')) return ['รูปภาพ', '#7C3AED']; if (value.includes('delete')) return ['ลบข้อมูล', '#DC2626']; if (value.includes('create')) return ['สร้างข้อมูล', '#15803D']; if (value.includes('update') || value.includes('edit')) return ['แก้ไขข้อมูล', '#F97316']; return ['ระบบ', colors.primary]; }
function textOf(item) { return [item.action, item.entityType, item.entityId, item.actorEmail, item.ipAddress, item.userAgent, item.message].filter(Boolean).join(' ').toLowerCase(); }

export default function AdminAuditLog() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getAuditLogs(), [], []);
  const [search, setSearch] = useState('');
  const logs = Array.isArray(data) ? data : data?.items || [];
  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return query ? logs.filter((item) => textOf(item).includes(query)) : logs; }, [logs, search]);

  return (
    <AdminPanel title="ประวัติการใช้งาน" description="กิจกรรมสำคัญของผู้ดูแลและระบบ แสดงแบบไทม์ไลน์ให้อ่านง่าย">
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error.message}</Alert> : null}
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดประวัติการใช้งาน..." /> : null}
        <TextField label="ค้นหาประวัติ" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาจากอีเมล รายการ หรือไอพี" InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon /></InputAdornment> }} />
        {!filtered.length ? <AdminEmptyState label="ไม่พบประวัติที่ตรงกับเงื่อนไข" /> : null}
        <Stack spacing={1.5}>
          {filtered.map((item, index) => { const [label, color] = tone(item.action); return (
            <Stack key={item.id || index} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Box sx={{ bgcolor: color, borderRadius: 999, height: 12, mt: 1.2, width: 12 }} />
              <Stack spacing={1} sx={{ bgcolor: 'background.paper', borderRadius: '24px', boxShadow: '0 14px 36px rgba(15,17,21,0.04)', flex: 1, p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 950 }}>{item.message || item.action || 'กิจกรรมระบบ'}</Typography>
                  <Chip size="small" label={label} sx={{ bgcolor: `${color}18`, color, fontWeight: 900 }} />
                </Stack>
                <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>{item.actorEmail || 'ระบบ'} · {formatDate(item.createdAt || item.created_at)}{item.ipAddress ? ` · ${item.ipAddress}` : ''}</Typography>
                {item.entityType ? <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }}>ข้อมูล: {item.entityType}{item.entityId ? ` #${item.entityId}` : ''}</Typography> : null}
              </Stack>
            </Stack>
          ); })}
        </Stack>
      </Stack>
    </AdminPanel>
  );
}
