import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GenericTable } from '../components/GenericTable';
import { useToast } from '../contexts/ToastContext';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';
import { atualizarAcessoUsuario, criarUsuario, listarUsuariosAdmin, type UsuarioAdmin } from '../services/usersService';

const ROLES: Role[] = ['admin', 'gestor', 'engenheiro', 'usuario', 'cliente'];

export default function AdminUsersAccessPage() {
  const { t } = useTranslation();
  const { mostrarToast } = useToast();
  const usuarioLogado = useAuthStore((s) => s.usuario);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dados, setDados] = useState<UsuarioAdmin[]>([]);
  const [rolesEditados, setRolesEditados] = useState<Record<string, Role>>({});
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [criando, setCriando] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({ name: '', email: '', password: '', role: 'usuario' as Role });

  const carregar = async () => {
    setCarregando(true);
    try {
      const resposta = await listarUsuariosAdmin({ page, search });
      setDados(resposta.dados);
      setTotalPages(resposta.paginacao.totalPages || 1);
      const mapaInicial: Record<string, Role> = {};
      for (const usuario of resposta.dados) {
        mapaInicial[usuario.id] = usuario.role;
      }
      setRolesEditados(mapaInicial);
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const salvarRole = async (usuario: UsuarioAdmin) => {
    const roleSelecionada = rolesEditados[usuario.id] ?? usuario.role;
    if (roleSelecionada === usuario.role) {
      mostrarToast('sucesso', t('nenhumaAlteracaoRole'));
      return;
    }

    setSalvandoId(usuario.id);
    try {
      await atualizarAcessoUsuario(usuario.id, {
        role: roleSelecionada,
        companyId: usuario.companyId ?? null,
      });
      mostrarToast('sucesso', t('acessoAtualizadoSucesso'));
      await carregar();
    } catch (erro: any) {
      const mensagem = erro?.response?.data?.mensagem ?? t('erroPadrao');
      mostrarToast('erro', mensagem);
    } finally {
      setSalvandoId(null);
    }
  };

  const colunas = useMemo(
    () => [
      { chave: 'name', titulo: t('nome') },
      { chave: 'email', titulo: t('email') },
      {
        chave: 'empresa',
        titulo: t('empresa'),
        render: (item: UsuarioAdmin) => item.company?.name ?? '-',
      },
      {
        chave: 'nivelAcesso',
        titulo: t('nivelAcesso'),
        render: (item: UsuarioAdmin) => (
          <select
            className="mm-input min-w-40"
            value={rolesEditados[item.id] ?? item.role}
            onChange={(e) => setRolesEditados((atual) => ({ ...atual, [item.id]: e.target.value as Role }))}
            disabled={usuarioLogado?.id === item.id}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`role_${role}`)}
              </option>
            ))}
          </select>
        ),
      },
      {
        chave: 'acoes',
        titulo: t('acoes'),
        render: (item: UsuarioAdmin) => (
          <button
            className="mm-btn mm-btn-primary text-xs"
            type="button"
            onClick={() => salvarRole(item)}
            disabled={salvandoId === item.id || usuarioLogado?.id === item.id}
          >
            {salvandoId === item.id ? t('salvando') : t('salvar')}
          </button>
        ),
      },
    ],
    [rolesEditados, salvandoId, t, usuarioLogado?.id],
  );

  const handleCriarUsuario = async () => {
    if (!novoUsuario.name || !novoUsuario.email || !novoUsuario.password) {
      mostrarToast('erro', 'Preencha todos os campos.');
      return;
    }
    setCriando(true);
    try {
      await criarUsuario(novoUsuario);
      mostrarToast('sucesso', 'Usuário criado com sucesso!');
      setNovoUsuario({ name: '', email: '', password: '', role: 'usuario' });
      setMostrarForm(false);
      await carregar();
    } catch (erro: any) {
      mostrarToast('erro', erro?.response?.data?.mensagem ?? 'Erro ao criar usuário.');
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{t('gestaoAcessoUsuarios')}</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('gestaoAcessoHint')}
          </p>
        </div>
        <button className="mm-btn-primary" type="button" onClick={() => setMostrarForm(!mostrarForm)}>
          + Novo Usuário
        </button>
      </div>

      {mostrarForm && (
        <div className="mm-card p-4 space-y-3">
          <h3 className="font-semibold text-base">Novo Usuário</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Nome Completo *</label>
              <input className="mm-input" placeholder="Nome Completo" value={novoUsuario.name} onChange={(e) => setNovoUsuario({ ...novoUsuario, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Email *</label>
              <input className="mm-input" placeholder="email@empresa.com" type="email" value={novoUsuario.email} onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Senha *</label>
              <input className="mm-input" placeholder="Senha" type="password" value={novoUsuario.password} onChange={(e) => setNovoUsuario({ ...novoUsuario, password: e.target.value })} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Nível de Acesso</label>
              <select className="mm-input" value={novoUsuario.role} onChange={(e) => setNovoUsuario({ ...novoUsuario, role: e.target.value as Role })}>
                {ROLES.map((role) => (<option key={role} value={role}>{t(`role_${role}`)}</option>))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="mm-btn-primary" type="button" onClick={handleCriarUsuario} disabled={criando}>
              {criando ? 'Criando...' : 'Criar'}
            </button>
            <button className="mm-btn" type="button" onClick={() => setMostrarForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="mm-card flex flex-wrap gap-2 p-3">
        <input
          className="mm-input max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t('buscar')}...`}
        />
        <button
          className="mm-btn"
          type="button"
          onClick={() => {
            setPage(1);
            carregar();
          }}
        >
          {t('buscar')}
        </button>
      </div>

      <GenericTable dados={dados} colunas={colunas} vazioTexto={carregando ? t('carregando') : t('semDados')} />

      <div className="flex items-center justify-between text-sm">
        <span>
          {t('pagina')} {page} {t('de')} {totalPages}
        </span>
        <div className="flex gap-2">
          <button className="mm-btn" type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('anterior')}
          </button>
          <button className="mm-btn" type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t('proxima')}
          </button>
        </div>
      </div>

      <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        {t('naoPodeEditarProprioPerfilHint')}
      </div>
    </div>
  );
}
