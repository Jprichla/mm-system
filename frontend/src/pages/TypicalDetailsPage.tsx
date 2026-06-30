import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GenericTable } from '../components/GenericTable';
import { useToast } from '../contexts/ToastContext';
import {
  listarDetalhesTypicos,
  removerDetalheTypico,
} from '../services/typicalDetailsService';
import type { DetalheTypico } from '../types';

const TypicalDetailsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [detalhes, setDetalhes] = useState<DetalheTypico[]>([]);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const carregarDetalhes = async () => {
    try {
      const resposta = await listarDetalhesTypicos(paginaAtual, 10, busca);
      setDetalhes(resposta.dados);
      setTotalPaginas(resposta.paginacao.totalPaginas);
    } catch (erro) {
      const mensagem = t('erroCarregarDetalhesTypicos') || 'Erro ao carregar detalhes típicos';
      mostrarToast('erro', String(mensagem));
    }
  };

  useEffect(() => {
    carregarDetalhes();
  }, [paginaAtual, busca]);

  const handleExcluir = async (id: string) => {
    if (!window.confirm(t('confirmarExclusao') || 'Deseja realmente excluir este detalhe típico?')) {
      return;
    }

    try {
      await removerDetalheTypico(id);
      const msgSucesso = t('detalheTyicoExcluidoSucesso') || 'Detalhe típico excluído com sucesso';
      mostrarToast('sucesso', String(msgSucesso));
      carregarDetalhes();
    } catch (erro) {
      const msgErro = t('erroExcluirDetalheTypico') || 'Erro ao excluir detalhe típico';
      mostrarToast('erro', String(msgErro));
    }
  };

  const getNome = (detalhe: DetalheTypico) => {
    const idioma = i18n.language;
    if (idioma === 'en' && detalhe.nameEn) return detalhe.nameEn;
    if (idioma === 'es' && detalhe.nameEs) return detalhe.nameEs;
    return detalhe.namePt;
  };

  const colunas = [
    { chave: 'code', titulo: t('codigo') || 'Código' },
    {
      chave: 'name',
      titulo: t('nome') || 'Nome',
      render: (detalhe: DetalheTypico) => getNome(detalhe),
    },
    {
      chave: 'components',
      titulo: t('componentes') || 'Componentes',
      render: (detalhe: DetalheTypico) => detalhe.components?.length || 0,
    },
    {
      chave: 'acoes',
      titulo: t('acoes') || 'Ações',
      render: (detalhe: DetalheTypico) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/typical-details/${detalhe.id}/detail`)}
            className="mm-btn"
            style={{ fontSize: '0.875rem', padding: '4px 12px' }}
          >
            👁️ {t('verDetalhes') || 'Ver detalhes'}
          </button>
          <button
            onClick={() => navigate(`/typical-details/${detalhe.id}/edit`)}
            className="mm-btn mm-btn-primary"
            style={{ fontSize: '0.875rem', padding: '4px 12px' }}
          >
            {t('editar') || 'Editar'}
          </button>
          <button
            onClick={() => handleExcluir(detalhe.id)}
            className="mm-btn"
            style={{
              fontSize: '0.875rem',
              padding: '4px 12px',
              backgroundColor: 'var(--danger)',
              color: '#fff',
            }}
          >
            {t('excluir') || 'Excluir'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {t('detalhesTypicos') || 'Detalhes Típicos'}
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/typical-details/gallery')} className="mm-btn">
            {t('galeriaDetalhesTypicos') || 'Galeria'}
          </button>
          <button
            onClick={() => navigate('/typical-details/new')}
            className="mm-btn mm-btn-primary"
          >
            {t('novoDetalheTypico') || 'Novo Detalhe Típico'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder={t('buscar') + '...'}
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
          className="mm-input"
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>

      <GenericTable
        dados={detalhes}
        colunas={colunas}
        vazioTexto={t('nenhumDetalheTypico') || 'Nenhum detalhe típico encontrado'}
      />

      {totalPaginas > 1 && (
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            disabled={paginaAtual === 1}
            className="mm-btn"
            style={{ opacity: paginaAtual === 1 ? 0.5 : 1 }}
          >
            {t('anterior') || 'Anterior'}
          </button>
          <span style={{ color: 'var(--text-primary)' }}>
            {t('pagina') || 'Página'} {paginaAtual} {t('de') || 'de'} {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual === totalPaginas}
            className="mm-btn"
            style={{ opacity: paginaAtual === totalPaginas ? 0.5 : 1 }}
          >
            {t('proxima') || 'Próxima'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TypicalDetailsPage;
