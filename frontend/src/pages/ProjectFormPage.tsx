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
    } catch (_erro) {
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
      } catch (_erro) {
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
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  return (
    <form className="space-y-4" onSubmit={salvar}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{edicao ? `${t('editar')} ${t('projetos')}` : t('novoProjeto')}</h2>
        <button className="mm-btn" type="button" onClick={() => navigate('/projects')}>
          {t('cancelar')}
        </button>
      </div>

      <section className="mm-card grid gap-3 p-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">{t('codigo')}</label>
          <input className="mm-input" required value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('nome')}</label>
          <input className="mm-input" required value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">{t('descricao')}</label>
          <textarea className="mm-input" value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('status')}</label>
          <select className="mm-input" value={form.status ?? 'ativo'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Projeto['status'] }))}>
            <option value="ativo">ativo</option>
            <option value="revisao">revisao</option>
            <option value="encerrado">encerrado</option>
          </select>
        </div>
      </section>

      <button className="mm-btn mm-btn-primary" type="submit">
        {t('salvar')}
      </button>

      {edicao && (
        <section className="mm-card space-y-3 p-4">
          <h3 className="text-lg font-semibold">{t('membrosDoProjeto')}</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('membrosDoProjetoHint')}
          </p>

          {podeGerenciarMembrosProjeto && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-64 flex-1">
                <label className="mb-1 block text-sm">{t('buscarUsuario')}</label>
                <input
                  className="mm-input"
                  placeholder={`${t('buscar')}...`}
                  value={buscaUsuario}
                  onChange={(e) => {
                    setBuscaUsuario(e.target.value);
                    setUsuarioSelecionado('');
                  }}
                />
              </div>
              <div className="min-w-64 flex-1">
                <label className="mb-1 block text-sm">{t('usuario')}</label>
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
              </div>
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
        </section>
      )}
    </form>
  );
}
