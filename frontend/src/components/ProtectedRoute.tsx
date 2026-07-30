import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute() {
  const { t } = useTranslation();
  const token = useAuthStore((estado) => estado.token);
  const usuario = useAuthStore((estado) => estado.usuario);
  const perfilHidratado = useAuthStore((estado) => estado.perfilHidratado);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!perfilHidratado) {
    return (
      <div className="mm-auth-shell">
        <p className="mm-card p-6 text-center" role="status" aria-live="polite">
          {t('carregando')}...
        </p>
      </div>
    );
  }

  if (usuario?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
