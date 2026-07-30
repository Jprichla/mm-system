import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="mm-home-hero" aria-labelledby="home-title">
        <div>
          <p className="mm-home-eyebrow">MM System</p>
          <h2 id="home-title">{t('painelPrincipal')}</h2>
          <p>{t('navegacaoRapida')}</p>
        </div>
        <span className="mm-home-hero-mark" aria-hidden="true">MM</span>
      </section>

      <section aria-label={t('navegacaoRapida')}>
        <div className="mb-4">
          <p className="mm-home-eyebrow">{t('navegacaoRapida')}</p>
          <h3 className="text-xl font-semibold">{t('painelPrincipal')}</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link className="mm-home-action" to="/materials">
            <span className="mm-home-action-index" aria-hidden="true">01</span>
            <h4>{t('materiais')}</h4>
            <p>
            CRUD completo de material pai e variantes com i18n em 3 idiomas.
            </p>
          </Link>
          <Link className="mm-home-action" to="/typical-details">
            <span className="mm-home-action-index" aria-hidden="true">02</span>
            <h4>{t('detalhesTypicos')}</h4>
            <p>Cadastro completo de kits típicos com BOM inline e anexos.</p>
          </Link>
          <Link className="mm-home-action" to="/projects">
            <span className="mm-home-action-index" aria-hidden="true">03</span>
            <h4>{t('projetos')}</h4>
            <p>Gestão de projetos com filtragem por perfil de acesso.</p>
          </Link>
          <Link className="mm-home-action" to="/projects">
            <span className="mm-home-action-index" aria-hidden="true">04</span>
            <h4>{t('documentos')}</h4>
            <p>Acesse documentos dentro de cada projeto, com abas por tipo e relatório de balanço.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
