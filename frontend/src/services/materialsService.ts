import { api } from './api';
import type { Material, VarianteMaterial, Categoria } from '../types';

export interface MateriaisResposta {
  dados: Material[];
  paginacao: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function listarMateriais(params: { page: number; search: string }) {
  const resposta = await api.get<MateriaisResposta>('/materials', {
    params: {
      page: params.page,
      pageSize: 10,
      search: params.search,
    },
  });
  return resposta.data;
}

export async function criarMaterial(payload: Partial<Material>) {
  const resposta = await api.post('/materials', payload);
  return resposta.data;
}

export async function atualizarMaterial(id: string, payload: Partial<Material>) {
  const resposta = await api.put(`/materials/${id}`, payload);
  return resposta.data;
}

export async function removerMaterial(id: string) {
  const resposta = await api.delete(`/materials/${id}`);
  return resposta.data;
}

export async function listarCategorias() {
  const resposta = await api.get<{ dados: Categoria[] }>('/categories');
  return resposta.data.dados;
}

export async function listarVariantes(materialId: string) {
  const resposta = await api.get<{ dados: VarianteMaterial[] }>(`/materials/${materialId}/variants`);
  return resposta.data.dados;
}

export async function criarVariante(materialId: string, payload: Partial<VarianteMaterial>) {
  const resposta = await api.post(`/materials/${materialId}/variants`, payload);
  return resposta.data;
}

export async function removerVariante(materialId: string, variantId: string) {
  const resposta = await api.delete(`/materials/${materialId}/variants/${variantId}`);
  return resposta.data;
}
