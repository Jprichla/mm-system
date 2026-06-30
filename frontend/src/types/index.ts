export type Role = 'admin' | 'gestor' | 'engenheiro' | 'usuario' | 'cliente';

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string | null;
}

export interface Categoria {
  id: string;
  namePt: string;
  nameEn?: string | null;
  nameEs?: string | null;
}

export interface Material {
  id: string;
  code: string;
  codeWarning?: string | null;
  namePt: string;
  nameEn?: string | null;
  nameEs?: string | null;
  descriptionPt?: string | null;
  descriptionEn?: string | null;
  descriptionEs?: string | null;
  categoryId: string;
  category?: Categoria;
  createdAt: string;
  updatedAt: string;
}

export interface VarianteMaterial {
  id: string;
  materialId: string;
  code: string;
  codeWarning?: string | null;
  namePt: string;
  nameEn?: string | null;
  nameEs?: string | null;
  unit?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Projeto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: 'ativo' | 'revisao' | 'encerrado';
  companyId?: string | null;
}

export interface Documento {
  id: string;
  projectId: string;
  code: string;
  title: string;
  type: 'lista_materiais' | 'lista_estimativa' | 'lista_cabos';
  revision: string;
  project?: Projeto;
  items?: ItemDocumento[];
}

export interface DetalheTypico {
  id: string;
  code: string;
  namePt: string;
  nameEn?: string | null;
  nameEs?: string | null;
  descriptionPt?: string | null;
  descriptionEn?: string | null;
  descriptionEs?: string | null;
  components?: ComponenteTypico[];
  attachments?: AnexoArquivo[];
  createdAt: string;
  updatedAt: string;
}

export interface ComponenteTypico {
  id: string;
  typicalDetailId: string;
  variantId: string;
  variant?: VarianteMaterial & { material?: Material };
  quantity: number;
  lineNumber: number;
}

export interface ItemDocumento {
  id: string;
  documentId: string;
  variantId: string;
  variant?: VarianteMaterial & { material?: Material };
  quantity: number;
  unitPrice?: number | null;
  totalPrice?: number | null;
  lineNumber: number;
}

export interface AnexoArquivo {
  id: string;
  entityType: string;
  entityId: string;
  fileType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  language?: string | null;
  description?: string | null;
  isMainImage: boolean;
}
