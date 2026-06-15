import { createTheme } from '@mui/material/styles';
import { breakpoints } from './breakpoints.js';
import { colors } from './colors.js';
import { spacing } from './spacing.js';
import { fontFamily, typographyScale } from './typography.js';
import { modeColors } from './colors.js';

export function createMuiTheme(colorMode = 'light') {
  const mode = colorMode === 'dark' ? 'dark' : 'light';
  const modePalette = modeColors[mode];

  return createTheme({
  breakpoints,
  palette: {
    mode,
    primary: {
      main: colors.primary,
      dark: colors.primaryActive,
      contrastText: colors.onPrimary
    },
    background: {
      default: modePalette.background,
      paper: modePalette.surface
    },
    text: {
      primary: modePalette.text,
      secondary: modePalette.muted
    },
    divider: modePalette.border
  },
  shape: {
    borderRadius: 24
  },
  spacing: (factor) => `${4 * factor}px`,
  typography: {
    fontFamily,
    display: typographyScale.display,
    h1: {
      ...typographyScale.h1
    },
    h2: {
      ...typographyScale.h2
    },
    h3: {
      ...typographyScale.h3
    },
    h4: {
      fontWeight: 500
    },
    h5: {
      fontWeight: 500
    },
    h6: {
      fontWeight: 600
    },
    body1: {
      ...typographyScale.body
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.6
    },
    caption: {
      ...typographyScale.caption
    },
    button: {
      ...typographyScale.button
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--wwj-bg': modePalette.background,
          '--wwj-surface': modePalette.surface,
          '--wwj-surface-strong': modePalette.surfaceStrong,
          '--wwj-text': modePalette.text,
          '--wwj-muted': modePalette.muted,
          '--wwj-muted-soft': modePalette.mutedSoft,
          '--wwj-border': modePalette.border,
          '--wwj-border-soft': modePalette.borderSoft
        },
        body: {
          backgroundColor: modePalette.background,
          color: modePalette.text,
          textRendering: 'optimizeLegibility'
        },
        '::selection': {
          backgroundColor: colors.primary,
          color: colors.onPrimary
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: '24px',
          padding: `${spacing.xs - 2}px ${spacing.md}px`,
          textTransform: 'none',
          boxShadow: 'none',
          '&.Mui-focusVisible': {
            outline: `3px solid ${colors.primary}`,
            outlineOffset: 2
          }
        },
        containedPrimary: {
          boxShadow: mode === 'dark' ? 'none' : '0 14px 28px rgba(255, 0, 0, 0.18)',
          '&:hover': {
            backgroundColor: colors.primaryHover,
            boxShadow: mode === 'dark' ? 'none' : '0 18px 36px rgba(255, 0, 0, 0.22)'
          }
        },
        outlined: {
          borderColor: colors.hairline,
          color: colors.ink,
          backgroundColor: colors.canvas
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          boxShadow: mode === 'dark' ? 'none' : '0 18px 45px rgba(15, 17, 21, 0.08)'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          '&.Mui-focusVisible': {
            outline: `3px solid ${colors.primary}`,
            outlineOffset: 2
          }
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: spacing.xs,
          paddingRight: spacing.xs
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '18px',
          border: `1px solid ${colors.hairlineSoft}`,
          boxShadow: 'none',
          marginBottom: 10,
          overflow: 'hidden',
          '&::before': {
            display: 'none'
          }
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 64,
          paddingLeft: spacing.sm,
          paddingRight: spacing.sm
        }
      }
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: `${spacing.xs}px ${spacing.sm}px ${spacing.sm}px`
        }
      }
    }
  }
});
}

export const muiTheme = createMuiTheme('light');
