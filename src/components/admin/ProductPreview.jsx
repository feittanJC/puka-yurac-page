import { Plate } from './ui';

/**
 * Vista previa en vivo de la tarjeta tal como se ve en la landing
 * (réplica en React de ProductCard: foto en plato papel, categoría,
 * título, descripción, acabados en mono y enlace "Cotizar este producto").
 */
export default function ProductPreview({ titulo, categoria, descripcion, imagen, acabados, activo, destacado }) {
  const empty = !titulo.trim();
  const title = empty ? 'Nombre del producto' : titulo.trim();
  const spec = acabados.length ? acabados.join(' · ') : 'Sin acabados';
  const status = activo
    ? destacado
      ? 'Publicado: se verá en el catálogo y en Productos destacados.'
      : 'Publicado: se verá en el catálogo.'
    : 'Oculto: no se verá en el sitio hasta que lo publiques.';

  return (
    <section aria-labelledby="preview-title">
      <h3 id="preview-title" className="text-[15px] font-bold ui-text-primary">
        Vista previa
      </h3>
      <p className="mt-1 mb-3.5 text-sm ui-text-secondary">Así se verá la tarjeta en el sitio.</p>

      <div className="rounded-2xl border ui-border ui-surface-bg p-5 sm:p-6">
        {imagen ? (
          <Plate src={imagen} className="h-[260px] sm:h-[300px]" padding="p-6 sm:p-7" radius="rounded-[20px]" />
        ) : (
          <div className="h-[260px] sm:h-[300px] rounded-[20px] bg-[var(--bg-plate)] p-6 sm:p-7 flex flex-col justify-end">
            {/* El plato es claro en ambos temas: colores fijos para mantener contraste */}
            <span className="font-sans [font-stretch:112%] text-[28px] sm:text-[32px] leading-[1.02] font-extrabold tracking-[-0.03em] text-[#3a3c40] break-words">
              {title}
            </span>
            <span className="mt-2 text-[13px] font-semibold text-[#5f6268]">Foto próximamente</span>
          </div>
        )}

        <p className="mt-[18px] mb-1.5 text-sm font-semibold ui-text-tertiary">{categoria.trim() || 'Categoría'}</p>
        <p
          className={`font-sans [font-stretch:106%] text-[22px] leading-[1.2] font-bold break-words ${
            empty ? 'ui-text-tertiary' : 'ui-text-primary'
          }`}
        >
          {title}
        </p>
        {descripcion.trim() && (
          <p className="mt-2 text-base leading-[1.55] ui-text-secondary break-words">{descripcion}</p>
        )}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="font-mono text-[13px] ui-text-secondary">{spec}</span>
          <span className="inline-flex items-center min-h-11 ui-text-primary text-[15px] font-bold underline decoration-[var(--accent-text)] decoration-2 underline-offset-[6px] whitespace-nowrap">
            Cotizar este producto
          </span>
        </div>
      </div>

      <p
        className={`mt-3.5 text-sm leading-normal font-semibold ${
          activo ? 'text-[var(--whatsapp)] dark:text-emerald-400' : 'ui-text-secondary'
        }`}
      >
        {status}
      </p>
    </section>
  );
}
