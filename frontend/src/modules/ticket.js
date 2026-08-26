import { showSuccess, showError } from './modals.js';
import {
  fetchTickets,
  createTicket as apiCreateTicket,
  sendTicketMessage as apiSendMessage,
  updateTicketStatus as apiUpdateStatus,
  updateTicketPriority as apiUpdatePriority
} from '../../../backend/api/tickets.api.js';
import { subscribeToTicketMessages } from '../../../backend/api/realtime.api.js';

const availableCategories = [
  { name: 'Software Bug', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' },
  { name: 'Hardware / Printer', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400' },
  { name: 'Sales / Billing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400' },
  { name: 'Stock Sync / DB', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' },
  { name: 'Network / Offline', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400' },
  { name: 'General Support', color: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300' }
];

let clientTickets = [];
let adminTickets = [];
let activeClientTicketId = null;
let activeAdminTicketId = null;
let selectedCategories = [];
let currentAdminStatusFilter = 'All';

// ==========================================
// CLIENT SUPPORT CONTROLLER
// ==========================================
export async function initTicket() {
  const container = document.getElementById('tickets-list-container');
  if (!container) return; // Not on client support page

  // Inject Create Ticket Drawer HTML
  injectTicketDrawerHTML();

  // Load client store tickets
  const storeId = parseInt(localStorage.getItem('user_store_id') || localStorage.getItem('store_id') || '1', 10);
  const res = await fetchTickets(storeId);
  if (res.success) {
    clientTickets = res.data;
  }
  renderClientTicketCards(clientTickets);

  // Search & Category Filter
  const searchInput = document.getElementById('ticket-search-input');
  const categoryFilter = document.getElementById('ticket-category-filter');
  if (searchInput) searchInput.addEventListener('input', handleClientSearch);
  if (categoryFilter) categoryFilter.addEventListener('change', handleClientSearch);

  // Create Ticket Triggers
  const createTrigger = document.getElementById('btn-create-ticket-trigger');
  if (createTrigger) createTrigger.addEventListener('click', openTicketDrawer);

  const mobileCreateTrigger = document.getElementById('btn-create-ticket-mobile');
  if (mobileCreateTrigger) mobileCreateTrigger.addEventListener('click', openTicketDrawer);

  // Reply Form Submit
  const replyForm = document.getElementById('reply-form');
  if (replyForm) replyForm.addEventListener('submit', handleClientReplySubmit);

  // Mobile Back Button
  const backBtn = document.getElementById('btn-ticket-back');
  if (backBtn) backBtn.addEventListener('click', goBackToListClient);

  // Bind Drawer specific events
  bindDrawerEvents();

  // Listen to platform ticket events
  window.addEventListener('platform:ticket:created', (e) => {
    const newT = e.detail;
    if (newT && parseInt(newT.store_id, 10) === storeId) {
      if (!clientTickets.some(t => t.id === newT.id)) {
        clientTickets.unshift(newT);
        renderClientTicketCards(clientTickets);
      }
    }
  });

  window.addEventListener('platform:ticket:message', (e) => {
    const { ticketId, message } = e.detail;
    const target = clientTickets.find(t => t.id === ticketId);
    if (target) {
      target.messages.push(message);
      if (activeClientTicketId === ticketId) {
        renderClientMessages(target.messages);
      }
      renderClientTicketCards(clientTickets);
    }
  });

  window.addEventListener('platform:ticket:updated', (e) => {
    const updated = e.detail;
    const idx = clientTickets.findIndex(t => t.id === updated.id);
    if (idx !== -1) {
      clientTickets[idx] = updated;
      if (activeClientTicketId === updated.id) {
        selectClientTicket(updated.id);
      } else {
        renderClientTicketCards(clientTickets);
      }
    }
  });

  // Supabase realtime hook
  subscribeToTicketMessages(null, (newMsg) => {
    const target = clientTickets.find(t => t.id === Number(newMsg.ticket_id));
    if (target) {
      target.messages.push({
        sender: newMsg.sender_type || 'support',
        sender_name: newMsg.sender_name || 'Admin Helpdesk',
        text: newMsg.message,
        time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      if (activeClientTicketId === target.id) {
        renderClientMessages(target.messages);
      }
      renderClientTicketCards(clientTickets);
    }
  });
}

function renderClientTicketCards(ticketArray) {
  const container = document.getElementById('tickets-list-container');
  if (!container) return;

  container.innerHTML = '';

  if (ticketArray.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-neutral-400 dark:text-neutral-500 font-bold text-xs">
        No active support tickets found for your store.
      </div>
    `;
    return;
  }

  ticketArray.forEach(t => {
    const card = document.createElement('div');
    card.className = `group p-4 bg-neutral-50 dark:bg-[#16171d]/40 border cursor-pointer transition-all duration-200 ${activeClientTicketId === t.id
        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
        : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-350 dark:hover:border-emerald-850'
      } rounded-none`;
    card.dataset.id = t.id;

    const avatarHtml = t.avatar
      ? `<img class="w-10 h-10 rounded-full object-cover shrink-0" src="${t.avatar}" alt="${t.user_name || t.user}">`
      : `
        <div class="relative w-10 h-10 overflow-hidden bg-neutral-200 dark:bg-neutral-800 rounded-full shrink-0 flex items-center justify-center font-bold text-xs">
          ${(t.user_name || t.user || 'U').charAt(0)}
        </div>
      `;

    const tagsHtml = (t.categories || []).map(cat => {
      const info = availableCategories.find(c => c.name === cat) || { color: 'bg-neutral-150 text-neutral-800' };
      return `<span class="inline-block px-1.5 py-0.5 rounded-none text-[9px] font-extrabold uppercase tracking-wide ${info.color}">${cat}</span>`;
    }).join(' ');

    let statusColor = 'text-neutral-450';
    if (t.status === 'Open') statusColor = 'text-emerald-600 dark:text-emerald-450';
    else if (t.status === 'Pending') statusColor = 'text-yellow-600 dark:text-yellow-550';
    else if (t.status === 'Closed' || t.status === 'Resolved') statusColor = 'text-neutral-500 dark:text-neutral-400';

    const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;

    card.innerHTML = `
      <div class="flex gap-3">
        ${avatarHtml}
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start gap-2">
            <h4 class="text-xs font-black text-neutral-900 dark:text-white truncate group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">${t.user_name || t.user}</h4>
            <span class="text-[9px] text-neutral-400 dark:text-neutral-500 shrink-0 font-bold">${lastMsg?.time || 'Just now'}</span>
          </div>
          <p class="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 truncate font-bold"><span class="text-emerald-600 dark:text-emerald-450 font-black mr-1">#TCK-${t.id}</span> ${t.title}</p>
          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            ${tagsHtml}
            <span class="ms-auto text-[9px] font-black tracking-wider uppercase ${statusColor}">${t.status}</span>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => selectClientTicket(t.id));
    container.appendChild(card);
  });
}

function selectClientTicket(id) {
  activeClientTicketId = id;
  renderClientTicketCards(clientTickets);

  const t = clientTickets.find(ticket => ticket.id === id);
  if (!t) return;

  const placeholder = document.getElementById('ticket-placeholder-state');
  const detailView = document.getElementById('ticket-detail-view');

  if (window.innerWidth < 1024) {
    const paneLeft = document.getElementById('pane-left');
    const paneRight = document.getElementById('pane-right');
    if (paneLeft) paneLeft.classList.add('hidden');
    if (paneRight) {
      paneRight.classList.remove('hidden');
      paneRight.classList.add('flex');
    }
  }

  if (placeholder) placeholder.classList.add('hidden');
  if (detailView) detailView.classList.remove('hidden');

  const nameEl = document.getElementById('detail-user-name');
  const idEl = document.getElementById('detail-ticket-id');
  const boldTitleEl = document.getElementById('detail-ticket-title-bold');
  const avatarEl = document.getElementById('detail-user-avatar');
  const statusEl = document.getElementById('detail-status-badge');
  const priorityEl = document.getElementById('detail-priority-badge');

  if (nameEl) nameEl.textContent = `${t.user_name || t.user} (${t.store_name || 'Store Merchant'})`;
  if (idEl) idEl.textContent = `#TCK-${t.id}`;
  if (boldTitleEl) boldTitleEl.textContent = t.title;

  if (avatarEl) {
    if (t.avatar) {
      avatarEl.innerHTML = `<img class="w-full h-full rounded-full object-cover" src="${t.avatar}">`;
    } else {
      avatarEl.innerHTML = `<div class="w-full h-full rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs dark:text-neutral-400 font-black">${(t.user_name || t.user || 'U').charAt(0)}</div>`;
    }
  }

  if (statusEl) {
    statusEl.textContent = t.status;
    statusEl.className = `px-2.5 py-1 text-[9px] font-black tracking-wider uppercase rounded-none ${t.status === 'Open'
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/20'
        : t.status === 'Pending'
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-500 border border-amber-200/20'
          : 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-300'
      }`;
  }

  if (priorityEl) {
    priorityEl.textContent = t.priority;
    priorityEl.className = `px-2.5 py-1 text-[9px] font-black tracking-wider uppercase rounded-none ${t.priority === 'High'
        ? 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white border border-emerald-500'
        : t.priority === 'Medium'
          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200/20'
          : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-300/30'
      }`;
  }

  renderClientMessages(t.messages || []);
}

function renderClientMessages(messages) {
  const container = document.getElementById('detail-messages-container');
  if (!container) return;

  container.innerHTML = '';
  messages.forEach(msg => {
    const wrapper = document.createElement('div');
    const isUser = msg.sender === 'user';
    wrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;

    const bubbleStyle = isUser
      ? 'bg-emerald-600 text-white shadow-xs rounded-2xl rounded-br-none'
      : 'bg-white dark:bg-[#16171d] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-2xl rounded-bl-none';

    wrapper.innerHTML = `
      <div class="max-w-[80%] p-3 text-xs leading-relaxed ${bubbleStyle}">
        <div class="flex items-center gap-1.5 mb-1 text-[10px] font-bold ${isUser ? 'text-emerald-100 justify-end' : 'text-rose-600 dark:text-rose-400'}">
          ${!isUser ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span> Admin Helpdesk' : 'You (Staff)'}
        </div>
        <p class="font-medium">${msg.text}</p>
        <span class="block text-[9px] mt-1 text-right font-mono ${isUser ? 'text-emerald-200' : 'text-neutral-400 dark:text-neutral-500'}">${msg.time || 'Just now'}</span>
      </div>
    `;
    container.appendChild(wrapper);
  });

  container.scrollTop = container.scrollHeight;
}

async function handleClientReplySubmit(e) {
  e.preventDefault();
  const input = document.getElementById('reply-input');
  if (!input || !input.value.trim() || !activeClientTicketId) return;

  const currentUserName = localStorage.getItem('user_name') || 'Client Staff';
  const res = await apiSendMessage({
    ticketId: activeClientTicketId,
    sender: 'user',
    senderName: currentUserName,
    text: input.value.trim()
  });

  if (res.success) {
    input.value = '';
    const t = clientTickets.find(ticket => ticket.id === activeClientTicketId);
    if (t) {
      renderClientMessages(t.messages);
      renderClientTicketCards(clientTickets);
    }
  }
}

function handleClientSearch() {
  const searchInput = document.getElementById('ticket-search-input');
  const categoryFilter = document.getElementById('ticket-category-filter');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCat = categoryFilter ? categoryFilter.value : 'All';

  const filtered = clientTickets.filter(t => {
    const matchesSearch = !query ||
      (t.user_name || t.user || '').toLowerCase().includes(query) ||
      (t.title || '').toLowerCase().includes(query) ||
      String(t.id).includes(query);

    const matchesCategory = selectedCat === 'All' ||
      (t.categories || []).includes(selectedCat);

    return matchesSearch && matchesCategory;
  });

  renderClientTicketCards(filtered);
}

function goBackToListClient() {
  activeClientTicketId = null;
  renderClientTicketCards(clientTickets);

  const paneLeft = document.getElementById('pane-left');
  const paneRight = document.getElementById('pane-right');
  const placeholder = document.getElementById('ticket-placeholder-state');
  const detailView = document.getElementById('ticket-detail-view');

  if (paneLeft) paneLeft.classList.remove('hidden');
  if (placeholder) placeholder.classList.remove('hidden');
  if (detailView) detailView.classList.add('hidden');

  if (paneRight && window.innerWidth < 1024) {
    paneRight.classList.remove('flex');
    paneRight.classList.add('hidden');
  }
}

function injectTicketDrawerHTML() {
  if (document.getElementById('ticket-drawer')) return;

  const drawerHTML = `
    <div id="ticket-drawer-backdrop" class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-[60] hidden transition-opacity opacity-0"></div>

    <div id="ticket-drawer"
      class="fixed inset-0 lg:inset-auto lg:top-0 lg:bottom-0 lg:right-0 z-[70] p-5 lg:p-6 overflow-y-auto transition-transform translate-x-full bg-white dark:bg-[#16171d] w-full lg:w-[420px] shadow-2xl flex flex-col font-sans"
      tabindex="-1">
      
      <div class="flex items-center pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <button type="button" id="btn-close-ticket-drawer"
          class="text-neutral-900 dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none cursor-pointer mr-3 shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h5 class="text-lg font-black text-neutral-900 dark:text-white tracking-tight flex-1 uppercase">Create Support Ticket</h5>
      </div>

      <form id="create-ticket-form" class="space-y-3 flex-1 flex flex-col">
        <div>
          <label for="input-ticket-title" class="block mb-1 text-[11px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Ticket Title</label>
          <input type="text" id="input-ticket-title" required
            class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-xs block w-full p-2.5 font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
            placeholder="Brief summary of the issue...">
        </div>

        <div class="relative">
          <label class="block mb-1 text-[11px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Category</label>
          <button id="dropdownCategoryButton" type="button"
            class="inline-flex items-center justify-between text-left text-neutral-500 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs w-full p-2.5 font-bold cursor-pointer">
            <div id="selected-categories-pills" class="flex flex-wrap gap-1 flex-1 min-w-0 pr-2">
              <span class="text-neutral-400">Select categories...</span>
            </div>
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7"/></svg>
          </button>

          <div id="dropdownCategoryMenu" class="z-50 hidden absolute mt-1 bg-white dark:bg-[#16171d] border border-neutral-200 dark:border-neutral-800 shadow-xl w-full p-2 max-h-60 flex flex-col">
            <ul id="category-items-list" class="flex-1 p-1 text-xs space-y-1 overflow-y-auto custom-scrollbar">
              ${availableCategories.map((cat, idx) => `
                <li class="w-full flex items-center p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <label for="cat-check-${idx}" class="w-full flex items-center justify-between cursor-pointer">
                    <span class="inline-flex items-center font-bold text-neutral-800 dark:text-neutral-200">
                      <span class="w-2.5 h-2.5 rounded-full ${cat.color.split(' ')[0]} me-2 shrink-0"></span>
                      ${cat.name}
                    </span>
                    <input id="cat-check-${idx}" type="checkbox" value="${cat.name}"
                      class="category-checkbox w-4 h-4 text-emerald-600 bg-neutral-100 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer">
                  </label>
                </li>
              `).join('')}
            </ul>
            <div class="border-t border-neutral-100 dark:border-neutral-800 p-1.5 shrink-0">
              <button id="btn-category-select-apply" type="button"
                class="w-full text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-[11px] py-1.5 cursor-pointer">
                Apply Categories
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label for="select-ticket-priority" class="block mb-1 text-[11px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Priority</label>
            <select id="select-ticket-priority"
              class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-xs block w-full p-2 font-bold cursor-pointer">
              <option value="High">High</option>
              <option value="Medium" selected>Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label class="block mb-1 text-[11px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Store Merchant</label>
            <input type="text" readonly value="${localStorage.getItem('store_name') || 'Jorgy Main POS'}"
              class="bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-neutral-500 text-xs block w-full p-2 font-bold select-none cursor-not-allowed">
          </div>
        </div>

        <div>
          <label for="input-ticket-message" class="block mb-1 text-[11px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Describe Problem</label>
          <textarea id="input-ticket-message" rows="4" required
            class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-xs block w-full p-2.5 font-medium outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Explain what happened, error message, or steps to reproduce..."></textarea>
        </div>

        <div class="pt-3 mt-auto shrink-0">
          <button type="submit" id="btn-submit-ticket"
            class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-xs cursor-pointer">
            Submit Support Request
          </button>
        </div>
      </form>
    </div>
  `;

  const template = document.createElement('template');
  template.innerHTML = drawerHTML;
  document.body.appendChild(template.content);
}

function openTicketDrawer() {
  const drawer = document.getElementById('ticket-drawer');
  const backdrop = document.getElementById('ticket-drawer-backdrop');
  if (drawer && backdrop) {
    backdrop.classList.remove('hidden');
    backdrop.offsetHeight;
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
  }
}

function closeTicketDrawer() {
  const drawer = document.getElementById('ticket-drawer');
  const backdrop = document.getElementById('ticket-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    setTimeout(() => { backdrop.classList.add('hidden'); }, 300);
  }
  const form = document.getElementById('create-ticket-form');
  if (form) form.reset();
  selectedCategories = [];
  updateCategoryDropdownButton();
}

function updateCategoryDropdownButton() {
  const selectedContainer = document.getElementById('selected-categories-pills');
  if (!selectedContainer) return;

  if (selectedCategories.length === 0) {
    selectedContainer.innerHTML = `<span class="text-neutral-400 font-bold select-none">Select categories...</span>`;
    return;
  }

  selectedContainer.innerHTML = selectedCategories.map(cat => {
    const info = availableCategories.find(c => c.name === cat) || { color: 'bg-neutral-100 text-neutral-800' };
    return `
      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase ${info.color}">
        ${cat}
      </span>
    `;
  }).join(' ');
}

function bindDrawerEvents() {
  const closeBtn = document.getElementById('btn-close-ticket-drawer');
  const backdrop = document.getElementById('ticket-drawer-backdrop');
  const form = document.getElementById('create-ticket-form');

  if (closeBtn) closeBtn.addEventListener('click', closeTicketDrawer);
  if (backdrop) backdrop.addEventListener('click', closeTicketDrawer);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('input-ticket-title');
      const prioritySelect = document.getElementById('select-ticket-priority');
      const messageTextarea = document.getElementById('input-ticket-message');

      if (!titleInput || !messageTextarea) return;

      const storeId = parseInt(localStorage.getItem('user_store_id') || localStorage.getItem('store_id') || '1', 10);
      const userId = localStorage.getItem('user_id') || 'usr_client';
      const userName = localStorage.getItem('user_name') || 'Client Staff';
      const userRole = localStorage.getItem('user_role') || 'owner';

      const res = await apiCreateTicket({
        storeId,
        userId,
        userName,
        userRole,
        title: titleInput.value.trim(),
        categories: selectedCategories.length > 0 ? [...selectedCategories] : ['General Support'],
        priority: prioritySelect.value,
        message: messageTextarea.value.trim()
      });

      if (res.success) {
        closeTicketDrawer();
        selectClientTicket(res.data.id);
        showSuccess('Ticket Submitted', `Ticket #TCK-${res.data.id} has been submitted to Admin Helpdesk.`);
      } else {
        showError('Submission Failed', res.error || 'Could not log support ticket.');
      }
    });
  }

  const categoryBtn = document.getElementById('dropdownCategoryButton');
  const categoryMenu = document.getElementById('dropdownCategoryMenu');

  if (categoryBtn && categoryMenu) {
    categoryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      categoryMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!categoryMenu.contains(e.target) && e.target !== categoryBtn && !categoryBtn.contains(e.target)) {
        categoryMenu.classList.add('hidden');
      }
    });
  }

  const checkBoxes = document.querySelectorAll('.category-checkbox');
  checkBoxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const val = cb.value;
      if (cb.checked) {
        if (!selectedCategories.includes(val)) selectedCategories.push(val);
      } else {
        selectedCategories = selectedCategories.filter(c => c !== val);
      }
      updateCategoryDropdownButton();
    });
  });

  const applyBtn = document.getElementById('btn-category-select-apply');
  if (applyBtn && categoryMenu) {
    applyBtn.addEventListener('click', () => {
      categoryMenu.classList.add('hidden');
    });
  }
}

