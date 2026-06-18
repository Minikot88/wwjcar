import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getInitials(name = '', email = '') {
  const source = name || email || 'ผู้ดูแล';
  return source.split(/[ ._-]/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'AD';
}

function AccountCard({ title, description, children }) {
  return (
    <Stack spacing={2.25} sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', p: { xs: 2.25, md: 3 } }}>
      <Box>
        <Typography sx={{ fontSize: '1.12rem', fontWeight: 950 }}>{title}</Typography>
        {description ? <Typography color="text.secondary" sx={{ fontSize: '0.88rem', mt: 0.55 }}>{description}</Typography> : null}
      </Box>
      {children}
    </Stack>
  );
}

function SessionRow({ session, onRevoke, disabled }) {
  const active = session.status === 'active';
  return (
    <Stack spacing={1.1} sx={{ bgcolor: colors.canvasElevated, borderRadius: '20px', p: 1.75 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 950 }} noWrap>{session.email || session.actorEmail || 'เซสชันผู้ดูแล'}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>เริ่ม {formatDate(session.createdAt || session.created_at)} · หมดอายุ {formatDate(session.expiresAt || session.expires_at)}</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip size="small" label={active ? 'ใช้งานอยู่' : session.status || 'ไม่ทราบ'} sx={{ bgcolor: active ? 'rgba(21,128,61,0.12)' : 'rgba(107,114,128,0.14)', color: active ? '#15803D' : 'text.secondary', fontWeight: 900 }} />
          <Button size="small" variant="outlined" color="error" disabled={!active || disabled} onClick={() => onRevoke(session.id)}>ยกเลิก</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default function AdminProfile() {
  const { data, error } = useCmsResource(() => cmsService.getAdminProfile(), null, []);
  const { data: sessionsData, error: sessionsError } = useCmsResource(() => cmsService.getSessions(), [], []);
  const [name, setName] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const user = data?.user || {};
  const sessions = useMemo(() => (Array.isArray(sessionsData) ? sessionsData : sessionsData?.items || []), [sessionsData]);
  const activeSessions = sessions.filter((session) => session.status === 'active');

  useEffect(() => { if (user?.name) setName(user.name); }, [user?.name]);

  const saveProfile = async () => {
    setIsSaving(true); setMessage(''); setActionError('');
    try { await cmsService.updateAdminProfile({ name }); setMessage('บันทึกโปรไฟล์แล้ว'); }
    catch (saveError) { setActionError(saveError.message || 'บันทึกโปรไฟล์ไม่สำเร็จ'); }
    finally { setIsSaving(false); }
  };

  const changePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) { setActionError('กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่'); return; }
    setIsSaving(true); setMessage(''); setActionError('');
    try { await cmsService.changePassword(passwords); setPasswords({ currentPassword: '', newPassword: '' }); setMessage('เปลี่ยนรหัสผ่านแล้ว'); }
    catch (passwordError) { setActionError(passwordError.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ'); }
    finally { setIsSaving(false); }
  };

  const revokeSession = async (id) => {
    setIsSaving(true); setMessage(''); setActionError('');
    try { await cmsService.revokeSession(id); setMessage('ยกเลิกเซสชันแล้ว'); }
    catch (sessionError) { setActionError(sessionError.message || 'ยกเลิกเซสชันไม่สำเร็จ'); }
    finally { setIsSaving(false); }
  };

  return (
    <AdminPanel title="โปรไฟล์ผู้ดูแล" description="ตั้งค่าบัญชีผู้ดูแล ความปลอดภัย รหัสผ่าน และอุปกรณ์ที่เข้าสู่ระบบ">
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error.message}</Alert> : null}
        {sessionsError ? <Alert severity="warning">{sessionsError.message}</Alert> : null}
        {actionError ? <Alert severity="error">{actionError}</Alert> : null}
        {message ? <Alert severity="success">{message}</Alert> : null}
        {!data ? <AdminLoadingBlock label="กำลังโหลดโปรไฟล์ผู้ดูแล..." /> : null}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: '0.9fr 1.1fr' } }}>
          <Stack spacing={3}>
            <AccountCard title="ข้อมูลบัญชี" description="ชื่อและอีเมลของผู้ดูแลระบบ">
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ alignItems: 'center', bgcolor: 'rgba(255,0,0,0.08)', borderRadius: '24px', color: colors.primary, display: 'flex', fontSize: '1.3rem', fontWeight: 950, height: 76, justifyContent: 'center', width: 76 }}>{getInitials(name, user.email)}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '1.45rem', fontWeight: 950 }} noWrap>{name || 'ผู้ดูแลระบบ'}</Typography>
                  <Typography color="text.secondary" noWrap>{user.email || '-'}</Typography>
                  <Chip size="small" label="ผู้ดูแล" sx={{ bgcolor: 'rgba(21,128,61,0.12)', color: '#15803D', fontWeight: 900, mt: 1 }} />
                </Box>
              </Stack>
              <TextField label="ชื่อผู้ดูแล" value={name} onChange={(event) => setName(event.target.value)} />
              <TextField label="อีเมล" value={user.email || ''} disabled />
              <Button variant="contained" onClick={saveProfile} disabled={isSaving || !name.trim()} sx={{ alignSelf: { sm: 'flex-start' } }}>บันทึกโปรไฟล์</Button>
            </AccountCard>
            <AccountCard title="ความปลอดภัย" description="ภาพรวมการป้องกันบัญชีผู้ดูแล">
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                <Metric label="สิทธิ์" value="ผู้ดูแล" />
                <Metric label="เซสชันที่ใช้งาน" value={`${activeSessions.length} รายการ`} tone="#F97316" />
                <Metric label="การเข้าสู่ระบบ" value="ยืนยันตัวตนแล้ว" />
                <Metric label="รหัสผ่าน" value="เปลี่ยนได้จากหน้านี้" tone={colors.primary} />
              </Box>
            </AccountCard>
          </Stack>
          <Stack spacing={3}>
            <AccountCard title="รหัสผ่าน" description="เปลี่ยนรหัสผ่านผู้ดูแลอย่างปลอดภัย">
              <TextField label="รหัสผ่านปัจจุบัน" type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} autoComplete="current-password" />
              <TextField label="รหัสผ่านใหม่" type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} autoComplete="new-password" helperText="ควรใช้รหัสผ่านที่ยาวและไม่ซ้ำกับบริการอื่น" />
              <Button variant="outlined" onClick={changePassword} disabled={isSaving} sx={{ alignSelf: { sm: 'flex-start' } }}>เปลี่ยนรหัสผ่าน</Button>
            </AccountCard>
            <AccountCard title="อุปกรณ์ที่เข้าสู่ระบบ" description="ตรวจสอบและยกเลิกเซสชันของผู้ดูแล">
              {!sessions.length ? <AdminEmptyState label="ยังไม่มีเซสชันให้แสดง" /> : null}
              <Stack spacing={1.25}>{sessions.map((session) => <SessionRow key={session.id} session={session} onRevoke={revokeSession} disabled={isSaving} />)}</Stack>
            </AccountCard>
          </Stack>
        </Box>
      </Stack>
    </AdminPanel>
  );
}

function Metric({ label, value, tone = '#15803D' }) {
  return <Stack sx={{ bgcolor: colors.canvasElevated, borderRadius: '18px', p: 1.75 }}><Typography color="text.secondary" sx={{ fontSize: '0.74rem', fontWeight: 900 }}>{label}</Typography><Typography sx={{ color: tone, fontSize: '1rem', fontWeight: 950, mt: 0.7 }}>{value}</Typography></Stack>;
}
