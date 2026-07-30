import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Role, Usuario } from '../types';
import { useAuthStore } from '../store/authStore';
import { usePermissoes } from './usePermissoes';

const usuario = (role: Role): Usuario => ({
  id: 'usuario-1',
  name: 'Usuario de teste',
  email: 'teste@example.com',
  role,
});

function definirPreview(roleEfetivo: Role) {
  useAuthStore.setState({
    token: 'token-real',
    usuario: usuario('admin'),
    carregando: false,
    roleVisualizado: roleEfetivo === 'admin' ? null : roleEfetivo,
    roleEfetivo,
    isAdminReal: true,
  });
}

describe('usePermissoes', () => {
  beforeEach(() => {
    localStorage.clear();
    definirPreview('admin');
  });

  it('presents engineer permissions when a real admin previews as engenheiro', () => {
    definirPreview('engenheiro');

    const { result } = renderHook(() => usePermissoes());

    expect(result.current.role).toBe('engenheiro');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAdminReal).toBe(true);
    expect(result.current.podeGerenciarUsuarios).toBe(false);
    expect(result.current.podeCriarProjeto).toBe(true);
  });

  it('removes material and document item editing permissions when a real admin previews as cliente', () => {
    definirPreview('cliente');

    const { result } = renderHook(() => usePermissoes());

    expect(result.current.role).toBe('cliente');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAdminReal).toBe(true);
    expect(result.current.podeEditarMaterial).toBe(false);
    expect(result.current.podeEditarItensLista).toBe(false);
  });
});
