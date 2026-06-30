import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="mm-card p-6">
        <h2 className="mb-2 text-xl font-semibold">{t('documentosProjeto')}</h2>
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
