// Primitivas compartidas del panel admin (rediseño 2026).
// Colores vía tokens de global.css para que claro/oscuro cumplan AA.
import { imagenOptimizada } from '../../lib/imagen';
import { useEffect, useRef } from 'react';

export const cls = {
  // Botón principal rojo (acción)
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--action)] hover:bg-[var(--action-hover)] text-white font-bold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
  // Botón secundario sobre superficie (papel en claro, elevado en oscuro)
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-xl ui-elevated-bg ui-text-primary font-semibold transition-colors cursor-pointer hover:bg-[var(--border-main)] disabled:opacity-60 disabled:cursor-not-allowed',
  // Enlace tipo texto con subrayado al pasar
  textLink:
    'inline-flex items-center min-h-11 px-3 ui-text-primary font-semibold underline-offset-[5px] hover:underline cursor-pointer',
  input:
    'w-full rounded-xl border border-[var(--border-input)] ui-surface-bg ui-text-primary text-base placeholder:text-[var(--text-tertiary)] transition-colors',
  label: 'block mb-2 text-[15px] font-bold ui-text-primary',
  hint: 'text-sm ui-text-secondary',
  errorText: 'text-sm font-semibold text-[#b91c1c] dark:text-[#f87171]',
  danger: 'text-[#b91c1c] dark:text-[#f87171]',
  // Pill / chip seleccionado en tinta (invierte en oscuro)
  inkOn: 'bg-[var(--text-primary)] text-[var(--bg-page)]',
  iconBtn:
    'inline-flex items-center justify-center w-11 h-11 rounded-[10px] transition-colors cursor-pointer hover:bg-[var(--bg-elevated)]',
};

function Svg({ size = 20, strokeWidth = 1.8, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconEdit = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  </Svg>
);

export const IconTrash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
);

export const IconClose = ({ size = 22, strokeWidth = 2 }) => (
  <Svg size={size} strokeWidth={strokeWidth}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IconUpload = ({ size = 32 }) => (
  <Svg size={size}>
    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </Svg>
);

export const IconSearch = ({ size = 20 }) => (
  <Svg size={size}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);

/**
 * Pista + perilla del switch (decorativa). El rol switch lo lleva el botón padre.
 * tone "green" = publicado; "ink" = destacado.
 */
export function SwitchTrack({ checked, tone = 'green', size = 'sm' }) {
  const big = size === 'lg';
  const onTrack = tone === 'green' ? 'bg-[var(--whatsapp)]' : 'bg-[var(--text-primary)]';
  const knobOn = tone === 'ink' ? 'bg-white dark:bg-[#0f1115]' : 'bg-white';
  return (
    <span
      aria-hidden="true"
      className={`relative block shrink-0 rounded-full transition-colors ${big ? 'w-[52px] h-[30px]' : 'w-11 h-[26px]'} ${
        checked ? onTrack : 'bg-[var(--border-input)]'
      }`}
    >
      <span
        className={`absolute top-[3px] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-[left] motion-reduce:transition-none ${
          big ? 'w-6 h-6' : 'w-5 h-5'
        } ${checked ? `${knobOn} ${big ? 'left-[25px]' : 'left-[21px]'}` : 'bg-white left-[3px]'}`}
      />
    </span>
  );
}

/** Miniatura/visor sobre plano papel. El plano es claro en ambos temas. */
export function Plate({ src, alt = '', className = '', padding = 'p-1.5', radius = 'rounded-[10px]', children }) {
  return (
    <div className={`flex items-center justify-center bg-[var(--bg-plate)] ${radius} ${padding} ${className}`}>
      {src ? (
        <img src={imagenOptimizada(src)} alt={alt} className="block max-w-full max-h-full object-contain mix-blend-multiply" />
      ) : (
        children
      )}
    </div>
  );
}

/** Fila con título, descripción y switch grande (formularios del panel). */
export function SwitchRow({ id, title, description, checked, tone, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 lg:gap-6 py-3.5 lg:py-4 border-b ui-border">
      <div>
        <p id={id} className="text-base font-bold ui-text-primary">
          {title}
        </p>
        <p id={`${id}-desc`} className={`mt-1 ${cls.hint}`}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        aria-describedby={`${id}-desc`}
        onClick={onToggle}
        className="shrink-0 inline-flex items-center justify-center w-[60px] h-11 cursor-pointer rounded-full"
      >
        <SwitchTrack checked={checked} tone={tone} size="lg" />
      </button>
    </div>
  );
}

/** Switch compacto para filas de listas (publicado / destacado). */
export function RowSwitch({ checked, tone, label, ariaLabel, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onClick}
      className="justify-self-start inline-flex items-center gap-2.5 h-11 text-sm font-semibold ui-text-primary cursor-pointer"
    >
      <SwitchTrack checked={checked} tone={tone} />
      <span aria-hidden="true">{label}</span>
    </button>
  );
}

