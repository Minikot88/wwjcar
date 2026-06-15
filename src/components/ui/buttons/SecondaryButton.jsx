import { Button } from '@mui/material';
import { forwardRef } from 'react';
import { colors } from '../../../theme/colors.js';

const SecondaryButton = forwardRef(function SecondaryButton({ children, sx, ...props }, ref) {
  return (
    <Button
      ref={ref}
      variant="contained"
      sx={{
        bgcolor: colors.canvasElevated,
        color: colors.ink,
        border: `1px solid ${colors.hairline}`,
        '&:hover': {
          bgcolor: colors.surfaceStrongLight
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
});

export default SecondaryButton;
