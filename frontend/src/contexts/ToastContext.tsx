import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type TipoToast = 'sucesso' | 'erro';

interface ToastItem {
  id: number;
  tipo: TipoToast;
  mensagem: string;
}

interface ToastContextType {
  mostrarToast: (tipo: TipoToast, mensagem: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  mostrarToast: () => undefined,
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const mostrarToast = useCallback((tipo: TipoToast, mensagem: string) => {
    const id = Date.now();
    setToasts((atual) => [...atual, { id, tipo, mensagem }]);

    setTimeout(() => {
      setToasts((atual) => atual.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const valor = useMemo(() => ({ mostrarToast }), [mostrarToast]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="mm-toast-stack">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`mm-toast ${toast.tipo === 'sucesso' ? 'mm-toast--sucesso' : 'mm-toast--erro'}`}
            role={toast.tipo === 'erro' ? 'alert' : 'status'}
          >
            {toast.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
