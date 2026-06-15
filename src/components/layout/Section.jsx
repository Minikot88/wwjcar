import { Box } from '@mui/material';
import { colors } from '../../theme/colors.js';
import { sectionSpacing } from '../../theme/spacing.js';
import AppContainer from './AppContainer.jsx';

const surfaceStyles = {
  dark: {
    bgcolor: colors.canvas,
    color: colors.ink
  },
  elevated: {
    bgcolor: colors.canvasElevated,
    color: colors.ink
  },
  light: {
    bgcolor: colors.canvasLight,
    color: colors.bodyOnLight
  },
  red: {
    bgcolor: colors.canvas,
    color: colors.ink
  }
};

export default function Section({
  children,
  surface = 'dark',
  spacing = 'standard',
  container = true,
  containerSize = 'editorial',
  sx,
  containerSx,
  ...props
}) {
  const py = sectionSpacing[spacing] || sectionSpacing.standard;
  const responsivePadding = {
    xs: `${py.xs}px`,
    md: `${py.md}px`
  };

  return (
    <Box
      component="section"
      sx={{
        ...surfaceStyles[surface],
        py: responsivePadding,
        ...sx
      }}
      {...props}
    >
      {container ? (
        <AppContainer size={containerSize} sx={containerSx}>
          {children}
        </AppContainer>
      ) : (
        children
      )}
    </Box>
  );
}
