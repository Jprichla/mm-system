import type { InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../store/authStore';
import type { Usuario } from '../types';
import { api } from './api';

const admin: Usuario = {
  id: 'admin-api',
  name: 'Admin da API',
  email: 'admin-api@example.com',
  role: 'admin',
};

describe('API identity boundary', () => {
  afterEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('keeps the real Admin token and sends no effective-role data during a lower-role preview', async () => {
    const tokenReal = 'token-real-7f93';
    localStorage.setItem('mm_token', tokenReal);
    useAuthStore.setState({
      token: tokenReal,
      usuario: admin,
      carregando: false,
      perfilHidratado: true,
      roleVisualizado: null,
      roleEfetivo: 'admin',
      isAdminReal: true,
    });
    useAuthStore.getState().definirRoleVisualizado('cliente');

    let requisicaoCapturada: InternalAxiosRequestConfig | undefined;
    await api.post(
      '/projects',
      { titulo: 'Projeto preservado' },
      {
        params: { pagina: 2 },
        adapter: async (config) => {
          requisicaoCapturada = config;
          return {
            data: {},
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        },
      },
    );

    expect(requisicaoCapturada).toBeDefined();
    const headers = requisicaoCapturada!.headers.toJSON();
    const payload = typeof requisicaoCapturada!.data === 'string'
      ? JSON.parse(requisicaoCapturada!.data)
      : requisicaoCapturada!.data;

    expect(headers.Authorization).toBe(`Bearer ${tokenReal}`);
    expect(requisicaoCapturada!.params).toEqual({ pagina: 2 });
    expect(payload).toEqual({ titulo: 'Projeto preservado' });

    const fronteiraSerializada = JSON.stringify({
      headers,
      params: requisicaoCapturada!.params,
      payload,
    });
    expect(fronteiraSerializada).not.toMatch(/roleVisualizado|roleEfetivo|mm_role_visualizado/i);
    expect(fronteiraSerializada).not.toMatch(/cliente/i);
    expect(Object.keys(headers).join(' ')).not.toMatch(/role|perfil|visual/i);
  });
});
