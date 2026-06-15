import { Button } from '@mui/material';
import { forwardRef } from 'react';

const PrimaryButton = forwardRef(function PrimaryButton({ children, sx, ...props }, ref) {
  return (
    <Button ref={ref} variant="contained" color="primary" sx={sx} {...props}>
      {children}
    </Button>
  );
});

export default PrimaryButton;
