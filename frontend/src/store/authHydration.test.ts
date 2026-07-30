import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Usuario } from '../types';

const admin: Usuario = {
  id: 'admin-1',
  name: 'Admin de teste',
  email: 'admin@example.com',
  role: 'admin',
};

describe('auth profile hydration lifecycle', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it('starts complete without a token and incomplete with a stored token', async () => {
    localStorage.clear();
    const storeSemToken = await import('./authStore');

    expect(storeSemToken.useAuthStore.getState()).toMatchObject({
      token: null,
      perfilHidratado: true,
    });

    vi.resetModules();
    localStorage.setItem('mm_token', 'token-admin-real');
    const storeComToken = await import('./authStore');

    expect(storeComToken.useAuthStore.getState()).toMatchObject({
      token: 'token-admin-real',
      perfilHidratado: false,
    });
  });

  it('finishes hydration after a stored-token profile succeeds', async () => {
    localStorage.setItem('mm_token', 'token-admin-real');
    const { api } = await import('../services/api');
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { usuario: admin } });
    const { useAuthStore } = await import('./authStore');

    await useAuthStore.getState().carregarPerfil();

    expect(useAuthStore.getState()).toMatchObject({
      token: 'token-admin-real',
      usuario: admin,
      perfilHidratado: true,
      roleEfetivo: 'admin',
    });
  });

  it('finishes hydration in the no-token state after a stored-token profile fails', async () => {
    localStorage.setItem('mm_token', 'token-expirado');
    const { api } = await import('../services/api');
    vi.spyOn(api, 'get').mockRejectedValueOnce(new Error('Sessão expirada'));
    const { useAuthStore } = await import('./authStore');

    await useAuthStore.getState().carregarPerfil();

    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      usuario: null,
      perfilHidratado: true,
      roleEfetivo: 'cliente',
    });
  });

  it('leaves login success hydrated and logout in the hydrated no-token state', async () => {
    const { api } = await import('../services/api');
    vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: { token: 'token-admin-real', usuario: admin },
    });
    const { useAuthStore } = await import('./authStore');

    await useAuthStore.getState().login('admin@example.com', 'senha-segura');

    expect(useAuthStore.getState()).toMatchObject({
      token: 'token-admin-real',
      usuario: admin,
      perfilHidratado: true,
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      usuario: null,
      perfilHidratado: true,
    });
  });
});
