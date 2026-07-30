import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { RolePreviewControl } from './RolePreviewControl';

const linkBase = 'flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold transition-colors';

const navigationItems = [
  { to: '/home', label: 'home' },
  { to: '/materials', label: 'materiais' },
  { to: '/typical-details', label: 'detalhesTypicos' },
  { to: '/projects', label: 'projetos' },
] as const;

interface SidebarProps {
  menuAberto: boolean;
  onFecharMenu: () => void;
}

export function Sidebar({ menuAberto, onFecharMenu }: SidebarProps) {
  const { t } = useTranslation();
  const roleEfetivo = useAuthStore((state) => state.roleEfetivo);
  const items = roleEfetivo === 'admin'
    ? [...navigationItems, { to: '/admin/users-access', label: 'gestaoAcessos' }]
    : navigationItems;

  const navigation = (mobile = false) => (
    <nav className="flex flex-col gap-1" aria-label={t('categoriasGlobais')}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={mobile ? onFecharMenu : undefined}
          className={({ isActive }) => `${linkBase} ${isActive ? 'bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]' : 'text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]'}`}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-70" aria-hidden="true" />
          <span>{t(item.label)}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="mm-card sticky top-24 hidden h-fit p-3 md:block">
        <div className="mb-2 px-3 pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
          {t('categoriasGlobais')}
        </div>
        {navigation()}
      </aside>

      {menuAberto && (
        <div id="mobile-navigation" className="fixed inset-0 z-30 bg-[color:var(--bg-page)]/80 p-4 pt-24 backdrop-blur-sm md:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={onFecharMenu}
            aria-label={t('fecharNavegacao')}
          />
          <aside className="mm-card relative mx-auto w-full max-w-md p-3 shadow-[var(--shadow-md)]">
            <div className="mb-2 flex items-center justify-between px-3 pt-1">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                {t('categoriasGlobais')}
              </div>
              <button type="button" className="mm-btn min-h-9 rounded-full px-3 text-xs" onClick={onFecharMenu} aria-label={t('fecharNavegacao')}>
                ×
              </button>
            </div>
            <div className="mb-3 px-3 md:hidden">
              <RolePreviewControl variant="mobile" />
            </div>
            {navigation(true)}
          </aside>
        </div>
      )}
    </>
  );
}
