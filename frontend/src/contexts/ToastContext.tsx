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
      <div className="fixed right-4 top-4 z-[9999] flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border p-3 text-sm shadow ${
              toast.tipo === 'sucesso'
                ? 'border-emerald-400 bg-emerald-100 text-emerald-900'
                : 'border-rose-400 bg-rose-100 text-rose-900'
            }`}
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
