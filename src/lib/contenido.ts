import { negocioService } from '../services/contenido.service';
import { aplicarNegocio } from '../data/siteData';

let negocioCargado: Promise<void> | null = null;

/**
 * Lee los datos del negocio de Supabase una sola vez por build y los aplica sobre siteData.
 * Llamarlo en el frontmatter de cada página pública ANTES de renderizar componentes.
 * Si Supabase no responde, se quedan los valores de src/data/siteData.js.
 */
export function cargarNegocio(): Promise<void> {
  negocioCargado ??= negocioService
    .get()
    .then((row) => {
      aplicarNegocio(row);
    })
    .catch(() => {});
  return negocioCargado;
}
