import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { obterDetalheTypico } from '../services/typicalDetailsService';
import type { AnexoArquivo, ComponenteTypico, DetalheTypico } from '../types';

function nomeNoIdioma(
  t: { namePt: string; nameEn?: string | null; nameEs?: string | null },
  idioma: string
): string {
  if (idioma === 'en' && t.nameEn) return t.nameEn;
  if (idioma === 'es' && t.nameEs) return t.nameEs;
  return t.namePt;
}

export default function TypicalDetailDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { mostrarToast } = useToast();

  const [detalhe, setDetalhe] = useState<DetalheTypico | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try {
        setCarregando(true);
        const data = await obterDetalheTypico(id);
        setDetalhe(data);
      } catch (_e) {
        mostrarToast('erro', t('erroCarregar'));
        navigate('/typical-details');
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [id, navigate, mostrarToast, t]);

  const anexosImagem = useMemo(() => {
    if (!detalhe?.attachments) return [];
    return detalhe.attachments.filter((a) => a.mimeType.startsWith('image/'));
  }, [detalhe]);

  const anexoPrincipal = useMemo(() => {
    return anexosImagem.find((a) => a.isMainImage) ?? anexosImagem[0];
  }, [anexosImagem]);

  const anexosTecnicos = useMemo(() => {
    if (!detalhe?.attachments) return [];
    return detalhe.attachments.filter((a) => !a.mimeType.startsWith('image/'));
  }, [detalhe]);

  const quantidadeTotal = useMemo(() => {
    return (detalhe?.components ?? []).reduce((acc, c) => acc + c.quantity, 0);
  }, [detalhe]);

  if (carregando) {
    return <div className="mm-card">{t('carregando')}...</div>;
  }

  if (!detalhe) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{t('detalhesDetalheTypico')}</h1>
          <p className="text-sm opacity-75">{t('codigo')}: <span className="font-mono">{detalhe.code}</span></p>
        </div>
        <div className="flex gap-2">
          <Link to={`/typical-details/${detalhe.id}/edit`} className="mm-btn mm-btn-primary">{t('editar')}</Link>
          <button className="mm-btn" type="button" onClick={() => navigate('/typical-details')}>{t('voltar')}</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="mm-card space-y-3 p-4">
          <h2 className="text-lg font-semibold">{t('informacoesGerais')}</h2>
          <div>
            <div className="text-xs opacity-70">{t('dataCriacao')}</div>
            <div>{new Date(detalhe.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
          <div>
            <div className="text-xs opacity-70">{t('nomePt')}</div>
            <div>{detalhe.namePt}</div>
          </div>
          <div>
            <div className="text-xs opacity-70">{t('nomeEn')}</div>
            <div>{detalhe.nameEn || '-'}</div>
          </div>
          <div>
            <div className="text-xs opacity-70">{t('nomeEs')}</div>
            <div>{detalhe.nameEs || '-'}</div>
          </div>
        </div>

        <div className="mm-card space-y-3 p-4">
          <h2 className="text-lg font-semibold">{t('imagemPrincipal')}</h2>
          <div className="h-64 overflow-hidden rounded" style={{ backgroundColor: 'var(--header-bg)' }}>
            {anexoPrincipal ? (
              <img src={anexoPrincipal.filePath} alt={detalhe.namePt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm opacity-70">{t('semImagem')}</div>
            )}
          </div>
          <div className="text-xs opacity-70">{anexoPrincipal?.fileName ?? '-'}</div>
        </div>
      </div>

      <div className="mm-card space-y-3 p-4">
        <h2 className="text-lg font-semibold">BOM - {t('componentes')} ({detalhe.components?.length ?? 0})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)' }}>
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">{t('codigo')}</th>
                <th className="px-2 py-2 text-left">{t('material')}</th>
                <th className="px-2 py-2 text-left">{t('variante')}</th>
                <th className="px-2 py-2 text-left">{t('quantidade')}</th>
                <th className="px-2 py-2 text-left">{t('unidade')}</th>
              </tr>
            </thead>
            <tbody>
              {(detalhe.components ?? []).map((c: ComponenteTypico) => (
                <tr key={c.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-2 py-2">{c.lineNumber}</td>
                  <td className="px-2 py-2 font-mono">{c.variant?.code}</td>
                  <td className="px-2 py-2">{c.variant?.material ? nomeNoIdioma(c.variant.material, i18n.language) : '-'}</td>
                  <td className="px-2 py-2">{nomeNoIdioma(c.variant ?? { namePt: '-' }, i18n.language)}</td>
                  <td className="px-2 py-2">{c.quantity}</td>
                  <td className="px-2 py-2">{c.variant?.unit ?? '-'}</td>
                </tr>
              ))}
              {(detalhe.components ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center opacity-70">{t('nenhumComponente')}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td colSpan={4} className="px-2 py-2 text-right font-semibold">{t('quantidadeTotal')}</td>
                <td className="px-2 py-2 font-semibold">{quantidadeTotal}</td>
                <td className="px-2 py-2">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="mm-card space-y-3 p-4">
          <h2 className="text-lg font-semibold">{t('galeriaImagens')}</h2>
          {anexosImagem.length === 0 ? (
            <div className="text-sm opacity-70">{t('nenhumAnexo')}</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {anexosImagem.map((a: AnexoArquivo) => (
                <a key={a.id} href={a.filePath} target="_blank" rel="noreferrer" className="rounded border p-2" style={{ borderColor: 'var(--border)' }}>
                  <img src={a.filePath} alt={a.fileName} className="h-28 w-full rounded object-cover" />
                  <div className="mt-1 truncate text-xs">{a.fileName}</div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mm-card space-y-3 p-4">
          <h2 className="text-lg font-semibold">{t('anexosTecnicos')}</h2>
          {anexosTecnicos.length === 0 ? (
            <div className="text-sm opacity-70">{t('nenhumAnexo')}</div>
          ) : (
            <ul className="space-y-2">
              {anexosTecnicos.map((a: AnexoArquivo) => (
                <li key={a.id} className="rounded border p-2 text-sm" style={{ borderColor: 'var(--border)' }}>
                  <a href={a.filePath} target="_blank" rel="noreferrer" className="underline">
                    {a.fileName}
                  </a>
                  <span className="ml-2 text-xs opacity-70">({a.fileType.toUpperCase()})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
