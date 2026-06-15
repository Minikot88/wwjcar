import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/colors.js';
import { spacing } from '../../theme/spacing.js';
import MaxWidth from './MaxWidth.jsx';

export default function PageHeader({ eyebrow, title, description, align = 'left', sx }) {
  return (
    <Box
      sx={{
        borderBottom: `1px solid ${colors.hairlineSoft}`,
        pb: { xs: `${spacing.md}px`, md: `${spacing.lg}px` },
        pt: { xs: `${spacing.xs}px`, md: `${spacing.sm}px` },
        textAlign: align,
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
