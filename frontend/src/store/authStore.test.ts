import { beforeEach, describe, expect, it } from 'vitest';
import type { Role, Usuario } from '../types';
import { useAuthStore } from './authStore';

interface VisualRoleState {
  roleVisualizado: Role | null;
  roleEfetivo: Role;
  isAdminReal: boolean;
  definirRoleVisualizado: (role: Role) => void;
  validarRoleVisualizado: () => void;
}

const usuario = (role: Role): Usuario => ({
  id: 'usuario-1',
  name: 'Usuário de teste',
  email: 'teste@example.com',
  role,
});

const estadoVisual = () => useAuthStore.getState() as unknown as VisualRoleState;

describe('useAuthStore visual role', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      token: 'token-real',
      usuario: usuario('admin'),
      carregando: false,
      roleVisualizado: null,
      roleEfetivo: 'admin',
      isAdminReal: true,
    });
  });

  it('allows a real admin to view as engenheiro and persists the role', () => {
    estadoVisual().definirRoleVisualizado('engenheiro');

    expect(estadoVisual().roleVisualizado).toBe('engenheiro');
    expect(estadoVisual().roleEfetivo).toBe('engenheiro');
    expect(localStorage.getItem('mm_role_visualizado')).toBe('engenheiro');
  });

  it('removes a manually persisted visual role for a real non-admin', () => {
    localStorage.setItem('mm_role_visualizado', 'engenheiro');
    useAuthStore.setState({ usuario: usuario('gestor') });

    estadoVisual().validarRoleVisualizado();

    expect(estadoVisual().roleVisualizado).toBeNull();
    expect(estadoVisual().roleEfetivo).toBe('gestor');
    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
  });

  it('clears the visual role and storage on logout', () => {
    estadoVisual().definirRoleVisualizado('engenheiro');

    useAuthStore.getState().logout();

    expect(estadoVisual().roleVisualizado).toBeNull();
    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
  });

  it('removes invalid persisted visual roles', () => {
    localStorage.setItem('mm_role_visualizado', 'invalido');

    estadoVisual().validarRoleVisualizado();

    expect(estadoVisual().roleVisualizado).toBeNull();
    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
  });

  it('rejects arbitrary runtime values for the visual role', () => {
    estadoVisual().definirRoleVisualizado('invalido' as unknown as Role);

    expect(estadoVisual().roleVisualizado).toBeNull();
    expect(estadoVisual().roleEfetivo).toBe('admin');
    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
  });

  it('never changes the real user role or token when visual role changes', () => {
    const usuarioReal = usuario('admin');
    useAuthStore.setState({ token: 'token-imutavel', usuario: usuarioReal });

    estadoVisual().definirRoleVisualizado('engenheiro');

    expect(useAuthStore.getState().token).toBe('token-imutavel');
    expect(useAuthStore.getState().usuario).toBe(usuarioReal);
    expect(useAuthStore.getState().usuario?.role).toBe('admin');
  });
});
