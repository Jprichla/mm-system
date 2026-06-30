import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

const linkBase = 'block rounded-md px-3 py-2 text-sm';

export function Sidebar() {
  const { t } = useTranslation();
  const usuario = useAuthStore((state) => state.usuario);

  return (
    <aside className="mm-card h-fit min-w-56 p-3">
      <div className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
        {t('categoriasGlobais')}
      </div>
      <nav className="flex flex-col gap-1">
        <NavLink to="/home" className={({ isActive }) => `${linkBase} ${isActive ? 'mm-btn-primary' : ''}`}>
          {t('home')}
        </NavLink>
        <NavLink to="/materials" className={({ isActive }) => `${linkBase} ${isActive ? 'mm-btn-primary' : ''}`}>
          {t('materiais')}
        </NavLink>
        <NavLink to="/typical-details" className={({ isActive }) => `${linkBase} ${isActive ? 'mm-btn-primary' : ''}`}>
          {t('detalhesTypicos')}
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `${linkBase} ${isActive ? 'mm-btn-primary' : ''}`}>
          {t('projetos')}
        </NavLink>

        {usuario?.role === 'admin' && (
          <NavLink to="/admin/users-access" className={({ isActive }) => `${linkBase} ${isActive ? 'mm-btn-primary' : ''}`}>
            {t('gestaoAcessos')}
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
