import { supabase } from './client.api.js';

// Default initial support tickets
const DEFAULT_TICKETS = [
  {
    id: 101,
    store_id: 1,
    store_name: 'Jorgy Main POS',
    user_id: 'c101',
    user_name: 'Bessie Wilkerson',
    user_role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    title: 'Receipt printer printing blank pages',
    categories: ['Hardware / Printer', 'General Support'],
    status: 'Open',
    priority: 'High',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      { sender: 'user', sender_name: 'Bessie Wilkerson', text: 'Can you please help me to get my receipt printer working? It prints, but the paper is completely blank.', time: '10:05 AM', created_at: new Date(Date.now() - 3600000).toISOString() },
      { sender: 'support', sender_name: 'SuperAdmin Helpdesk', text: 'Hi Bessie! This usually happens if the thermal paper roll is loaded backward. Thermal paper only has the sensitive coating on one side. Can you try flipping the roll and running a test print?', time: '10:12 AM', created_at: new Date(Date.now() - 3000000).toISOString() }
    ]
  },
  {
    id: 102,
    store_id: 1,
    store_name: 'Jorgy Main POS',
    user_id: 'c102',
    user_name: 'Elissa Steamer',
    user_role: 'inventory_manager',
    avatar: null,
    title: 'POS database offline synchronization delay',
    categories: ['Stock Sync / DB'],
    status: 'Pending',
    priority: 'Medium',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      { sender: 'user', sender_name: 'Elissa Steamer', text: 'We had a 10-minute network cutout. The sales are back online but the dashboard is still showing old stock numbers.', time: 'Yesterday', created_at: new Date(Date.now() - 86400000).toISOString() },
      { sender: 'support', sender_name: 'SuperAdmin Helpdesk', text: 'Hi Elissa, offline logs sync automatically every 15 minutes to prevent network overload. Let us know if the values do not update soon!', time: 'Yesterday', created_at: new Date(Date.now() - 80000000).toISOString() }
    ]
  },
  {
    id: 103,
    store_id: 2,
    store_name: 'Downtown Mart Express',
    user_id: 'c103',
    user_name: 'Jeff Stewart',
    user_role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    title: 'Barcode scanner double scanning item logs',
    categories: ['Software Bug'],
    status: 'Open',
    priority: 'High',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    messages: [
      { sender: 'user', sender_name: 'Jeff Stewart', text: 'When we scan Milo 24g, it occasionally registers twice in the checkout cart list.', time: '2 days ago', created_at: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  {
    id: 104,
    store_id: 3,
    store_name: 'Boutique Corner Branch',
    user_id: 'c104',
    user_name: 'George Nguen',
    user_role: 'cashier',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    title: 'Promo discount code not applying to beverage items',
    categories: ['Sales / Billing'],
    status: 'Closed',
    priority: 'Low',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    messages: [
      { sender: 'user', sender_name: 'George Nguen', text: 'Can we get free games or apply code BEV10? It keeps returning invalid coupon code.', time: '3 days ago', created_at: new Date(Date.now() - 259200000).toISOString() },
      { sender: 'support', sender_name: 'SuperAdmin Helpdesk', text: 'Coupon BEV10 has expired on June 25th. You can try promo SUM26 instead.', time: '3 days ago', created_at: new Date(Date.now() - 250000000).toISOString() }
    ]
  },
  {
    id: 105,
    store_id: 1,
    store_name: 'Jorgy Main POS',
    user_id: 'c105',
    user_name: 'Mittie Burton',
    user_role: 'cashier',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
    title: 'Offline mode sales not syncing automatically',
    categories: ['Network / Offline', 'Stock Sync / DB'],
    status: 'Open',
    priority: 'Medium',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    messages: [
      { sender: 'user', sender_name: 'Mittie Burton', text: 'Our sales recorded during offline mode are still pending sync. Can we trigger it manually?', time: '4 days ago', created_at: new Date(Date.now() - 345600000).toISOString() },
      { sender: 'support', sender_name: 'SuperAdmin Helpdesk', text: "Hi Mittie! Yes, you can manually sync by clicking the 'Sync Logs' button under Settings -> Sync Settings. Try that and let us know if it works!", time: '4 days ago', created_at: new Date(Date.now() - 340000000).toISOString() }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'platform_support_tickets_data';

function getStoredTickets() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored tickets:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_TICKETS));
  return DEFAULT_TICKETS;
}

function saveStoredTickets(tickets) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
}

/**
 * Fetches support tickets. If storeId is provided, returns tickets for that store only (Client).
 * If storeId is null, returns all tickets (SuperAdmin).
 */
export async function fetchTickets(storeId = null) {
  try {
    const all = getStoredTickets();
    if (storeId !== null && storeId !== undefined && storeId !== '') {
      const filtered = all.filter(t => parseInt(t.store_id, 10) === parseInt(storeId, 10));
      return { success: true, data: filtered };
    }
    return { success: true, data: all };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Creates a new support ticket.
 */
export async function createTicket({ storeId, userId, userName, userRole, title, categories, priority, message }) {
  try {
    const all = getStoredTickets();
    const newId = (all.length > 0 ? Math.max(...all.map(t => t.id)) : 100) + 1;
    const storeName = parseInt(storeId, 10) === 1 ? 'Jorgy Main POS' : parseInt(storeId, 10) === 2 ? 'Downtown Mart Express' : 'Store #' + storeId;

    const newTicket = {
      id: newId,
      store_id: parseInt(storeId || '1', 10),
      store_name: storeName,
      user_id: userId || 'usr_' + Date.now(),
      user_name: userName || 'Client User',
      user_role: userRole || 'owner',
      avatar: null,
      title: title || 'Support Inquiry',
      categories: Array.isArray(categories) && categories.length ? categories : ['General Support'],
      status: 'Open',
      priority: priority || 'Medium',
      created_at: new Date().toISOString(),
      messages: [
        {
          sender: 'user',
          sender_name: userName || 'Client User',
          text: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created_at: new Date().toISOString()
        }
      ]
    };

    all.unshift(newTicket);
    saveStoredTickets(all);

    // Broadcast storage event for multi-tab realtime simulation
    window.dispatchEvent(new CustomEvent('platform:ticket:created', { detail: newTicket }));

    return { success: true, data: newTicket };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Appends a message to a ticket (from User or SuperAdmin Support).
 */
export async function sendTicketMessage({ ticketId, sender, senderName, text }) {
  try {
    const all = getStoredTickets();
    const ticket = all.find(t => t.id === parseInt(ticketId, 10));
    if (!ticket) throw new Error('Ticket not found');

    const newMsg = {
      sender: sender || 'support', // 'user' | 'support'
      sender_name: senderName || (sender === 'support' ? 'SuperAdmin Helpdesk' : 'Client Staff'),
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString()
    };

    ticket.messages.push(newMsg);
    saveStoredTickets(all);

    window.dispatchEvent(new CustomEvent('platform:ticket:message', {
      detail: { ticketId: parseInt(ticketId, 10), message: newMsg }
    }));

    return { success: true, data: newMsg, ticket };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates a ticket status (Open, Pending, Resolved, Closed).
 */
export async function updateTicketStatus(ticketId, status) {
  try {
    const all = getStoredTickets();
    const ticket = all.find(t => t.id === parseInt(ticketId, 10));
    if (!ticket) throw new Error('Ticket not found');

    ticket.status = status;
    saveStoredTickets(all);

    window.dispatchEvent(new CustomEvent('platform:ticket:updated', { detail: ticket }));
    return { success: true, data: ticket };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates a ticket priority (Low, Medium, High).
 */
export async function updateTicketPriority(ticketId, priority) {
  try {
    const all = getStoredTickets();
    const ticket = all.find(t => t.id === parseInt(ticketId, 10));
    if (!ticket) throw new Error('Ticket not found');

    ticket.priority = priority;
    saveStoredTickets(all);

    window.dispatchEvent(new CustomEvent('platform:ticket:updated', { detail: ticket }));
    return { success: true, data: ticket };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
