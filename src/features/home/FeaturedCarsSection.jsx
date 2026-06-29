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
    <Section
      surface="light"
      spacing="compact"
      sx={{
        mx: 'calc(50% - 50vw)',
        pt: { xs: '42px', md: '48px' },
        pb: { xs: '64px', md: '94px' },
        background: 'linear-gradient(180deg, var(--wwj-surface) 0%, var(--wwj-bg) 100%)'
      }}
    >
      <Stack spacing={{ xs: 3.5, md: 5 }}>
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
            <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 620, lineHeight: 1.75 }}>
              เลือกรถตามงบ จำนวนผู้โดยสาร และแผนการเดินทางในหาดใหญ่ ทีมงานช่วยเช็ครถว่างก่อนยืนยันการจองผ่าน LINE
            </Typography>
          </Box>
          <OutlineButton component={Link} to="/cars" onLight>
            ดูรถทั้งหมด
          </OutlineButton>
        </Stack>

        <Box sx={{ ...gridColumns({ xs: 1, sm: 2, lg: 3 }), gap: { xs: 2.25, md: 3 } }}>
          {carsToRender.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </Box>
      </Stack>
    </Section>
  );
}
