// ==========================================
// products.api.js - Supabase Products & Categories CRUD API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchProducts ---
/**
 * Fetches products for a specific store and optional branch from Supabase.
 */
export async function fetchProducts(storeId = null, branchId = null) {
  try {
    let query = supabase
      .from('products')
      .select('*, categories(name), brands(name)')
      .order('id', { ascending: true });

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Fetch users directory to reliably resolve created_by -> full_name
    let userMap = new Map();
    try {
      const { data: usersData } = await supabase.from('users').select('id, full_name, username');
      if (usersData && usersData.length > 0) {
        usersData.forEach(u => {
          userMap.set(u.id, u.full_name || u.username);
        });
      }
    } catch (e) {
      console.warn('[Products API] Users map fetch skipped:', e);
    }

    // Normalize format for frontend table & POS
    const formatted = (data || []).map(p => {
      const creatorName = userMap.get(p.created_by) || (p.created_by ? `User #${p.created_by}` : 'Mark Jordan');
      return {
        id: p.id,
        sku: p.sku || `SKU${String(p.id).padStart(3, '0')}`,
        custom_id: p.sku,
        barcode_ean13: p.ean_13_barcode || p.barcode_ean13,
        name: p.name,
        category: p.categories?.name || 'General',
        brand: p.brands?.name || 'General',
        price: parseFloat(p.selling_price ?? p.price) || 0.00,
        cost_price: parseFloat(p.buying_price ?? p.cost_price) || 0.00,
        qty: parseInt(p.qty ?? p.stock_quantity, 10) || 0,
        image_path: p.image_path,
        branch_id: p.branch_id || null,
        createdBy: creatorName,
        created_by: p.created_by,
        created_at: p.created_at
      };
    });

    return { success: true, data: formatted };
  } catch (err) {
    console.error('[Products API Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchProducts ---

// --- START fetchCategories ---
export async function fetchCategories(storeId = null) {
  try {
    let query = supabase.from('categories').select('*').order('name', { ascending: true });
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[Categories API Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchCategories ---

// --- START createProduct ---
export async function createProduct({
  storeId = 1,
  branchId = null,
  sku,
  barcodeEan13,
  productName,
  categoryId,
  brandId,
  price,
  costPrice,
  stockQuantity,
  imagePath,
  createdBy = 1
}) {
  try {
    const insertPayload = {
      store_id: storeId,
      sku: sku,
      ean_13_barcode: barcodeEan13,
      name: productName,
      category_id: categoryId,
      brand_id: brandId || null,
      selling_price: price,
      buying_price: costPrice,
      qty: stockQuantity,
      image_path: imagePath,
      created_by: createdBy
    };

    if (branchId) {
      insertPayload.branch_id = branchId;
    }

    const { data, error } = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Create Product Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END createProduct ---

// --- START updateProduct ---
export async function updateProduct(productId, updates) {
  try {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    
    // Remove undefined or null keys that shouldn't be overwritten
    Object.keys(cleanUpdates).forEach(key => {
      if (cleanUpdates[key] === undefined) {
        delete cleanUpdates[key];
      }
    });

    const { data, error } = await supabase
      .from('products')
      .update(cleanUpdates)
      .eq('id', parseInt(productId, 10))
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] || cleanUpdates };
  } catch (err) {
    console.error('[Update Product Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END updateProduct ---

// --- START uploadProductImage ---
/**
 * Uploads a product image file to the 'product-images' Supabase storage bucket
 */
export async function uploadProductImage(file, sku = 'SKU') {
  try {
    if (!file) return { success: true, imagePath: null, publicUrl: null };
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${sku.toLowerCase()}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.warn('[Storage upload warning]:', error.message);
      // If bucket is not created or permissions issue, return null safely
      return { success: false, error: error.message, imagePath: null };
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      imagePath: filePath,
      publicUrl: urlData?.publicUrl || null
    };
  } catch (err) {
    console.error('[Upload Product Image Error]:', err);
    return { success: false, error: err.message, imagePath: null };
  }
}

/**
 * Resolves a public URL for a product image path from the 'product-images' storage bucket
 */
export function getProductImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(imagePath);
  return data?.publicUrl || null;
}
// --- END uploadProductImage ---

// --- START deleteProduct ---
/**
 * Hard deletes a product to free space according to subscription limits.
 */
export async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Delete Product Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END deleteProduct ---
