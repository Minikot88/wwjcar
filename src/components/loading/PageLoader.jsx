import { Box, LinearProgress } from '@mui/material';
import { colors } from '../../theme/colors.js';

export default function PageLoader() {
  return (
    <Box sx={{ py: { xs: 6, md: 8 } }}>
      <LinearProgress
        sx={{
          bgcolor: colors.hairline,
          '& .MuiLinearProgress-bar': {
            bgcolor: colors.primary
          }
        }}
      />
    </Box>
  );
}
