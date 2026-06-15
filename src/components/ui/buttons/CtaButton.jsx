import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '@mui/material';
import { forwardRef } from 'react';
import { colors } from '../../../theme/colors.js';

const CtaButton = forwardRef(function CtaButton({ children, sx, ...props }, ref) {
  return (
    <Button
      ref={ref}
      variant="contained"
      color="primary"
      endIcon={<ArrowForwardIcon />}
      sx={{
        minHeight: 56,
        px: { xs: 4, sm: 5 },
        bgcolor: colors.primary,
        '& .MuiButton-endIcon': {
          ml: 1.5
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
});

export default CtaButton;
