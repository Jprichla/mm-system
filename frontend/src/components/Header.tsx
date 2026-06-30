import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { usePreferencesStore, type Idioma } from '../store/preferencesStore';

export function Header() {
  const { t, i18n } = useTranslation();
  const { usuario, logout } = useAuthStore();
  const { tema, alternarTema, idioma, setIdioma } = usePreferencesStore();

  const trocarIdioma = (novoIdioma: Idioma) => {
    setIdioma(novoIdioma);
    i18n.changeLanguage(novoIdioma);
  };

  return (
    <header className="mm-header sticky top-0 z-40 flex items-center justify-between px-4 py-3">
      <div className="text-sm font-bold tracking-[0.18em] md:text-base">MM <span style={{ color: '#00b4d8' }}>SYSTEM</span></div>
      <div className="flex items-center gap-2">
        <select
          className="mm-header-btn text-xs"
          value={idioma}
          onChange={(evento) => trocarIdioma(evento.target.value as Idioma)}
        >
          <option value="pt">PT</option>
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        <button type="button" className="mm-header-btn text-xs" onClick={alternarTema}>
          {t('tema')}: {tema === 'dark' ? t('escuro') : t('claro')}
        </button>
        <div className="mm-header-btn text-xs">{usuario?.name ?? '-'}</div>
        <button type="button" className="mm-header-btn text-xs" onClick={logout}>
          {t('sair')}
        </button>
      </div>
    </header>
  );
}
