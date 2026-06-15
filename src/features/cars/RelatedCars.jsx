import { Box, Stack, Typography } from '@mui/material';
import { CarCard } from '../../components/cars/index.js';
import { colors } from '../../theme/colors.js';
import { gridColumns } from '../../utils/responsive.js';
import { getRelatedCars } from './carUtils.js';

export default function RelatedCars({ car }) {
  const relatedCars = getRelatedCars(car, 3);

  return (
    <Stack spacing={{ xs: 4, md: 6 }}>
      <Box>
        <Typography variant="caption" sx={{ color: colors.primary }}>
          รถที่ใกล้เคียง
        </Typography>
        <Typography component="h2" variant="h1" sx={{ mt: 1 }}>
          รถรุ่นใกล้เคียง
        </Typography>
      </Box>

      <Box sx={{ ...gridColumns({ xs: 1, sm: 2, lg: 3 }), gap: { xs: 3, md: 4 } }}>
        {relatedCars.map((relatedCar) => (
          <CarCard key={relatedCar.id} car={relatedCar} />
        ))}
      </Box>
    </Stack>
  );
}
