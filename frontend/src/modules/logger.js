// ==========================================
// logger.js - User Activity & Security IP Logger (GMT+08)
// ==========================================
import { supabase } from '../../../backend/api/client.api.js';

// Cache client IP
let cachedClientIp = null;

// --- START getClientIp ---
export async function getClientIp() {
  if (cachedClientIp) return cachedClientIp;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      cachedClientIp = data.ip;
      return data.ip;
    }
  } catch (e) {
    console.warn('IP lookup fallback:', e);
  }
  return '127.0.0.1';
}
// --- END getClientIp ---

// --- START formatGMT8Date ---
export function formatGMT8Date(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila', // GMT+08 standard
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(new Date(date));
}
// --- END formatGMT8Date ---

// --- START logUserActivity ---
export async function logUserActivity({ 
  storeId = null, 
  userId = null, 
  actorRole = 'cashier', 
  actionType, 
  description, 
  entityType = null, 
  entityId = null, 
  amount = null 
}) {
  try {
    const ip = await getClientIp();
    const userAgent = navigator.userAgent;

    await supabase.from('activity_logs').insert({
      store_id: storeId,
      user_id: userId,
      actor_role: actorRole,
      action_type: actionType,
      description: description,
      ip_address: ip,
      user_agent: userAgent,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      amount: amount ? parseFloat(amount) : null
    });
  } catch (err) {
    console.warn('Failed to log activity:', err);
  }
}
// --- END logUserActivity ---
