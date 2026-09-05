// ==========================================
// suppliers.api.js - Suppliers Directory CRUD API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchSuppliers ---
/**
 * Fetches suppliers for a specific store and optional branch.
 */
export async function fetchSuppliers(storeId = 1, branchId = null) {
  try {
    let query = supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[Suppliers API Fetch Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchSuppliers ---

// --- START createSupplier ---
export async function createSupplier({
  storeId = 1,
  branchId = null,
  name,
  contactPerson = '',
  phone = '',
  email = '',
  notes = ''
}) {
  try {
    const payload = {
      store_id: storeId,
      branch_id: branchId,
      name: name.trim(),
      contact_person: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim()
    };

    const { data, error } = await supabase
      .from('suppliers')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Suppliers API Create Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END createSupplier ---

// --- START updateSupplier ---
export async function updateSupplier(supplierId, updates) {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', supplierId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Suppliers API Update Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END updateSupplier ---

// --- START deleteSupplier ---
export async function deleteSupplier(supplierId) {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Suppliers API Delete Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END deleteSupplier ---
