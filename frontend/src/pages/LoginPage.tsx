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
    <div className="flex min-h-screen items-center justify-center p-4">
      <form className="mm-card w-full max-w-md space-y-4 p-6" onSubmit={onSubmit}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{t('appName')}</h1>
          <select className="mm-btn text-xs" value={idioma} onChange={(e) => alterarIdioma(e.target.value as Idioma)}>
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('email')}</label>
          <input className="mm-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('senha')}</label>
          <input className="mm-input" value={senha} onChange={(e) => setSenha(e.target.value)} type="password" required />
        </div>
        <button className="mm-btn mm-btn-primary w-full" type="submit" disabled={carregando}>
          {carregando ? '...' : t('login')}
        </button>
      </form>
    </div>
  );
}
