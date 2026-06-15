import { Skeleton, Stack } from '@mui/material';
import { colors } from '../../../theme/colors.js';

export default function TextSkeleton({ lines = 3, width = '100%' }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '72%' : width}
          sx={{ bgcolor: colors.surfaceStrongLight, fontSize: '1rem' }}
        />
      ))}
    </Stack>
  );
}
