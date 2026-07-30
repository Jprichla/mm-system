import { act, cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '../i18n';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Usuario } from '../types';
import { AdminOnlyRoute } from './AdminOnlyRoute';
import { ProtectedRoute } from './ProtectedRoute';

const admin: Usuario = {
  id: 'admin-1',
  name: 'Admin de teste',
  email: 'admin@example.com',
  role: 'admin',
};

function renderAdminRoute() {
  render(
    <MemoryRouter
      initialEntries={['/admin/users-access']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/home" element={<p>Home</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<p>Trocar senha</p>} />
          <Route element={<AdminOnlyRoute />}>
            <Route path="/admin/users-access" element={<p>Gestão de acessos</p>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute profile hydration', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('mm_token', 'token-admin-real');
    await i18n.changeLanguage('pt');
    useAuthStore.setState({
      token: 'token-admin-real',
      usuario: null,
      carregando: false,
      roleVisualizado: null,
      roleEfetivo: 'cliente',
      isAdminReal: false,
      perfilHidratado: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('holds an allowed restricted route until the stored-token profile becomes Admin', async () => {
    let concluirPerfil!: (resposta: { data: { usuario: Usuario } }) => void;
    const respostaPendente = new Promise<{ data: { usuario: Usuario } }>((resolve) => {
      concluirPerfil = resolve;
    });
    vi.spyOn(api, 'get').mockReturnValueOnce(respostaPendente);

    const carregamento = useAuthStore.getState().carregarPerfil();
    renderAdminRoute();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Gestão de acessos')).not.toBeInTheDocument();

    await act(async () => {
      concluirPerfil({ data: { usuario: admin } });
      await carregamento;
    });

    expect(screen.getByText('Gestão de acessos')).toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('preserves the forced-password redirect after hydration completes', () => {
    useAuthStore.setState({
      usuario: { ...admin, mustChangePassword: true },
      roleEfetivo: 'admin',
      isAdminReal: true,
      perfilHidratado: true,
    });

    renderAdminRoute();

    expect(screen.getByText('Trocar senha')).toBeInTheDocument();
    expect(screen.queryByText('Gestão de acessos')).not.toBeInTheDocument();
  });
});
