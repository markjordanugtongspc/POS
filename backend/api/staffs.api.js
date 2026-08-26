// ==========================================
// staffs.api.js - Staff Directory (Owners, Managers, Cashiers) API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchStaffsByRole ---
export async function fetchStaffsByRole(role, storeId = null) {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (role) {
      query = query.eq('role', role);
    }
    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[Staffs API Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchStaffsByRole ---

// --- START softDeleteStaff ---
export async function softDeleteStaff(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_active: false,
        resigned_at: new Date().toISOString(),
        archived_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('[Soft Delete Staff Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END softDeleteStaff ---

// --- START fetchAllPlatformUsers ---
/**
 * Fetches all platform users across all stores (SuperAdmin).
 */
export async function fetchAllPlatformUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, stores(store_name)')
      .order('id', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[Fetch All Platform Users Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchAllPlatformUsers ---

