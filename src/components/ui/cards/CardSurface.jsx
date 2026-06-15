import { Paper } from '@mui/material';
import { cardStyles } from '../../../theme/cardStyles.js';

export default function CardSurface({ variant = 'feature', children, sx, ...props }) {
  return (
    <Paper sx={{ ...cardStyles[variant], ...sx }} {...props}>
      {children}
    </Paper>
  );
}
