import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import { Box, Button, Divider, Drawer, List, ListItemButton, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { LogoFull } from '../components/brand/Logo.jsx';
import { cmsService } from '../services/cmsService.js';
import { colors } from '../theme/colors.js';

const drawerWidth = 280;

const adminLinks = [
  { label: 'แดชบอร์ด', href: '/admin', icon: SpaceDashboardOutlinedIcon },
  { label: 'รถเช่า', href: '/admin/cars', icon: DirectionsCarOutlinedIcon },
  { label: 'ตั้งค่าเว็บไซต์', href: '/admin/site-settings', icon: SettingsOutlinedIcon },
  { label: 'หน้าแรก', href: '/admin/home', icon: HomeOutlinedIcon },
  { label: 'FAQ', href: '/admin/faqs', icon: HelpOutlineOutlinedIcon },
  { label: 'เงื่อนไขการเช่า', href: '/admin/rental-conditions', icon: RuleOutlinedIcon },
  { label: 'เกี่ยวกับเรา', href: '/admin/about', icon: InfoOutlinedIcon },
  { label: 'หน้าเว็บ', href: '/admin/pages', icon: ArticleOutlinedIcon },
  { label: 'ไฟล์อัปโหลด', href: '/admin/uploads', icon: CollectionsOutlinedIcon }
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    cmsService.logout();
    navigate('/admin/login', { replace: true });
  };

  const sidebar = (
    <Stack sx={{ height: '100%', bgcolor: colors.canvas }}>
      <Toolbar sx={{ minHeight: 84, px: 3 }}>
        <LogoFull />
      </Toolbar>
      <Divider sx={{ borderColor: colors.hairlineSoft }} />
      <List sx={{ px: 1.5, py: 2.5 }}>
        {adminLinks.map((item) => {
          const Icon = item.icon;

          return (
          <ListItemButton
            key={item.href}
            component={NavLink}
            to={item.href}
            end={item.href === '/admin'}
            sx={{
              alignItems: 'center',
              borderRadius: '14px',
              color: colors.body,
              gap: 1.35,
              mb: 0.35,
              minHeight: 46,
              px: 1.5,
              '&.active': {
                bgcolor: 'rgba(255,0,0,0.06)',
                color: colors.primary
              },
              '&:hover': {
                bgcolor: colors.canvasElevated,
                color: 'text.primary'
              }
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 650, fontSize: '0.92rem' }} />
          </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" onClick={logout} startIcon={<LogoutOutlinedIcon />}>
          ออกจากระบบ
        </Button>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${colors.hairlineSoft}`,
            boxShadow: 'none'
          }
        }}
        open
      >
        {sidebar}
      </Drawer>
      <Box sx={{ ml: { md: `${drawerWidth}px` }, p: { xs: 2, md: 5 }, maxWidth: 1480 }}>
        <Stack spacing={1} sx={{ mb: { xs: 3, md: 5 } }}>
          <Typography variant="caption" color="primary">
            WWJ CMS
          </Typography>
          <Typography component="h1" variant="h1">
            ระบบจัดการเว็บไซต์
          </Typography>
        </Stack>
        <Outlet />
      </Box>
    </Box>
  );
}
