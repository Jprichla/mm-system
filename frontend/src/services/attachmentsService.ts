import { api } from './api';
import type { AnexoArquivo } from '../types';

export async function listarAnexos(typicalDetailId: string) {
  const resposta = await api.get<AnexoArquivo[]>(`/typical-details/${typicalDetailId}/attachments`);
  return resposta.data;
}

export async function uploadAnexo(
  typicalDetailId: string,
  payload: {
    file: File;
    language?: string;
    description?: string;
    isMainImage?: boolean;
  }
) {
  const formData = new FormData();
  formData.append('file', payload.file);
  if (payload.language) formData.append('language', payload.language);
  if (payload.description) formData.append('description', payload.description);
  if (payload.isMainImage) formData.append('isMainImage', 'true');

  const resposta = await api.post<AnexoArquivo>(`/typical-details/${typicalDetailId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return resposta.data;
}

export async function definirAnexoPrincipal(attachmentId: string) {
  const resposta = await api.patch(`/attachments/${attachmentId}/main-image`);
  return resposta.data;
}

export async function removerAnexo(attachmentId: string) {
  await api.delete(`/attachments/${attachmentId}`);
}
