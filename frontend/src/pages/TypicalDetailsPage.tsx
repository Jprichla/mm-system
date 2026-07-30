import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GenericTable } from '../components/GenericTable';
import { useToast } from '../contexts/ToastContext';
import { usePermissoes } from '../hooks/usePermissoes';
import { listarDetalhesTypicos, removerDetalheTypico } from '../services/typicalDetailsService';
import type { DetalheTypico } from '../types';

const TypicalDetailsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const { podeCriarDetalheTipico, podeEditarDetalheTipico, podeExcluirDetalheTipico } = usePermissoes();
  const [detalhes, setDetalhes] = useState<DetalheTypico[]>([]);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const carregarDetalhes = async () => {
    try {
      const resposta = await listarDetalhesTypicos(paginaAtual, 10, busca);
      setDetalhes(resposta.dados);
      setTotalPaginas(resposta.paginacao.totalPaginas);
    } catch {
      const mensagem = t('erroCarregarDetalhesTypicos') || 'Erro ao carregar detalhes típicos';
      mostrarToast('erro', String(mensagem));
    }
  };

  useEffect(() => { carregarDetalhes(); }, [paginaAtual, busca]);

  const handleExcluir = async (id: string) => {
    if (!window.confirm(t('confirmarExclusao') || 'Deseja realmente excluir este detalhe típico?')) return;
    try {
      await removerDetalheTypico(id);
      const msgSucesso = t('detalheTyicoExcluidoSucesso') || 'Detalhe típico excluído com sucesso';
      mostrarToast('sucesso', String(msgSucesso));
      carregarDetalhes();
    } catch {
      const msgErro = t('erroExcluirDetalheTypico') || 'Erro ao excluir detalhe típico';
      mostrarToast('erro', String(msgErro));
    }
  };

  const getNome = (detalhe: DetalheTypico) => {
    if (i18n.language === 'en' && detalhe.nameEn) return detalhe.nameEn;
    if (i18n.language === 'es' && detalhe.nameEs) return detalhe.nameEs;
    return detalhe.namePt;
  };

  const colunas = [
    { chave: 'code', titulo: t('codigo') || 'Código' },
    { chave: 'name', titulo: t('nome') || 'Nome', render: (detalhe: DetalheTypico) => getNome(detalhe) },
    { chave: 'components', titulo: t('componentes') || 'Componentes', render: (detalhe: DetalheTypico) => detalhe.components?.length || 0 },
    {
      chave: 'acoes', titulo: t('acoes') || 'Ações', render: (detalhe: DetalheTypico) => (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate(`/typical-details/${detalhe.id}/detail`)} className="mm-btn text-xs" type="button">{t('verDetalhes') || 'Ver detalhes'}</button>
          {podeEditarDetalheTipico && <button onClick={() => navigate(`/typical-details/${detalhe.id}/edit`)} className="mm-btn mm-btn-primary text-xs" type="button">{t('editar') || 'Editar'}</button>}
          {podeExcluirDetalheTipico && <button onClick={() => handleExcluir(detalhe.id)} className="mm-btn-danger text-xs" type="button">{t('excluir') || 'Excluir'}</button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="mm-page-header">
        <div><h1 className="text-2xl font-bold">{t('detalhesTypicos') || 'Detalhes Típicos'}</h1><p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('componentes')}</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/typical-details/gallery')} className="mm-btn" type="button">{t('galeriaDetalhesTypicos') || 'Galeria'}</button>
          {podeCriarDetalheTipico && <button onClick={() => navigate('/typical-details/new')} className="mm-btn mm-btn-primary" type="button">{t('novoDetalheTypico') || 'Novo Detalhe Típico'}</button>}
        </div>
      </div>
      <div className="mm-toolbar" role="search">
        <input type="text" placeholder={`${t('buscar')}...`} value={busca} onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }} className="mm-input max-w-md" />
      </div>
      <GenericTable dados={detalhes} colunas={colunas} vazioTexto={t('nenhumDetalheTypico') || 'Nenhum detalhe típico encontrado'} />
      {totalPaginas > 1 && <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{t('pagina') || 'Página'} {paginaAtual} {t('de') || 'de'} {totalPaginas}</span><div className="flex gap-2"><button onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="mm-btn" type="button">{t('anterior') || 'Anterior'}</button><button onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas} className="mm-btn" type="button">{t('proxima') || 'Próxima'}</button></div></div>}
    </div>
  );
};

export default TypicalDetailsPage;
