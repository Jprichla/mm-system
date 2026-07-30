import { cleanup, render, renderHook, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { usePermissoes } from '../hooks/usePermissoes';
import i18n from '../i18n';
import { useAuthStore } from '../store/authStore';
import type { Role, Usuario } from '../types';
import { AdminOnlyRoute } from './AdminOnlyRoute';
import { EngenheiroRoute, GestorRoute } from './RoleRoutes';
import { Sidebar } from './Sidebar';

const admin: Usuario = {
  id: 'admin-matrix',
  name: 'Admin da matriz',
  email: 'admin-matrix@example.com',
  role: 'admin',
};

const roles: Role[] = ['admin', 'gestor', 'engenheiro', 'usuario', 'cliente'];
const menuComum = ['Home', 'Materiais', 'Detalhes Típicos', 'Projetos'];

const routeMatrix: Record<Role, {
  admin: boolean;
  gestor: boolean;
  engenheiro: boolean;
}> = {
  admin: { admin: true, gestor: true, engenheiro: true },
  gestor: { admin: false, gestor: true, engenheiro: true },
  engenheiro: { admin: false, gestor: false, engenheiro: true },
  usuario: { admin: false, gestor: false, engenheiro: false },
  cliente: { admin: false, gestor: false, engenheiro: false },
};

const actionMatrix: Record<Role, {
  podeGerenciarUsuarios: boolean;
  podeCriarMaterial: boolean;
  podeCriarProjeto: boolean;
  podeExcluirProjeto: boolean;
  podeEditarItensLista: boolean;
  podeVerProjetos: boolean;
}> = {
  admin: {
    podeGerenciarUsuarios: true,
    podeCriarMaterial: true,
    podeCriarProjeto: true,
    podeExcluirProjeto: true,
    podeEditarItensLista: true,
    podeVerProjetos: true,
  },
  gestor: {
    podeGerenciarUsuarios: false,
    podeCriarMaterial: true,
    podeCriarProjeto: true,
    podeExcluirProjeto: false,
    podeEditarItensLista: true,
    podeVerProjetos: true,
  },
  engenheiro: {
    podeGerenciarUsuarios: false,
    podeCriarMaterial: false,
    podeCriarProjeto: true,
    podeExcluirProjeto: false,
    podeEditarItensLista: true,
    podeVerProjetos: true,
  },
  usuario: {
    podeGerenciarUsuarios: false,
    podeCriarMaterial: false,
    podeCriarProjeto: false,
    podeExcluirProjeto: false,
    podeEditarItensLista: true,
    podeVerProjetos: true,
  },
  cliente: {
    podeGerenciarUsuarios: false,
    podeCriarMaterial: false,
    podeCriarProjeto: false,
    podeExcluirProjeto: false,
    podeEditarItensLista: false,
    podeVerProjetos: true,
  },
};

function definirRoleEfetivo(roleEfetivo: Role) {
  useAuthStore.setState({
    token: 'token-admin-real',
    usuario: admin,
    carregando: false,
    perfilHidratado: true,
    roleVisualizado: roleEfetivo === 'admin' ? null : roleEfetivo,
    roleEfetivo,
    isAdminReal: true,
  });
}

function rotaAdmitida(guard: ReactElement) {
  render(
    <MemoryRouter
      initialEntries={['/restrita']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/home" element={<p>Home</p>} />
        <Route element={guard}>
          <Route path="/restrita" element={<p>Conteúdo restrito</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  const admitida = screen.queryByText('Conteúdo restrito') !== null;
  cleanup();
  return admitida;
}

describe('effective-role acceptance matrix', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pt');
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe('representative menus', () => {
    it.each(roles)('renders the expected navigation for effective role %s', (role) => {
      definirRoleEfetivo(role);
      render(
        <MemoryRouter
          initialEntries={['/home']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Sidebar menuAberto={false} onFecharMenu={() => undefined} />
        </MemoryRouter>,
      );

      const nomesDosLinks = screen.getAllByRole('link').map((link) => link.textContent);
      expect(nomesDosLinks).toEqual(
        role === 'admin' ? [...menuComum, 'Gestão de Acessos'] : menuComum,
      );
    });
  });

  describe('route gates', () => {
    it.each(roles)('applies every route gate to effective role %s', (role) => {
      definirRoleEfetivo(role);

      expect({
        admin: rotaAdmitida(<AdminOnlyRoute />),
        gestor: rotaAdmitida(<GestorRoute />),
        engenheiro: rotaAdmitida(<EngenheiroRoute />),
      }).toEqual(routeMatrix[role]);
    });
  });

  describe('representative action permissions', () => {
    it.each(roles)('returns the expected actions for effective role %s', (role) => {
      definirRoleEfetivo(role);

      const { result } = renderHook(() => usePermissoes());

      expect({
        podeGerenciarUsuarios: result.current.podeGerenciarUsuarios,
        podeCriarMaterial: result.current.podeCriarMaterial,
        podeCriarProjeto: result.current.podeCriarProjeto,
        podeExcluirProjeto: result.current.podeExcluirProjeto,
        podeEditarItensLista: result.current.podeEditarItensLista,
        podeVerProjetos: result.current.podeVerProjetos,
      }).toEqual(actionMatrix[role]);
    });
  });
});
