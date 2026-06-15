import { Container } from '@mui/material';
import { containerWidths } from '../../theme/breakpoints.js';

export default function AppContainer({ size = 'editorial', children, sx, ...props }) {
  return (
    <Container
      maxWidth={false}
      sx={{
        width: '100%',
        maxWidth: containerWidths[size] || containerWidths.editorial,
        mx: 'auto',
        px: { xs: 2, sm: 3, lg: 4 },
        ...sx
      }}
      {...props}
    >
      {children}
    </Container>
  );
}
