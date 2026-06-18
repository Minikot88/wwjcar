import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ManageHistoryOutlinedIcon from '@mui/icons-material/ManageHistoryOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { LogoFull } from '../components/brand/Logo.jsx';
import { cmsService } from '../services/cmsService.js';
import { colors } from '../theme/colors.js';

const drawerWidth = 304;

const adminSections = [
  {
    title: 'ธุรกิจ',
    description: 'รายได้ กำไร ลูกค้า และภาพรวมธุรกิจ',
    links: [
      { label: 'ภาพรวมธุรกิจ', href: '/admin', icon: SpaceDashboardOutlinedIcon },
      { label: 'ลูกค้า รายรับ และรายงาน', href: '/admin/business', icon: AnalyticsOutlinedIcon }
    ]
  },
  {
    title: 'ฟลีทรถ',
    description: 'รถเช่า ปฏิทินจอง และรถซ่อม',
    links: [
      { label: 'จัดการรถเช่า', href: '/admin/cars', icon: DirectionsCarOutlinedIcon },
      { label: 'ปฏิทินจองรถ', href: '/admin/bookings', icon: EventAvailableOutlinedIcon },
      { label: 'จัดการรถซ่อม', href: '/admin/maintenance', icon: BuildCircleOutlinedIcon }
    ]
  },
  {
    title: 'เว็บไซต์',
    description: 'ข้อมูลหน้าเว็บ รูปภาพ และเนื้อหาขาย',
    links: [
      { label: 'ตั้งค่าเว็บไซต์', href: '/admin/site-settings', icon: SettingsOutlinedIcon },
      { label: 'หน้าหลัก', href: '/admin/home', icon: HomeOutlinedIcon },
      { label: 'คำถามที่พบบ่อย', href: '/admin/faqs', icon: HelpOutlineOutlinedIcon },
      { label: 'เงื่อนไขการเช่า', href: '/admin/rental-conditions', icon: RuleOutlinedIcon },
      { label: 'เกี่ยวกับเรา', href: '/admin/about', icon: InfoOutlinedIcon },
      { label: 'เนื้อหาหน้าเว็บ', href: '/admin/pages', icon: ArticleOutlinedIcon },
      { label: 'รีวิวลูกค้า', href: '/admin/reviews', icon: RateReviewOutlinedIcon },
      { label: 'คลังรูปภาพ', href: '/admin/uploads', icon: CollectionsOutlinedIcon }
    ]
  },
  {
    title: 'ระบบ',
    description: 'สุขภาพระบบ ความปลอดภัย และสำรองข้อมูล',
    links: [
      { label: 'สถานะระบบ', href: '/admin/operations/health', icon: MonitorHeartOutlinedIcon },
      { label: 'สำรองข้อมูล', href: '/admin/operations/backups', icon: BackupOutlinedIcon },
      { label: 'ประวัติการใช้งาน', href: '/admin/operations/audit-log', icon: ManageHistoryOutlinedIcon },
      { label: 'โปรไฟล์ผู้ดูแล', href: '/admin/operations/profile', icon: PersonOutlineOutlinedIcon },
      { label: 'อุปกรณ์ที่เข้าสู่ระบบ', href: '/admin/operations/sessions', icon: DevicesOutlinedIcon }
    ]
  }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const logout = () => {
    cmsService.logout();
    navigate('/admin/login', { replace: true });
  };

  const closeMobileDrawer = () => setIsMobileDrawerOpen(false);

  const sidebar = (
    <Stack sx={{ bgcolor: colors.canvas, height: '100%', minHeight: 0 }}>
      <Toolbar sx={{ flexShrink: 0, minHeight: { xs: 76, md: 88 }, px: { xs: 2.5, md: 3 } }}>
        <LogoFull />
      </Toolbar>
      <Divider sx={{ borderColor: colors.hairlineSoft }} />
      <List sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, py: 3 }}>
        {adminSections.map((section) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            <Box sx={{ px: 1, pb: 1.25 }}>
              <Typography sx={{ color: 'text.primary', fontSize: '0.76rem', fontWeight: 900, letterSpacing: 0, textTransform: 'none' }}>
                {section.title}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.45, mt: 0.35 }}>
                {section.description}
              </Typography>
            </Box>
            <Stack spacing={0.5}>
              {section.links.map((item) => {
                const Icon = item.icon;

                return (
                  <ListItemButton
                    key={item.href}
                    component={NavLink}
                    to={item.href}
                    end={item.href === '/admin'}
                    onClick={closeMobileDrawer}
                    sx={{
                      alignItems: 'center',
                      borderRadius: '18px',
                      color: 'text.secondary',
                      gap: 1.35,
                      minHeight: 48,
                      px: 1.5,
                      position: 'relative',
                      transition: 'background-color 160ms ease, color 160ms ease, transform 160ms ease',
                      '&::before': {
                        bgcolor: colors.primary,
                        borderRadius: 999,
                        bottom: 12,
                        content: '""',
                        left: 0,
                        opacity: 0,
                        position: 'absolute',
                        top: 12,
                        transition: 'opacity 160ms ease',
                        width: 3
                      },
                      '&.active': {
                        bgcolor: 'rgba(255,0,0,0.055)',
                        color: 'text.primary'
                      },
                      '&.active::before': {
                        opacity: 1
                      },
                      '&:hover': {
                        bgcolor: colors.canvasElevated,
                        color: 'text.primary',
                        transform: 'translateX(2px)'
                      }
                    }}
                  >
                    <Icon sx={{ color: 'inherit', fontSize: 20, flexShrink: 0 }} />
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 800, fontSize: '0.92rem', noWrap: true }} />
                  </ListItemButton>
                );
              })}
            </Stack>
          </Box>
        ))}
      </List>
      <Box sx={{ flexShrink: 0, p: 2 }}>
        <Button fullWidth variant="outlined" onClick={logout} startIcon={<LogoutOutlinedIcon />}>
          ออกจากระบบ
        </Button>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflowX: 'hidden' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(18px)',
          backgroundImage: 'none',
          bgcolor: 'color-mix(in srgb, var(--wwj-bg) 92%, transparent)',
          borderBottom: `1px solid ${colors.hairlineSoft}`,
          color: 'text.primary',
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 2 }}>
          <LogoFull markSize={{ xs: 34 }} sx={{ flex: 1, minWidth: 0 }} />
          <IconButton
            aria-label="เปิดเมนูผู้ดูแล"
            aria-controls="admin-mobile-navigation"
            aria-expanded={isMobileDrawerOpen ? 'true' : 'false'}
            onClick={() => setIsMobileDrawerOpen(true)}
            sx={{ bgcolor: colors.canvasElevated, height: 44, width: 44 }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            borderRight: `1px solid ${colors.hairlineSoft}`,
            boxShadow: 'none',
            boxSizing: 'border-box',
            width: drawerWidth
          }
        }}
        open
      >
        {sidebar}
      </Drawer>

      <Drawer
        id="admin-mobile-navigation"
        anchor="left"
        open={isMobileDrawerOpen}
        onClose={closeMobileDrawer}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            borderRadius: 0,
            borderRight: `1px solid ${colors.hairlineSoft}`,
            boxShadow: '0 24px 80px rgba(15,17,21,0.14)',
            width: 'min(90vw, 340px)'
          }
        }}
      >
        {sidebar}
      </Drawer>

      <Box
        component="main"
        sx={{
          maxWidth: 1540,
          minWidth: 0,
          ml: { md: `${drawerWidth}px` },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
          py: { xs: 3, md: 5 }
        }}
      >
        <Stack spacing={1} sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography variant="caption" color="primary" sx={{ fontWeight: 900 }}>
            ระบบผู้ดูแล WWJ Car Rent
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.35rem' }, fontWeight: 900, letterSpacing: 0, lineHeight: 1.15 }}>
            ระบบจัดการธุรกิจรถเช่า
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
            ดูรายได้ สถานะรถ ลูกค้า เนื้อหาเว็บไซต์ และงานระบบในที่เดียว
          </Typography>
        </Stack>
        <Outlet />
      </Box>
    </Box>
  );
}
