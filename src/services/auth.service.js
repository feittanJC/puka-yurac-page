import { supabase } from '../lib/supabase';

export const authService = {
  /**
   * Login Admin User
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (!(await this.isAdmin())) {
      await supabase.auth.signOut();
      throw new Error('Este usuario no tiene permisos de administrador');
    }
    return data;
  },

  /**
   * Logout Admin User
   */
  async logout() {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  },

  /**
   * Get Active Session (null if not logged in)
   */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Check if current user is registered in public.admins
   */
  async isAdmin() {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) return false;
    return data === true;
  },

  /**
   * Get Active User Profile
   */
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
};
