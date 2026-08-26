// ==========================================
// client.api.js - Central Supabase Client & Connection Handler
// ==========================================
import { createClient } from '@supabase/supabase-js';

// Environment variables provided securely by Vite via .env (never hardcode secret keys in source files)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Supabase Error] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env');
}

// --- START initSupabaseClient ---
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
// --- END initSupabaseClient ---
