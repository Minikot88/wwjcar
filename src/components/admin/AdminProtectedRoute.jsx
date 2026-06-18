import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import PageLoader from '../loading/PageLoader.jsx';
import { clearAdminToken, getAdminToken } from '../../services/apiClient.js';
import { cmsService } from '../../services/cmsService.js';

export default function AdminProtectedRoute() {
  const location = useLocation();
  const [status, setStatus] = useState(() => (getAdminToken() ? 'checking' : 'anonymous'));

  useEffect(() => {
    let isMounted = true;

    if (!getAdminToken()) {
      setStatus('anonymous');
      return undefined;
    }

    cmsService.getCurrentAdmin()
      .then(() => {
        if (isMounted) setStatus('authenticated');
      })
      .catch(() => {
        clearAdminToken();
        if (isMounted) setStatus('anonymous');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === 'checking') {
    return <PageLoader />;
  }

  if (status === 'anonymous') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
