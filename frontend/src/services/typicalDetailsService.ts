import { api } from './api';
import type { DetalheTypico, ComponenteTypico } from '../types';

export interface DetalhesTypicosResposta {
  dados: DetalheTypico[];
  paginacao: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export const listarDetalhesTypicos = async (
  pagina: number = 1,
  limite: number = 10,
  busca: string = ''
): Promise<DetalhesTypicosResposta> => {
  const response = await api.get('/typical-details', {
    params: { pagina, limite, busca },
  });
  return response.data;
};

export const obterDetalheTypico = async (id: string): Promise<DetalheTypico> => {
  const response = await api.get(`/typical-details/${id}`);
  return response.data;
};

export const criarDetalheTypico = async (
  dados: Omit<DetalheTypico, 'id' | 'createdAt' | 'updatedAt' | 'components' | 'attachments'>
): Promise<DetalheTypico> => {
  const response = await api.post('/typical-details', dados);
  return response.data;
};

export const atualizarDetalheTypico = async (
  id: string,
  dados: Partial<Omit<DetalheTypico, 'id' | 'createdAt' | 'updatedAt' | 'components' | 'attachments'>>
): Promise<DetalheTypico> => {
  const response = await api.put(`/typical-details/${id}`, dados);
  return response.data;
};

export const removerDetalheTypico = async (id: string): Promise<void> => {
  await api.delete(`/typical-details/${id}`);
};

// Componentes
export const listarComponentes = async (typicalDetailId: string): Promise<ComponenteTypico[]> => {
  const response = await api.get(`/typical-details/${typicalDetailId}/components`);
  return response.data;
};

export const adicionarComponente = async (
  typicalDetailId: string,
  dados: { variantId: string; quantity: number }
): Promise<ComponenteTypico> => {
  const response = await api.post(`/typical-details/${typicalDetailId}/components`, dados);
  return response.data;
};

export const atualizarComponente = async (
  componentId: string,
  dados: { quantity?: number }
): Promise<ComponenteTypico> => {
  const response = await api.put(`/typical-details/components/${componentId}`, dados);
  return response.data;
};

export const removerComponente = async (componentId: string): Promise<void> => {
  await api.delete(`/typical-details/components/${componentId}`);
};
