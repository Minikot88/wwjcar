import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminAlerts, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const fallbackStats = {
  carsCount: 0,
  availableTodayCount: 0,
  bookedTodayCount: 0,
  maintenanceTodayCount: 0,
  customersCount: 0,
  newCustomersCount: 0,
  repeatCustomersCount: 0,
  todayRevenue: 0,
  todayExpenses: 0,
  todayProfit: 0,
  weeklyRevenue: 0,
  weeklyExpenses: 0,
  weeklyProfit: 0,
  monthlyRevenue: 0,
  yearlyRevenue: 0,
  monthlyExpenses: 0,
  monthlyProfit: 0,
  returningTodayCount: 0,
  returningTomorrowCount: 0,
  occupancyRate: 0,
  utilizationRate: 0,
  monthlyTrends: [],
  yearlyTrends: []
};

const money = new Intl.NumberFormat('th-TH', {
  currency: 'THB',
  maximumFractionDigits: 0,
  style: 'currency'
});

function toNumber(value) {
  return Number(value || 0);
}

function formatMoney(value) {
  return money.format(toNumber(value));
}

function formatNumber(value) {
  return toNumber(value).toLocaleString('th-TH');
}

function clampPercent(value) {
  return Math.max(0, Math.min(toNumber(value), 100));
}

function HeroMetric({ label, value, helper, tone = 'neutral', format = 'number' }) {
  const toneMap = {
    green: '#15803D',
    orange: '#F97316',
    red: colors.primary,
    neutral: colors.bodyStrong
  };

  return (
    <Stack
      spacing={1}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '24px',
        boxShadow: '0 18px 48px rgba(15,17,21,0.06)',
        minHeight: 148,
        p: { xs: 2.5, md: 3 }
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: '0.84rem', fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography sx={{ color: toneMap[tone], fontSize: { xs: '1.85rem', md: '2.35rem' }, fontWeight: 950, letterSpacing: 0, lineHeight: 1.05 }}>
        {format === 'money' ? formatMoney(value) : formatNumber(value)}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
        {helper}
      </Typography>
    </Stack>
  );
}

function FleetCard({ label, value, color, description }) {
  return (
    <Stack
      spacing={1.25}
      sx={{
        bgcolor: colors.canvasElevated,
        borderRadius: '24px',
        minHeight: 140,
        p: 3
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 900 }}>{label}</Typography>
        <Box sx={{ bgcolor: color, borderRadius: 999, height: 12, width: 12 }} />
      </Stack>
      <Typography sx={{ fontSize: '2.1rem', fontWeight: 950, lineHeight: 1 }}>
        {formatNumber(value)}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
        {description}
      </Typography>
    </Stack>
  );
}

function SummaryRow({ label, value, color, strong = false }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Box sx={{ bgcolor: color, borderRadius: 999, height: 8, width: 8 }} />
        <Typography color={strong ? 'text.primary' : 'text.secondary'} sx={{ fontSize: '0.86rem', fontWeight: strong ? 900 : 750 }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ color: strong ? color : 'text.primary', fontSize: strong ? '1rem' : '0.9rem', fontWeight: strong ? 950 : 850, textAlign: 'right' }}>
        {formatMoney(value)}
      </Typography>
    </Stack>
  );
}

function PeriodSummaryCard({ title, revenue, expenses, profit, helper }) {
  return (
    <Stack
      spacing={2}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '24px',
        boxShadow: '0 18px 48px rgba(15,17,21,0.055)',
        minHeight: 176,
        p: { xs: 2.5, md: 3 }
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 950 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
          {helper}
        </Typography>
      </Stack>
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <SummaryRow label="รายได้" value={revenue} color="#15803D" />
        <SummaryRow label="รายจ่าย" value={expenses} color="#DC2626" />
        <SummaryRow label="กำไร" value={profit} color={colors.primary} strong />
      </Box>
    </Stack>
  );
}

