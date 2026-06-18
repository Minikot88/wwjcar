import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { Alert, Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const tones = {
  green: { label: 'ปกติ', color: '#15803D', bg: 'rgba(21,128,61,0.12)' },
  orange: { label: 'ควรตรวจสอบ', color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  red: { label: 'มีปัญหา', color: '#DC2626', bg: 'rgba(220,38,38,0.13)' }
};

function getTone(status) {
  if (status === 'ok' || status === 'completed') return 'green';
  if (status === 'warning' || status === 'not_configured' || status === 'unknown' || !status) return 'orange';
  return 'red';
}

function formatBytes(value) {
  if (value == null) return '-';
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  if (number >= 1024 ** 3) return `${(number / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (number >= 1024 ** 2) return `${(number / 1024 / 1024).toFixed(1)} MB`;
  return `${(number / 1024).toFixed(1)} KB`;
}

function formatDuration(seconds) {
  if (seconds == null) return '-';
  const total = Number(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days} วัน ${hours} ชม.`;
  if (hours > 0) return `${hours} ชม. ${minutes} นาที`;
  return `${minutes} นาที`;
}

function StatusCard({ icon, title, status, value, detail, percent }) {
  const tone = tones[getTone(status)];
  const progress = Number.isFinite(Number(percent)) ? Math.max(0, Math.min(100, Number(percent))) : null;

  return (
    <Stack spacing={1.75} sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', minHeight: 190, p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ bgcolor: tone.bg, borderRadius: '18px', color: tone.color, display: 'grid', height: 46, placeItems: 'center', width: 46 }}>
          {icon}
        </Box>
        <Chip size="small" label={tone.label} sx={{ bgcolor: tone.bg, color: tone.color, fontWeight: 900 }} />
      </Stack>
      <Box>
        <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 900 }}>{title}</Typography>
        <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.38rem' }, fontWeight: 950, lineHeight: 1.2, mt: 0.7, overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
      </Box>
      {progress != null ? (
        <LinearProgress variant="determinate" value={progress} sx={{ bgcolor: 'rgba(107,114,128,0.14)', borderRadius: 99, height: 8, '& .MuiLinearProgress-bar': { bgcolor: tone.color, borderRadius: 99 } }} />
      ) : null}
      <Typography color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.65 }}>{detail || 'ไม่มีรายละเอียดเพิ่มเติม'}</Typography>
    </Stack>
  );
}

export default function AdminOperationsHealth() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getOperationsHealth(), null, []);
  const checks = data?.checks || {};

  const cards = [
    { icon: <RouterOutlinedIcon />, title: 'เอพีไอ', status: checks.api?.status || data?.status || 'ok', value: 'เอพีไอออนไลน์', detail: checks.api?.message || 'Health endpoint ตอบกลับสำเร็จ' },
    { icon: <DataObjectOutlinedIcon />, title: 'ฐานข้อมูล', status: checks.database?.status, value: checks.database?.status === 'ok' ? 'PostgreSQL พร้อมใช้งาน' : 'ฐานข้อมูลต้องตรวจสอบ', detail: checks.database?.message || 'ตรวจสอบการเชื่อมต่อจาก backend' },
    { icon: <CloudOutlinedIcon />, title: 'Cloudinary', status: checks.cloudinary?.status, value: checks.cloudinary?.status === 'ok' ? 'เชื่อมต่อแล้ว' : 'ต้องตรวจสอบ', detail: checks.cloudinary?.message || 'ใช้เก็บรูปโลโก้ รถ แกลเลอรี และรูป CMS', percent: checks.cloudinary?.storage?.usedPercent },
    { icon: <BackupOutlinedIcon />, title: 'สำรองข้อมูล', status: checks.backup?.status, value: checks.backup?.fileName || 'ยังไม่มีไฟล์ล่าสุด', detail: checks.backup?.ageHours != null ? `อายุไฟล์ ${checks.backup.ageHours} ชม. · ขนาด ${formatBytes(checks.backup.sizeBytes)}` : checks.backup?.message || 'ควรมี backup ล่าสุดก่อนใช้งานจริง' },
    { icon: <StorageOutlinedIcon />, title: 'พื้นที่ดิสก์', status: checks.disk?.status, value: `ใช้ไป ${checks.disk?.usedPercent ?? '-'}%`, detail: `เหลือ ${formatBytes(checks.disk?.available)} จาก ${formatBytes(checks.disk?.total)}`, percent: checks.disk?.usedPercent },
    { icon: <MemoryOutlinedIcon />, title: 'หน่วยความจำ', status: checks.memory?.status, value: `ใช้ไป ${checks.memory?.usedPercent ?? '-'}%`, detail: `เหลือ ${formatBytes(checks.memory?.free)} จาก ${formatBytes(checks.memory?.total)}`, percent: checks.memory?.usedPercent },
    { icon: <TimerOutlinedIcon />, title: 'เวลาทำงาน', status: checks.uptime?.status, value: formatDuration(checks.uptime?.systemSeconds), detail: `เอพีไอทำงานมาแล้ว ${formatDuration(checks.uptime?.processSeconds)}` },
    { icon: <CloudOutlinedIcon />, title: 'รูปที่อัปโหลด', status: 'ok', value: `${checks.uploads?.uploadCount ?? 0} ไฟล์`, detail: checks.uploads?.lastUpload ? `ล่าสุด: ${checks.uploads.lastUpload.originalName} · รวม ${formatBytes(checks.uploads.totalBytes)}` : 'ยังไม่มีไฟล์อัปโหลดในระบบ' }
  ];

  const red = cards.filter((item) => getTone(item.status) === 'red').length;
  const orange = cards.filter((item) => getTone(item.status) === 'orange').length;
  const green = cards.length - red - orange;

  return (
    <AdminPanel title="สถานะระบบ" description="ภาพรวมสุขภาพระบบสำหรับเจ้าของธุรกิจและผู้ดูแล">
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error.message}</Alert> : null}
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดสถานะระบบ..." /> : null}
        <Stack spacing={2} sx={{ bgcolor: 'background.paper', borderRadius: '30px', boxShadow: '0 18px 48px rgba(15,17,21,0.045)', p: { xs: 2.25, md: 3 } }}>
          <Typography sx={{ color: red ? '#DC2626' : orange ? '#F97316' : '#15803D', fontSize: { xs: '1.55rem', md: '2rem' }, fontWeight: 950 }}>
            {red ? 'ระบบมีจุดที่ต้องแก้ไข' : orange ? 'ระบบใช้งานได้ แต่ควรตรวจสอบบางส่วน' : 'ระบบพร้อมใช้งาน'}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Chip label={`ปกติ ${green}`} sx={{ bgcolor: tones.green.bg, color: tones.green.color, fontWeight: 900 }} />
            <Chip label={`ตรวจสอบ ${orange}`} sx={{ bgcolor: tones.orange.bg, color: tones.orange.color, fontWeight: 900 }} />
            <Chip label={`มีปัญหา ${red}`} sx={{ bgcolor: tones.red.bg, color: tones.red.color, fontWeight: 900 }} />
          </Stack>
        </Stack>
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' } }}>
          {cards.map((card) => <StatusCard key={card.title} {...card} />)}
        </Box>
        <Button startIcon={<RefreshOutlinedIcon />} variant="outlined" onClick={() => window.location.reload()} sx={{ alignSelf: 'flex-start' }}>รีเฟรชสถานะ</Button>
      </Stack>
    </AdminPanel>
  );
}
