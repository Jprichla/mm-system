import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div className="mm-page-header">
        <div>
          <h1 className="text-2xl font-bold">{t('documentosProjeto')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('documentosDentroProjetoHint')}</p>
        </div>
      </div>
      <div className="mm-card mm-section-card">
        <h2 className="mm-section-heading">{t('documentosProjeto')}</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('documentosDentroProjetoHint')}
        </p>
        <div className="mt-4">
          <button className="mm-btn mm-btn-primary" type="button" onClick={() => navigate('/projects')}>
            {t('irParaProjetos')}
          </button>
        </div>
      </div>
    </div>
  );
}
