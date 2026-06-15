import { Box, Typography } from '@mui/material';
import { NavLink } from 'react-router';
import { colors } from '../../theme/colors.js';

const logoImage = '/images/brand/logo.png';

function LogoRoot({ to, label = 'WWJ Car Rent', children, sx }) {
  return (
    <Box
      component={to ? NavLink : 'div'}
      {...(to ? { to } : {})}
      aria-label={label}
      sx={{
        alignItems: 'center',
        display: 'inline-flex',
        textDecoration: 'none',
        ...sx
      }}
    >
      {children}
    </Box>
  );
}

export function LogoMark({ to = '/', size = { xs: 34, md: 40 }, priority = false, sx }) {
  return (
    <LogoRoot to={to} sx={sx}>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: colors.canvas,
          borderRadius: { xs: '12px', md: '14px' },
          boxShadow: '0 10px 24px rgba(15,17,21,0.08)',
          display: 'inline-flex',
          height: size,
          justifyContent: 'center',
          overflow: 'hidden',
          width: size
        }}
      >
        <Box
          component="img"
          src={logoImage}
          alt="WWJ Car Rent"
          loading={priority ? 'eager' : 'lazy'}
          sx={{
            display: 'block',
            height: '100%',
            objectFit: 'contain',
            width: '100%'
          }}
        />
      </Box>
    </LogoRoot>
  );
}

export function LogoFull({ to = '/', markSize = { xs: 34, md: 40 }, priority = false, sx, textSx }) {
  return (
    <LogoRoot to={to} sx={{ gap: 1.35, ...sx }}>
      <LogoMark to={null} size={markSize} priority={priority} />
      <Box sx={{ lineHeight: 1 }}>
        <Typography
          component="span"
          sx={{
            color: 'text.primary',
            display: 'block',
            fontSize: { xs: '1rem', md: '1.08rem' },
            fontWeight: 850,
            lineHeight: 1.05,
            ...textSx
          }}
        >
          WWJ Car Rent
        </Typography>
        <Typography
          component="span"
          sx={{
            color: colors.muted,
            display: { xs: 'none', sm: 'block' },
            fontSize: '0.72rem',
            fontWeight: 700,
            lineHeight: 1.2,
            mt: 0.35
          }}
        >
          Hat Yai
        </Typography>
      </Box>
    </LogoRoot>
  );
}

export default LogoFull;