/** Aviso de éxito o error con botón para cerrarlo. */
export function Notice({ notice, onClose }) {
  if (!notice) return null;
  const ok = notice.tone === 'ok';
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl px-4 py-2 text-[15px] ${
        ok
          ? 'bg-[#e6f4ee] text-[#065f46] dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-[#fdecec] text-[#7f1d1d] dark:bg-red-500/15 dark:text-red-300'
      }`}
    >
      <p className="py-2 font-semibold">{notice.text}</p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 h-11 px-3 rounded-lg font-semibold underline underline-offset-4 cursor-pointer"
      >
        Cerrar aviso
      </button>
    </div>
  );
}

/**
 * Ventana modal sobre <dialog> nativo: atrapa el foco y Esc llama a onClose
 * (que puede pedir confirmación si hay cambios sin guardar).
 */
export function FormModal({ open, labelledBy, onClose, children, size = 'lg' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);
  const width = size === 'lg' ? 'lg:max-w-[1160px]' : 'lg:max-w-[720px]';
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={`m-0 lg:m-auto w-full max-w-none h-dvh max-h-none lg:h-[min(90dvh,920px)] ${width} p-0 lg:rounded-[20px] ui-surface-bg ui-text-primary overflow-hidden backdrop:bg-[#0f1115]/55 lg:shadow-[0_24px_64px_-12px_rgba(15,17,21,0.45)]`}
    >
      {open && <div className="flex h-full flex-col">{children}</div>}
    </dialog>
  );
}

/** Cabecera de formulario en modal: título enfocable + botón cerrar. */
export function ModalHeader({ id, title, srDetail, onClose, disabled }) {
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <header className="shrink-0 h-[60px] lg:h-[72px] px-2 lg:px-8 flex items-center gap-1 lg:gap-4 border-b ui-border">
      <button
        type="button"
        onClick={onClose}
        disabled={disabled}
        aria-label="Cerrar"
        className={`${cls.iconBtn} ui-text-primary lg:order-last lg:ml-auto`}
      >
        <IconClose />
      </button>
      <h2
        id={id}
        ref={headingRef}
        tabIndex={-1}
        className="min-w-0 truncate font-sans [font-stretch:108%] text-xl lg:text-2xl font-extrabold tracking-[-0.02em] ui-text-primary focus:outline-none"
      >
        {title}
        {srDetail && <span className="sr-only">: {srDetail}</span>}
      </h2>
    </header>
  );
}

/** Barra inferior con guardar / cancelar. */
export function ModalFooter({ formId, saving, saveLabel, error, onCancel }) {
  return (
    <footer className="shrink-0 px-5 lg:px-8 py-4 border-t ui-border ui-surface-bg shadow-[0_-4px_12px_rgba(15,17,21,0.06)] lg:shadow-none">
      {error && (
        <p role="alert" className={`mb-3 ${cls.errorText}`}>
          {error}
        </p>
      )}
      <div className="flex items-center gap-3 lg:justify-end lg:gap-6">
        <button
          type="submit"
          form={formId}
          disabled={saving}
          aria-busy={saving}
          className={`${cls.primary} flex-1 lg:flex-none h-[52px] lg:h-14 px-7 text-base`}
        >
          {saving ? 'Guardando…' : saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`${cls.textLink} hidden lg:inline-flex lg:order-first h-14 text-base`}
        >
          Cancelar
        </button>
      </div>
    </footer>
  );
}

/** Título de sección del panel + resumen + acción principal opcional. */
export function SectionHeader({ title, summary, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-8">
      <div>
        <h1 className="font-sans [font-stretch:112%] text-[32px] sm:text-[40px] leading-[1.05] font-extrabold tracking-[-0.03em] ui-text-primary">
          {title}
        </h1>
        {summary && <p className="mt-2 text-[15px] ui-text-secondary">{summary}</p>}
      </div>
      {action}
    </div>
  );
}
