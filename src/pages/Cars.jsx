import { Box, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import Seo from '../components/seo/Seo.jsx';
import { cars } from '../data/cars.js';
import CarFilters from '../features/cars/CarFilters.jsx';
import CarGrid from '../features/cars/CarGrid.jsx';
import { createCarsBreadcrumbSchema } from '../features/cars/carSchemas.js';
import { filterCars } from '../features/cars/carUtils.js';
import { useCmsResource } from '../hooks/useCmsResource.js';
import { cmsService } from '../services/cmsService.js';
import { colors } from '../theme/colors.js';

export default function Cars() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    transmission: '',
    sort: 'price-asc'
  });

  const { data: cmsCars } = useCmsResource(() => cmsService.getCars(), cars, []);
  const filteredCars = useMemo(() => filterCars(cmsCars, filters), [cmsCars, filters]);

  return (
    <>
      <Seo
        title="รถเช่าหาดใหญ่"
        description="เลือกรถเช่าหาดใหญ่จาก WWJ Car Rent มีรถหลายรุ่นพร้อมราคาเช่าต่อวัน ค้นหา กรองแบรนด์ และเลือกตามงบประมาณได้ง่าย"
        canonical="/cars"
        ogTitle="รถเช่าหาดใหญ่ | WWJ Car Rent"
        ogDescription="ดูรถเช่าทั้งหมดจาก WWJ Car Rent พร้อมราคาเช่าต่อวันสำหรับหาดใหญ่และสนามบินหาดใหญ่"
        schema={createCarsBreadcrumbSchema()}
      />

      <Stack spacing={{ xs: 5, md: 7 }}>
        <PageHeader
          eyebrow="รถเช่า"
          title="รถเช่าหาดใหญ่"
          description="ค้นหารถเช่าที่เหมาะกับทริปของคุณ เลือกตามแบรนด์ ระบบเกียร์ และราคาเช่าต่อวัน"
        />

        <Section
          surface="light"
          spacing="compact"
          sx={{ mx: 'calc(50% - 50vw)' }}
          containerSx={{ color: colors.bodyOnLight }}
        >
          <Stack spacing={{ xs: 4, md: 5 }} sx={{ bgcolor: colors.canvas, borderRadius: '24px', boxShadow: '0 18px 50px rgba(15,17,21,0.045)', p: { xs: 2.5, md: 4 } }}>
            <CarFilters filters={filters} onChange={setFilters} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: colors.muted }}>
                แสดงรถ {filteredCars.length} จาก {cmsCars.length} คัน
              </Typography>
            </Box>
            <CarGrid cars={filteredCars} />
          </Stack>
        </Section>
      </Stack>
    </>
  );
}
