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
      <div className="space-y-3">
        <p>{t('nenhumBalanceDisponivel')}</p>
        <button className="mm-btn" type="button" onClick={() => navigate('/documents')}>{t('voltar')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('balanceEngine')}</h2>
        <button className="mm-btn" type="button" onClick={() => navigate('/documents')}>{t('voltar')}</button>
      </div>

      <div className="mm-card p-3 text-sm">
        {t('divergencias')}: {data.resumo.divergentes} / {data.resumo.totalVariantes}
      </div>

      <div className="mm-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left">{t('codigo')}</th>
              <th className="px-2 py-2 text-left">{t('nome')}</th>
              {data.documentos.map((d) => (
                <th key={d.id} className="px-2 py-2 text-left">{d.code}</th>
              ))}
              <th className="px-2 py-2 text-left">Spread</th>
            </tr>
          </thead>
          <tbody>
            {data.itens.map((row) => (
              <tr key={row.variantId} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-2 py-2">{row.variantCode}</td>
                <td className="px-2 py-2">{row.variantNamePt}</td>
                {data.documentos.map((d) => (
                  <td key={d.id} className="px-2 py-2">{Number(row.quantitiesByDocument[d.id] || 0).toFixed(4)}</td>
                ))}
                <td className="px-2 py-2 font-semibold">{row.spread.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
