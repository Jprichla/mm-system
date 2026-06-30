import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import './index.css';
import App from './App';
import i18n from './i18n';
import { ToastProvider } from './contexts/ToastContext';
import { usePreferencesStore } from './store/preferencesStore';
import { useAuthStore } from './store/authStore';

function Bootstrap() {
  const { tema, idioma } = usePreferencesStore();
  const { carregarPerfil } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  useEffect(() => {
    i18n.changeLanguage(idioma);
  }, [idioma]);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ToastProvider>
        <BrowserRouter>
          <Bootstrap />
        </BrowserRouter>
      </ToastProvider>
    </I18nextProvider>
  </StrictMode>,
);
