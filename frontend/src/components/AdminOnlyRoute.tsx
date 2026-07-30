import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AdminOnlyRoute() {
  const roleEfetivo = useAuthStore((state) => state.roleEfetivo);

  if (roleEfetivo !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
