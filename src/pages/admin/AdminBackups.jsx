import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

function formatDate(value) { if (!value) return '-'; return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function formatBytes(value) { const bytes = Number(value || 0); if (!bytes) return '-'; if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }

export default function AdminBackups() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getBackups(), [], []);
  const action = useAdminAction();
  const backups = Array.isArray(data) ? data : data?.items || [];
  const latest = backups[0];
  const totalBytes = backups.reduce((sum, item) => sum + Number(item.sizeBytes || item.size || 0), 0);

  const createBackup = async () => { await action.run(() => cmsService.createBackup(), 'สร้างไฟล์สำรองแล้ว'); };

  return (
    <AdminPanel title="สำรองข้อมูล" description="ตรวจสอบประวัติไฟล์สำรอง สร้าง backup ใหม่ และดูแนวทางกู้คืนข้อมูล" actionLabel={action.isBusy ? 'กำลังสร้าง...' : 'สำรองข้อมูลทันที'} onAction={createBackup}>
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error.message}</Alert> : null}
        {action.error ? <Alert severity="error">{action.error}</Alert> : null}
        {action.success ? <Alert severity="success">{action.success}</Alert> : null}
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดข้อมูลสำรอง..." /> : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
          <Metric label="ไฟล์สำรองล่าสุด" value={latest ? formatDate(latest.createdAt || latest.created_at) : '-'} />
          <Metric label="จำนวนไฟล์สำรอง" value={`${backups.length.toLocaleString('th-TH')} ไฟล์`} />
          <Metric label="พื้นที่รวม" value={formatBytes(totalBytes)} />
        </Box>
        <Stack spacing={2} sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', p: { xs: 2.25, md: 3 } }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 950 }}>ไทม์ไลน์ไฟล์สำรอง</Typography>
          {!backups.length ? <AdminEmptyState label="ยังไม่มีไฟล์สำรอง" /> : null}
          {backups.map((backup) => (
            <Stack key={backup.id || backup.fileName} direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' }, bgcolor: colors.canvasElevated, borderRadius: '20px', justifyContent: 'space-between', p: 1.75 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 950, overflowWrap: 'anywhere' }}>{backup.fileName || backup.filename || `backup-${backup.id}`}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>{formatDate(backup.createdAt || backup.created_at)} · {formatBytes(backup.sizeBytes || backup.size)}</Typography>
              </Box>
              <Button variant="outlined" onClick={() => cmsService.downloadBackup(backup)}>ดาวน์โหลด</Button>
            </Stack>
          ))}
        </Stack>
        <Stack spacing={1.25} sx={{ bgcolor: colors.canvasElevated, borderRadius: '24px', p: { xs: 2.25, md: 3 } }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 950 }}>แนวทางกู้คืนข้อมูล</Typography>
          <Typography color="text.secondary">ดาวน์โหลดไฟล์สำรองล่าสุด เก็บไว้นอกเซิร์ฟเวอร์ และทดสอบ restore บนฐานข้อมูลทดสอบก่อนแตะ production เสมอ</Typography>
        </Stack>
      </Stack>
    </AdminPanel>
  );
}

function Metric({ label, value }) { return <Stack sx={{ bgcolor: 'background.paper', borderRadius: '24px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', p: 2.5 }}><BackupOutlinedIcon color="primary" /><Typography color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 850, mt: 1 }}>{label}</Typography><Typography sx={{ fontSize: '1.3rem', fontWeight: 950, mt: 0.5 }}>{value}</Typography></Stack>; }
