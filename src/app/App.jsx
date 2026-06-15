import { CssBaseline, ThemeProvider } from '@mui/material';
import { useMemo, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router';
import { router } from './router/routes.jsx';
import { validateEnvironment } from '../config/env.js';
import { ColorModeContext } from '../theme/ColorModeContext.js';
import { createMuiTheme } from '../theme/muiTheme.js';

const envWarnings = validateEnvironment();

if (import.meta.env.DEV && envWarnings.length > 0) {
  envWarnings.forEach((warning) => console.warn(`[env] ${warning}`));
}

export default function App() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.localStorage.getItem('wwj-color-mode') || 'light';
  });

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((currentMode) => {
          const nextMode = currentMode === 'light' ? 'dark' : 'light';
          window.localStorage.setItem('wwj-color-mode', nextMode);
          return nextMode;
        });
      }
    }),
    [mode]
  );

  const theme = useMemo(() => createMuiTheme(mode), [mode]);

  return (
    <HelmetProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </HelmetProvider>
  );
}
