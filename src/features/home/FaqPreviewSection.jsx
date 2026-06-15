import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import Section from '../../components/layout/Section.jsx';
import { colors } from '../../theme/colors.js';
import { faqPreviewItems } from './homeContent.js';

export default function FaqPreviewSection() {
  return (
    <Section surface="light" spacing="compact" sx={{ mx: 'calc(50% - 50vw)' }}>
      <Stack spacing={{ xs: 4, md: 5 }}>
        <Box>
          <Typography variant="caption" sx={{ color: colors.primary }}>
            คำถามยอดนิยม
          </Typography>
          <Typography component="h2" variant="h1" sx={{ color: colors.bodyOnLight, mt: 1 }}>
            คำถามที่พบบ่อย
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {faqPreviewItems.map((question) => (
            <Typography
              key={question}
              component="h3"
              variant="h3"
              sx={{
                color: colors.ink,
                bgcolor: colors.canvas,
                border: `1px solid ${colors.hairlineSoft}`,
                borderRadius: '20px',
                boxShadow: '0 14px 32px rgba(15,17,21,0.05)',
                p: { xs: 2.5, md: 3 }
              }}
            >
              {question}
            </Typography>
          ))}
        </Box>

        <Button
          component={Link}
          to="/faq"
          endIcon={<ArrowForwardIcon />}
          sx={{
            alignSelf: 'flex-start',
            color: colors.bodyOnLight,
            px: 0,
            '&:hover': {
              bgcolor: 'transparent',
              color: colors.primary
            }
          }}
        >
          ดูคำถามทั้งหมด
        </Button>
      </Stack>
    </Section>
  );
}
