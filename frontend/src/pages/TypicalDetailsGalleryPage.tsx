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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('galeriaDetalhesTypicos')}</h2>
        <Link to="/typical-details" className="mm-btn">{t('listar')}</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {dados.map((d) => {
          const imagem = d.attachments?.find((a) => a.isMainImage) || d.attachments?.[0];
          return (
            <Link key={d.id} to={`/typical-details/${d.id}/detail`} className="mm-card overflow-hidden p-0">
              <div className="h-40 w-full" style={{ background: 'var(--header-bg)' }}>
                {imagem?.mimeType?.startsWith('image/') ? (
                  <img src={imagem.filePath} alt={d.namePt} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs opacity-75">SEM IMAGEM</div>
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
