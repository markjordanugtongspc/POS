// ==========================================
// branches.api.js - Branches CRUD & Context Management API
// ==========================================
import { supabase } from './client.api.js';

const ACTIVE_BRANCH_STORAGE_KEY = 'active_branch_id';
const ACTIVE_BRANCH_NAME_STORAGE_KEY = 'active_branch_name';

/**
 * Get the currently active branch ID from localStorage
 * @returns {number|null}
 */
export function getActiveBranchId() {
  const val = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
  return val ? parseInt(val, 10) : null;
}

/**
 * Get the currently active branch name from localStorage
 * @returns {string}
 */
export function getActiveBranchName() {
  return localStorage.getItem(ACTIVE_BRANCH_NAME_STORAGE_KEY) || 'All Branches';
}

/**
 * Set the active branch in localStorage and trigger a global branch change event
 * @param {number|null} branchId - null means "All Branches"
 * @param {string} branchName
 */
export function setActiveBranch(branchId, branchName = 'All Branches') {
  if (branchId === null || branchId === undefined || branchId === 'all' || branchId === '') {
    localStorage.removeItem(ACTIVE_BRANCH_STORAGE_KEY);
    localStorage.setItem(ACTIVE_BRANCH_NAME_STORAGE_KEY, 'All Branches');
  } else {
    localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, String(branchId));
    localStorage.setItem(ACTIVE_BRANCH_NAME_STORAGE_KEY, branchName);
  }

  // Dispatch custom window event for reactive UI updates
  window.dispatchEvent(new CustomEvent('branch:changed', {
    detail: { branchId: branchId ? parseInt(branchId, 10) : null, branchName }
  }));
}

/**
 * Fetch all branches for a store with product counts and staff counts
 * @param {number|null} storeId
 * @returns {Promise<{ success: boolean, data: Array, error?: string }>}
 */
export async function fetchBranches(storeId = null) {
  try {
    const targetStoreId = storeId || parseInt(localStorage.getItem('store_id') || '1', 10);

    let query = supabase
      .from('branches')
      .select('*, products(id)')
      .order('id', { ascending: true });

    if (targetStoreId) {
      query = query.eq('store_id', targetStoreId);
    }

    const { data, error } = await query;
    if (error) {
      // If table does not exist yet (pending migration), return a mock main branch
      if (error.code === '42P01' || error.message?.includes('relation "public.branches" does not exist')) {
        console.warn('[Branches API]: branches table not found, fallback to default branch.');
        return {
          success: true,
          data: [
            {
              id: 1,
              store_id: targetStoreId,
              branch_name: 'Main Branch (Default)',
              business_type: 'sari_sari_store',
              address: 'Store Primary Location',
              is_active: true,
              products_count: 0
            }
          ]
        };
      }
      throw error;
    }

    const formatted = (data || []).map(b => ({
      id: b.id,
      store_id: b.store_id,
      branch_name: b.branch_name,
      business_type: b.business_type || 'sari_sari_store',
      address: b.address || '',
      is_active: b.is_active ?? true,
      created_at: b.created_at,
      products_count: Array.isArray(b.products) ? b.products.length : 0
    }));

    // If active branch is not set, set it to the first branch or null
    if (!localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY) && formatted.length > 0) {
      // Leave as null or set to first branch
    }

    return { success: true, data: formatted };
  } catch (err) {
    console.error('[Branches API Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Create a new branch under a store
 * @param {Object} param0
 * @param {number} param0.storeId
 * @param {string} param0.branchName
 * @param {string} param0.businessType
 * @param {string} [param0.address]
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function createBranch({ storeId, branchName, businessType, address = '' }) {
  try {
    const targetStoreId = storeId || parseInt(localStorage.getItem('store_id') || '1', 10);

    const payload = {
      store_id: targetStoreId,
      branch_name: branchName.trim(),
      business_type: businessType.trim(),
      address: address ? address.trim() : null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('branches')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error('[Branches API Create Error]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update branch metadata
 * @param {number} branchId
 * @param {Object} updates
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function updateBranch(branchId, updates) {
  try {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('branches')
      .update(payload)
      .eq('id', parseInt(branchId, 10))
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error('[Branches API Update Error]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete or deactivate a branch
 * @param {number} branchId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deleteBranch(branchId) {
  try {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', parseInt(branchId, 10));

    if (error) throw error;

    // If active branch was deleted, reset to All Branches
    if (getActiveBranchId() === parseInt(branchId, 10)) {
      setActiveBranch(null);
    }

    return { success: true };
  } catch (err) {
    console.error('[Branches API Delete Error]:', err);
    return { success: false, error: err.message };
  }
}
