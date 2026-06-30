import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { adicionarItem, listarItensDocumento, removerItem } from '../services/documentItemsService';
import { obterDocumento } from '../services/documentsService';
import { listarMateriais, listarVariantes } from '../services/materialsService';
import type { Documento, ItemDocumento, VarianteMaterial } from '../types';

export default function DocumentDetailPage() {
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
    } catch (_e) {
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
    } catch (_e) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const excluirItem = async (itemId: string) => {
    if (!id) return;
    await removerItem(itemId);
    setItens(await listarItensDocumento(id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t('itensDocumento')}</h2>
          <p className="text-sm opacity-75">{documento?.code} - {documento?.title}</p>
        </div>
        <button className="mm-btn" type="button" onClick={() => navigate(backTo || (documento?.projectId ? `/projects/${documento.projectId}/documents` : '/projects'))}>{t('voltar')}</button>
      </div>

      <div className="mm-card grid gap-2 p-3 md:grid-cols-[1fr_120px_120px_auto]">
        <select className="mm-input" value={form.variantId} onChange={(e) => setForm({ ...form, variantId: e.target.value })}>
          <option value="">{t('selecionarVariante')}</option>
          {variantes.map((v) => <option key={v.id} value={v.id}>{v.code} - {v.namePt}</option>)}
        </select>
        <input className="mm-input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <input className="mm-input" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder={t('precoUnitario')} />
        <button className="mm-btn mm-btn-primary" type="button" onClick={incluirItem}>{t('adicionarItem')}</button>
      </div>

      <div className="mm-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">{t('codigo')}</th>
              <th className="px-3 py-2 text-left">{t('nome')}</th>
              <th className="px-3 py-2 text-left">{t('quantidade')}</th>
              <th className="px-3 py-2 text-left">{t('precoUnitario')}</th>
              <th className="px-3 py-2 text-left">{t('precoTotal')}</th>
              <th className="px-3 py-2 text-left">{t('acoes')}</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-3 py-2">{item.lineNumber}</td>
                <td className="px-3 py-2">{item.variant?.code}</td>
                <td className="px-3 py-2">{item.variant?.namePt}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2">{item.unitPrice ?? '-'}</td>
                <td className="px-3 py-2">{item.totalPrice ?? '-'}</td>
                <td className="px-3 py-2"><button className="mm-btn text-xs" type="button" onClick={() => excluirItem(item.id)}>{t('excluir')}</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t" style={{ borderColor: 'var(--border)' }}>
              <td className="px-3 py-2" colSpan={5}>{t('totalGeral')}</td>
              <td className="px-3 py-2">{totalDocumento.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
