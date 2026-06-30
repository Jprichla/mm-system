import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GenericTable } from '../components/GenericTable';
import { useToast } from '../contexts/ToastContext';
import type { Projeto } from '../types';
import { listarProjetos, removerProjeto } from '../services/projectsService';

export function ProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dados, setDados] = useState<Projeto[]>([]);

  const carregar = async () => {
    try {
      const resposta = await listarProjetos({ page, search });
      setDados(resposta.dados);
      setTotalPages(resposta.paginacao.totalPages || 1);
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const excluir = async (id: string) => {
    if (!window.confirm(t('confirmarExclusao'))) return;
    try {
      await removerProjeto(id);
      mostrarToast('sucesso', 'Projeto removido com sucesso.');
      carregar();
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const colunas = useMemo(
    () => [
      { chave: 'code', titulo: t('codigo') },
      { chave: 'name', titulo: t('nome') },
      { chave: 'status', titulo: t('status') },
      {
        chave: 'acoes',
        titulo: t('acoes'),
        render: (item: Projeto) => (
          <div className="flex gap-2">
            <button className="mm-btn text-xs" onClick={() => navigate(`/projects/${item.id}/documents`)} type="button">
              📁 {t('documentos')}
            </button>
            <button className="mm-btn text-xs" onClick={() => navigate(`/projects/${item.id}/edit`)} type="button">
              {t('editar')}
            </button>
            <button className="mm-btn text-xs" onClick={() => excluir(item.id)} type="button">
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
        <h2 className="text-xl font-semibold">{t('projetos')}</h2>
        <button className="mm-btn mm-btn-primary" type="button" onClick={() => navigate('/projects/new')}>
          {t('novoProjeto')}
        </button>
      </div>

      <div className="mm-card flex flex-wrap gap-2 p-3">
        <input className="mm-input max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`${t('buscar')}...`} />
        <button className="mm-btn" type="button" onClick={() => { setPage(1); carregar(); }}>
          {t('buscar')}
        </button>
      </div>

      <GenericTable dados={dados} colunas={colunas} vazioTexto={t('semDados')} />

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
    </div>
  );
}
