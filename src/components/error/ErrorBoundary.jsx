import { Box, Button, Stack, Typography } from '@mui/material';
import { Link, useRouteError } from 'react-router';
import Seo from '../seo/Seo.jsx';

export default function ErrorBoundary() {
  const error = useRouteError();
  const message = error?.statusText || error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

  return (
    <>
      <Seo title="เกิดข้อผิดพลาด" canonical="/error" robots="noindex,follow" />
      <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
        <Stack spacing={3} sx={{ maxWidth: 640 }}>
          <Typography variant="caption" color="primary">
            เกิดข้อผิดพลาด
          </Typography>
          <Typography component="h1" variant="h1">
            ไม่สามารถโหลดหน้านี้ได้
          </Typography>
          <Typography color="text.secondary">{message}</Typography>
          <Button component={Link} to="/" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            กลับหน้าแรก
          </Button>
        </Stack>
      </Box>
    </>
  );
}
