// ==========================================
// stores.api.js - Store Merchants & Subscriptions Management API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchAllStores ---
/**
 * Fetches all registered stores directly from Supabase database (SuperAdmin).
 */
export async function fetchAllStores() {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return { success: true, data: stores || [] };
  } catch (err) {
    console.error('[Stores API Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchAllStores ---

// --- START updateStoreSubscription ---
/**
 * Updates a store's subscription tier, billing cycle, paid status, and expiration date in Supabase.
 */
export async function updateStoreSubscription(storeId, { planTier, billingCycle, isPaid, status, expiresAt = null }) {
  try {
    let finalExpiry = expiresAt;

    if (!finalExpiry) {
      const date = new Date();
      switch (billingCycle) {
        case '15_days': date.setDate(date.getDate() + 15); break;
        case '30_days': date.setDate(date.getDate() + 30); break;
        case '3_months': date.setMonth(date.getMonth() + 3); break;
        case '6_months': date.setMonth(date.getMonth() + 6); break;
        case '1_year': date.setFullYear(date.getFullYear() + 1); break;
        default: date.setDate(date.getDate() + 30);
      }
      finalExpiry = date.toISOString();
    }

    const payload = {
      plan_tier: planTier,
      billing_cycle: billingCycle,
      is_paid: isPaid,
      subscription_status: status || (isPaid ? 'active' : (planTier === 'free' ? 'trial' : 'past_due')),
      subscription_expires_at: finalExpiry,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('stores')
      .update(payload)
      .eq('id', parseInt(storeId, 10))
      .select();

    if (error) throw error;

    // Synchronize local session plan if updating active store
    const currentStoreId = parseInt(localStorage.getItem('store_id') || '1', 10);
    if (parseInt(storeId, 10) === currentStoreId) {
      localStorage.setItem('user_plan', planTier);
    }

    return { success: true, data: data?.[0] || payload };
  } catch (err) {
    console.error('[Update Store Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END updateStoreSubscription ---

// --- START createStore ---
/**
 * Creates a new store merchant record in Supabase database.
 */
export async function createStore({ storeName, planTier = 'free', billingCycle = '30_days', isPaid = false, expiresAt = null }) {
  try {
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    let finalExpiry = expiresAt;
    if (!finalExpiry) {
      const date = new Date();
      if (billingCycle === '15_days') date.setDate(date.getDate() + 15);
      else if (billingCycle === '30_days') date.setDate(date.getDate() + 30);
      else if (billingCycle === '3_months') date.setMonth(date.getMonth() + 3);
      else if (billingCycle === '6_months') date.setMonth(date.getMonth() + 6);
      else if (billingCycle === '1_year') date.setFullYear(date.getFullYear() + 1);
      finalExpiry = date.toISOString();
    }

    const payload = {
      store_name: storeName,
      slug: slug,
      plan_tier: planTier,
      billing_cycle: billingCycle,
      is_paid: isPaid,
      subscription_status: isPaid ? 'active' : (planTier === 'free' ? 'trial' : 'past_due'),
      subscription_start_at: new Date().toISOString(),
      subscription_expires_at: finalExpiry
    };

    const { data, error } = await supabase
      .from('stores')
      .insert(payload)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] || payload };
  } catch (err) {
    console.error('[Create Store Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END createStore ---

// --- START deleteStore ---
/**
 * Deletes a store merchant from Supabase (SuperAdmin).
 */
export async function deleteStore(storeId) {
  try {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', parseInt(storeId, 10));

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Delete Store Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END deleteStore ---


