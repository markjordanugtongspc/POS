// ==========================================
// audit.api.js - Activity & Security Audit Logs API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchAuditLogs ---
export async function fetchAuditLogs(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[Audit Logs API Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchAuditLogs ---
