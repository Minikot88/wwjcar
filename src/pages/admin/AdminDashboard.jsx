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
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' } }}>
        {cards.map(([label, key]) => (
          <Stack key={key} spacing={1} sx={{ bgcolor: colors.canvasElevated, borderRadius: '20px', p: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography sx={{ fontSize: '2.25rem', fontWeight: 850 }}>{data[key]}</Typography>
          </Stack>
        ))}
      </Box>
    </AdminPanel>
  );
}
