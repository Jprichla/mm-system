import { api } from './api';
import type { ItemDocumento } from '../types';

export const listarItensDocumento = async (documentId: string): Promise<ItemDocumento[]> => {
  const response = await api.get(`/documents/${documentId}/items`);
  return response.data;
};

export const obterItem = async (itemId: string): Promise<ItemDocumento> => {
  const response = await api.get(`/items/${itemId}`);
  return response.data;
};

export const adicionarItem = async (
  documentId: string,
  dados: {
    variantId: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
  }
): Promise<ItemDocumento> => {
  const response = await api.post(`/documents/${documentId}/items`, dados);
  return response.data;
};

export const adicionarItensBatch = async (
  documentId: string,
  itens: Array<{
    variantId: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
  }>
): Promise<ItemDocumento[]> => {
  const response = await api.post(`/documents/${documentId}/items/batch`, { itens });
  return response.data;
};

export const atualizarItem = async (
  itemId: string,
  dados: {
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }
): Promise<ItemDocumento> => {
  const response = await api.put(`/items/${itemId}`, dados);
  return response.data;
};

export const removerItem = async (itemId: string): Promise<void> => {
  await api.delete(`/items/${itemId}`);
};
