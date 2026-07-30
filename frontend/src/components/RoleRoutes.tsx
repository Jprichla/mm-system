import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Permite admin e gestor
export function GestorRoute() {
  const roleEfetivo = useAuthStore((state) => state.roleEfetivo);

  if (!['admin', 'gestor'].includes(roleEfetivo)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

// Permite admin, gestor e engenheiro
export function EngenheiroRoute() {
  const roleEfetivo = useAuthStore((state) => state.roleEfetivo);

  if (!['admin', 'gestor', 'engenheiro'].includes(roleEfetivo)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
