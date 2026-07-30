import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
}

function podeReceberFoco(elemento: HTMLElement) {
  if (
    elemento.matches('input[type="hidden"]') ||
    elemento.closest('[hidden], [aria-hidden="true"], [disabled]')
  ) {
    return false;
  }

  const estilo = window.getComputedStyle(elemento);
  return elemento.tabIndex >= 0 && estilo.visibility !== 'hidden' && estilo.display !== 'none' && elemento.getClientRects().length > 0;
}

export function Modal({ aberto, titulo, onFechar, children }: ModalProps) {
  const { t } = useTranslation();
  const tituloId = useId();
  const onFecharRef = useRef(onFechar);
  const painelRef = useRef<HTMLDivElement>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);
  const focoAnteriorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onFecharRef.current = onFechar;
  }, [onFechar]);

  useEffect(() => {
    if (!aberto) return undefined;

    focoAnteriorRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    botaoFecharRef.current?.focus();

    const aoPressionarTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFecharRef.current();

      if (event.key !== 'Tab') return;

      const focaveis = Array.from(
        painelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(podeReceberFoco);

      if (!focaveis.length) {
        event.preventDefault();
        return;
      }

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoPressionarTecla);
    return () => {
      document.removeEventListener('keydown', aoPressionarTecla);
      focoAnteriorRef.current?.focus();
    };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div
      className="mm-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onFechar();
      }}
    >
      <div ref={painelRef} className="mm-modal-panel" role="dialog" aria-modal="true" aria-labelledby={tituloId}>
        <div className="mm-modal-header">
          <h3 id={tituloId} className="text-lg font-semibold">{titulo}</h3>
          <button ref={botaoFecharRef} className="mm-btn" onClick={onFechar} type="button" aria-label={t('fecharDialogo', { titulo })}>
            ×
          </button>
        </div>
        <div className="mm-modal-content">{children}</div>
      </div>
    </div>
  );
}
