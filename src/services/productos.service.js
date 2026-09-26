import { supabase } from '../lib/supabase';

const TABLE = 'productos';
const BUCKET = 'productos';

export const productosService = {
  /**
   * Get all active products for Public Landing Page
   */
  async getPublicProductos() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('activo', true)
      .order('orden');

    if (error) {
      console.warn('Falling back to local static catalog data:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Get all products for Admin Panel (including inactive)
   */
  async getAdminProductos() {
    const { data, error } = await supabase.from(TABLE).select('*').order('orden');
    if (error) throw error;
    return data;
  },

  /**
   * Create new Product (Protected Admin)
   */
  async createProducto(productoData) {
    const { data, error } = await supabase.from(TABLE).insert(productoData).select().single();
    if (error) throw error;
    return data;
  },

  /**
   * Update existing Product (Protected Admin)
   */
  async updateProducto(id, productoData) {
    const { data, error } = await supabase.from(TABLE).update(productoData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  /**
   * Delete Product (Protected Admin)
   */
  async deleteProducto(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Upload product image to Storage, returns public URL (Protected Admin)
   */
  async uploadImagen(file) {
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) throw error;

    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },

  /**
   * Remove a product image from Storage given its public URL (Protected Admin).
   * Ignores URLs that don't belong to the bucket (e.g. local /assets/ images).
   */
  async deleteImagen(publicUrl) {
    if (!publicUrl) return;
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(publicUrl.slice(idx + marker.length).split('?')[0]);
    if (!path) return;

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  }
};
