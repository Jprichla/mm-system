import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { usePermissoes } from '../hooks/usePermissoes';
import type { Documento, Projeto } from '../types';
import { compararDocumentos, criarDocumento, listarDocumentos, removerDocumento, type BalanceComparisonResponse } from '../services/documentsService';
import { obterProjeto } from '../services/projectsService';

type AbaAtiva = Documento['type'] | 'balance';

const abasDocumento: Documento['type'][] = ['lista_materiais', 'lista_estimativa', 'lista_cabos'];

export default function ProjectDocumentsWorkspacePage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { podeCriarDocumento, podeExcluirDocumento } = usePermissoes();
  const { t } = useTranslation();
  const { mostrarToast } = useToast();

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('lista_materiais');
  const [docs, setDocs] = useState<Documento[]>([]);
  const [busca, setBusca] = useState('');
  const [novoDoc, setNovoDoc] = useState({ code: '', title: '', revision: '00' });
  const [selecionadosMat, setSelecionadosMat] = useState<string[]>([]);
  const [selecionadosEst, setSelecionadosEst] = useState<string[]>([]);
  const [resultadoBalance, setResultadoBalance] = useState<BalanceComparisonResponse | null>(null);

  const carregarWorkspace = async () => {
    if (!projectId) return;
    try {
      const [dadosProjeto, dadosDocs] = await Promise.all([
        obterProjeto(projectId),
        listarDocumentos({ page: 1, projectId }),
      ]);
      setProjeto(dadosProjeto);
      setDocs(dadosDocs.dados);
    } catch {
      mostrarToast('erro', t('erroPadrao'));
      navigate('/projects');
    }
  };

  useEffect(() => {
    carregarWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const docsPorTipo = useMemo(() => {
    return abasDocumento.reduce<Record<Documento['type'], Documento[]>>(
      (acc, tipo) => ({
        ...acc,
        [tipo]: docs
          .filter((d) => d.type === tipo)
          .filter((d) => {
            const termo = busca.toLowerCase();
            return !termo || d.code.toLowerCase().includes(termo) || d.title.toLowerCase().includes(termo);
          }),
      }),
      {
        lista_materiais: [],
        lista_estimativa: [],
        lista_cabos: [],
      },
    );
  }, [docs, busca]);

  const listaMateriais = useMemo(() => docs.filter((d) => d.type === 'lista_materiais'), [docs]);
  const listaEstimativa = useMemo(() => docs.filter((d) => d.type === 'lista_estimativa'), [docs]);

  const tituloTipo = (tipo: Documento['type']) => {
    if (tipo === 'lista_materiais') return t('listaMateriais');
    if (tipo === 'lista_estimativa') return t('listaEstimativa');
    return t('listaCabos');
  };

  const criarNaAbaAtual = async () => {
    if (!projectId || abaAtiva === 'balance') return;
    if (!novoDoc.code || !novoDoc.title) {
      mostrarToast('erro', t('preenchaCamposObrigatorios'));
      return;
    }

    try {
      await criarDocumento({
        projectId,
        code: novoDoc.code,
        title: novoDoc.title,
        revision: novoDoc.revision,
        type: abaAtiva,
      });
      setNovoDoc({ code: '', title: '', revision: '00' });
      await carregarWorkspace();
      mostrarToast('sucesso', t('salvoComSucesso'));
    } catch {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const excluirDocumento = async (docId: string) => {
    if (!window.confirm(t('confirmarExclusao'))) return;
    try {
      await removerDocumento(docId);
      await carregarWorkspace();
      mostrarToast('sucesso', t('registroExcluido'));
    } catch {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const executarBalance = async () => {
    const ids = [...selecionadosMat, ...selecionadosEst];
    if (selecionadosMat.length === 0 || selecionadosEst.length === 0) {
      mostrarToast('erro', t('selecioneListasParaBalance'));
      return;
    }
    try {
      const resposta = await compararDocumentos(ids);
      setResultadoBalance(resposta);
    } catch {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const renderTabelaDocumentos = (tipo: Documento['type']) => {
    const lista = docsPorTipo[tipo];
    return (
      <div className="space-y-4">
        <div className="mm-toolbar" role="search">
          <input
            aria-label={t('buscar')}
            className="mm-input max-w-sm"
            placeholder={`${t('buscar')}...`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {podeCriarDocumento && (
            <button className="mm-btn mm-btn-primary" type="button" onClick={criarNaAbaAtual}>
              + {t('novoDocumento')}
            </button>
          )}
        </div>

        <div className="mm-card grid gap-3 p-4 md:grid-cols-[180px_1fr_120px_auto]">
          <input className="mm-input" placeholder={t('codigo')} value={novoDoc.code} onChange={(e) => setNovoDoc({ ...novoDoc, code: e.target.value })} />
          <input className="mm-input" placeholder={t('nome')} value={novoDoc.title} onChange={(e) => setNovoDoc({ ...novoDoc, title: e.target.value })} />
          <input className="mm-input" placeholder={t('revisao')} value={novoDoc.revision} onChange={(e) => setNovoDoc({ ...novoDoc, revision: e.target.value })} />
          <div className="self-center text-sm" style={{ color: 'var(--text-secondary)' }}>{tituloTipo(tipo)}</div>
        </div>

        <div className="mm-table-shell" tabIndex={0}>
          <table className="mm-table text-sm">
            <thead>
              <tr>
                <th>{t('codigo')}</th>
                <th>{t('nome')}</th>
                <th>{t('revisao')}</th>
                <th>{t('itens')}</th>
                <th>{t('acoes')}</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((doc) => (
                <tr key={doc.id}>
                  <td className="font-mono" style={{ color: 'var(--accent-text)' }}>{doc.code}</td>
                  <td>{doc.title}</td>
                  <td>{doc.revision}</td>
                  <td>{doc.items?.length ?? 0}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="mm-btn text-xs"
                        type="button"
                        onClick={() => navigate(`/documents/${doc.id}`, { state: { backTo: `/projects/${projectId}/documents` } })}
                      >
                        {t('detalhar')}
                      </button>
                      {podeExcluirDocumento && (
                        <button className="mm-btn text-xs" type="button" onClick={() => excluirDocumento(doc.id)}>
                          {t('excluir')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td className="py-8 text-center" colSpan={5} style={{ color: 'var(--text-muted)' }}>
                    {t('semDados')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <section className="mm-card mm-workspace-context">
        <div>
          <p className="mm-auth-eyebrow">{t('documentosProjeto')}</p>
          <h1 className="text-2xl font-bold">{projeto?.name ?? '...'}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{projeto?.code}</p>
        </div>
        <button className="mm-btn" type="button" onClick={() => navigate('/projects')}>
          &larr; {t('voltar')}
        </button>
      </section>

      <section className="mm-card p-3 md:p-4">
        <div className="mm-tabs" role="group" aria-label={t('documentosProjeto')}>
          <button className="mm-tab" aria-pressed={abaAtiva === 'lista_materiais'} type="button" onClick={() => setAbaAtiva('lista_materiais')}>{t('listaMateriais')}</button>
          <button className="mm-tab" aria-pressed={abaAtiva === 'lista_estimativa'} type="button" onClick={() => setAbaAtiva('lista_estimativa')}>{t('listaEstimativa')}</button>
          <button className="mm-tab" aria-pressed={abaAtiva === 'lista_cabos'} type="button" onClick={() => setAbaAtiva('lista_cabos')}>{t('listaCabos')}</button>
          <button className="mm-tab" aria-pressed={abaAtiva === 'balance'} type="button" onClick={() => setAbaAtiva('balance')}>{t('relatorioBalanco')}</button>
        </div>

        <div className="pt-4">
          {abaAtiva === 'balance' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="mm-section-heading">{t('compararDocumentos')}</h2>
                <button className="mm-btn mm-btn-primary" type="button" onClick={executarBalance}>{t('executarBalanco')}</button>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="mm-card">
                  <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--header-bg)', color: 'var(--header-text)' }}>
                    <strong>{t('listaMateriais')}</strong>
                    <span className="text-xs">{selecionadosMat.length} {t('selecionados')}</span>
                  </div>
                  <div className="max-h-80 overflow-auto p-3">
                    {listaMateriais.map((doc) => (
                      <label key={doc.id} className="mb-2 flex cursor-pointer items-start gap-2 rounded p-2" style={{ background: 'var(--bg-card)' }}>
                        <input type="checkbox" checked={selecionadosMat.includes(doc.id)} onChange={(e) => setSelecionadosMat((prev) => e.target.checked ? [...prev, doc.id] : prev.filter((x) => x !== doc.id))} />
                        <span className="text-sm"><strong>{doc.code}</strong> — {doc.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mm-card">
                  <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--header-bg)', color: 'var(--header-text)' }}>
                    <strong>{t('listaEstimativa')}</strong>
                    <span className="text-xs">{selecionadosEst.length} {t('selecionados')}</span>
                  </div>
                  <div className="max-h-80 overflow-auto p-3">
                    {listaEstimativa.map((doc) => (
                      <label key={doc.id} className="mb-2 flex cursor-pointer items-start gap-2 rounded p-2" style={{ background: 'var(--bg-card)' }}>
                        <input type="checkbox" checked={selecionadosEst.includes(doc.id)} onChange={(e) => setSelecionadosEst((prev) => e.target.checked ? [...prev, doc.id] : prev.filter((x) => x !== doc.id))} />
                        <span className="text-sm"><strong>{doc.code}</strong> — {doc.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {resultadoBalance && (
                <div className="mm-table-shell" tabIndex={0}>
                  <div className="p-4 pb-0 text-sm">
                    {t('divergencias')}: {resultadoBalance.resumo.divergentes}/{resultadoBalance.resumo.totalVariantes}
                  </div>
                  <table className="mm-table mm-balance-table text-sm">
                    <thead>
                      <tr>
                        <th className="mm-balance-sticky">{t('material')}</th>
                        <th>{t('codigo')}</th>
                        {resultadoBalance.documentos.map((d) => (
                          <th key={d.id} className="mm-number-cell">{d.code}</th>
                        ))}
                        <th className="mm-number-cell mm-balance-spread">Spread</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultadoBalance.itens.map((item) => (
                        <tr key={item.variantId}>
                          <td className="mm-balance-sticky">{item.materialNamePt}</td>
                          <td className="font-mono">{item.variantCode}</td>
                          {resultadoBalance.documentos.map((d) => (
                            <td key={d.id} className="mm-number-cell">{Number(item.quantitiesByDocument[d.id] || 0).toFixed(4)}</td>
                          ))}
                          <td className="mm-number-cell mm-balance-spread font-semibold">{item.spread.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            renderTabelaDocumentos(abaAtiva)
          )}
        </div>
      </section>
    </div>
  );
}
