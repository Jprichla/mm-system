import { create } from 'zustand';
import { api } from '../services/api';
import type { Usuario } from '../types';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, password: string) => Promise<void>;
  carregarPerfil: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('mm_token'),
  usuario: null,
  carregando: false,

  login: async (email, password) => {
    set({ carregando: true });
    try {
      const resposta = await api.post('/auth/login', { email, password });
      const token = resposta.data.token as string;
      const usuario = resposta.data.usuario as Usuario;
      localStorage.setItem('mm_token', token);
      set({ token, usuario, carregando: false });
    } catch (erro) {
      set({ carregando: false });
      throw erro;
    }
  },

  carregarPerfil: async () => {
    if (!get().token) {
      return;
    }

    try {
      const resposta = await api.get('/auth/me');
      set({ usuario: resposta.data.usuario as Usuario });
    } catch (_erro) {
      localStorage.removeItem('mm_token');
      set({ token: null, usuario: null });
    }
  },

  logout: () => {
    localStorage.removeItem('mm_token');
    set({ token: null, usuario: null });
  },
}));
