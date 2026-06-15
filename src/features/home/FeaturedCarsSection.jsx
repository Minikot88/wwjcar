import { Box, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import { CarCard } from '../../components/cars/index.js';
import Section from '../../components/layout/Section.jsx';
import { OutlineButton } from '../../components/ui/buttons/index.js';
import { featuredCars } from '../../data/cars.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';
import { gridColumns } from '../../utils/responsive.js';

export default function FeaturedCarsSection() {
  const { data: cmsCars } = useCmsResource(() => cmsService.getCars(), featuredCars, []);
  const displayCars = cmsCars.filter((car) => car.featured).slice(0, 6);
  const carsToRender = displayCars.length > 0 ? displayCars : cmsCars.slice(0, 6);

  return (
    <Section surface="light" spacing="standard" sx={{ mx: 'calc(50% - 50vw)' }}>
      <Stack spacing={{ xs: 4, md: 6 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: colors.primary }}>
              รถแนะนำ
            </Typography>
            <Typography component="h2" variant="h1" sx={{ color: colors.bodyOnLight, mt: 1 }}>
              รถยอดนิยมพร้อมให้เช่า
            </Typography>
          </Box>
          <OutlineButton component={Link} to="/cars" onLight>
            ดูรถทั้งหมด
          </OutlineButton>
        </Stack>

        <Box sx={{ ...gridColumns({ xs: 1, sm: 2, lg: 3 }), gap: { xs: 3, md: 4 } }}>
          {carsToRender.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </Box>
      </Stack>
    </Section>
  );
}
