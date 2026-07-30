import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import type { Projeto } from '../types';
import { api } from '../services/api';
import {
  criarProjeto,
  atualizarProjeto,
  listarMembrosProjeto,
  adicionarMembroProjeto,
  removerMembroProjeto,
  type MembroProjeto,
} from '../services/projectsService';
import { listarUsuariosAdmin, type UsuarioAdmin } from '../services/usersService';
import { usePermissoes } from '../hooks/usePermissoes';

export function ProjectFormPage() {
  const { id } = useParams();
  const edicao = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mostrarToast } = useToast();
  const { podeGerenciarMembrosProjeto } = usePermissoes();

  const [form, setForm] = useState<Partial<Projeto>>({
    code: '',
    name: '',
    description: '',
    status: 'ativo',
  });

  const [membros, setMembros] = useState<MembroProjeto[]>([]);
  const [carregandoMembros, setCarregandoMembros] = useState(false);
  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [candidatos, setCandidatos] = useState<UsuarioAdmin[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [adicionandoMembro, setAdicionandoMembro] = useState(false);
  const [removendoMembroId, setRemovendoMembroId] = useState<string | null>(null);

  const carregarMembros = async () => {
    if (!id) return;
    setCarregandoMembros(true);
    try {
      setMembros(await listarMembrosProjeto(id));
    } catch {
      mostrarToast('erro', t('erroPadrao'));
    } finally {
      setCarregandoMembros(false);
    }
  };

  useEffect(() => {
    if (id) carregarMembros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id || !podeGerenciarMembrosProjeto) return;
    const timeout = setTimeout(async () => {
      try {
        const resposta = await listarUsuariosAdmin({ page: 1, search: buscaUsuario });
        setCandidatos(resposta.dados);
      } catch {
        // busca de candidatos é silenciosa, não trava a tela principal
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [buscaUsuario, id, podeGerenciarMembrosProjeto]);

  const idsJaMembros = useMemo(() => new Set(membros.map((m) => m.userId)), [membros]);
  const opcoesDisponiveis = useMemo(
    () => candidatos.filter((c) => !idsJaMembros.has(c.id)),
    [candidatos, idsJaMembros],
  );

  const handleAdicionarMembro = async () => {
    if (!id || !usuarioSelecionado) return;
    setAdicionandoMembro(true);
    try {
      await adicionarMembroProjeto(id, usuarioSelecionado);
      setUsuarioSelecionado('');
      setBuscaUsuario('');
      mostrarToast('sucesso', t('membroAdicionadoSucesso'));
      await carregarMembros();
    } catch (erro: any) {
      mostrarToast('erro', erro?.response?.data?.mensagem ?? t('erroPadrao'));
    } finally {
      setAdicionandoMembro(false);
    }
  };

  const handleRemoverMembro = async (membro: MembroProjeto) => {
    setRemovendoMembroId(membro.id);
    try {
      await removerMembroProjeto(membro.projectId, membro.userId);
      mostrarToast('sucesso', t('membroRemovidoSucesso'));
      await carregarMembros();
    } catch (erro: any) {
      mostrarToast('erro', erro?.response?.data?.mensagem ?? t('erroPadrao'));
    } finally {
      setRemovendoMembroId(null);
    }
  };

  useEffect(() => {
    if (!id) return;
    api
      .get(`/projects/${id}`)
      .then((res) => setForm(res.data.dados as Projeto))
      .catch(() => mostrarToast('erro', t('erroPadrao')));
  }, [id, mostrarToast, t]);

  const salvar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    try {
      if (edicao) {
        await atualizarProjeto(id!, form);
      } else {
        await criarProjeto(form);
      }
      mostrarToast('sucesso', t('projetoCriado'));
      navigate('/projects');
    } catch {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  return (
    <form className="space-y-5" onSubmit={salvar}>
      <div className="mm-page-header">
        <div>
          <h1 className="text-2xl font-bold">{edicao ? `${t('editar')} ${t('projetos')}` : t('novoProjeto')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('projetos')}</p>
        </div>
        <button className="mm-btn" type="button" onClick={() => navigate('/projects')}>
          {t('cancelar')}
        </button>
      </div>

      <section className="mm-card mm-section-card">
        <h2 className="mm-section-heading">{t('projetos')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="mm-field">
            <span className="mm-field-label">{t('codigo')}</span>
            <input className="mm-input" required value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </label>
          <label className="mm-field">
            <span className="mm-field-label">{t('nome')}</span>
            <input className="mm-input" required value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="mm-field md:col-span-2">
            <span className="mm-field-label">{t('descricao')}</span>
            <textarea className="mm-input" value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="mm-field">
            <span className="mm-field-label">{t('status')}</span>
            <select className="mm-input" value={form.status ?? 'ativo'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Projeto['status'] }))}>
              <option value="ativo">ativo</option>
              <option value="revisao">revisao</option>
              <option value="encerrado">encerrado</option>
            </select>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="mm-btn mm-btn-primary" type="submit">
          {t('salvar')}
        </button>
      </div>

      {edicao && (
        <section className="mm-card mm-section-card">
          <div>
            <h2 className="mm-section-heading">{t('membrosDoProjeto')}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('membrosDoProjetoHint')}
            </p>
          </div>

          {podeGerenciarMembrosProjeto && (
            <div className="flex flex-wrap items-end gap-2">
              <label className="mm-field min-w-64 flex-1">
                <span className="mm-field-label">{t('buscarUsuario')}</span>
                <input
                  className="mm-input"
                  placeholder={`${t('buscar')}...`}
                  value={buscaUsuario}
                  onChange={(e) => {
                    setBuscaUsuario(e.target.value);
                    setUsuarioSelecionado('');
                  }}
                />
              </label>
              <label className="mm-field min-w-64 flex-1">
                <span className="mm-field-label">{t('usuario')}</span>
                <select
                  className="mm-input"
                  value={usuarioSelecionado}
                  onChange={(e) => setUsuarioSelecionado(e.target.value)}
                >
                  <option value="">{t('selecionar')}...</option>
                  {opcoesDisponiveis.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.name} ({usuario.email}) — {t(`role_${usuario.role}`)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="mm-btn mm-btn-primary"
                type="button"
                onClick={handleAdicionarMembro}
                disabled={!usuarioSelecionado || adicionandoMembro}
              >
                {adicionandoMembro ? t('adicionando') : `+ ${t('adicionar')}`}
              </button>
            </div>
          )}

          <div className="mm-table-shell" tabIndex={0}>
            <table className="mm-table w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">{t('nome')}</th>
                <th className="px-3 py-2 text-left">{t('email')}</th>
                <th className="px-3 py-2 text-left">{t('nivelAcesso')}</th>
                {podeGerenciarMembrosProjeto && <th className="px-3 py-2 text-left">{t('acoes')}</th>}
              </tr>
            </thead>
            <tbody>
              {membros.length === 0 && (
                <tr>
                  <td className="px-3 py-3" colSpan={podeGerenciarMembrosProjeto ? 4 : 3} style={{ color: 'var(--text-muted)' }}>
                    {carregandoMembros ? t('carregando') : t('nenhumMembroProjeto')}
                  </td>
                </tr>
              )}
              {membros.map((membro) => (
                <tr key={membro.id}>
                  <td className="px-3 py-2">{membro.user.name}</td>
                  <td className="px-3 py-2">{membro.user.email}</td>
                  <td className="px-3 py-2">{t(`role_${membro.user.role}`)}</td>
                  {podeGerenciarMembrosProjeto && (
                    <td className="px-3 py-2">
                      <button
                        className="mm-btn text-xs"
                        type="button"
                        style={{ borderColor: 'var(--danger, #dc2626)', color: 'var(--danger, #dc2626)' }}
                        onClick={() => handleRemoverMembro(membro)}
                        disabled={removendoMembroId === membro.id}
                      >
                        {removendoMembroId === membro.id ? t('removendo') : t('remover')}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </section>
      )}
    </form>
  );
}
