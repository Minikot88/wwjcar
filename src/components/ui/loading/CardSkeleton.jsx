import { Box, Skeleton, Stack } from '@mui/material';
import CardSurface from '../cards/CardSurface.jsx';
import { colors } from '../../../theme/colors.js';

export default function CardSkeleton({ variant = 'feature' }) {
  return (
    <CardSurface variant={variant}>
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={180} sx={{ bgcolor: colors.surfaceStrongLight }} />
        <Box>
          <Skeleton variant="text" width="70%" sx={{ bgcolor: colors.surfaceStrongLight, fontSize: '1.25rem' }} />
          <Skeleton variant="text" width="90%" sx={{ bgcolor: colors.surfaceStrongLight }} />
          <Skeleton variant="text" width="56%" sx={{ bgcolor: colors.surfaceStrongLight }} />
        </Box>
      </Stack>
    </CardSurface>
  );
}
