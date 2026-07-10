import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute() {
  const token = useAuthStore((estado) => estado.token);
  const usuario = useAuthStore((estado) => estado.usuario);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (usuario?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
