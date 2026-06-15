import { Navigate, Outlet, useLocation } from 'react-router';
import { getAdminToken } from '../../services/apiClient.js';

export default function AdminProtectedRoute() {
  const location = useLocation();

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
