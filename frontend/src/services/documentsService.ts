import { api } from './api';
import type { Documento } from '../types';

export interface DocumentosResposta {
  dados: Documento[];
  paginacao: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface BalanceComparisonResponse {
  documentos: Array<{
    id: string;
    code: string;
    title: string;
    type: string;
    revision: string;
    project: {
      id: string;
      code: string;
      name: string;
    };
  }>;
  resumo: {
    totalVariantes: number;
    divergentes: number;
  };
  itens: Array<{
    variantId: string;
    variantCode: string;
    variantNamePt: string;
    materialCode: string;
    materialNamePt: string;
    spread: number;
    quantitiesByDocument: Record<string, number>;
  }>;
}

export async function listarDocumentos(params: { page: number; projectId?: string }) {
  const resposta = await api.get<DocumentosResposta>('/documents', {
    params: {
      page: params.page,
      pageSize: 10,
      projectId: params.projectId,
    },
  });
  return resposta.data;
}

export async function obterDocumento(id: string) {
  const resposta = await api.get<{ dados: Documento }>(`/documents/${id}`);
  return resposta.data.dados;
}

export async function criarDocumento(payload: {
  projectId: string;
  code: string;
  title: string;
  type: Documento['type'];
  revision?: string;
}) {
  const resposta = await api.post('/documents', payload);
  return resposta.data;
}

export async function atualizarDocumento(id: string, payload: Partial<Documento>) {
  const resposta = await api.put(`/documents/${id}`, payload);
  return resposta.data;
}

export async function removerDocumento(id: string) {
  const resposta = await api.delete(`/documents/${id}`);
  return resposta.data;
}

export async function compararDocumentos(documentIds: string[]) {
  const resposta = await api.post<BalanceComparisonResponse>('/documents/balance/compare', { documentIds });
  return resposta.data;
}
