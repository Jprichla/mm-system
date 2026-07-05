import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

// Hierarquia de roles
const HIERARQUIA: Role[] = ['admin', 'gestor', 'engenheiro', 'usuario', 'cliente'];

function temRole(roleUsuario: Role, roleMinimo: Role): boolean {
  return HIERARQUIA.indexOf(roleUsuario) <= HIERARQUIA.indexOf(roleMinimo);
}

export function usePermissoes() {
  const usuario = useAuthStore((s) => s.usuario);
  const role = usuario?.role ?? 'cliente';

  return {
    // Usuários
    podeGerenciarUsuarios: role === 'admin',

    // Materiais e Detalhes Típicos (Cadastros Globais)
    podeCriarMaterial: temRole(role, 'gestor'),
    podeEditarMaterial: temRole(role, 'gestor'),
    podeExcluirMaterial: temRole(role, 'gestor'),
    podeVerMateriais: temRole(role, 'usuario'),

    podeCriarDetalheTipico: temRole(role, 'gestor'),
    podeEditarDetalheTipico: temRole(role, 'gestor'),
    podeExcluirDetalheTipico: temRole(role, 'gestor'),
    podeVerDetalhesTipicos: temRole(role, 'usuario'),

    // Projetos
    podeCriarProjeto: temRole(role, 'engenheiro'),
    podeEditarProjeto: temRole(role, 'engenheiro'),
    podeExcluirProjeto: role === 'admin',
    podeVerProjetos: temRole(role, 'cliente'),

    // Documentos dentro de projetos
    podeCriarDocumento: temRole(role, 'engenheiro'),
    podeExcluirDocumento: temRole(role, 'engenheiro'),
    podeVerDocumentos: temRole(role, 'cliente'),

    // Itens de listas de materiais nos projetos
    podeEditarItensLista: temRole(role, 'usuario'),
    podeVerItensLista: temRole(role, 'cliente'),

    // Utilitário geral
    role,
    isAdmin: role === 'admin',
    isGestor: role === 'gestor',
    isEngenheiro: role === 'engenheiro',
    isUsuario: role === 'usuario',
    isCliente: role === 'cliente',
  };
}
