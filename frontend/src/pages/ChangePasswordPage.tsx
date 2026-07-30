import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../contexts/ToastContext';

export function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const usuario = useAuthStore((s) => s.usuario);
  const alterarSenha = useAuthStore((s) => s.alterarSenha);
  const logout = useAuthStore((s) => s.logout);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();

    if (novaSenha.length < 6) {
      mostrarToast('erro', t('senhaMinimoCaracteres'));
      return;
    }

    if (novaSenha !== confirmarSenha) {
      mostrarToast('erro', t('senhasNaoConferem'));
      return;
    }

    setEnviando(true);
    try {
      await alterarSenha(senhaAtual, novaSenha);
      mostrarToast('sucesso', t('senhaAlteradaSucesso'));
      navigate('/home');
    } catch (erro: any) {
      mostrarToast('erro', erro?.response?.data?.mensagem ?? t('erroPadrao'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="mm-auth-shell">
      <div className="mm-auth-layout">
        <section className="mm-auth-brand" aria-labelledby="password-brand-title">
          <span className="mm-auth-mark" aria-hidden="true">MM</span>
          <p className="mm-auth-eyebrow">MM System</p>
          <h1 id="password-brand-title">{t('appName')}</h1>
          <p>{t('navegacaoRapida')}</p>
        </section>

        <form className="mm-auth-card" onSubmit={onSubmit}>
          <div>
            <p className="mm-auth-eyebrow">{t('appName')}</p>
            <h2>{t('trocarSenha')}</h2>
            <p className="mm-auth-copy">{t('trocaSenhaObrigatoriaHint')}</p>
          </div>
          {usuario?.mustChangePassword && (
            <p className="mm-auth-notice">
              {t('trocaSenhaObrigatoriaHint')}
            </p>
          )}

          <fieldset className="mm-auth-fields">
            <legend className="sr-only">{t('trocarSenha')}</legend>
            <div className="mm-auth-field">
              <label htmlFor="current-password">{t('senhaAtual')}</label>
              <input id="current-password" className="mm-input" type="password" autoComplete="current-password" required value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
            </div>
            <div className="mm-auth-field">
              <label htmlFor="new-password">{t('novaSenha')}</label>
              <input id="new-password" className="mm-input" type="password" autoComplete="new-password" required minLength={6} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
            </div>
            <div className="mm-auth-field">
              <label htmlFor="confirm-password">{t('confirmarSenha')}</label>
              <input id="confirm-password" className="mm-input" type="password" autoComplete="new-password" required minLength={6} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
            </div>
          </fieldset>

          <div className="mm-auth-actions">
            <button className="mm-btn mm-btn-primary w-full" type="submit" disabled={enviando} aria-busy={enviando}>
              <span aria-live="polite">{enviando ? t('salvando') : t('trocarSenha')}</span>
            </button>

            {!usuario?.mustChangePassword && (
              <button className="mm-btn w-full" type="button" onClick={() => navigate('/home')}>
                {t('cancelar')}
              </button>
            )}

            <button className="mm-btn w-full text-xs" type="button" onClick={logout}>
              {t('sair')}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
