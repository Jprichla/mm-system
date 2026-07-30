import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { usePreferencesStore, type Idioma } from '../store/preferencesStore';
import { RolePreviewControl } from './RolePreviewControl';

interface HeaderProps {
  menuAberto: boolean;
  onAbrirMenu: () => void;
  onFecharMenu: () => void;
}

export function Header({ menuAberto, onAbrirMenu, onFecharMenu }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { usuario, logout } = useAuthStore();
  const { tema, alternarTema, idioma, setIdioma } = usePreferencesStore();

  const trocarIdioma = (novoIdioma: Idioma) => {
    setIdioma(novoIdioma);
    i18n.changeLanguage(novoIdioma);
  };

  return (
    <header className="mm-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--header-control-border)] bg-[var(--header-control-bg)] text-sm font-black text-[var(--header-accent-text)]" aria-hidden="true">
            MM
          </span>
          <div>
            <div className="text-sm font-bold tracking-[0.14em] md:text-base">MM <span className="text-[var(--header-accent-text)]">SYSTEM</span></div>
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--header-text-muted)]">{t('appName')}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-[var(--header-control-border)] bg-[var(--header-control-bg)] p-1.5 shadow-[var(--shadow-sm)]">
        <div className="hidden md:block">
          <RolePreviewControl variant="desktop" />
        </div>
        <select
          className="mm-header-btn rounded-full px-2.5 text-xs"
          value={idioma}
          onChange={(evento) => trocarIdioma(evento.target.value as Idioma)}
          aria-label={t('idioma')}
        >
          <option value="pt">PT</option>
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        <button type="button" className="mm-header-btn rounded-full px-2.5 text-xs" onClick={alternarTema} aria-label={t('tema')}>
          {t('tema')}: {tema === 'dark' ? t('escuro') : t('claro')}
        </button>
        <div className="mm-header-btn hidden max-w-40 truncate rounded-full px-3 text-xs sm:inline-flex" aria-label={t('usuario')}>
          {usuario?.name ?? '-'}
        </div>
        <button type="button" className="mm-header-btn rounded-full px-2.5 text-xs" onClick={logout} aria-label={t('sair')}>
          {t('sair')}
        </button>
          <button
            type="button"
            className="mm-header-btn mm-mobile-navigation-trigger rounded-full px-3 text-sm"
            onClick={menuAberto ? onFecharMenu : onAbrirMenu}
            aria-label={menuAberto ? t('fecharNavegacao') : t('abrirNavegacao')}
            aria-controls="mobile-navigation"
            aria-expanded={menuAberto}
          >
            {menuAberto ? '×' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
