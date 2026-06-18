import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
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
import { useContext, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { navigationItems } from '../../config/site.js';
import { ColorModeContext } from '../../theme/ColorModeContext.js';
import { colors } from '../../theme/colors.js';
import { contactActions, externalLinkProps } from '../../utils/contactActions.js';
import { LogoFull } from '../brand/Logo.jsx';
import AppContainer from '../layout/AppContainer.jsx';

const tabletNavHrefs = new Set(['/', '/cars', '/monthly-car-rental']);

const drawerItems = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'รถเช่า', href: '/cars' },
  { label: 'เช็คคิวรถ', href: '/availability' },
  { label: 'เช่ารถรายเดือน', href: '/monthly-car-rental' },
  { label: 'เงื่อนไขการเช่า', href: '/rental-conditions' },
  { label: 'วิธีเช่ารถ', href: '/how-to-rent' },
  { label: 'คำถามที่พบบ่อย', href: '/faq' },
  { label: 'ติดต่อเรา', href: '/contact' },
  { label: 'About', href: '/about-us' }
];

function NavItem({ item, compact = false, onClick }) {
  return (
    <Button
      component={NavLink}
      to={item.href}
      onClick={onClick}
      color="inherit"
      sx={{
        borderRadius: 0,
        color: colors.body,
        fontSize: compact ? '0.86rem' : { lg: '0.78rem', xl: '0.86rem' },
        fontWeight: 700,
        letterSpacing: 0,
        minHeight: compact ? 42 : { lg: 40, xl: 44 },
        px: compact ? 1.15 : { lg: 0.6, xl: 1.15 },
        position: 'relative',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        '&::after': {
          bgcolor: colors.primary,
          borderRadius: '999px',
          bottom: compact ? 4 : 5,
          content: '""',
          height: 2,
          left: '50%',
          opacity: 0,
          position: 'absolute',
          transform: 'translateX(-50%) scaleX(0.4)',
          transition: 'opacity 160ms ease, transform 160ms ease',
          width: compact ? 14 : 18
        },
        '&.active': {
          color: 'text.primary',
          '&::after': {
            opacity: 1,
            transform: 'translateX(-50%) scaleX(1)'
          }
        },
        '&:hover': {
          bgcolor: 'transparent',
          color: colors.primary
        },
        '&:focus-visible': {
          outline: `2px solid ${colors.primary}`,
          outlineOffset: 3
        },
        '@media (min-width: 1440px)': {
          fontSize: compact ? '0.86rem' : '0.9rem',
          minHeight: compact ? 42 : 46,
          px: compact ? 1.15 : 1.85
        }
      }}
    >
      {item.label}
    </Button>
  );
}

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const closeDrawer = () => setIsDrawerOpen(false);

  const tabletNavItems = useMemo(
    () => navigationItems.filter((item) => tabletNavHrefs.has(item.href)),
    []
  );

  useEffect(() => {
    const updateScrolled = () => setIsScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isScrolled
          ? 'color-mix(in srgb, var(--wwj-bg) 94%, transparent)'
          : 'color-mix(in srgb, var(--wwj-bg) 86%, transparent)',
        color: 'text.primary',
        borderBottom: `1px solid ${isScrolled ? colors.hairline : colors.hairlineSoft}`,
        backgroundImage: 'none',
        backdropFilter: 'blur(22px) saturate(1.08)',
        boxShadow: isScrolled ? '0 14px 34px rgba(15,17,21,0.06)' : 'none',
        transition: 'background-color 180ms ease, box-shadow 180ms ease, border-color 180ms ease'
      }}
    >
      <AppContainer size="editorial" sx={{ py: 0 }}>
        <Toolbar
          disableGutters
          sx={{
            gap: { xs: 1, md: 1.5, lg: 2.5, xl: 4 },
            minHeight: {
              xs: isScrolled ? 58 : 64,
              md: isScrolled ? 64 : 72,
              lg: isScrolled ? 70 : 78,
              xl: isScrolled ? 74 : 84
            },
            transition: 'min-height 180ms ease'
          }}
        >
          <LogoFull
            priority
            markSize={{ xs: 34, md: 36, lg: 40 }}
            sx={{
              flexShrink: 0,
              mr: { xs: 'auto', md: 1, lg: 0 }
            }}
            textSx={{
              display: { xs: 'block', lg: 'none', xl: 'block' },
              fontSize: { xs: '0.98rem', md: '1rem', xl: '1.08rem' },
              '@media (min-width: 1440px)': {
                display: 'block'
              }
            }}
            subtitleSx={{
              display: { xs: 'none', sm: 'block', lg: 'none', xl: 'block' },
              '@media (min-width: 1440px)': {
                display: 'block'
              }
            }}
          />

          <Box
            component="nav"
            aria-label="เมนูหลักสำหรับแท็บเล็ต"
            sx={{
              alignItems: 'center',
              display: { xs: 'none', md: 'flex', lg: 'none' },
              flex: 1,
              gap: 0.25,
              justifyContent: 'center',
              minWidth: 0
            }}
          >
            {tabletNavItems.map((item) => (
              <NavItem key={item.href} item={item} compact />
            ))}
          </Box>

          <Box
            component="nav"
            aria-label="เมนูหลัก"
            sx={{
              alignItems: 'center',
              display: { xs: 'none', lg: 'flex' },
              flex: 1,
              gap: { lg: 0, xl: 0.15 },
              justifyContent: { lg: 'center', xl: 'center' },
              minWidth: 0
            }}
          >
            {navigationItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </Box>

          <Box
            sx={{
              alignItems: 'center',
              display: { xs: 'none', md: 'flex' },
              flexShrink: 0,
              gap: { md: 0.75, lg: 0.7, xl: 1 },
              ml: { md: 0, lg: 0.4, xl: 1 },
              '@media (min-width: 1440px)': {
                gap: 1.25,
                ml: 2
              }
            }}
          >
            <Button
              component="a"
              href={contactActions.line.href}
              {...externalLinkProps(contactActions.line)}
              color="inherit"
              aria-label={contactActions.line.ariaLabel}
              sx={{
                borderRadius: '999px',
                color: 'text.primary',
                fontWeight: 750,
                minHeight: { md: 42, lg: 40, xl: 44 },
                px: { md: 1.8, lg: 1.45, xl: 2 },
                textTransform: 'none',
                '&:hover': { bgcolor: colors.canvasElevated },
                '&:focus-visible': {
                  outline: `2px solid ${colors.primary}`,
                  outlineOffset: 2
                }
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
              sx={{
                borderRadius: '999px',
                boxShadow: '0 12px 24px rgba(255,0,0,0.14)',
                display: { xs: 'none', lg: 'inline-flex' },
                fontWeight: 850,
                minHeight: { lg: 40, xl: 44 },
                px: { lg: 1.8, xl: 2.55 },
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '@media (min-width: 1440px)': {
                  px: 3.2
                }
              }}
            >
              จองรถ
            </Button>

            <IconButton
              aria-label={mode === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'}
              color="inherit"
              onClick={toggleColorMode}
              sx={{
                bgcolor: colors.canvasElevated,
                borderRadius: '999px',
                display: { xs: 'none', lg: 'inline-flex' },
                flexShrink: 0,
                height: { lg: 40, xl: 44 },
                width: { lg: 40, xl: 44 },
                '&:hover': { bgcolor: colors.canvas },
                '&:focus-visible': {
                  outline: `2px solid ${colors.primary}`,
                  outlineOffset: 2
                }
              }}
            >
              {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </IconButton>
          </Box>

          <IconButton
            aria-label="เปิดเมนูนำทาง"
            aria-expanded={isDrawerOpen ? 'true' : 'false'}
            aria-controls="site-navigation-drawer"
            color="inherit"
            edge="end"
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              bgcolor: colors.canvasElevated,
              borderRadius: '999px',
              display: { xs: 'inline-flex', lg: 'none' },
              flexShrink: 0,
              height: { xs: 42, md: 44 },
              width: { xs: 42, md: 44 },
              '&:hover': { bgcolor: colors.canvas },
              '&:focus-visible': {
                outline: `2px solid ${colors.primary}`,
                outlineOffset: 2
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppContainer>

      <Drawer
        anchor="right"
        id="site-navigation-drawer"
        open={isDrawerOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            bgcolor: colors.canvas,
            color: 'text.primary',
            borderLeft: `1px solid ${colors.hairlineSoft}`,
            borderRadius: 0,
            boxShadow: '0 24px 80px rgba(15,17,21,0.14)',
            height: '100dvh',
            maxWidth: '100vw',
            width: { xs: 'min(100vw, 340px)', sm: 390, md: 420 }
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <LogoFull markSize={{ xs: 34, md: 38 }} />
            <IconButton
              aria-label="ปิดเมนูนำทาง"
              onClick={closeDrawer}
              sx={{
                bgcolor: colors.canvasElevated,
                height: 44,
                width: 44,
                '&:focus-visible': {
                  outline: `2px solid ${colors.primary}`,
                  outlineOffset: 2
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: colors.hairlineSoft, mb: 1 }} />

          <List component="nav" aria-label="เมนูใน drawer" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 1 }}>
            {drawerItems.map((item) => (
              <ListItemButton
                key={item.href}
                component={NavLink}
                to={item.href}
                onClick={closeDrawer}
                sx={{
                  borderRadius: '14px',
                  minHeight: { xs: 54, sm: 58 },
                  px: 1.75,
                  position: 'relative',
                  '&.active': {
                    bgcolor: 'transparent',
                    color: 'text.primary',
                    '&::before': {
                      bgcolor: colors.primary,
                      borderRadius: '999px',
                      content: '""',
                      height: 22,
                      left: 0,
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3
                    }
                  },
                  '&:hover': {
                    bgcolor: colors.canvasElevated
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${colors.primary}`,
                    outlineOffset: 2
                  }
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: { xs: '1rem', sm: '1.05rem' },
                    fontWeight: 760
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ pt: 1 }}>
            <Divider sx={{ borderColor: colors.hairlineSoft, mb: 2 }} />
            <Stack spacing={1.25}>
              <Button
                component="a"
                href={contactActions.line.href}
                {...externalLinkProps(contactActions.line)}
                variant="contained"
                fullWidth
                aria-label={contactActions.line.ariaLabel}
                sx={{ borderRadius: '999px', minHeight: 50 }}
              >
                จองรถผ่าน LINE
              </Button>
              <Button
                onClick={toggleColorMode}
                variant="outlined"
                fullWidth
                startIcon={mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                aria-label={mode === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'}
                sx={{ borderRadius: '999px', minHeight: 48 }}
              >
                {mode === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                WWJ Car Rent · Hat Yai
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}
