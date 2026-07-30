import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

const roleLabelKeys: Record<Role, string> = {
  admin: 'roleAdmin',
  gestor: 'roleGestor',
  engenheiro: 'roleEngenheiro',
  usuario: 'roleUsuario',
  cliente: 'roleCliente',
};

export function AppLayout() {
  const { t } = useTranslation();
  const [menuAberto, setMenuAberto] = useState(false);
  const isAdminReal = useAuthStore((state) => state.isAdminReal);
  const roleVisualizado = useAuthStore((state) => state.roleVisualizado);
  const voltarAoAdmin = useAuthStore((state) => state.voltarAoAdmin);

  const abrirMenu = () => setMenuAberto(true);
  const fecharMenu = () => setMenuAberto(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)]">
      <Header menuAberto={menuAberto} onAbrirMenu={abrirMenu} onFecharMenu={fecharMenu} />
      {isAdminReal && roleVisualizado && (
        <div className="mm-role-preview-banner mx-auto w-full max-w-[1480px] px-4 md:px-6 lg:px-8" role="status">
          <div className="min-w-0">
            <p>{t('modoVisualizacaoAtivo', { role: t(roleLabelKeys[roleVisualizado]) })}</p>
            <p>{t('contaContinuaAdmin')}</p>
          </div>
          <button type="button" className="mm-btn shrink-0" onClick={voltarAoAdmin}>
            {t('voltarAoAdmin')}
          </button>
        </div>
      )}
      <div className="mx-auto grid w-full max-w-[1480px] flex-1 grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_minmax(0,1fr)] md:gap-8 md:px-6 md:py-8 lg:px-8">
        <Sidebar menuAberto={menuAberto} onFecharMenu={fecharMenu} />
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
