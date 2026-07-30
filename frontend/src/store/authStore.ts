import { create } from 'zustand';
import { api } from '../services/api';
import type { Role, Usuario } from '../types';

const ROLE_VISUALIZADO_STORAGE_KEY = 'mm_role_visualizado';
const ROLES: Role[] = ['admin', 'gestor', 'engenheiro', 'usuario', 'cliente'];
const tokenArmazenado = localStorage.getItem('mm_token');

const isRole = (role: string | null): role is Role =>
  role !== null && ROLES.includes(role as Role);

const estadoDoRoleVisualizado = (
  usuario: Usuario | null,
  roleVisualizado: Role | null,
) => {
  const isAdminReal = usuario?.role === 'admin';
  const roleVisualizadoValido =
    isAdminReal && isRole(roleVisualizado) && roleVisualizado !== 'admin'
      ? roleVisualizado
      : null;

  return {
    roleVisualizado: roleVisualizadoValido,
    roleEfetivo: roleVisualizadoValido ?? usuario?.role ?? 'cliente',
    isAdminReal,
  };
};

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  carregando: boolean;
  perfilHidratado: boolean;
  roleVisualizado: Role | null;
  roleEfetivo: Role;
  isAdminReal: boolean;
  login: (email: string, password: string) => Promise<void>;
  carregarPerfil: () => Promise<void>;
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>;
  definirRoleVisualizado: (role: Role) => void;
  voltarAoAdmin: () => void;
  validarRoleVisualizado: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: tokenArmazenado,
  usuario: null,
  carregando: false,
  perfilHidratado: !tokenArmazenado,
  ...estadoDoRoleVisualizado(null, null),

  login: async (email, password) => {
    set({ carregando: true });
    try {
      const resposta = await api.post('/auth/login', { email, password });
      const token = resposta.data.token as string;
      const usuario = resposta.data.usuario as Usuario;
      localStorage.setItem('mm_token', token);
      set({ token, usuario, carregando: false, perfilHidratado: true });
      get().validarRoleVisualizado();
    } catch (erro) {
      set({ carregando: false });
      throw erro;
    }
  },

  carregarPerfil: async () => {
    if (!get().token) {
      set({ perfilHidratado: true });
      return;
    }

    set({ perfilHidratado: false });
    try {
      const resposta = await api.get('/auth/me');
      set({ usuario: resposta.data.usuario as Usuario, perfilHidratado: true });
      get().validarRoleVisualizado();
    } catch (_erro) {
      localStorage.removeItem('mm_token');
      localStorage.removeItem(ROLE_VISUALIZADO_STORAGE_KEY);
      set({
        token: null,
        usuario: null,
        perfilHidratado: true,
        ...estadoDoRoleVisualizado(null, null),
      });
    }
  },

  alterarSenha: async (senhaAtual, novaSenha) => {
    await api.put('/auth/change-password', { senhaAtual, novaSenha });
    const usuarioAtual = get().usuario;
    if (usuarioAtual) {
      set({ usuario: { ...usuarioAtual, mustChangePassword: false } });
    }
  },

  definirRoleVisualizado: (role) => {
    const usuario = get().usuario;
    const roleVisualizado =
      usuario?.role === 'admin' && isRole(role) && role !== 'admin' ? role : null;

    if (roleVisualizado) {
      localStorage.setItem(ROLE_VISUALIZADO_STORAGE_KEY, roleVisualizado);
    } else {
      localStorage.removeItem(ROLE_VISUALIZADO_STORAGE_KEY);
    }

    set(estadoDoRoleVisualizado(usuario, roleVisualizado));
  },

  voltarAoAdmin: () => {
    const usuario = get().usuario;
    localStorage.removeItem(ROLE_VISUALIZADO_STORAGE_KEY);
    set(estadoDoRoleVisualizado(usuario, null));
  },

  validarRoleVisualizado: () => {
    const usuario = get().usuario;
    const roleArmazenado = localStorage.getItem(ROLE_VISUALIZADO_STORAGE_KEY);
    const roleVisualizado =
      usuario?.role === 'admin' && isRole(roleArmazenado) && roleArmazenado !== 'admin'
        ? roleArmazenado
        : null;

    if (roleVisualizado) {
      localStorage.setItem(ROLE_VISUALIZADO_STORAGE_KEY, roleVisualizado);
    } else {
      localStorage.removeItem(ROLE_VISUALIZADO_STORAGE_KEY);
    }

    set(estadoDoRoleVisualizado(usuario, roleVisualizado));
  },

  logout: () => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem(ROLE_VISUALIZADO_STORAGE_KEY);
    set({
      token: null,
      usuario: null,
      perfilHidratado: true,
      ...estadoDoRoleVisualizado(null, null),
    });
  },
}));
