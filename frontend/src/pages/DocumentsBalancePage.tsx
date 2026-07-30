import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { BalanceComparisonResponse } from '../services/documentsService';

export default function DocumentsBalancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as BalanceComparisonResponse | undefined;

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="mm-card mm-empty-state">
          <p>{t('nenhumBalanceDisponivel')}</p>
        </div>
        <button className="mm-btn" type="button" onClick={() => navigate('/documents')}>&larr; {t('voltar')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="mm-page-header">
        <div>
          <h1 className="text-2xl font-bold">{t('balanceEngine')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('compararDocumentos')}</p>
        </div>
        <button className="mm-btn" type="button" onClick={() => navigate('/documents')}>&larr; {t('voltar')}</button>
      </div>

      <div className="mm-card mm-total-summary">
        <span>{t('divergencias')}</span>
        <strong>{data.resumo.divergentes} / {data.resumo.totalVariantes}</strong>
      </div>

      <div className="mm-table-shell" tabIndex={0}>
        <table className="mm-table mm-balance-table text-sm">
          <thead>
            <tr>
              <th className="mm-balance-sticky">{t('codigo')}</th>
              <th>{t('nome')}</th>
              {data.documentos.map((d) => (
                <th key={d.id} className="mm-number-cell">{d.code}</th>
              ))}
              <th className="mm-number-cell mm-balance-spread">Spread</th>
            </tr>
          </thead>
          <tbody>
            {data.itens.map((row) => (
              <tr key={row.variantId}>
                <td className="mm-balance-sticky">{row.variantCode}</td>
                <td>{row.variantNamePt}</td>
                {data.documentos.map((d) => (
                  <td key={d.id} className="mm-number-cell">{Number(row.quantitiesByDocument[d.id] || 0).toFixed(4)}</td>
                ))}
                <td className="mm-number-cell mm-balance-spread font-semibold">{row.spread.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
