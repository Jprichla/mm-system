import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Permite admin e gestor
export function GestorRoute() {
  const usuario = useAuthStore((state) => state.usuario);

  if (!usuario || !['admin', 'gestor'].includes(usuario.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

// Permite admin, gestor e engenheiro
export function EngenheiroRoute() {
  const usuario = useAuthStore((state) => state.usuario);

  if (!usuario || !['admin', 'gestor', 'engenheiro'].includes(usuario.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
