import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function AdminSessions() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getSessions(), [], []);
  const action = useAdminAction();
  const sessions = Array.isArray(data) ? data : data?.items || [];

  const revoke = async (id) => {
    await action.run(() => cmsService.revokeSession(id), 'ยกเลิกอุปกรณ์แล้ว');
  };

  return (
    <AdminPanel title="อุปกรณ์ที่เข้าสู่ระบบ" description="ตรวจสอบอุปกรณ์และเซสชันที่กำลังเข้าถึงระบบผู้ดูแล">
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error.message}</Alert> : null}
        {action.error ? <Alert severity="error">{action.error}</Alert> : null}
        {action.success ? <Alert severity="success">{action.success}</Alert> : null}
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดอุปกรณ์ที่เข้าสู่ระบบ..." /> : null}
        {!sessions.length && !isLoading ? <AdminEmptyState label="ยังไม่มีข้อมูลอุปกรณ์ที่เข้าสู่ระบบ" /> : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
          {sessions.map((session) => {
            const active = session.status === 'active';
            return (
              <Stack key={session.id} spacing={1.5} sx={{ bgcolor: 'background.paper', borderRadius: '26px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', p: 2.5 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 950 }} noWrap>{session.email || session.actorEmail || 'ผู้ดูแลระบบ'}</Typography>
                  <Chip label={active ? 'ใช้งานอยู่' : session.status || 'ไม่ทราบ'} size="small" sx={{ bgcolor: active ? 'rgba(21,128,61,0.12)' : 'rgba(107,114,128,0.14)', color: active ? '#15803D' : 'text.secondary', fontWeight: 900 }} />
                </Stack>
                <Stack spacing={0.5} sx={{ bgcolor: colors.canvasElevated, borderRadius: '18px', p: 1.5 }}>
                  <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>เริ่มใช้งาน: {formatDate(session.createdAt || session.created_at)}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>หมดอายุ: {formatDate(session.expiresAt || session.expires_at)}</Typography>
                  {session.ipAddress ? <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>ไอพี: {session.ipAddress}</Typography> : null}
                </Stack>
                <Button variant="outlined" color="error" disabled={!active || action.isBusy} onClick={() => revoke(session.id)} sx={{ alignSelf: 'flex-start' }}>ยกเลิกอุปกรณ์นี้</Button>
              </Stack>
            );
          })}
        </Box>
      </Stack>
    </AdminPanel>
  );
}
