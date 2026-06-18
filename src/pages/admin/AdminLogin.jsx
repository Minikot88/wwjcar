import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { LogoFull } from '../../components/brand/Logo.jsx';
import PageLoader from '../../components/loading/PageLoader.jsx';
import { clearAdminToken, getAdminToken } from '../../services/apiClient.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(getAdminToken()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!getAdminToken()) {
      setIsCheckingSession(false);
      return undefined;
    }

    cmsService.getCurrentAdmin()
      .then(() => {
        if (isMounted) navigate('/admin', { replace: true });
      })
      .catch(() => {
        clearAdminToken();
        if (isMounted) setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await cmsService.login(form);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return <PageLoader />;
  }

  return (
    <Box sx={{ alignItems: 'center', bgcolor: 'background.default', display: 'flex', minHeight: '100vh', px: 2 }}>
      <Stack
        component="form"
        onSubmit={submit}
        spacing={3}
        sx={{
          bgcolor: colors.canvas,
          borderRadius: '24px',
          boxShadow: '0 24px 70px rgba(15,17,21,0.08)',
          maxWidth: 460,
          mx: 'auto',
          p: { xs: 3, md: 4 },
          width: '100%'
        }}
      >
        <LogoFull />
        <Box>
          <Typography component="h1" variant="h1">
            เข้าสู่ระบบผู้ดูแล
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            จัดการรถเช่า การจอง ลูกค้า รูปภาพ และเนื้อหาเว็บไซต์ WWJ Car Rent
          </Typography>
        </Box>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="อีเมล" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required autoComplete="username" />
        <TextField label="รหัสผ่าน" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required autoComplete="current-password" />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </Button>
      </Stack>
    </Box>
  );
}
