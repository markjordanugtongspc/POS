// ==========================================
// realtime.api.js - Centralized Supabase Realtime Channels Manager
// ==========================================
import { supabase } from './client.api.js';

/**
 * Subscribes to Realtime changes on ALL stores (SuperAdmin).
 * @param {Function} onStoreChange
 */
export function subscribeToAllStores(onStoreChange) {
  const channel = supabase
    .channel('realtime-all-stores')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'stores'
      },
      (payload) => {
        if (typeof onStoreChange === 'function') {
          onStoreChange(payload);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribes to Realtime changes on 'stores' table for a specific store.
 * Automatically syncs store subscription tier and paid status live across client tabs.
 * @param {number|string} storeId
 * @param {Function} onUpdate
 */
export function subscribeToStoreTier(storeId, onUpdate) {
  const targetStoreId = parseInt(storeId || '1', 10);
  const channel = supabase
    .channel(`realtime-store-tier-${targetStoreId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'stores'
      },
      (payload) => {
        const updatedStore = payload.new;
        if (!updatedStore) return;
        
        const currentStoreId = parseInt(localStorage.getItem('user_store_id') || localStorage.getItem('store_id') || String(targetStoreId), 10);
        if (parseInt(updatedStore.id, 10) === currentStoreId) {
          localStorage.setItem('user_plan', updatedStore.plan_tier || 'free');
          localStorage.setItem('store_paid', String(updatedStore.is_paid));
          localStorage.setItem('store_id', String(updatedStore.id));
          localStorage.setItem('user_store_id', String(updatedStore.id));
          
          if (typeof onUpdate === 'function') {
            onUpdate(updatedStore);
          }
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribes to Realtime changes on 'users' table.
 * @param {Function} onUserChange
 */
export function subscribeToUsers(onUserChange) {
  const channel = supabase
    .channel('realtime-platform-users')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users'
      },
      (payload) => {
        if (typeof onUserChange === 'function') {
          onUserChange(payload);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribes to Realtime changes on 'transactions' table.
 * @param {Function} onNewTransaction
 */
export function subscribeToTransactions(onNewTransaction) {
  const channel = supabase
    .channel('realtime-transactions')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions'
      },
      (payload) => {
        if (typeof onNewTransaction === 'function') {
          onNewTransaction(payload.new);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribes to Realtime changes on 'products' table (Insert, Update, Delete).
 * @param {Function} onProductChange
 */
export function subscribeToProducts(onProductChange) {
  const channel = supabase
    .channel('realtime-products')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        if (typeof onProductChange === 'function') {
          onProductChange(payload);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribes to Realtime changes on 'announcements' table.
 * @param {Function} onAnnouncementChange
 */
export function subscribeToAnnouncements(onAnnouncementChange) {
  const channel = supabase
    .channel('realtime-announcements')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'announcements'
      },
      (payload) => {
        if (typeof onAnnouncementChange === 'function') {
          onAnnouncementChange(payload);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribes to Realtime changes on 'ticket_messages' table for live support chat.
 * @param {number|string} ticketId
 * @param {Function} onNewMessage
 */
export function subscribeToTicketMessages(ticketId, onNewMessage) {
  const channel = supabase
    .channel(`realtime-ticket-messages-${ticketId || 'all'}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_messages',
        filter: ticketId ? `ticket_id=eq.${ticketId}` : undefined
      },
      (payload) => {
        if (typeof onNewMessage === 'function') {
          onNewMessage(payload.new);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribes to Realtime changes on 'activity_logs' table (SuperAdmin live audit).
 * @param {Function} onNewLog
 */
export function subscribeToAuditLogs(onNewLog) {
  const channel = supabase
    .channel('realtime-activity-logs')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs'
      },
      (payload) => {
        if (typeof onNewLog === 'function') {
          onNewLog(payload.new);
        }
      }
    )
    .subscribe();

  return channel;
}