// ==========================================
// ADMIN MULTI-TENANT HELPDESK CONTROLLER
// ==========================================
export async function initAdminTicket() {
  const container = document.getElementById('admin-tickets-list-container');
  if (!container) return; // Not on admin support page

  // Fetch all platform tickets
  const res = await fetchTickets(null);
  if (res.success) {
    adminTickets = res.data;
  }
  updateAdminStats();
  renderAdminTicketCards(adminTickets);

  // Search & Filter listeners
  const searchInput = document.getElementById('admin-ticket-search-input');
  const storeFilter = document.getElementById('admin-ticket-store-filter');
  const categoryFilter = document.getElementById('admin-ticket-category-filter');

  if (searchInput) searchInput.addEventListener('input', handleAdminFilters);
  if (storeFilter) storeFilter.addEventListener('change', handleAdminFilters);
  if (categoryFilter) categoryFilter.addEventListener('change', handleAdminFilters);

  // Status Tabs
  const statusTabs = document.querySelectorAll('.admin-status-tab');
  statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      statusTabs.forEach(t => {
        t.className = 'admin-status-tab cursor-pointer px-2 py-0.5 font-bold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800';
      });
      tab.className = 'admin-status-tab cursor-pointer px-2 py-0.5 font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800';
      currentAdminStatusFilter = tab.getAttribute('data-status') || 'All';
      handleAdminFilters();
    });
  });

  // Reply Form Submit
  const replyForm = document.getElementById('admin-reply-form');
  if (replyForm) replyForm.addEventListener('submit', handleAdminReplySubmit);

  // Status & Priority Dropdowns in Header
  const statusSelect = document.getElementById('admin-detail-status-select');
  const prioritySelect = document.getElementById('admin-detail-priority-select');

  if (statusSelect) {
    statusSelect.addEventListener('change', async () => {
      if (!activeAdminTicketId) return;
      await apiUpdateStatus(activeAdminTicketId, statusSelect.value);
      updateAdminStats();
    });
  }

  if (prioritySelect) {
    prioritySelect.addEventListener('change', async () => {
      if (!activeAdminTicketId) return;
      await apiUpdatePriority(activeAdminTicketId, prioritySelect.value);
    });
  }

  // Mobile back
  const backBtn = document.getElementById('btn-admin-ticket-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      activeAdminTicketId = null;
      renderAdminTicketCards(adminTickets);
      const paneLeft = document.getElementById('pane-left');
      const paneRight = document.getElementById('pane-right');
      const placeholder = document.getElementById('admin-ticket-placeholder-state');
      const detailView = document.getElementById('admin-ticket-detail-view');
      if (paneLeft) paneLeft.classList.remove('hidden');
      if (placeholder) placeholder.classList.remove('hidden');
      if (detailView) detailView.classList.add('hidden');
      if (paneRight && window.innerWidth < 1024) {
        paneRight.classList.remove('flex');
        paneRight.classList.add('hidden');
      }
    });
  }

  // Platform event listeners for realtime
  window.addEventListener('platform:ticket:created', (e) => {
    const newT = e.detail;
    if (newT && !adminTickets.some(t => t.id === newT.id)) {
      adminTickets.unshift(newT);
      updateAdminStats();
      handleAdminFilters();
    }
  });

  window.addEventListener('platform:ticket:message', (e) => {
    const { ticketId, message } = e.detail;
    const target = adminTickets.find(t => t.id === ticketId);
    if (target) {
      target.messages.push(message);
      if (activeAdminTicketId === ticketId) {
        renderAdminMessages(target.messages);
      }
      handleAdminFilters();
    }
  });

  window.addEventListener('platform:ticket:updated', (e) => {
    const updated = e.detail;
    const idx = adminTickets.findIndex(t => t.id === updated.id);
    if (idx !== -1) {
      adminTickets[idx] = updated;
      updateAdminStats();
      if (activeAdminTicketId === updated.id) {
        selectAdminTicket(updated.id);
      } else {
        handleAdminFilters();
      }
    }
  });
}

