import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { usePermissoes } from '../hooks/usePermissoes';
import type { Material, VarianteMaterial } from '../types';

interface MaterialDetail extends Material { variants?: VarianteMaterial[]; }

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mostrarToast } = useToast();
  const { podeEditarMaterial } = usePermissoes();
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregarMaterial(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function carregarMaterial() {
    try {
      setCarregando(true);
      const res = await api.get(`/materials/${id}`);
      setMaterial(res.data.dados);
    } catch (error: any) {
      mostrarToast('erro', error.response?.data?.mensagem || t('erroCarregar'));
      navigate('/materials');
    } finally { setCarregando(false); }
  }

  if (carregando) return <div className="mm-card p-6 text-center">{t('carregando')}...</div>;
  if (!material) return null;

  const idiomas = [
    { label: t('nomePt'), name: material.namePt, description: material.descriptionPt },
    { label: t('nomeEn'), name: material.nameEn, description: material.descriptionEn },
    { label: t('nomeEs'), name: material.nameEs, description: material.descriptionEs },
  ];

  return (
    <div className="space-y-5">
      <section className="mm-card mm-section-card">
        <div className="mm-page-header !mb-0">
          <div><h1 className="text-2xl font-bold">{t('detalhesMaterial')}</h1><p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('codigo')}: <span className="font-mono font-semibold">{material.code}</span></p></div>
          <div className="flex flex-wrap gap-2">{podeEditarMaterial && <Link to={`/materials/${material.id}/edit`} className="mm-btn mm-btn-primary">{t('editar')}</Link>}<button onClick={() => navigate('/materials')} className="mm-btn" type="button">{t('voltar')}</button></div>
        </div>
      </section>
      <section className="mm-card mm-section-card">
        <h2 className="mm-section-heading">{t('informacoesGerais')}</h2>
        <dl className="mm-metadata-grid"><div><dt>{t('categoria')}</dt><dd className="font-semibold">{material.category?.namePt || '-'}</dd></div><div><dt>{t('dataCriacao')}</dt><dd>{new Date(material.createdAt).toLocaleDateString('pt-BR')}</dd></div></dl>
      </section>
      <section className="mm-card mm-section-card">
        <h2 className="mm-section-heading">{t('nomes')} e {t('descricoes')}</h2>
        <div className="grid gap-4 lg:grid-cols-3">{idiomas.map((idioma) => <article key={idioma.label} className="rounded-[var(--radius-sm)] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}><h3 className="font-semibold">{idioma.label}</h3><p className="mt-2 font-medium">{idioma.name || '-'}</p><p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{idioma.description || '-'}</p></article>)}</div>
      </section>
      <section className="mm-card mm-section-card">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="mm-section-heading">{t('variantes')} ({material.variants?.length || 0})</h2>{podeEditarMaterial && <Link to={`/materials/${material.id}/edit`} className="mm-btn mm-btn-primary text-sm">{t('adicionarVariante')}</Link>}</div>
        {material.variants && material.variants.length > 0 ? <div className="mm-table-shell"><table className="mm-table min-w-full text-sm"><thead><tr><th>{t('codigo')}</th><th>{t('nomePt')}</th><th>{t('nomeEn')}</th><th>{t('nomeEs')}</th><th>{t('dataCriacao')}</th></tr></thead><tbody>{material.variants.map((variante) => <tr key={variante.id}><td className="font-mono font-semibold">{variante.code}</td><td>{variante.namePt || '-'}</td><td>{variante.nameEn || '-'}</td><td>{variante.nameEs || '-'}</td><td>{new Date(variante.createdAt).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></div> : <div className="mm-empty-state">{t('nenhumaVariante')}</div>}
      </section>
    </div>
  );
}
