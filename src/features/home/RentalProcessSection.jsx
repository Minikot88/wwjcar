import { Box, Stack, Typography } from '@mui/material';
import Section from '../../components/layout/Section.jsx';
import { colors } from '../../theme/colors.js';
import { gridColumns } from '../../utils/responsive.js';
import { rentalProcessSteps } from './homeContent.js';

export default function RentalProcessSection() {
  return (
    <Section surface="light" spacing="standard" sx={{ mx: 'calc(50% - 50vw)' }}>
      <Stack spacing={{ xs: 4, md: 6 }}>
        <Box>
          <Typography variant="caption" sx={{ color: colors.primary }}>
            ขั้นตอนการเช่า
          </Typography>
          <Typography component="h2" variant="h1" sx={{ mt: 1, color: colors.ink }}>
            จองง่ายใน 4 ขั้นตอน
          </Typography>
        </Box>

        <Box sx={{ ...gridColumns({ xs: 1, sm: 2, lg: 4 }), gap: { xs: 2.5, md: 3 } }}>
          {rentalProcessSteps.map((step, index) => (
            <Stack
              key={step}
              spacing={3}
              sx={{
                bgcolor: colors.canvas,
                border: `1px solid ${colors.hairlineSoft}`,
                borderRadius: '24px',
                boxShadow: '0 18px 45px rgba(15,17,21,0.06)',
                p: { xs: 3, md: 4 },
                minHeight: 190
              }}
            >
              <Typography
                sx={{
                  bgcolor: 'rgba(255,0,0,0.08)',
                  color: colors.primary,
                  width: 52,
                  height: 52,
                  borderRadius: '18px',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </Typography>
              <Typography component="h3" variant="h3">
                {step}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Stack>
    </Section>
  );
}
