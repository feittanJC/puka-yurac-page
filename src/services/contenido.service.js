import { supabase } from '../lib/supabase';

/**
 * CRUD genérico para tablas de contenido con columnas `activo` y `orden`
 * (faqs, trabajos). Mismo patrón que productos.service.js:
 * los getters públicos devuelven null si hay error (el sitio usa su respaldo).
 */
function crud(table) {
  return {
    async getPublic() {
      const { data, error } = await supabase.from(table).select('*').eq('activo', true).order('orden').order('id');
      if (error) {
        console.warn(`No se pudo leer ${table}; se usa el respaldo local:`, error.message);
        return null;
      }
      return data;
    },
    async getAdmin() {
      const { data, error } = await supabase.from(table).select('*').order('orden').order('id');
      if (error) throw error;
      return data;
    },
    async create(row) {
      const { data, error } = await supabase.from(table).insert(row).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, row) {
      const { data, error } = await supabase.from(table).update(row).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

export const faqsService = crud('faqs');
export const trabajosService = crud('trabajos');

export const negocioService = {
  /** Fila única de datos del negocio, o null si no se pudo leer. */
  async get() {
    const { data, error } = await supabase.from('negocio').select('*').eq('id', 1).maybeSingle();
    if (error) {
      console.warn('No se pudo leer negocio; se usan los datos locales:', error.message);
      return null;
    }
    return data;
  },
  async save(row) {
    const { data, error } = await supabase
      .from('negocio')
      .upsert({ ...row, id: 1 })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
