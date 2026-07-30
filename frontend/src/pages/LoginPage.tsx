import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { usePreferencesStore, type Idioma } from '../store/preferencesStore';
import { useToast } from '../contexts/ToastContext';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const { login, carregando } = useAuthStore();
  const { idioma, setIdioma } = usePreferencesStore();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const alterarIdioma = (novoIdioma: Idioma) => {
    setIdioma(novoIdioma);
    i18n.changeLanguage(novoIdioma);
  };

  const onSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();
    try {
      await login(email, senha);
      mostrarToast('sucesso', t('login'));
      navigate('/home');
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  return (
    <main className="mm-auth-shell">
      <div className="mm-auth-layout">
        <section className="mm-auth-brand" aria-labelledby="login-brand-title">
          <span className="mm-auth-mark" aria-hidden="true">MM</span>
          <p className="mm-auth-eyebrow">MM System</p>
          <h1 id="login-brand-title">{t('appName')}</h1>
          <p>{t('navegacaoRapida')}</p>
        </section>

        <form className="mm-auth-card" onSubmit={onSubmit}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mm-auth-eyebrow">{t('appName')}</p>
              <h2>{t('login')}</h2>
              <p className="mm-auth-copy">{t('navegacaoRapida')}</p>
            </div>
            <label className="mm-auth-language">
              <span className="sr-only">{t('idioma')}</span>
              <select
                className="mm-btn text-xs"
                value={idioma}
                onChange={(e) => alterarIdioma(e.target.value as Idioma)}
                aria-label={t('idioma')}
              >
                <option value="pt">PT</option>
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
            </label>
          </div>

          <fieldset className="mm-auth-fields">
            <legend className="sr-only">{t('login')}</legend>
            <div className="mm-auth-field">
              <label htmlFor="login-email">{t('email')}</label>
              <input id="login-email" className="mm-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
            </div>
            <div className="mm-auth-field">
              <label htmlFor="login-password">{t('senha')}</label>
              <input id="login-password" className="mm-input" value={senha} onChange={(e) => setSenha(e.target.value)} type="password" autoComplete="current-password" required />
            </div>
          </fieldset>

          <button className="mm-btn mm-btn-primary w-full" type="submit" disabled={carregando} aria-busy={carregando}>
            <span aria-live="polite">{carregando ? t('carregando') : t('login')}</span>
          </button>
        </form>
      </div>
    </main>
  );
}