function updateAdminStats() {
  const openCount = adminTickets.filter(t => t.status === 'Open').length;
  const pendingCount = adminTickets.filter(t => t.status === 'Pending').length;
  const countOpenEl = document.getElementById('count-open');
  const countPendingEl = document.getElementById('count-pending');
  if (countOpenEl) countOpenEl.textContent = String(openCount);
  if (countPendingEl) countPendingEl.textContent = String(pendingCount);
}

function renderAdminTicketCards(ticketArray) {
  const container = document.getElementById('admin-tickets-list-container');
  if (!container) return;

  container.innerHTML = '';

  if (ticketArray.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-neutral-400 dark:text-neutral-500 font-bold text-xs">
        No support tickets match the selected filters.
      </div>
    `;
    return;
  }

  ticketArray.forEach(t => {
    const card = document.createElement('div');
    card.className = `p-3 bg-white dark:bg-[#16171d] border cursor-pointer transition shadow-2xs ${
      activeAdminTicketId === t.id
        ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 ring-1 ring-rose-500/30'
        : 'border-neutral-200 dark:border-neutral-800 hover:border-rose-300 dark:hover:border-rose-800'
    }`;

    const tagsHtml = (t.categories || []).map(cat => {
      const info = availableCategories.find(c => c.name === cat) || { color: 'bg-neutral-100 text-neutral-700' };
      return `<span class="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase ${info.color}">${cat}</span>`;
    }).join(' ');

    let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400';
    if (t.status === 'Pending') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400';
    else if (t.status === 'Resolved' || t.status === 'Closed') statusBadge = 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400';

    const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-1.5">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] font-mono font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-1 py-0.5 border border-rose-200 dark:border-rose-800">#TCK-${t.id}</span>
          <span class="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 truncate max-w-[130px]">${t.store_name || 'Store #' + t.store_id}</span>
        </div>
        <span class="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">${lastMsg?.time || 'Just now'}</span>
      </div>

      <h4 class="text-xs font-black text-neutral-900 dark:text-white truncate mb-1">${t.title}</h4>
      <p class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">${lastMsg ? lastMsg.text : 'No messages yet.'}</p>

      <div class="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <div class="flex items-center gap-1 flex-wrap">
          ${tagsHtml}
        </div>
        <span class="px-1.5 py-0.5 text-[9px] font-black uppercase border ${statusBadge}">${t.status}</span>
      </div>
    `;

    card.addEventListener('click', () => selectAdminTicket(t.id));
    container.appendChild(card);
  });
}

