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
          overflowX: 'hidden',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased'
        },
        html: {
          overflowX: 'hidden'
        },
        '#root': {
          minWidth: 0,
          overflowX: 'hidden'
        },
        'img, video, canvas, svg': {
          maxWidth: '100%'
        },
        'a, button, [role="button"], input, textarea, select': {
          WebkitTapHighlightColor: 'transparent'
        },
        ':focus-visible': {
          outline: `3px solid ${colors.primary}`,
          outlineOffset: 3
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
          borderRadius: '999px',
          padding: `${spacing.xs - 1}px ${spacing.md}px`,
          textTransform: 'none',
          boxShadow: 'none',
          fontWeight: 700,
          transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
          '&.Mui-focusVisible': {
            outline: `3px solid ${colors.primary}`,
            outlineOffset: 2
          }
        },
        containedPrimary: {
          boxShadow: mode === 'dark' ? 'none' : '0 12px 26px rgba(255, 0, 0, 0.14)',
          '&:hover': {
            backgroundColor: colors.primaryHover,
            boxShadow: mode === 'dark' ? 'none' : '0 16px 34px rgba(255, 0, 0, 0.18)',
            transform: 'translateY(-1px)'
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        },
        outlined: {
          borderColor: modePalette.border,
          color: modePalette.text,
          backgroundColor: mode === 'dark' ? modePalette.surface : '#FFFFFF',
          '&:hover': {
            borderColor: colors.primary,
            backgroundColor: mode === 'dark' ? modePalette.surfaceStrong : '#FFFFFF',
            color: colors.primary,
            transform: 'translateY(-1px)'
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          backgroundImage: 'none',
          boxShadow: mode === 'dark' ? 'none' : colors.shadowSoft
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
          borderRadius: '20px',
          border: `1px solid ${modePalette.borderSoft}`,
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
          minHeight: 68,
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
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined'
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '18px',
          backgroundColor: mode === 'dark' ? modePalette.surface : '#FFFFFF',
          transition: 'border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: modePalette.border
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: modePalette.mutedSoft
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primary,
            borderWidth: 1
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 4px rgba(255,0,0,0.06)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: modePalette.borderSoft,
          paddingBottom: spacing.xs,
          paddingTop: spacing.xs,
          verticalAlign: 'middle'
        },
        head: {
          backgroundColor: modePalette.surface,
          color: modePalette.muted,
          fontSize: '0.78rem',
          fontWeight: 850,
          letterSpacing: 0
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 140ms ease',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.025)' : '#FAFBFC'
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '18px',
          alignItems: 'center'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          minHeight: 42,
          textTransform: 'none',
          fontWeight: 800
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          fontWeight: 700
        }
      }
    }
  }
});
}

export const muiTheme = createMuiTheme('light');
