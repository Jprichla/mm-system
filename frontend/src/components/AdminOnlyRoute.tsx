import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AdminOnlyRoute() {
  const usuario = useAuthStore((state) => state.usuario);

  if (usuario?.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
