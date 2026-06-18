import { Box, Typography } from '@mui/material';
import { NavLink } from 'react-router';
import { cmsService } from '../../services/cmsService.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { colors } from '../../theme/colors.js';
import { getImageAsset, responsiveImageProps } from '../../utils/imageAssets.js';

const logoImage = getImageAsset('logo');

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
  const { data: settings } = useCmsResource(() => cmsService.getSettings(), [], []);
  const brand = settings.find((item) => item.key === 'brand')?.value || {};
  const logoSrc = brand.logoUrl || logoImage.src;
  const logoProps = brand.logoUrl
    ? { alt: 'WWJ Car Rent Hat Yai logo' }
    : responsiveImageProps(logoImage, 'WWJ Car Rent Hat Yai logo');

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
          src={logoSrc}
          {...logoProps}
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

export function LogoFull({ to = '/', markSize = { xs: 34, md: 40 }, priority = false, sx, textSx, subtitleSx }) {
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
            mt: 0.35,
            ...subtitleSx
          }}
        >
          Hat Yai
        </Typography>
      </Box>
    </LogoRoot>
  );
}

export default LogoFull;
