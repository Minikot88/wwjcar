import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { colors } from '../../theme/colors.js';

export function AdminAlerts({ error, success }) {
  return (
    <Stack spacing={1.5}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}
    </Stack>
  );
}

export function AdminLoadingBlock({ label = 'กำลังโหลดข้อมูล...' }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: colors.canvasElevated,
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '22px',
        display: 'flex',
        gap: 1.5,
        minHeight: 92,
        p: 2.5,
        boxShadow: '0 10px 28px rgba(15,17,21,0.035)'
      }}
    >
      <CircularProgress size={22} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

export function AdminEmptyState({ label = 'ยังไม่มีข้อมูล' }) {
  return (
    <Box
      sx={{
        bgcolor: colors.canvasElevated,
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: '22px',
        p: 3,
        textAlign: 'center'
      }}
    >
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}
