import { Paper } from '@mui/material';
import { cardStyles } from '../../../theme/cardStyles.js';
import { colors } from '../../../theme/colors.js';

export default function CardSurface({ variant = 'feature', children, sx, ...props }) {
  return (
    <Paper
      sx={{
        ...cardStyles[variant],
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: { md: 'translateY(-3px)' },
          boxShadow: colors.shadowMedium
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}