function selectAdminTicket(id) {
  activeAdminTicketId = id;
  renderAdminTicketCards(adminTickets);

  const t = adminTickets.find(ticket => ticket.id === id);
  if (!t) return;

  const placeholder = document.getElementById('admin-ticket-placeholder-state');
  const detailView = document.getElementById('admin-ticket-detail-view');

  if (window.innerWidth < 1024) {
    const paneLeft = document.getElementById('pane-left');
    const paneRight = document.getElementById('pane-right');
    if (paneLeft) paneLeft.classList.add('hidden');
    if (paneRight) {
      paneRight.classList.remove('hidden');
      paneRight.classList.add('flex');
    }
  }

  if (placeholder) placeholder.classList.add('hidden');
  if (detailView) detailView.classList.remove('hidden');

  const idEl = document.getElementById('admin-detail-ticket-id');
  const storeBadgeEl = document.getElementById('admin-detail-store-badge');
  const titleEl = document.getElementById('admin-detail-ticket-title');
  const userNameEl = document.getElementById('admin-detail-user-name');
  const timeEl = document.getElementById('admin-detail-time');
  const statusSelect = document.getElementById('admin-detail-status-select');
  const prioritySelect = document.getElementById('admin-detail-priority-select');

  if (idEl) idEl.textContent = `#TCK-${t.id}`;
  if (storeBadgeEl) storeBadgeEl.textContent = `${t.store_name || 'Store #' + t.store_id}`;
  if (titleEl) titleEl.textContent = t.title;
  if (userNameEl) userNameEl.textContent = `${t.user_name || t.user} (${t.user_role || 'Staff'})`;
  if (timeEl) timeEl.textContent = new Date(t.created_at || Date.now()).toLocaleDateString();

  if (statusSelect) statusSelect.value = t.status || 'Open';
  if (prioritySelect) prioritySelect.value = t.priority || 'Medium';

  renderAdminMessages(t.messages || []);
}

