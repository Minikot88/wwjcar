import { Box } from '@mui/material';
import { containerWidths } from '../../theme/breakpoints.js';

export default function MaxWidth({ size = 'standard', children, sx, ...props }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: containerWidths[size] || containerWidths.standard,
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
