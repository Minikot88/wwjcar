import PhoneIcon from '@mui/icons-material/Phone';
import { Box, Stack, Typography } from '@mui/material';
import Section from '../../components/layout/Section.jsx';
import { OutlineButton, PrimaryButton } from '../../components/ui/buttons/index.js';
import { colors } from '../../theme/colors.js';
import { contactActions, externalLinkProps } from '../../utils/contactActions.js';

export default function HomeCtaSection() {
  return (
    <Section surface="light" spacing="standard" sx={{ mx: 'calc(50% - 50vw)' }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={{ xs: 4, md: 6 }}
        sx={{
          alignItems: { xs: 'flex-start', lg: 'center' },
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #FF0000 0%, #C40000 100%)',
          color: colors.onPrimary,
          borderRadius: { xs: '26px', md: '32px' },
          p: { xs: 3, md: 5 },
          boxShadow: '0 24px 60px rgba(255,0,0,0.16)'
        }}
      >
        <Box sx={{ maxWidth: 780 }}>
          <Typography variant="caption" sx={{ color: colors.onPrimary }}>
            จองรถเช่า
          </Typography>
          <Typography component="h2" variant="h1" sx={{ mt: 1 }}>
            พร้อมเดินทางในหาดใหญ่แล้วหรือยัง?
          </Typography>
          <Typography sx={{ mt: 1.5, maxWidth: 620, opacity: 0.86 }}>
            ส่งวันเดินทางและรุ่นรถที่สนใจให้ทีมงานเช็ครถว่างได้ทันที
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <PrimaryButton
            component="a"
            href={contactActions.phone.href}
            aria-label={contactActions.phone.ariaLabel}
            startIcon={<PhoneIcon />}
            sx={{
              bgcolor: colors.canvas,
              color: colors.ink,
              '&:hover': {
                bgcolor: colors.canvasElevated
              }
            }}
          >
            โทรสอบถาม
          </PrimaryButton>
          <OutlineButton
            component="a"
            href={contactActions.line.href}
            {...externalLinkProps(contactActions.line)}
            aria-label={contactActions.line.ariaLabel}
            sx={{
              borderColor: colors.onPrimary,
              color: colors.onPrimary,
              '&:hover': {
                borderColor: colors.onPrimary,
                color: colors.onPrimary
              }
            }}
          >
            LINE
          </OutlineButton>
        </Stack>
      </Stack>
    </Section>
  );
}
