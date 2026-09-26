/**
 * Las fotos originales de /public/assets pesan 1–2 MB. Si un producto apunta a una de ellas,
 * se sirve la versión optimizada (webp, 1600px máx.) de /public/assets/fotos.
 */
const OPTIMIZADAS = new Set(['cuaderno', 'anillado', 'calendario', 'folleto', 'background']);

export function imagenOptimizada(src: string | null | undefined): string {
  if (!src) return '';
  const m = src.match(/^\/assets\/([\w-]+)\.(?:jpe?g|png)$/i);
  return m && OPTIMIZADAS.has(m[1]) ? `/assets/fotos/${m[1]}.webp` : src;
}
