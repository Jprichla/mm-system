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
    <div className="flex min-h-screen items-center justify-center p-4">
      <form className="mm-card w-full max-w-md space-y-4 p-6" onSubmit={onSubmit}>
        <div>
          <h1 className="text-xl font-semibold">{t('trocarSenha')}</h1>
          {usuario?.mustChangePassword && (
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('trocaSenhaObrigatoriaHint')}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm">{t('senhaAtual')}</label>
          <input
            className="mm-input"
            type="password"
            required
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('novaSenha')}</label>
          <input
            className="mm-input"
            type="password"
            required
            minLength={6}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('confirmarSenha')}</label>
          <input
            className="mm-input"
            type="password"
            required
            minLength={6}
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
        </div>

        <button className="mm-btn mm-btn-primary w-full" type="submit" disabled={enviando}>
          {enviando ? '...' : t('trocarSenha')}
        </button>

        {!usuario?.mustChangePassword && (
          <button className="mm-btn w-full" type="button" onClick={() => navigate('/home')}>
            {t('cancelar')}
          </button>
        )}

        <button className="mm-btn w-full text-xs" type="button" onClick={logout}>
          {t('sair')}
        </button>
      </form>
    </div>
  );
}
