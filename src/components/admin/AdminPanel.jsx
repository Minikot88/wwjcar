import { Box, Button, Stack, Typography } from '@mui/material';
import { colors } from '../../theme/colors.js';

export default function AdminPanel({ title, description, actionLabel, onAction, children }) {
  return (
    <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', boxShadow: 'none', p: { xs: 2.5, md: 4.5 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography component="h2" variant="h2">
            {title}
          </Typography>
          {description ? (
            <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.75, maxWidth: 760 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {actionLabel ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
      {children}
    </Box>
  );
}
