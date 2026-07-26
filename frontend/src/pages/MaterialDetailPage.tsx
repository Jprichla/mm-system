import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { usePermissoes } from '../hooks/usePermissoes';
import type { Material, VarianteMaterial } from '../types';

interface MaterialDetail extends Material {
  variants?: VarianteMaterial[];
}

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mostrarToast } = useToast();
  const { podeEditarMaterial } = usePermissoes();
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarMaterial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregarMaterial() {
    try {
      setCarregando(true);
      const res = await api.get(`/materials/${id}`);
      setMaterial(res.data.dados);
    } catch (error: any) {
      mostrarToast('erro', error.response?.data?.mensagem || t('erroCarregar'));
      navigate('/materials');
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          {t('carregando')}...
        </p>
      </div>
    );
  }

  if (!material) return null;

  return (
    <div className="space-y-4">
      <section className="mm-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t('detalhesMaterial')}</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('codigo')}: <span className="font-mono font-semibold">{material.code}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {podeEditarMaterial && (
              <Link to={`/materials/${material.id}/edit`} className="mm-btn mm-btn-primary">
                ✏️ {t('editar')}
              </Link>
            )}
            <button onClick={() => navigate('/materials')} className="mm-btn" type="button">
              ← {t('voltar')}
            </button>
          </div>
        </div>
      </section>

      <section className="mm-card p-4">
        <h2 className="mb-4 text-lg font-semibold">📋 {t('informacoesGerais')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{t('categoria')}</p>
            <p className="font-semibold">{material.category?.namePt || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{t('dataCriacao')}</p>
            <p>{new Date(material.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 font-semibold">🌐 {t('nomes')}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>🇧🇷 Português</p>
              <p className="font-medium">{material.namePt || '-'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>🇺🇸 English</p>
              <p className="font-medium">{material.nameEn || '-'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>🇪🇸 Español</p>
              <p className="font-medium">{material.nameEs || '-'}</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 font-semibold">📝 {t('descricoes')}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>🇧🇷 Português</p>
              <p className="text-sm">{material.descriptionPt || '-'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>🇺🇸 English</p>
              <p className="text-sm">{material.descriptionEn || '-'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>🇪🇸 Español</p>
              <p className="text-sm">{material.descriptionEs || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mm-card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">🔧 {t('variantes')} ({material.variants?.length || 0})</h2>
          {podeEditarMaterial && (
            <Link to={`/materials/${material.id}/edit`} className="mm-btn mm-btn-primary text-sm">
              + {t('adicionarVariante')}
            </Link>
          )}
        </div>

        {material.variants && material.variants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)' }}>
                  <th className="px-4 py-3 text-left font-semibold">{t('codigo')}</th>
                  <th className="px-4 py-3 text-left font-semibold">🇧🇷 {t('nome')}</th>
                  <th className="px-4 py-3 text-left font-semibold">🇺🇸 {t('nome')}</th>
                  <th className="px-4 py-3 text-left font-semibold">🇪🇸 {t('nome')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('dataCriacao')}</th>
                </tr>
              </thead>
              <tbody>
                {material.variants.map((variante, idx) => (
                  <tr
                    key={variante.id}
                    className="border-b"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                    }}
                  >
                    <td className="px-4 py-3 font-mono font-semibold">{variante.code}</td>
                    <td className="px-4 py-3">{variante.namePt || '-'}</td>
                    <td className="px-4 py-3">{variante.nameEn || '-'}</td>
                    <td className="px-4 py-3">{variante.nameEs || '-'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(variante.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center" style={{ color: 'var(--text-secondary)' }}>
            {t('nenhumaVariante')}
          </p>
        )}
      </section>
    </div>
  );
}
