import { useEffect, useId, useRef } from 'react';
import { cls } from './ui';

/**
 * Diálogo de confirmación accesible sobre <dialog> nativo (showModal):
 * atrapa el foco, cierra con Esc y devuelve el foco al elemento previo.
 * El foco inicial va a "Cancelar" (la opción segura).
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        // clic en el fondo (fuera de la caja) = cancelar
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl ui-surface-bg ui-text-primary p-0 backdrop:bg-black/50"
    >
      <div className="p-6 sm:p-7">
        <h2 id={titleId} className="text-2xl font-extrabold tracking-tight leading-tight">
          {title}
        </h2>
        <p id={descId} className="mt-3 text-base leading-relaxed ui-text-secondary">
          {message}
        </p>
        <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={`${cls.secondary} h-12 px-5 text-[15px]`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`${cls.primary} h-12 px-5 text-[15px]`}
          >
            {busy ? 'Un momento…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
