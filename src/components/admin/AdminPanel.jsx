import { Box, Button, Stack, Typography } from '@mui/material';
import { colors } from '../../theme/colors.js';

export default function AdminPanel({ title, description, actionLabel, onAction, children }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: { xs: '20px', md: '24px' },
        boxShadow: '0 20px 60px rgba(15,17,21,0.055)',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: { xs: 3, md: 4 } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" sx={{ fontSize: { xs: '1.45rem', md: '1.9rem' }, fontWeight: 950, letterSpacing: 0, lineHeight: 1.2 }}>
            {title}
          </Typography>
          {description ? (
            <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.75, maxWidth: 760 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {actionLabel ? (
          <Button variant="contained" onClick={onAction} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
      {children}
    </Box>
  );
}
