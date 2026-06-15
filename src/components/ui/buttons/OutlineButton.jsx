import { Button } from '@mui/material';
import { forwardRef } from 'react';
import { colors } from '../../../theme/colors.js';

const OutlineButton = forwardRef(function OutlineButton({ children, onLight = false, sx, ...props }, ref) {
  const borderColor = onLight ? colors.bodyOnLight : colors.ink;
  const textColor = onLight ? colors.bodyOnLight : colors.ink;

  return (
    <Button
      ref={ref}
      variant="outlined"
      sx={{
        color: textColor,
        borderColor,
        bgcolor: 'transparent',
        '&:hover': {
          borderColor: colors.primary,
          color: colors.primary,
          bgcolor: 'transparent'
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
});

export default OutlineButton;
