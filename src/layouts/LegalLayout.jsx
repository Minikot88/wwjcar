import { Box, Paper } from '@mui/material';
import { Outlet } from 'react-router';
import Header from '../components/navigation/Header.jsx';
import Footer from '../components/footer/Footer.jsx';
import AppContainer from '../components/layout/AppContainer.jsx';
import PageVisibilityGate from '../components/cms/PageVisibilityGate.jsx';
import { colors } from '../theme/colors.js';

export default function LegalLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: colors.canvas }}>
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <AppContainer size="narrow" sx={{ py: { xs: 8, md: 12 } }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: colors.canvasLight,
              color: colors.bodyOnLight,
              p: { xs: 3, sm: 5 },
              border: `1px solid ${colors.hairlineOnLight}`
            }}
          >
            <PageVisibilityGate>
              <Outlet />
            </PageVisibilityGate>
          </Paper>
        </AppContainer>
      </Box>
      <Footer />
    </Box>
  );
}
