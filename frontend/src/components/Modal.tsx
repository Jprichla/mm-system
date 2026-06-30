interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
}

export function Modal({ aberto, titulo, onFechar, children }: ModalProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="mm-card w-full max-w-2xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{titulo}</h3>
          <button className="mm-btn" onClick={onFechar} type="button">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
