import { Box, Typography } from '@mui/material';
import { memo } from 'react';
import { CarCard } from '../../components/cars/index.js';
import { colors } from '../../theme/colors.js';
import { gridColumns } from '../../utils/responsive.js';

function CarGrid({ cars }) {
  if (cars.length === 0) {
    return (
      <Box sx={{ bgcolor: colors.canvas, border: `1px solid ${colors.hairlineSoft}`, borderRadius: '24px', p: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Typography sx={{ color: colors.bodyOnLight }}>ไม่พบรถที่ตรงกับตัวกรองที่เลือก</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...gridColumns({ xs: 1, sm: 2, lg: 3 }), gap: { xs: 3, md: 4 } }}>
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </Box>
  );
}

export default memo(CarGrid);