function UpcomingActivityCard({ title, value, description, color }) {
  return (
    <Stack
      spacing={1}
      sx={{
        bgcolor: colors.canvasElevated,
        borderRadius: '22px',
        minHeight: 128,
        p: 2.5
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
        <Box sx={{ bgcolor: color, borderRadius: 999, height: 10, width: 10 }} />
      </Stack>
      <Typography sx={{ fontSize: '2rem', fontWeight: 950, lineHeight: 1 }}>
        {formatNumber(value)}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
        {description}
      </Typography>
    </Stack>
  );
}

function RevenueExpenseProfitChart({ rows }) {
  const chartRows = (rows || []).slice(-6);
  const values = chartRows.flatMap((row) => [toNumber(row.revenue), toNumber(row.expenses), toNumber(row.profit)].map(Math.abs));
  const maxValue = Math.max(...values, 1);
  const series = [
    { key: 'revenue', label: 'รายได้', color: '#15803D' },
    { key: 'expenses', label: 'รายจ่าย', color: '#DC2626' },
    { key: 'profit', label: 'กำไร', color: colors.primary }
  ];

  return (
    <Stack spacing={3} sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 18px 48px rgba(15,17,21,0.055)', p: { xs: 2.5, md: 3.5 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' }, fontWeight: 950 }}>
            รายได้ รายจ่าย และกำไร
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            เปรียบเทียบตัวเลขสำคัญในกราฟเดียว เพื่อดูทิศทางธุรกิจได้รวดเร็ว
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {series.map((item) => (
            <Chip key={item.key} label={item.label} size="small" sx={{ bgcolor: `${item.color}18`, color: item.color, fontWeight: 800 }} />
          ))}
        </Stack>
      </Stack>

      {chartRows.length ? (
        <Stack spacing={2.25}>
          {chartRows.map((row) => (
            <Box key={row.period} sx={{ display: 'grid', gap: { xs: 1.25, md: 2 }, gridTemplateColumns: { xs: '1fr', md: '92px 1fr' }, alignItems: 'start' }}>
              <Typography color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 900, pt: { md: 0.5 } }}>
                {row.period}
              </Typography>
              <Stack spacing={1}>
                {series.map((item) => {
                  const value = toNumber(row[item.key]);
                  return (
                    <Box key={item.key} sx={{ display: 'grid', gridTemplateColumns: { xs: '72px 1fr', sm: '86px 1fr 112px' }, gap: 1.25, alignItems: 'center' }}>
                      <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                        {item.label}
                      </Typography>
                      <Box sx={{ bgcolor: 'rgba(107,114,128,0.12)', borderRadius: 999, height: 10, minWidth: 0, overflow: 'hidden' }}>
                        <Box sx={{ bgcolor: item.color, borderRadius: 999, height: '100%', width: `${Math.max((Math.abs(value) / maxValue) * 100, value ? 5 : 0)}%` }} />
                      </Box>
                      <Typography color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.78rem', fontWeight: 800, textAlign: 'right' }}>
                        {formatMoney(value)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box sx={{ bgcolor: colors.canvasElevated, borderRadius: '20px', p: 3 }}>
          <Typography color="text.secondary">ยังไม่มีข้อมูลแนวโน้มรายได้ รายจ่าย และกำไรสำหรับแสดงกราฟ</Typography>
        </Box>
      )}
    </Stack>
  );
}

function OccupancyChart({ stats }) {
  const occupancy = clampPercent(stats.occupancyRate || stats.utilizationRate);
  const available = clampPercent(100 - occupancy);

  return (
    <Stack spacing={3} sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 18px 48px rgba(15,17,21,0.055)', p: { xs: 2.5, md: 3.5 } }}>
      <Box>
        <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' }, fontWeight: 950 }}>
          อัตราการใช้รถ
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          ภาพรวมความหนาแน่นของคิวรถวันนี้
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' }, alignItems: 'center' }}>
        <Box
          sx={{
            alignItems: 'center',
            aspectRatio: '1 / 1',
            background: `conic-gradient(${colors.primary} 0 ${occupancy}%, rgba(107,114,128,0.16) ${occupancy}% 100%)`,
            borderRadius: '50%',
            display: 'grid',
            justifySelf: { xs: 'center', sm: 'start' },
            maxWidth: 180,
            p: 1.5,
            width: '100%'
          }}
        >
          <Stack sx={{ alignItems: 'center', bgcolor: 'background.paper', borderRadius: '50%', height: '100%', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 950 }}>{occupancy}%</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 800 }}>กำลังใช้งาน</Typography>
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ fontWeight: 850 }}>รถว่าง</Typography>
              <Typography color="text.secondary">{available}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={available} sx={{ bgcolor: 'rgba(107,114,128,0.14)', borderRadius: 999, height: 10, '& .MuiLinearProgress-bar': { bgcolor: '#15803D', borderRadius: 999 } }} />
          </Box>
          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ fontWeight: 850 }}>รถกำลังให้เช่า</Typography>
              <Typography color="text.secondary">{occupancy}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={occupancy} sx={{ bgcolor: 'rgba(107,114,128,0.14)', borderRadius: 999, height: 10, '& .MuiLinearProgress-bar': { bgcolor: colors.primary, borderRadius: 999 } }} />
          </Box>
          <Typography color="text.secondary" sx={{ fontSize: '0.86rem', lineHeight: 1.65 }}>
            ใช้ร่วมกับปฏิทินจองรถเพื่อดูวันที่รถแน่นและวันที่ยังมีโอกาสรับงานเพิ่ม
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useCmsResource(() => cmsService.getDashboard(), fallbackStats, []);
  const stats = { ...fallbackStats, ...data };
  const trendRows = stats.monthlyTrends?.length ? stats.monthlyTrends : stats.yearlyTrends;

  return (
    <AdminPanel
      title="ภาพรวมผู้บริหาร"
      description="ตัวเลขสำคัญสำหรับดูสุขภาพธุรกิจรถเช่า รายได้ กำไร และสถานะรถในวันนี้"
    >
      <Stack spacing={{ xs: 3, md: 4 }}>
        <AdminAlerts error={error?.message} />
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดภาพรวมธุรกิจ..." /> : null}

        <Box sx={{ bgcolor: colors.canvasElevated, borderRadius: '32px', p: { xs: 2, md: 3 }, position: 'relative' }}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.85rem', fontWeight: 900 }}>
              แดชบอร์ดผู้บริหาร
            </Typography>
            <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.75rem' }, fontWeight: 950, lineHeight: 1.2 }}>
              ตัวเลขหลักสำหรับตัดสินใจวันนี้
            </Typography>
          </Stack>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' } }}>
            <HeroMetric label="รายได้เดือนนี้" value={stats.monthlyRevenue} format="money" helper="ยอดรายได้จากรายการเช่าในเดือนนี้" tone="green" />
            <HeroMetric label="กำไรเดือนนี้" value={stats.monthlyProfit} format="money" helper={`หลังหักรายจ่าย ${formatMoney(stats.monthlyExpenses)}`} tone="red" />
            <HeroMetric label="รถกำลังให้เช่า" value={stats.bookedTodayCount} helper="จำนวนรถที่มีคิวใช้งานวันนี้" tone="orange" />
            <HeroMetric label="รถว่างวันนี้" value={stats.availableTodayCount} helper={`จากรถทั้งหมด ${formatNumber(stats.carsCount)} คัน`} tone="green" />
          </Box>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' }, fontWeight: 950 }}>
              สรุปธุรกิจ
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              แยกตามช่วงเวลาเพื่อดูรายได้ รายจ่าย และกำไรอย่างรวดเร็ว
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' } }}>
            <PeriodSummaryCard title="วันนี้" helper="ผลประกอบการวันนี้" revenue={stats.todayRevenue} expenses={stats.todayExpenses} profit={stats.todayProfit} />
            <PeriodSummaryCard title="สัปดาห์นี้" helper="ภาพรวมสัปดาห์นี้" revenue={stats.weeklyRevenue} expenses={stats.weeklyExpenses} profit={stats.weeklyProfit} />
            <PeriodSummaryCard title="เดือนนี้" helper="ภาพรวมเดือนนี้" revenue={stats.monthlyRevenue} expenses={stats.monthlyExpenses} profit={stats.monthlyProfit} />
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' }, fontWeight: 950 }}>
              ภาพรวมฟลีทรถ
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              ดูสถานะรถที่พร้อมให้เช่า กำลังให้เช่า และอยู่ระหว่างซ่อม
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
            <FleetCard label="รถทั้งหมด" value={stats.carsCount} color={colors.bodyStrong} description="จำนวนรถในระบบบริหารฟลีท" />
            <FleetCard label="รถว่าง" value={stats.availableTodayCount} color="#15803D" description="รถที่พร้อมรับงานวันนี้" />
            <FleetCard label="รถเช่าอยู่" value={stats.bookedTodayCount} color={colors.primary} description="รถที่มีคิวเช่าหรือกำลังใช้งาน" />
            <FleetCard label="รถซ่อม" value={stats.maintenanceTodayCount} color="#F97316" description="รถที่ถูกบล็อกเพื่อซ่อมหรือดูแลสภาพ" />
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' }, fontWeight: 950 }}>
              กิจกรรมที่ต้องติดตาม
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              งานสำคัญที่ทีมต้องเตรียมรับมือวันนี้และวันถัดไป
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            <UpcomingActivityCard title="รถคืนวันนี้" value={stats.returningTodayCount} color="#15803D" description="รายการที่ต้องเตรียมตรวจรับรถและปิดงานวันนี้" />
            <UpcomingActivityCard title="รถคืนพรุ่งนี้" value={stats.returningTomorrowCount} color="#2563EB" description="ช่วยวางแผนล้างรถ เตรียมส่งต่อ และรับงานใหม่" />
            <UpcomingActivityCard title="รถซ่อมวันนี้" value={stats.maintenanceTodayCount} color="#F97316" description="รถที่ไม่ควรเปิดรับคิวเช่าในวันนี้" />
          </Box>
        </Stack>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.45fr) minmax(360px, 0.75fr)' } }}>
          <RevenueExpenseProfitChart rows={trendRows} />
          <OccupancyChart stats={stats} />
        </Box>
      </Stack>
    </AdminPanel>
  );
}
