import { act, cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '../i18n';
import { AppLayout } from '../layouts/AppLayout';
import { useAuthStore } from '../store/authStore';
import type { Role, Usuario } from '../types';
import { Header } from './Header';
import { RolePreviewControl } from './RolePreviewControl';
import { Sidebar } from './Sidebar';

const usuario = (role: Role): Usuario => ({
  id: 'usuario-1',
  name: 'Usuario de teste',
  email: 'teste@example.com',
  role,
});

function definirConta(role: Role) {
  useAuthStore.setState({
    token: 'token-real',
    usuario: usuario(role),
    carregando: false,
    roleVisualizado: null,
    roleEfetivo: role,
    isAdminReal: role === 'admin',
  });
}

function renderHeader() {
  return render(
    <Header menuAberto={false} onAbrirMenu={() => undefined} onFecharMenu={() => undefined} />,
  );
}

function renderWithRouter(element: ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/home']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {element}
    </MemoryRouter>,
  );
}

function renderAppLayout() {
  return render(
    <MemoryRouter initialEntries={['/home']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<p>Home</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('role preview controls', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('pt');
    definirConta('admin');
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('does not render the selector for a real non-admin account', () => {
    definirConta('engenheiro');

    renderHeader();

    expect(screen.queryByLabelText('Visualizar como')).toBeNull();
  });

  it('exposes all five roles to a real Admin', () => {
    renderHeader();

    const selector = screen.getByRole('combobox', { name: 'Visualizar como' });
    expect(selector).toHaveValue('admin');
    expect(within(selector).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Admin',
      'Gestor',
      'Engenheiro',
      'Usuário',
      'Cliente',
    ]);
  });

  it('renders one desktop capsule while keeping the mobile control stacked and full width', () => {
    const { container } = render(
      <>
        <RolePreviewControl variant="desktop" />
        <RolePreviewControl variant="mobile" />
      </>,
    );

    const [desktopControl, mobileControl] = Array.from(
      container.querySelectorAll<HTMLDivElement>('.mm-role-preview-control'),
    );
    const desktopLabel = within(desktopControl).getByText('Visualizar como', { selector: 'label' });
    const mobileLabel = within(mobileControl).getByText('Visualizar como', { selector: 'label' });
    const desktopPrefix = within(desktopControl).getByText('Visualizar como:', { selector: 'span' });
    const desktopSelect = within(desktopControl).getByRole('combobox', { name: 'Visualizar como' });
    const mobileSelect = within(mobileControl).getByRole('combobox', { name: 'Visualizar como' });
    const stylesheet = document.createElement('style');
    stylesheet.textContent = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    document.head.append(stylesheet);

    try {
      expect(desktopControl).toHaveClass(
        'mm-role-preview-control--desktop',
        'mm-role-preview-control--desktop-capsule',
      );
      expect(desktopLabel).toHaveClass('sr-only');
      expect(desktopPrefix).toHaveTextContent('Visualizar como:');
      expect(desktopPrefix).toHaveAttribute('aria-hidden', 'true');
      expect(desktopSelect).toBeInTheDocument();
      expect(getComputedStyle(desktopControl).display).toBe('inline-flex');
      expect(getComputedStyle(desktopSelect).width).toBe('auto');
      expect(getComputedStyle(desktopSelect).minHeight).toBe('40px');

      expect(mobileControl).toHaveClass('mm-role-preview-control--mobile');
      expect(mobileLabel).not.toHaveClass('sr-only');
      expect(getComputedStyle(mobileControl).display).toBe('grid');
      expect(getComputedStyle(mobileSelect).width).toBe('100%');
      expect(getComputedStyle(mobileSelect).minHeight).toBe('44px');
    } finally {
      stylesheet.remove();
    }
  });

  it('allows the mobile header actions to wrap instead of forcing a horizontal row', () => {
    renderHeader();

    expect(screen.getByLabelText('Idioma').parentElement).toHaveClass('flex-wrap');
  });

  it('selecting Engineer updates the visual role and selected option', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Visualizar como' }), 'engenheiro');

    expect(useAuthStore.getState().roleVisualizado).toBe('engenheiro');
    expect(screen.getByRole('combobox', { name: 'Visualizar como' })).toHaveValue('engenheiro');
  });

  it('renders the active preview banner and returns to Admin on request', async () => {
    const user = userEvent.setup();
    act(() => useAuthStore.getState().definirRoleVisualizado('engenheiro'));

    renderAppLayout();

    expect(screen.getByRole('status')).toHaveTextContent('Modo de visualização: Engenheiro.');
    expect(screen.getByRole('status')).toHaveTextContent('Sua conta continua sendo Admin.');
    await user.click(screen.getByRole('button', { name: 'Voltar ao Admin' }));

    expect(useAuthStore.getState().roleVisualizado).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('hides Admin navigation for an Engineer preview and restores it for Admin', () => {
    act(() => useAuthStore.getState().definirRoleVisualizado('engenheiro'));
    renderWithRouter(<Sidebar menuAberto={false} onFecharMenu={() => undefined} />);

    expect(screen.queryByRole('link', { name: 'Gestão de Acessos' })).toBeNull();

    act(() => useAuthStore.getState().voltarAoAdmin());

    expect(screen.getByRole('link', { name: 'Gestão de Acessos' })).toBeInTheDocument();
  });
});

describe('global responsive layout', () => {
  it('does not impose a body minimum width that exceeds a scrollbar-reduced viewport', () => {
    const stylesheet = document.createElement('style');
    stylesheet.textContent = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    document.head.append(stylesheet);

    expect(getComputedStyle(document.body).minWidth).toBe('');

    stylesheet.remove();
  });

  it('hides the mobile navigation trigger at the desktop breakpoint', () => {
    renderHeader();

    expect(screen.getByLabelText('Abrir navegação')).toHaveClass('mm-mobile-navigation-trigger');

    const stylesheet = document.createElement('style');
    stylesheet.textContent = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    document.head.append(stylesheet);

    const desktopRule = Array.from(stylesheet.sheet!.cssRules).find(
      (rule) => rule instanceof CSSMediaRule && rule.conditionText === '(min-width: 768px)',
    ) as CSSMediaRule;
    const triggerRule = Array.from(desktopRule.cssRules).find(
      (rule) => rule instanceof CSSStyleRule && rule.selectorText === '.mm-mobile-navigation-trigger',
    ) as CSSStyleRule;

    expect(triggerRule).toBeDefined();
    expect(triggerRule.style.display).toBe('none');

    stylesheet.remove();
  });
});
