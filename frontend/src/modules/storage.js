// ==========================================
// storage.js - Supabase Storage Upload & Retrieval Module
// ==========================================
import { supabase } from '../../../backend/api/client.api.js';

// --- START uploadFileToBucket ---
export async function uploadFileToBucket(bucketName, file, pathPrefix = '') {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data.path;
  } catch (err) {
    console.error(`Error uploading to ${bucketName}:`, err);
    throw err;
  }
}
// --- END uploadFileToBucket ---

// --- START getPublicStorageUrl ---
export function getPublicStorageUrl(bucketName, filePath) {
  if (!filePath) return null;
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}
// --- END getPublicStorageUrl ---
