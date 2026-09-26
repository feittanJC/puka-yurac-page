import type { Producto } from '../types/producto';

export type GridMode = 'destacados' | 'todos';

/**
 * "todos": catálogo completo.
 * "destacados": solo los marcados como destacados; si no hay ninguno, los primeros del catálogo.
 */
export function selectProductos(all: Producto[], mode: GridMode, limit: number): Producto[] {
  if (mode === 'todos') return all;
  const destacados = all.filter((p) => p.destacado);
  return (destacados.length > 0 ? destacados : all).slice(0, limit);
}
