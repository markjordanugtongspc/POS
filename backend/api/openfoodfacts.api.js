// ==========================================
// openfoodfacts.api.js - Open Food Facts Barcode Lookup
// ==========================================

const OFF_BASE_URL = 'https://world.openfoodfacts.net/api/v2/product';
const cache = new Map();
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1500; // Throttle to prevent hitting rate limits

/**
 * Looks up product details from Open Food Facts by barcode (EAN-13, UPC, etc.)
 * @param {string} barcode - Barcode string
 * @returns {Promise<{ found: boolean, name?: string, brand?: string, category?: string, imageUrl?: string, barcode: string, error?: string }>}
 */
export async function lookupBarcode(barcode) {
  if (!barcode) {
    return { found: false, error: 'No barcode provided', barcode: '' };
  }

  const cleanBarcode = String(barcode).trim().replace(/[^0-9]/g, '');
  if (!cleanBarcode) {
    return { found: false, error: 'Invalid barcode digits', barcode };
  }

  // Return cached result if available
  if (cache.has(cleanBarcode)) {
    return cache.get(cleanBarcode);
  }

  // Enforce client-side rate limit spacing
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    await new Promise(res => setTimeout(res, MIN_REQUEST_INTERVAL_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();

  try {
    // Standard Simple GET request without custom headers to avoid CORS preflight rejection
    const queryParams = '?fields=code,product_name,product_name_en,brands,categories,image_front_url';
    const primaryUrl = `https://world.openfoodfacts.net/api/v2/product/${cleanBarcode}${queryParams}`;
    const fallbackUrl = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}${queryParams}`;
    
    let response;
    try {
      response = await fetch(primaryUrl);
    } catch (_) {
      // Fallback to production if staging has connectivity issues
      response = await fetch(fallbackUrl);
    }

    if (!response.ok) {
      if (response.status === 404) {
        const notFoundResult = { found: false, barcode: cleanBarcode, message: 'Product not found in Open Food Facts' };
        cache.set(cleanBarcode, notFoundResult);
        return notFoundResult;
      }
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const rawCategories = p.categories || '';
      // Extract cleanest category (first in comma-separated list or last specific)
      const categoryList = rawCategories.split(',').map(c => c.trim()).filter(Boolean);
      const cleanCategory = categoryList.length > 0 ? categoryList[0] : '';

      const rawBrands = p.brands || '';
      const brandList = rawBrands.split(',').map(b => b.trim()).filter(Boolean);
      const cleanBrand = brandList.length > 0 ? brandList[0] : '';

      const cleanName = p.product_name || p.product_name_en || '';

      const result = {
        found: true,
        barcode: cleanBarcode,
        name: cleanName,
        brand: cleanBrand,
        category: cleanCategory,
        imageUrl: p.image_front_url || null,
        source: 'openfoodfacts'
      };

      cache.set(cleanBarcode, result);
      return result;
    }

    const notFoundResult = { found: false, barcode: cleanBarcode, message: 'Product not found in Open Food Facts' };
    cache.set(cleanBarcode, notFoundResult);
    return notFoundResult;
  } catch (err) {
    console.warn('[OpenFoodFacts API Error]:', err);
    return { found: false, barcode: cleanBarcode, error: err.message };
  }
}