function renderAdminMessages(messages) {
  const container = document.getElementById('admin-detail-messages-container');
  if (!container) return;

  container.innerHTML = '';
  messages.forEach(msg => {
    const wrapper = document.createElement('div');
    const isSupport = msg.sender === 'support';
    wrapper.className = `flex ${isSupport ? 'justify-end' : 'justify-start'} mb-3.5`;

    const bubbleStyle = isSupport
      ? 'bg-rose-600 text-white shadow-xs rounded-2xl rounded-br-none'
      : 'bg-white dark:bg-[#16171d] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl rounded-bl-none shadow-xs';

    wrapper.innerHTML = `
      <div class="max-w-[80%] p-3 text-xs leading-relaxed ${bubbleStyle}">
        <div class="flex items-center gap-1.5 mb-1 text-[10px] font-bold ${isSupport ? 'text-rose-100 justify-end' : 'text-emerald-600 dark:text-emerald-400'}">
          ${!isSupport ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Client Staff' : 'You (Admin Helpdesk)'}
        </div>
        <p class="font-medium">${msg.text}</p>
        <span class="block text-[9px] mt-1 text-right font-mono ${isSupport ? 'text-rose-200' : 'text-neutral-400 dark:text-neutral-500'}">${msg.time || 'Just now'}</span>
      </div>
    `;
    container.appendChild(wrapper);
  });

  container.scrollTop = container.scrollHeight;
}

