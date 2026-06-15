import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
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
  Toolbar
} from '@mui/material';
import { useContext, useState } from 'react';
import { NavLink } from 'react-router';
import { navigationItems, secondaryNavigationItems } from '../../config/site.js';
import { ColorModeContext } from '../../theme/ColorModeContext.js';
import { colors } from '../../theme/colors.js';
import { contactActions, externalLinkProps } from '../../utils/contactActions.js';
import { LogoFull } from '../brand/Logo.jsx';
import AppContainer from '../layout/AppContainer.jsx';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'color-mix(in srgb, var(--wwj-bg) 86%, transparent)',
        color: 'text.primary',
        borderBottom: `1px solid ${colors.hairlineSoft}`,
        backgroundImage: 'none',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 8px 28px rgba(15,17,21,0.035)',
        '.MuiButton-root': {
          borderRadius: '999px'
        }
      }}
    >
      <AppContainer size="editorial" sx={{ py: 0 }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 66, md: 78 }, gap: { xs: 1, md: 2.5 } }}>
          <LogoFull
            priority
            sx={{
              flexShrink: 0,
              mr: { xs: 'auto', lg: 2 }
            }}
          />

          <Box
            component="nav"
            aria-label="เมนูหลัก"
            sx={{
              alignItems: 'center',
              display: { xs: 'none', lg: 'flex' },
              flex: 1,
              gap: 0.25,
              justifyContent: 'center'
            }}
          >
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                component={NavLink}
                to={item.href}
                color="inherit"
                sx={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  minHeight: 44,
                  px: 1.5,
                  color: colors.body,
                  borderRadius: '999px',
                  position: 'relative',
                  '&.active': {
                    color: colors.primary,
                    bgcolor: 'rgba(255,0,0,0.07)'
                  },
                  '&:hover': {
                    color: colors.primary,
                    bgcolor: 'rgba(255,0,0,0.04)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' }, gap: 1.25, ml: { md: 'auto', lg: 2.5 } }}>
            <Button
              component="a"
              href={contactActions.line.href}
              {...externalLinkProps(contactActions.line)}
              color="inherit"
              aria-label={contactActions.line.ariaLabel}
              sx={{
                minHeight: 44,
                px: 2,
                color: 'text.primary',
                bgcolor: 'transparent',
                '&:hover': { bgcolor: colors.canvasElevated }
              }}
            >
              LINE
            </Button>
            <Button
              component="a"
              href={contactActions.line.href}
              {...externalLinkProps(contactActions.line)}
              variant="contained"
              color="primary"
              aria-label="จองรถเช่าผ่าน LINE"
              sx={{ minHeight: 46, px: 3, boxShadow: '0 14px 30px rgba(255,0,0,0.18)' }}
            >
              จองรถ
            </Button>
          </Box>

          <IconButton
            aria-label={mode === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'}
            color="inherit"
            onClick={toggleColorMode}
            sx={{
              bgcolor: colors.canvasElevated,
              borderRadius: '999px',
              flexShrink: 0,
              height: 44,
              ml: { xs: 0, md: 0.5 },
              mr: { xs: 0.5, md: 0 },
              width: 44
            }}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          <IconButton
            aria-label="เปิดเมนูนำทาง"
            color="inherit"
            edge="end"
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              bgcolor: colors.canvasElevated,
              borderRadius: '999px',
              display: { xs: 'inline-flex', md: 'none' },
              height: 44,
              width: 44
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppContainer>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            bgcolor: colors.canvas,
            color: 'text.primary',
            borderLeft: `1px solid ${colors.hairline}`,
            borderRadius: '24px 0 0 24px'
          }
        }}
      >
        <Box sx={{ width: { xs: 320, sm: 360 }, p: 2 }} role="presentation">
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <LogoFull markSize={{ xs: 34, md: 40 }} />
          </Box>
          <List>
            {navigationItems.map((item) => (
              <ListItemButton
                key={item.href}
                component={NavLink}
                to={item.href}
                onClick={closeDrawer}
                sx={{
                  minHeight: 56,
                  '&.active': {
                    color: colors.primary
                  }
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1.5, borderColor: colors.hairlineSoft }} />
          <List>
            {secondaryNavigationItems.map((item) => (
              <ListItemButton
                key={item.href}
                component={NavLink}
                to={item.href}
                onClick={closeDrawer}
                sx={{
                  minHeight: 52,
                  '&.active': {
                    color: colors.primary
                  }
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Stack spacing={1.25} sx={{ mt: 2 }}>
            <Button
              component="a"
              href={contactActions.line.href}
              {...externalLinkProps(contactActions.line)}
              variant="contained"
              fullWidth
              aria-label={contactActions.line.ariaLabel}
            >
              จองรถผ่าน LINE
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  );
}
