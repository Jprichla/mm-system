import { api } from './api';
import type { Projeto } from '../types';

export interface ProjetosResposta {
  dados: Projeto[];
  paginacao: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function listarProjetos(params: { page: number; search: string }) {
  const resposta = await api.get<ProjetosResposta>('/projects', {
    params: {
      page: params.page,
      pageSize: 10,
      search: params.search,
    },
  });
  return resposta.data;
}

export async function obterProjeto(id: string) {
  const resposta = await api.get<{ dados: Projeto }>(`/projects/${id}`);
  return resposta.data.dados;
}

export async function criarProjeto(payload: Partial<Projeto>) {
  const resposta = await api.post('/projects', payload);
  return resposta.data;
}

export async function atualizarProjeto(id: string, payload: Partial<Projeto>) {
  const resposta = await api.put(`/projects/${id}`, payload);
  return resposta.data;
}

export async function removerProjeto(id: string) {
  const resposta = await api.delete(`/projects/${id}`);
  return resposta.data;
}
