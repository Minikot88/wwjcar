import { Box, Button, Divider, Drawer, List, ListItemButton, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { LogoFull } from '../components/brand/Logo.jsx';
import { cmsService } from '../services/cmsService.js';
import { colors } from '../theme/colors.js';

const drawerWidth = 280;

const adminLinks = [
  { label: 'แดชบอร์ด', href: '/admin' },
  { label: 'รถเช่า', href: '/admin/cars' },
  { label: 'ตั้งค่าเว็บไซต์', href: '/admin/site-settings' },
  { label: 'หน้าแรก', href: '/admin/home' },
  { label: 'FAQ', href: '/admin/faqs' },
  { label: 'เงื่อนไขการเช่า', href: '/admin/rental-conditions' },
  { label: 'เกี่ยวกับเรา', href: '/admin/about' },
  { label: 'หน้าเว็บ', href: '/admin/pages' },
  { label: 'ไฟล์อัปโหลด', href: '/admin/uploads' }
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    cmsService.logout();
    navigate('/admin/login', { replace: true });
  };

  const sidebar = (
    <Stack sx={{ height: '100%' }}>
      <Toolbar sx={{ minHeight: 78 }}>
        <LogoFull />
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {adminLinks.map((item) => (
          <ListItemButton
            key={item.href}
            component={NavLink}
            to={item.href}
            end={item.href === '/admin'}
            sx={{
              borderRadius: '16px',
              mb: 0.5,
              '&.active': {
                bgcolor: 'rgba(255,0,0,0.08)',
                color: colors.primary
              }
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" onClick={logout}>
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
            borderRight: `1px solid ${colors.hairlineSoft}`
          }
        }}
        open
      >
        {sidebar}
      </Drawer>
      <Box sx={{ ml: { md: `${drawerWidth}px` }, p: { xs: 2, md: 4 } }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
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
