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
        bgcolor: 'color-mix(in srgb, var(--wwj-bg) 88%, transparent)',
        color: 'text.primary',
        borderBottom: `1px solid ${colors.hairlineSoft}`,
        backgroundImage: 'none',
        backdropFilter: 'blur(20px)',
        boxShadow: 'none',
        '.MuiButton-root': {
          borderRadius: '999px'
        }
      }}
    >
      <AppContainer size="editorial" sx={{ py: 0 }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 82 }, gap: { xs: 1, md: 3 } }}>
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
              gap: 0.5,
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
                  fontSize: '0.9rem',
                  fontWeight: 650,
                  minHeight: 44,
                  px: 1.75,
                  color: colors.body,
                  borderRadius: '999px',
                  position: 'relative',
                  '&.active': {
                    color: colors.primary,
                    bgcolor: 'transparent',
                    '&::after': {
                      bgcolor: colors.primary,
                      borderRadius: '999px',
                      bottom: 5,
                      content: '""',
                      height: 3,
                      left: '50%',
                      position: 'absolute',
                      transform: 'translateX(-50%)',
                      width: 18
                    }
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

          <Box sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' }, gap: 1, ml: { md: 'auto', lg: 3 } }}>
            <Button
              component="a"
              href={contactActions.line.href}
              {...externalLinkProps(contactActions.line)}
              color="inherit"
              aria-label={contactActions.line.ariaLabel}
              sx={{
                minHeight: 44,
                px: 2.25,
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
              sx={{ minHeight: 46, px: 3.25, boxShadow: '0 12px 26px rgba(255,0,0,0.14)' }}
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
            borderRadius: '28px 0 0 28px',
            boxShadow: 'none'
          }
        }}
      >
        <Box sx={{ width: { xs: 320, sm: 380 }, p: 2.5 }} role="presentation">
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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
                  borderRadius: '16px',
                  minHeight: 56,
                  '&.active': {
                    bgcolor: 'rgba(255,0,0,0.06)',
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
                  borderRadius: '16px',
                  minHeight: 52,
                  '&.active': {
                    bgcolor: 'rgba(255,0,0,0.06)',
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
