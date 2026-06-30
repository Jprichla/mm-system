import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GenericTable } from '../components/GenericTable';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import type { Material, VarianteMaterial } from '../types';
import {
  listarMateriais,
  listarVariantes,
  criarVariante,
  removerMaterial,
  removerVariante,
} from '../services/materialsService';

export function MaterialsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dados, setDados] = useState<Material[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [materialSelecionado, setMaterialSelecionado] = useState<Material | null>(null);
  const [variantes, setVariantes] = useState<VarianteMaterial[]>([]);
  const [codigoVariante, setCodigoVariante] = useState('');
  const [nomeVariante, setNomeVariante] = useState('');
  const [unidadeVariante, setUnidadeVariante] = useState('');

  const buscar = async () => {
    setCarregando(true);
    try {
      const resposta = await listarMateriais({ page, search });
      setDados(resposta.dados);
      setTotalPages(resposta.paginacao.totalPages || 1);
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const abrirVariantes = async (material: Material) => {
    setMaterialSelecionado(material);
    try {
      const lista = await listarVariantes(material.id);
      setVariantes(lista);
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const incluirVariante = async () => {
    if (!materialSelecionado) return;
    try {
      const resposta = await criarVariante(materialSelecionado.id, {
        code: codigoVariante,
        namePt: nomeVariante,
        unit: unidadeVariante,
      });
      if (resposta.warning) {
        mostrarToast('erro', resposta.warning);
      }
      await abrirVariantes(materialSelecionado);
      setCodigoVariante('');
      setNomeVariante('');
      setUnidadeVariante('');
      mostrarToast('sucesso', 'Variante criada com sucesso.');
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const excluirMaterial = async (id: string) => {
    if (!window.confirm(t('confirmarExclusao'))) return;
    try {
      await removerMaterial(id);
      mostrarToast('sucesso', 'Material removido com sucesso.');
      await buscar();
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const colunas = useMemo(
    () => [
      { chave: 'code', titulo: t('codigo') },
      { chave: 'namePt', titulo: t('nome') },
      {
        chave: 'category',
        titulo: t('categoria'),
        render: (item: Material) => item.category?.namePt ?? '-',
      },
      {
        chave: 'acoes',
        titulo: t('acoes'),
        render: (item: Material) => (
          <div className="flex gap-2">
            <button className="mm-btn text-xs" onClick={() => navigate(`/materials/${item.id}/detail`)} type="button">
              👁️ {t('verDetalhes')}
            </button>
            <button className="mm-btn text-xs" onClick={() => navigate(`/materials/${item.id}/edit`)} type="button">
              {t('editar')}
            </button>
            <button className="mm-btn text-xs" onClick={() => abrirVariantes(item)} type="button">
              {t('variantes')}
            </button>
            <button className="mm-btn text-xs" onClick={() => excluirMaterial(item.id)} type="button">
              {t('excluir')}
            </button>
          </div>
        ),
      },
    ],
    [navigate, t],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{t('materiais')}</h2>
        <button className="mm-btn mm-btn-primary" type="button" onClick={() => navigate('/materials/new')}>
          {t('novoMaterial')}
        </button>
      </div>

      <div className="mm-card flex flex-wrap gap-2 p-3">
        <input
          className="mm-input max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t('buscar')}...`}
        />
        <button className="mm-btn" type="button" onClick={() => { setPage(1); buscar(); }}>
          {t('buscar')}
        </button>
      </div>

      {carregando ? <div className="mm-card p-3">Carregando...</div> : <GenericTable dados={dados} colunas={colunas} vazioTexto={t('semDados')} />}

      <div className="flex items-center justify-between text-sm">
        <span>
          {t('pagina')} {page} {t('de')} {totalPages}
        </span>
        <div className="flex gap-2">
          <button className="mm-btn" type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('anterior')}
          </button>
          <button className="mm-btn" type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t('proxima')}
          </button>
        </div>
      </div>

      <Modal aberto={!!materialSelecionado} titulo={`${t('variantes')} - ${materialSelecionado?.namePt ?? ''}`} onFechar={() => setMaterialSelecionado(null)}>
        <div className="mb-3 grid gap-2 md:grid-cols-4">
          <input className="mm-input" placeholder={t('codigo')} value={codigoVariante} onChange={(e) => setCodigoVariante(e.target.value)} />
          <input className="mm-input md:col-span-2" placeholder={t('nome')} value={nomeVariante} onChange={(e) => setNomeVariante(e.target.value)} />
          <input className="mm-input" placeholder={t('unidade')} value={unidadeVariante} onChange={(e) => setUnidadeVariante(e.target.value)} />
        </div>
        <button type="button" className="mm-btn mm-btn-primary mb-3" onClick={incluirVariante}>
          {t('incluirVariante')}
        </button>

        <div className="space-y-2">
          {variantes.map((variante) => (
            <div key={variante.id} className="flex items-center justify-between rounded border p-2" style={{ borderColor: 'var(--border)' }}>
              <div>
                <strong>{variante.code}</strong> - {variante.namePt} ({variante.unit ?? '-'})
              </div>
              <button
                type="button"
                className="mm-btn text-xs"
                onClick={async () => {
                  if (!materialSelecionado) return;
                  await removerVariante(materialSelecionado.id, variante.id);
                  await abrirVariantes(materialSelecionado);
                }}
              >
                {t('excluir')}
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
