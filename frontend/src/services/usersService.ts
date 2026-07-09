import { api } from './api';
import type { Role } from '../types';

export interface UsuarioAdmin {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string | null;
  createdAt: string;
  company?: {
    id: string;
    name: string;
  } | null;
}

export interface UsuariosAdminResposta {
  dados: UsuarioAdmin[];
  paginacao: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function listarUsuariosAdmin(params?: { page?: number; search?: string }) {
  const resposta = await api.get<UsuariosAdminResposta>('/users', {
    params: {
      page: params?.page ?? 1,
      pageSize: 10,
      search: params?.search ?? '',
    },
  });
  return resposta.data;
}

export async function atualizarAcessoUsuario(id: string, payload: { role: Role; companyId?: string | null }) {
  const resposta = await api.put<{ mensagem: string; usuario: UsuarioAdmin }>(`/users/${id}/access`, payload);
  return resposta.data;
}

export async function criarUsuario(payload: { name: string; email: string; password: string; role: Role }) {
  const resposta = await api.post<{ mensagem: string; usuario: UsuarioAdmin }>('/users', payload);
  return resposta.data;
}

export async function excluirUsuario(id: string) {
  const resposta = await api.delete<{ mensagem: string }>(`/users/${id}`);
  return resposta.data;
}
