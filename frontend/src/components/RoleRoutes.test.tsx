import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Role, Usuario } from '../types';
import { useAuthStore } from '../store/authStore';
import { AdminOnlyRoute } from './AdminOnlyRoute';
import { EngenheiroRoute, GestorRoute } from './RoleRoutes';

const usuario = (role: Role): Usuario => ({
  id: 'usuario-1',
  name: 'Usuario de teste',
  email: 'teste@example.com',
  role,
});

function definirRoleEfetivo(roleEfetivo: Role, roleReal: Role = roleEfetivo) {
  useAuthStore.setState({
    token: 'token-real',
    usuario: usuario(roleReal),
    carregando: false,
    roleVisualizado: roleReal === 'admin' && roleEfetivo !== 'admin' ? roleEfetivo : null,
    roleEfetivo,
    isAdminReal: roleReal === 'admin',
  });
}

function renderRoute(guard: ReactElement) {
  render(
    <MemoryRouter
      initialEntries={['/restrita']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/home" element={<p>Home</p>} />
        <Route element={guard}>
          <Route path="/restrita" element={<p>Conteudo restrito</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('role routes', () => {
  beforeEach(() => {
    localStorage.clear();
    definirRoleEfetivo('admin');
  });

  afterEach(() => {
    cleanup();
  });

  it('redirects a real admin previewing a lower role away from an admin route', () => {
    definirRoleEfetivo('engenheiro', 'admin');

    renderRoute(<AdminOnlyRoute />);

    expect(screen.queryByText('Home')).not.toBeNull();
  });

  it('admits an effective gestor to a gestor route', () => {
    definirRoleEfetivo('gestor', 'admin');

    renderRoute(<GestorRoute />);

    expect(screen.queryByText('Conteudo restrito')).not.toBeNull();
  });

  it('redirects an effective engenheiro away from a gestor route', () => {
    definirRoleEfetivo('engenheiro', 'admin');

    renderRoute(<GestorRoute />);

    expect(screen.queryByText('Home')).not.toBeNull();
  });

  it('admits an effective engenheiro to an engenheiro route', () => {
    definirRoleEfetivo('engenheiro', 'admin');

    renderRoute(<EngenheiroRoute />);

    expect(screen.queryByText('Conteudo restrito')).not.toBeNull();
  });

  it('redirects an effective usuario away from an engenheiro route', () => {
    definirRoleEfetivo('usuario', 'admin');

    renderRoute(<EngenheiroRoute />);

    expect(screen.queryByText('Home')).not.toBeNull();
  });
});
