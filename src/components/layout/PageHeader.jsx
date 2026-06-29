import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/colors.js';
import { spacing } from '../../theme/spacing.js';
import MaxWidth from './MaxWidth.jsx';

export default function PageHeader({ eyebrow, title, description, align = 'left', sx }) {
  return (
    <Box
      sx={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--wwj-surface) 64%, transparent), transparent 58%)',
        border: `1px solid ${colors.hairlineSoft}`,
        borderRadius: { xs: '24px', md: '32px' },
        boxShadow: '0 18px 52px rgba(15,17,21,0.04)',
        overflow: 'hidden',
        pb: { xs: `${spacing.md}px`, md: `${spacing.lg}px` },
        pl: { xs: 3, md: 5 },
        pr: { xs: 3, md: 5 },
        pt: { xs: `${spacing.md}px`, md: `${spacing.lg}px` },
        position: 'relative',
        textAlign: align,
        '&::after': {
          bgcolor: colors.primary,
          borderRadius: '999px',
          bottom: 0,
          content: '""',
          height: 3,
          left: align === 'center' ? '50%' : { xs: 24, md: 40 },
          position: 'absolute',
          transform: align === 'center' ? 'translateX(-50%)' : 'none',
          width: 56
        },
        ...sx
      }}
    >
      <MaxWidth size="standard" sx={{ mx: align === 'center' ? 'auto' : 0 }}>
        {eyebrow ? (
          <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 2, fontWeight: 750 }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
        {description ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2.5, maxWidth: 760, lineHeight: 1.85 }}>
            {description}
          </Typography>
        ) : null}
      </MaxWidth>
    </Box>
  );
}
