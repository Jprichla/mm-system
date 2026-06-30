import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import {
  adicionarComponente,
  atualizarComponente,
  atualizarDetalheTypico,
  criarDetalheTypico,
  listarComponentes,
  obterDetalheTypico,
  removerComponente,
} from '../services/typicalDetailsService';
import { listarMateriais, listarVariantes } from '../services/materialsService';
import { definirAnexoPrincipal, listarAnexos, removerAnexo, uploadAnexo } from '../services/attachmentsService';
import type { AnexoArquivo, ComponenteTypico, DetalheTypico, VarianteMaterial } from '../types';

const formInicial = {
  code: '',
  namePt: '',
  nameEn: '',
  nameEs: '',
  descriptionPt: '',
  descriptionEn: '',
  descriptionEs: '',
};

export default function TypicalDetailFormPage() {
  const { id } = useParams();
  const edicao = Boolean(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [form, setForm] = useState(formInicial);
  const [componentes, setComponentes] = useState<ComponenteTypico[]>([]);
  const [anexos, setAnexos] = useState<AnexoArquivo[]>([]);
  const [variantes, setVariantes] = useState<VarianteMaterial[]>([]);
  const [variantId, setVariantId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [anexoFile, setAnexoFile] = useState<File | null>(null);

  const carregarVariantes = async () => {
    try {
      const materiais = await listarMateriais({ page: 1, search: '' });
      const variantesTodos = await Promise.all(
        materiais.dados.slice(0, 60).map((material) => listarVariantes(material.id).catch(() => []))
      );
      setVariantes(variantesTodos.flat());
    } catch (_e) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const carregarDetalhe = async () => {
    if (!id) return;
    try {
      const detalhe = await obterDetalheTypico(id);
      setForm({
        code: detalhe.code,
        namePt: detalhe.namePt,
        nameEn: detalhe.nameEn || '',
        nameEs: detalhe.nameEs || '',
        descriptionPt: detalhe.descriptionPt || '',
        descriptionEn: detalhe.descriptionEn || '',
        descriptionEs: detalhe.descriptionEs || '',
      });
      setComponentes(await listarComponentes(id));
      setAnexos(await listarAnexos(id));
    } catch (_e) {
      mostrarToast('erro', t('erroPadrao'));
      navigate('/typical-details');
    }
  };

  useEffect(() => {
    carregarVariantes();
    carregarDetalhe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const salvarCabecalho = async () => {
    try {
      if (edicao && id) {
        await atualizarDetalheTypico(id, form);
        mostrarToast('sucesso', t('salvoComSucesso'));
      } else {
        const criado: DetalheTypico = await criarDetalheTypico(form as never);
        mostrarToast('sucesso', t('salvoComSucesso'));
        navigate(`/typical-details/${criado.id}/edit`);
      }
    } catch (_e) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const adicionarLinha = async () => {
    if (!id || !variantId) return;
    try {
      await adicionarComponente(id, { variantId, quantity: Number(quantidade || '1') });
      setComponentes(await listarComponentes(id));
      setVariantId('');
      setQuantidade('1');
    } catch (_e) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const atualizarQuantidade = async (componentId: string, q: number) => {
    try {
      await atualizarComponente(componentId, { quantity: q });
      if (id) setComponentes(await listarComponentes(id));
    } catch (_e) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const excluirComponente = async (componentId: string) => {
    try {
      await removerComponente(componentId);
      if (id) setComponentes(await listarComponentes(id));
    } catch (_e) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const enviarAnexo = async () => {
    if (!id || !anexoFile) return;
    try {
      await uploadAnexo(id, { file: anexoFile, isMainImage: anexos.length === 0 });
      setAnexoFile(null);
      setAnexos(await listarAnexos(id));
      mostrarToast('sucesso', t('anexoEnviado'));
    } catch (_e) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const variantesOrdenadas = useMemo(
    () => [...variantes].sort((a, b) => a.code.localeCompare(b.code)),
    [variantes]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{edicao ? t('editarDetalheTypico') : t('novoDetalheTypico')}</h2>
        <div className="flex gap-2">
          {edicao && id && (
            <button className="mm-btn" type="button" onClick={() => navigate(`/typical-details/${id}/detail`)}>
              👁️ {t('verDetalhes')}
            </button>
          )}
          <button className="mm-btn" type="button" onClick={() => navigate('/typical-details')}>{t('cancelar')}</button>
          <button className="mm-btn mm-btn-primary" type="button" onClick={salvarCabecalho}>{t('salvar')}</button>
        </div>
      </div>

      <div className="mm-card grid gap-3 p-4 md:grid-cols-2">
        <input className="mm-input" placeholder={t('codigo')} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input className="mm-input" placeholder={t('nomePt')} value={form.namePt} onChange={(e) => setForm({ ...form, namePt: e.target.value })} />
        <input className="mm-input" placeholder={t('nomeEn')} value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
        <input className="mm-input" placeholder={t('nomeEs')} value={form.nameEs} onChange={(e) => setForm({ ...form, nameEs: e.target.value })} />
        <textarea className="mm-input md:col-span-2" placeholder={t('descricaoPt')} value={form.descriptionPt} onChange={(e) => setForm({ ...form, descriptionPt: e.target.value })} />
        <textarea className="mm-input md:col-span-2" placeholder={t('descricaoEn')} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
        <textarea className="mm-input md:col-span-2" placeholder={t('descricaoEs')} value={form.descriptionEs} onChange={(e) => setForm({ ...form, descriptionEs: e.target.value })} />
      </div>

      {edicao && id && (
        <>
          <div className="mm-card space-y-3 p-4">
            <h3 className="text-lg font-semibold">{t('componentes')}</h3>
            <div className="grid gap-2 md:grid-cols-[1fr_120px_auto]">
              <select className="mm-input" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
                <option value="">{t('selecionarVariante')}</option>
                {variantesOrdenadas.map((v) => (
                  <option key={v.id} value={v.id}>{v.code} - {v.namePt}</option>
                ))}
              </select>
              <input className="mm-input" type="number" min="0.0001" step="0.0001" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
              <button className="mm-btn" type="button" onClick={adicionarLinha}>{t('adicionarItem')}</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">{t('codigo')}</th>
                    <th className="px-2 py-2 text-left">{t('nome')}</th>
                    <th className="px-2 py-2 text-left">{t('quantidade')}</th>
                    <th className="px-2 py-2 text-left">{t('acoes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {componentes.map((c) => (
                    <tr key={c.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-2 py-2">{c.lineNumber}</td>
                      <td className="px-2 py-2">{c.variant?.code}</td>
                      <td className="px-2 py-2">{c.variant?.namePt}</td>
                      <td className="px-2 py-2">
                        <input
                          className="mm-input w-28"
                          type="number"
                          min="0.0001"
                          step="0.0001"
                          defaultValue={c.quantity}
                          onBlur={(e) => atualizarQuantidade(c.id, Number(e.target.value))}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <button className="mm-btn" type="button" onClick={() => excluirComponente(c.id)}>{t('excluir')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mm-card space-y-3 p-4">
            <h3 className="text-lg font-semibold">{t('anexos')}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <input type="file" onChange={(e) => setAnexoFile(e.target.files?.[0] ?? null)} />
              <button className="mm-btn" type="button" onClick={enviarAnexo} disabled={!anexoFile}>{t('uploadArquivo')}</button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {anexos.map((a) => (
                <div key={a.id} className="rounded border p-2" style={{ borderColor: 'var(--border)' }}>
                  {a.mimeType.startsWith('image/') ? (
                    <img src={a.filePath} alt={a.fileName} className="h-32 w-full rounded object-cover" />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-xs opacity-75">{a.fileType.toUpperCase()}</div>
                  )}
                  <div className="mt-2 text-xs">{a.fileName}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="mm-btn text-xs" type="button" onClick={() => definirAnexoPrincipal(a.id)}>{t('definirPrincipal')}</button>
                    <button
                      className="mm-btn text-xs"
                      type="button"
                      onClick={async () => {
                        await removerAnexo(a.id);
                        if (id) {
                          setAnexos(await listarAnexos(id));
                        }
                      }}
                    >
                      {t('excluir')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
