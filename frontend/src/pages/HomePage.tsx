import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <section className="mm-card p-6">
        <h2 className="mb-2 text-2xl font-semibold">{t('painelPrincipal')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{t('navegacaoRapida')}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link className="mm-card p-5 hover:opacity-90" to="/materials">
          <h3 className="mb-1 text-lg font-semibold">{t('materiais')}</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            CRUD completo de material pai e variantes com i18n em 3 idiomas.
          </p>
        </Link>
        <Link className="mm-card p-5 hover:opacity-90" to="/typical-details">
          <h3 className="mb-1 text-lg font-semibold">{t('detalhesTypicos')}</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Cadastro completo de kits típicos com BOM inline e anexos.
          </p>
        </Link>
        <Link className="mm-card p-5 hover:opacity-90" to="/projects">
          <h3 className="mb-1 text-lg font-semibold">{t('projetos')}</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Gestão de projetos com filtragem por perfil de acesso.
          </p>
        </Link>
        <Link className="mm-card p-5 hover:opacity-90" to="/projects">
          <h3 className="mb-1 text-lg font-semibold">{t('documentos')}</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Acesse documentos dentro de cada projeto, com abas por tipo e relatório de balanço.
          </p>
        </Link>
      </section>
    </div>
  );
}
