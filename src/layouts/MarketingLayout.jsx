import { Box } from '@mui/material';
import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router';
import Header from '../components/navigation/Header.jsx';
import Footer from '../components/footer/Footer.jsx';
import AppContainer from '../components/layout/AppContainer.jsx';
import PageVisibilityGate from '../components/cms/PageVisibilityGate.jsx';
import { colors } from '../theme/colors.js';

const FloatingContactButtons = lazy(() => import('../components/cta/FloatingContactButtons.jsx'));

export default function MarketingLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: colors.canvas, pb: { xs: 8, md: 0 } }}>
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <AppContainer size="editorial" sx={{ py: { xs: 6, md: 10 } }}>
          <PageVisibilityGate>
            <Outlet />
          </PageVisibilityGate>
        </AppContainer>
      </Box>
      <Footer />
      <Suspense fallback={null}>
        <FloatingContactButtons />
      </Suspense>
    </Box>
  );
}
