import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { usePermissoes } from '../hooks/usePermissoes';
import { obterDetalheTypico } from '../services/typicalDetailsService';
import type { AnexoArquivo, ComponenteTypico, DetalheTypico } from '../types';

function nomeNoIdioma(item: { namePt: string; nameEn?: string | null; nameEs?: string | null }, idioma: string): string {
  if (idioma === 'en' && item.nameEn) return item.nameEn;
  if (idioma === 'es' && item.nameEs) return item.nameEs;
  return item.namePt;
}

export default function TypicalDetailDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { mostrarToast } = useToast();
  const { podeEditarDetalheTipico } = usePermissoes();
  const [detalhe, setDetalhe] = useState<DetalheTypico | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try { setCarregando(true); setDetalhe(await obterDetalheTypico(id)); }
      catch (_e) { mostrarToast('erro', t('erroCarregar')); navigate('/typical-details'); }
      finally { setCarregando(false); }
    };
    carregar();
  }, [id, navigate, mostrarToast, t]);

  const anexosImagem = useMemo(() => detalhe?.attachments?.filter((a) => a.mimeType.startsWith('image/')) ?? [], [detalhe]);
  const anexoPrincipal = useMemo(() => anexosImagem.find((a) => a.isMainImage) ?? anexosImagem[0], [anexosImagem]);
  const anexosTecnicos = useMemo(() => detalhe?.attachments?.filter((a) => !a.mimeType.startsWith('image/')) ?? [], [detalhe]);
  const quantidadeTotal = useMemo(() => (detalhe?.components ?? []).reduce((acc, c) => acc + c.quantity, 0), [detalhe]);

  if (carregando) return <div className="mm-card p-6 text-center">{t('carregando')}...</div>;
  if (!detalhe) return null;

  return (
    <div className="space-y-5">
      <section className="mm-card mm-section-card"><div className="mm-page-header !mb-0"><div><h1 className="text-2xl font-bold">{t('detalhesDetalheTypico')}</h1><p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('codigo')}: <span className="font-mono font-semibold">{detalhe.code}</span></p></div><div className="flex flex-wrap gap-2">{podeEditarDetalheTipico && <Link to={`/typical-details/${detalhe.id}/edit`} className="mm-btn mm-btn-primary">{t('editar')}</Link>}<button className="mm-btn" type="button" onClick={() => navigate('/typical-details')}>{t('voltar')}</button></div></div></section>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <section className="mm-card mm-section-card"><h2 className="mm-section-heading">{t('informacoesGerais')}</h2><dl className="mm-metadata-grid"><div><dt>{t('dataCriacao')}</dt><dd>{new Date(detalhe.createdAt).toLocaleDateString('pt-BR')}</dd></div><div><dt>{t('nomePt')}</dt><dd>{detalhe.namePt || '-'}</dd></div><div><dt>{t('nomeEn')}</dt><dd>{detalhe.nameEn || '-'}</dd></div><div><dt>{t('nomeEs')}</dt><dd>{detalhe.nameEs || '-'}</dd></div></dl></section>
        <section className="mm-card mm-section-card"><h2 className="mm-section-heading">{t('imagemPrincipal')}</h2><div className="mm-gallery-image rounded-[var(--radius-sm)]">{anexoPrincipal ? <img src={anexoPrincipal.filePath} alt={detalhe.namePt} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--header-text)' }}>{t('semImagem')}</div>}</div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{anexoPrincipal?.fileName ?? '-'}</p></section>
      </div>
      <section className="mm-card mm-section-card"><h2 className="mm-section-heading">BOM — {t('componentes')} ({detalhe.components?.length ?? 0})</h2><div className="mm-table-shell"><table className="mm-table min-w-full text-sm"><thead><tr><th>#</th><th>{t('codigo')}</th><th>{t('material')}</th><th>{t('variante')}</th><th>{t('quantidade')}</th><th>{t('unidade')}</th></tr></thead><tbody>{(detalhe.components ?? []).map((c: ComponenteTypico) => <tr key={c.id}><td>{c.lineNumber}</td><td className="font-mono">{c.variant?.code}</td><td>{c.variant?.material ? nomeNoIdioma(c.variant.material, i18n.language) : '-'}</td><td>{nomeNoIdioma(c.variant ?? { namePt: '-' }, i18n.language)}</td><td>{c.quantity}</td><td>{c.variant?.unit ?? '-'}</td></tr>)}{(detalhe.components ?? []).length === 0 && <tr><td colSpan={6} className="py-8 text-center">{t('nenhumComponente')}</td></tr>}</tbody><tfoot><tr><td colSpan={4} className="text-right font-semibold">{t('quantidadeTotal')}</td><td className="font-semibold">{quantidadeTotal}</td><td>-</td></tr></tfoot></table></div></section>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="mm-card mm-section-card"><h2 className="mm-section-heading">{t('galeriaImagens')}</h2>{anexosImagem.length === 0 ? <div className="mm-empty-state">{t('nenhumAnexo')}</div> : <div className="grid gap-3 sm:grid-cols-2">{anexosImagem.map((a: AnexoArquivo) => <a key={a.id} href={a.filePath} target="_blank" rel="noreferrer" className="mm-gallery-card rounded-[var(--radius-sm)] border p-2" style={{ borderColor: 'var(--border)' }}><img src={a.filePath} alt={a.fileName} className="mm-gallery-image rounded" /><span className="mt-2 truncate text-xs">{a.fileName}</span></a>)}</div>}</section>
        <section className="mm-card mm-section-card"><h2 className="mm-section-heading">{t('anexosTecnicos')}</h2>{anexosTecnicos.length === 0 ? <div className="mm-empty-state">{t('nenhumAnexo')}</div> : <ul className="space-y-2">{anexosTecnicos.map((a: AnexoArquivo) => <li key={a.id} className="rounded-[var(--radius-sm)] border p-3 text-sm" style={{ borderColor: 'var(--border)' }}><a href={a.filePath} target="_blank" rel="noreferrer" className="underline">{a.fileName}</a><span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>({a.fileType.toUpperCase()})</span></li>)}</ul>}</section>
      </div>
    </div>
  );
}
