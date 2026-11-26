import { siteData } from '../data/siteData';
import { categoriasService } from '../services/contenido.service';

export interface Categoria {
  nombre: string;
  spec: string;
  /** 3 cantidades sugeridas en el cotizador */
  cantidades: number[];
  mostrar_en_inicio: boolean;
}

export const CANTIDADES_POR_DEFECTO = [50, 100, 250];

/** Cantidades sugeridas de respaldo (las mismas que siembra la migración 003). */
const PRESETS_LOCALES: Record<string, number[]> = {
  'Agendas corporativas': [50, 100, 250],
  'Cuadernos personalizados': [100, 250, 500],
  'Facturas y talonarios': [10, 25, 50],
  'Folletos y afiches': [500, 1000, 2500],
  Calendarios: [50, 100, 250],
  'Agendas de cuero': [25, 50, 100],
};

/** Completa y limpia las cantidades: 3 enteros positivos. */
export function normalizarCantidades(lista: unknown): number[] {
  const nums = (Array.isArray(lista) ? lista : [])
    .map((n) => Math.round(Number(n)))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 3);
  for (const d of CANTIDADES_POR_DEFECTO) if (nums.length < 3 && !nums.includes(d)) nums.push(d);
  return nums.sort((a, b) => a - b);
}

export function categoriasLocales(): Categoria[] {
  return siteData.categorias.map((c) => ({
    nombre: c.nombre,
    spec: c.spec,
    cantidades: PRESETS_LOCALES[c.nombre] ?? CANTIDADES_POR_DEFECTO,
    mostrar_en_inicio: true,
  }));
}

export function desdeFilas(rows: any[] | null | undefined): Categoria[] | null {
  if (!rows?.length) return null;
  return rows.map((r) => ({
    nombre: r.nombre,
    spec: r.spec ?? '',
    cantidades: normalizarCantidades(r.cantidades),
    mostrar_en_inicio: r.mostrar_en_inicio !== false,
  }));
}

let cache: Promise<Categoria[]> | null = null;

/** Categorías publicadas desde Supabase (panel → Categorías); respaldo: siteData.categorias. */
export function cargarCategorias(): Promise<Categoria[]> {
  cache ??= categoriasService
    .getPublic()
    .then((rows) => desdeFilas(rows) ?? categoriasLocales())
    .catch(() => categoriasLocales());
  return cache;
}

export const hrefCategoria = (nombre: string) => `/productos?cat=${encodeURIComponent(nombre)}`;
