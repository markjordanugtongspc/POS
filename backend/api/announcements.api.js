// ==========================================
// announcements.api.js - System Announcements & Promo Banner API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchActiveAnnouncement ---
export async function fetchActiveAnnouncement() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Announcements API Error]:', err);
    return {
      success: true,
      data: {
        id: 1,
        title: 'Beta version',
        badge_text: 'Beta version',
        message: 'Preview the new Flowbite navigation! You can customize settings in your profile.',
        action_button_text: 'Turn off now',
        is_active: true
      }
    };
  }
}
// --- END fetchActiveAnnouncement ---

// --- START fetchAllAnnouncements ---
export async function fetchAllAnnouncements() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    return {
      success: true,
      data: [
        {
          id: 1,
          title: 'Flowbite Navigation Preview',
          badge_text: 'Beta version',
          message: 'Preview the new Flowbite navigation! You can customize settings in your profile.',
          action_button_text: 'Turn off now',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]
    };
  }
}
// --- END fetchAllAnnouncements ---

// --- START toggleAnnouncementActive ---
export async function toggleAnnouncementActive(announcementId, isActive) {
  try {
    // If activating, deactivate others first (only 1 active at a time)
    if (isActive) {
      await supabase
        .from('announcements')
        .update({ is_active: false })
        .neq('id', announcementId);
    }

    const { data, error } = await supabase
      .from('announcements')
      .update({ is_active: isActive })
      .eq('id', announcementId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('[Toggle Announcement Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END toggleAnnouncementActive ---

// --- START createAnnouncement ---
export async function createAnnouncement({ title, badgeText, message, actionText, actionUrl, isActive = true }) {
  try {
    if (isActive) {
      // Deactivate others first
      await supabase.from('announcements').update({ is_active: false }).neq('id', 0);
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        badge_text: badgeText || 'Announcement',
        message,
        action_button_text: actionText || 'Dismiss',
        action_button_url: actionUrl || null,
        is_active: isActive
      })
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('[Create Announcement Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END createAnnouncement ---
