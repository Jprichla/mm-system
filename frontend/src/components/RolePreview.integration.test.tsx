import { act, cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '../i18n';
import { AppLayout } from '../layouts/AppLayout';
import { useAuthStore } from '../store/authStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { Role, Usuario } from '../types';

let storeReinicializado: typeof useAuthStore | null = null;

const usuario = (role: Role): Usuario => ({
  id: 'usuario-integracao',
  name: 'Usuário de integração',
  email: 'integracao@example.com',
  role,
});

function definirConta(role: Role, token = 'token-admin') {
  localStorage.setItem('mm_token', token);
  useAuthStore.setState({
    token,
    usuario: usuario(role),
    carregando: false,
    roleVisualizado: null,
    roleEfetivo: role,
    isAdminReal: role === 'admin',
  });
}

function renderAplicacaoComLayout(Layout: typeof AppLayout = AppLayout) {
  return render(
    <MemoryRouter
      initialEntries={['/home']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route element={<Layout />}>
          <Route path="/home" element={<p>Início</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function resetarEstado() {
  localStorage.clear();
  useAuthStore.setState({
    token: null,
    usuario: null,
    carregando: false,
    roleVisualizado: null,
    roleEfetivo: 'cliente',
    isAdminReal: false,
  });
  usePreferencesStore.setState({ tema: 'dark', idioma: 'pt' });
}

function resetarStoreReinicializado() {
  if (!storeReinicializado) {
    return;
  }

  storeReinicializado.setState({
    token: null,
    usuario: null,
    carregando: false,
    roleVisualizado: null,
    roleEfetivo: 'cliente',
    isAdminReal: false,
  });
  storeReinicializado = null;
}

describe('fluxo integrado de visualização de papel', () => {
  beforeEach(async () => {
    resetarEstado();
    await i18n.changeLanguage('pt');
  });

  afterEach(async () => {
    cleanup();
    resetarStoreReinicializado();
    resetarEstado();
    await i18n.changeLanguage('pt');
  });

  it('mantém a prévia escolhida pela UI após reinicializar o store e volta ao Admin antes do logout', async () => {
    const user = userEvent.setup();
    definirConta('admin');
    renderAplicacaoComLayout();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Visualizar como' }), 'cliente');

    expect(useAuthStore.getState().usuario?.role).toBe('admin');
    expect(useAuthStore.getState().token).toBe('token-admin');
    expect(useAuthStore.getState().roleEfetivo).toBe('cliente');
    expect(localStorage.getItem('mm_token')).toBe('token-admin');
    expect(localStorage.getItem('mm_role_visualizado')).toBe('cliente');
    expect(screen.queryByRole('link', { name: 'Gestão de Acessos' })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Sua conta continua sendo Admin.');

    cleanup();
    vi.resetModules();
    const [store, layout] = await Promise.all([
      import('../store/authStore'),
      import('../layouts/AppLayout'),
    ]);
    storeReinicializado = store.useAuthStore;
    storeReinicializado.setState({ usuario: usuario('admin') });

    act(() => storeReinicializado?.getState().validarRoleVisualizado());

    expect(storeReinicializado.getState().token).toBe('token-admin');
    expect(storeReinicializado.getState().usuario?.role).toBe('admin');
    expect(storeReinicializado.getState().roleVisualizado).toBe('cliente');
    expect(storeReinicializado.getState().roleEfetivo).toBe('cliente');

    renderAplicacaoComLayout(layout.AppLayout);
    expect(screen.getByRole('status')).toHaveTextContent('Modo de visualização: Cliente.');

    await user.click(screen.getByRole('button', { name: 'Voltar ao Admin' }));

    expect(storeReinicializado.getState().usuario?.role).toBe('admin');
    expect(storeReinicializado.getState().token).toBe('token-admin');
    expect(storeReinicializado.getState().roleEfetivo).toBe('admin');
    expect(localStorage.getItem('mm_token')).toBe('token-admin');
    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
    expect(screen.getByRole('link', { name: 'Gestão de Acessos' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(localStorage.getItem('mm_token')).toBeNull();
    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
  });

  it('remove a prévia inserida manualmente para Gestor e não exibe o seletor', () => {
    definirConta('gestor', 'token-gestor');
    localStorage.setItem('mm_role_visualizado', 'admin');

    act(() => useAuthStore.getState().validarRoleVisualizado());
    renderAplicacaoComLayout();

    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
    expect(useAuthStore.getState().roleEfetivo).toBe('gestor');
    expect(screen.queryByRole('combobox', { name: 'Visualizar como' })).toBeNull();
  });
});
