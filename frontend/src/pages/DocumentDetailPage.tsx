import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { usePermissoes } from '../hooks/usePermissoes';
import { adicionarItem, listarItensDocumento, removerItem } from '../services/documentItemsService';
import { obterDocumento } from '../services/documentsService';
import { listarMateriais, listarVariantes } from '../services/materialsService';
import type { Documento, ItemDocumento, VarianteMaterial } from '../types';

export default function DocumentDetailPage() {
  const { podeEditarItensLista } = usePermissoes();
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { mostrarToast } = useToast();

  const [documento, setDocumento] = useState<Documento | null>(null);
  const [itens, setItens] = useState<ItemDocumento[]>([]);
  const [variantes, setVariantes] = useState<VarianteMaterial[]>([]);
  const [form, setForm] = useState({ variantId: '', quantity: '1', unitPrice: '' });
  const backTo = (location.state as { backTo?: string } | null)?.backTo;

  const carregar = async () => {
    if (!id) return;
    try {
      const [doc, itensDoc, materiais] = await Promise.all([
        obterDocumento(id),
        listarItensDocumento(id),
        listarMateriais({ page: 1, search: '' }),
      ]);
      setDocumento(doc);
      setItens(itensDoc);
      const todasVariantes = await Promise.all(materiais.dados.slice(0, 60).map((m) => listarVariantes(m.id).catch(() => [])));
      setVariantes(todasVariantes.flat());
    } catch {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totalDocumento = useMemo(() => itens.reduce((acc, item) => acc + Number(item.totalPrice || 0), 0), [itens]);

  const incluirItem = async () => {
    if (!id || !form.variantId) return;
    const quantity = Number(form.quantity || 0);
    const unitPrice = Number(form.unitPrice || 0);
    const totalPrice = quantity * unitPrice;

    try {
      await adicionarItem(id, {
        variantId: form.variantId,
        quantity,
        unitPrice: unitPrice || undefined,
        totalPrice: unitPrice ? totalPrice : undefined,
      });
      setForm({ variantId: '', quantity: '1', unitPrice: '' });
      setItens(await listarItensDocumento(id));
    } catch {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const excluirItem = async (itemId: string) => {
    if (!id) return;
    await removerItem(itemId);
    setItens(await listarItensDocumento(id));
  };

  return (
    <div className="space-y-5">
      <div className="mm-page-header">
        <div>
          <h1 className="text-2xl font-bold">{t('itensDocumento')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{documento?.code} — {documento?.title}</p>
        </div>
        <button className="mm-btn" type="button" onClick={() => navigate(backTo || (documento?.projectId ? `/projects/${documento.projectId}/documents` : '/projects'))}>
          &larr; {t('voltar')}
        </button>
      </div>

      <section className="mm-card mm-section-card">
        <h2 className="mm-section-heading">{t('documentosProjeto')}</h2>
        <dl className="mm-metadata-grid">
          <div><dt>{t('codigo')}</dt><dd>{documento?.code ?? '-'}</dd></div>
          <div><dt>{t('nome')}</dt><dd>{documento?.title ?? '-'}</dd></div>
          <div><dt>{t('revisao')}</dt><dd>{documento?.revision ?? '-'}</dd></div>
        </dl>
      </section>

      <section className="mm-card mm-section-card">
        <div>
          <h2 className="mm-section-heading">{t('adicionarItem')}</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('itensDocumento')}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_140px_160px_auto]">
          <label className="mm-field">
            <span className="mm-field-label">{t('selecionarVariante')}</span>
            <select className="mm-input" value={form.variantId} onChange={(e) => setForm({ ...form, variantId: e.target.value })}>
              <option value="">{t('selecionarVariante')}</option>
              {variantes.map((v) => <option key={v.id} value={v.id}>{v.code} — {v.namePt}</option>)}
            </select>
          </label>
          <label className="mm-field">
            <span className="mm-field-label">{t('quantidade')}</span>
            <input className="mm-input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </label>
          <label className="mm-field">
            <span className="mm-field-label">{t('precoUnitario')}</span>
            <input className="mm-input" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
          </label>
          {podeEditarItensLista && (
            <div className="flex items-end">
              <button className="mm-btn mm-btn-primary w-full" type="button" onClick={incluirItem}>{t('adicionarItem')}</button>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="mm-section-heading">{t('itensDocumento')}</h2>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{itens.length} {t('itens')}</span>
        </div>
        <div className="mm-table-shell" tabIndex={0}>
          <table className="mm-table text-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('codigo')}</th>
                <th>{t('nome')}</th>
                <th className="mm-number-cell">{t('quantidade')}</th>
                <th className="mm-number-cell">{t('precoUnitario')}</th>
                <th className="mm-number-cell">{t('precoTotal')}</th>
                <th>{t('acoes')}</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id}>
                  <td>{item.lineNumber}</td>
                  <td>{item.variant?.code}</td>
                  <td>{item.variant?.namePt}</td>
                  <td className="mm-number-cell">{item.quantity}</td>
                  <td className="mm-number-cell">{item.unitPrice ?? '-'}</td>
                  <td className="mm-number-cell">{item.totalPrice ?? '-'}</td>
                  <td>{podeEditarItensLista && <button className="mm-btn text-xs" type="button" onClick={() => excluirItem(item.id)}>{t('excluir')}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mm-card mm-total-summary">
        <span>{t('totalGeral')}</span>
        <strong>{totalDocumento.toFixed(2)}</strong>
      </section>
    </div>
  );
}
