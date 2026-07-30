import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listarDetalhesTypicos } from '../services/typicalDetailsService';
import type { DetalheTypico } from '../types';

export default function TypicalDetailsGalleryPage() {
  const { t } = useTranslation();
  const [dados, setDados] = useState<DetalheTypico[]>([]);

  useEffect(() => {
    listarDetalhesTypicos(1, 100, '').then((res) => setDados(res.dados));
  }, []);

  return (
    <div className="space-y-5">
      <div className="mm-page-header">
        <div>
          <h1 className="text-2xl font-bold">{t('galeriaDetalhesTypicos')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('detalhesTypicos')}</p>
        </div>
        <Link to="/typical-details" className="mm-btn">{t('listar')}</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {dados.map((d) => {
          const imagem = d.attachments?.find((a) => a.isMainImage) || d.attachments?.[0];
          return (
            <Link key={d.id} to={`/typical-details/${d.id}/detail`} className="mm-card mm-gallery-card">
              <div className="mm-gallery-image">
                {imagem?.mimeType?.startsWith('image/') ? (
                  <img src={imagem.filePath} alt={d.namePt} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--header-text)' }}>{t('semImagem')}</div>
                )}
              </div>
              <div className="space-y-1 p-3 text-sm">
                <div className="font-semibold">{d.code}</div>
                <div>{d.namePt}</div>
                <div className="text-xs opacity-75">{d.components?.length || 0} {t('componentes')}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
