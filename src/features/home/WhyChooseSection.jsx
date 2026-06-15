import { Box, Stack, Typography } from '@mui/material';
import Section from '../../components/layout/Section.jsx';
import CardSurface from '../../components/ui/cards/CardSurface.jsx';
import { colors } from '../../theme/colors.js';
import { gridColumns } from '../../utils/responsive.js';
import { whyChooseItems } from './homeContent.js';

export default function WhyChooseSection() {
  return (
    <Section surface="light" spacing="standard" sx={{ mx: 'calc(50% - 50vw)' }}>
      <Stack spacing={{ xs: 4, md: 6 }}>
        <Box>
          <Typography variant="caption" sx={{ color: colors.primary }}>
            ทำไมต้องเลือก WWJ
          </Typography>
          <Typography component="h2" variant="h1" sx={{ mt: 1, color: colors.ink }}>
            เช่ารถอย่างมั่นใจในหาดใหญ่
          </Typography>
        </Box>

        <Box sx={{ ...gridColumns({ xs: 1, sm: 2, lg: 4 }), gap: { xs: 3, md: 4 } }}>
          {whyChooseItems.map((item) => {
            const Icon = item.icon;

            return (
              <CardSurface key={item.title} variant="feature" sx={{ minHeight: 240 }}>
                <Stack spacing={3}>
                  <Icon sx={{ color: colors.primary, fontSize: 36 }} />
                  <Box>
                    <Typography component="h3" variant="h3">
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardSurface>
            );
          })}
        </Box>
      </Stack>
    </Section>
  );
}