async function handleAdminReplySubmit(e) {
  e.preventDefault();
  const input = document.getElementById('admin-reply-input');
  if (!input || !input.value.trim() || !activeAdminTicketId) return;

  const res = await apiSendMessage({
    ticketId: activeAdminTicketId,
    sender: 'support',
    senderName: 'Admin Helpdesk',
    text: input.value.trim()
  });

  if (res.success) {
    input.value = '';
    const t = adminTickets.find(ticket => ticket.id === activeAdminTicketId);
    if (t) {
      renderAdminMessages(t.messages);
      handleAdminFilters();
    }
  }
}

function handleAdminFilters() {
  const searchInput = document.getElementById('admin-ticket-search-input');
  const storeFilter = document.getElementById('admin-ticket-store-filter');
  const categoryFilter = document.getElementById('admin-ticket-category-filter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedStore = storeFilter ? storeFilter.value : 'All';
  const selectedCat = categoryFilter ? categoryFilter.value : 'All';

  const filtered = adminTickets.filter(t => {
    const matchesSearch = !query ||
      (t.user_name || t.user || '').toLowerCase().includes(query) ||
      (t.title || '').toLowerCase().includes(query) ||
      (t.store_name || '').toLowerCase().includes(query) ||
      String(t.id).includes(query);

    const matchesStore = selectedStore === 'All' || String(t.store_id) === String(selectedStore);
    const matchesCategory = selectedCat === 'All' || (t.categories || []).includes(selectedCat);
    const matchesStatus = currentAdminStatusFilter === 'All' || t.status === currentAdminStatusFilter;

    return matchesSearch && matchesStore && matchesCategory && matchesStatus;
  });

  renderAdminTicketCards(filtered);
}
