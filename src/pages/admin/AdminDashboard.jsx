import { Box, Stack, Typography } from '@mui/material';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const fallbackStats = {
  carsCount: 0,
  faqCount: 0,
  reviewsCount: 0,
  pagesCount: 0,
  siteSettingsCount: 0
};

const cards = [
  ['รถในระบบ', 'carsCount'],
  ['FAQ', 'faqCount'],
  ['รีวิว', 'reviewsCount'],
  ['หน้าเว็บ', 'pagesCount'],
  ['ตั้งค่าเว็บไซต์', 'siteSettingsCount']
];

export default function AdminDashboard() {
  const { data } = useCmsResource(() => cmsService.getDashboard(), fallbackStats, []);

  return (
    <AdminPanel title="ภาพรวม" description="ตรวจสอบจำนวนข้อมูลหลักในระบบ CMS">
      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' } }}>
        {cards.map(([label, key]) => (
          <Stack
            key={key}
            spacing={1.25}
            sx={{
              bgcolor: colors.canvasElevated,
              border: `1px solid ${colors.hairlineSoft}`,
              borderRadius: '22px',
              minHeight: 140,
              p: 3,
              position: 'relative',
              '&::before': {
                bgcolor: colors.primary,
                borderRadius: '999px',
                content: '""',
                height: 4,
                left: 24,
                position: 'absolute',
                top: 18,
                width: 24
              }
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography sx={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1 }}>{data[key]}</Typography>
          </Stack>
        ))}
      </Box>
    </AdminPanel>
  );
}
