import { Stack } from '@mui/material';
import CardSkeleton from './CardSkeleton.jsx';
import TextSkeleton from './TextSkeleton.jsx';

export default function PageSkeleton() {
  return (
    <Stack spacing={{ xs: 4, md: 6 }}>
      <TextSkeleton lines={4} />
      <CardSkeleton />
      <CardSkeleton />
    </Stack>
  );
}
