// Primitivas compartidas del panel admin (rediseño 2026).
// Colores vía tokens de global.css para que claro/oscuro cumplan AA.

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
        <img src={src} alt={alt} className="block max-w-full max-h-full object-contain mix-blend-multiply" />
      ) : (
        children
      )}
    </div>
  );
}
