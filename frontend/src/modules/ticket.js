import Swal from 'sweetalert2';
import { showSuccess } from './modals.js';

// Mock Tickets Database
let tickets = [
  {
    id: 101,
    user: 'Bessie Wilkerson',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    title: 'Receipt printer printing blank pages',
    categories: ['Hardware / Printer', 'General Support'],
    status: 'Open',
    priority: 'High',
    messages: [
      { sender: 'user', text: 'Can you please help me to get my receipt printer working? It prints, but the paper is completely blank.', time: '10:05 AM' },
      { sender: 'support', text: 'Hi Bessie! This usually happens if the thermal paper roll is loaded backward. Thermal paper only has the sensitive coating on one side. Can you try flipping the roll and running a test print?', time: '10:12 AM' }
    ]
  },
  {
    id: 102,
    user: 'Elissa Steamer',
    avatar: null,
    title: 'POS database offline synchronization delay',
    categories: ['Stock Sync / DB'],
    status: 'Pending',
    priority: 'Medium',
    messages: [
      { sender: 'user', text: 'We had a 10-minute network cutout. The sales are back online but the dashboard is still showing old stock numbers.', time: 'Yesterday' },
      { sender: 'support', text: 'Hi Elissa, offline logs sync automatically every 15 minutes to prevent network overload. Let us know if the values do not update soon!', time: 'Yesterday' }
    ]
  },
  {
    id: 103,
    user: 'Jeff Stewart',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    title: 'Barcode scanner double scanning item logs',
    categories: ['Software Bug'],
    status: 'Open',
    priority: 'High',
    messages: [
      { sender: 'user', text: 'When we scan Milo 24g, it occasionally registers twice in the checkout cart list.', time: '2 days ago' }
    ]
  },
  {
    id: 104,
    user: 'George Nguen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    title: 'Promo discount code not applying to beverage items',
    categories: ['Sales / Billing'],
    status: 'Closed',
    priority: 'Low',
    messages: [
      { sender: 'user', text: 'Can we get free games or apply code BEV10? It keeps returning invalid coupon code.', time: '3 days ago' },
      { sender: 'support', text: 'Coupon BEV10 has expired on June 25th. You can try promo SUM26 instead.', time: '3 days ago' }
    ]
  },
  {
    id: 105,
    user: 'Mittie Burton',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
    title: 'Offline mode sales not syncing automatically',
    categories: ['Network / Offline', 'Stock Sync / DB'],
    status: 'Open',
    priority: 'Medium',
    messages: [
      { sender: 'user', text: 'Our sales recorded during offline mode are still pending sync. Can we trigger it manually?', time: '4 days ago' },
      { sender: 'support', text: "Hi Mittie! Yes, you can manually sync by clicking the 'Sync Logs' button under Settings -> Sync Settings. Try that and let us know if it works!", time: '4 days ago' }
    ]
  }
];

const availableCategories = [
  { name: 'Software Bug', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' },
  { name: 'Hardware / Printer', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400' },
  { name: 'Sales / Billing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400' },
  { name: 'Stock Sync / DB', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' },
  { name: 'Network / Offline', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400' },
  { name: 'General Support', color: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300' }
];

let activeTicketId = null;
let selectedCategories = [];

// Initialize Support Module
export function initTicket() {
  const container = document.getElementById('tickets-list-container');
  if (!container) return; // Not on support page

  // Inject Drawer HTML
  injectTicketDrawerHTML();

  // Initial render of cards
  renderTicketCards(tickets);

  // Bind Search Input and Category Filter
  const searchInput = document.getElementById('ticket-search-input');
  const categoryFilter = document.getElementById('ticket-category-filter');
  
  if (searchInput) {
    searchInput.addEventListener('input', handleTicketSearch);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', handleTicketSearch);
  }

  // Bind Create Drawer Toggle
  const createTrigger = document.getElementById('btn-create-ticket-trigger');
  if (createTrigger) {
    createTrigger.addEventListener('click', openTicketDrawer);
  }

  const mobileCreateTrigger = document.getElementById('btn-create-ticket-mobile');
  if (mobileCreateTrigger) {
    mobileCreateTrigger.addEventListener('click', openTicketDrawer);
  }

  // Bind Reply Form Submit
  const replyForm = document.getElementById('reply-form');
  if (replyForm) {
    replyForm.addEventListener('submit', handleReplySubmit);
  }

  // Bind Mobile Back Button
  const backBtn = document.getElementById('btn-ticket-back');
  if (backBtn) {
    backBtn.addEventListener('click', goBackToList);
  }

  // Bind Drawer specific events
  bindDrawerEvents();
}

// Render ticket cards inside left list pane
function renderTicketCards(ticketArray) {
  const container = document.getElementById('tickets-list-container');
  if (!container) return;

  container.innerHTML = '';

  if (ticketArray.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-neutral-450 dark:text-neutral-500 font-bold text-xs">
        No tickets found.
      </div>
    `;
    return;
  }

  ticketArray.forEach(t => {
    const card = document.createElement('div');
    card.className = `group p-4 bg-neutral-50 dark:bg-[#16171d]/40 border cursor-pointer transition-all duration-200 ${
      activeTicketId === t.id 
        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10' 
        : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-350 dark:hover:border-emerald-850'
    } rounded-none`;
    card.dataset.id = t.id;

    // Avatar HTML
    const avatarHtml = t.avatar 
      ? `<img class="w-10 h-10 rounded-full object-cover shrink-0" src="${t.avatar}" alt="${t.user}">`
      : `
        <div class="relative w-10 h-10 overflow-hidden bg-neutral-200 dark:bg-neutral-800 rounded-full shrink-0">
          <svg class="absolute w-12 h-12 text-neutral-400 dark:text-neutral-500 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
        </div>
      `;

    // Category Tags
    const tagsHtml = t.categories.map(cat => {
      const info = availableCategories.find(c => c.name === cat) || { color: 'bg-neutral-150 text-neutral-800' };
      return `<span class="inline-block px-1.5 py-0.5 rounded-none text-[9px] font-extrabold uppercase tracking-wide ${info.color}">${cat}</span>`;
    }).join(' ');

    // Color Coding status in card list
    let statusColor = 'text-neutral-450';
    if (t.status === 'Open') statusColor = 'text-emerald-600 dark:text-emerald-450';
    else if (t.status === 'Pending') statusColor = 'text-yellow-600 dark:text-yellow-550';
    else if (t.status === 'Closed') statusColor = 'text-red-700 dark:text-red-500';

    card.innerHTML = `
      <div class="flex gap-3">
        ${avatarHtml}
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start gap-2">
            <h4 class="text-xs font-black text-neutral-900 dark:text-white truncate group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">${t.user}</h4>
            <span class="text-[9px] text-neutral-400 dark:text-neutral-500 shrink-0 font-bold">${t.messages[t.messages.length - 1]?.time || 'Just now'}</span>
          </div>
          <p class="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 truncate font-bold"><span class="text-emerald-600 dark:text-emerald-450 font-black mr-1">TKT-${t.id}</span> ${t.title}</p>
          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            ${tagsHtml}
            <span class="ms-auto text-[9px] font-black tracking-wider uppercase ${statusColor}">${t.status}</span>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => selectTicket(t.id));
    container.appendChild(card);
  });
}

// Select ticket to view details on right pane
function selectTicket(id) {
  activeTicketId = id;
  renderTicketCards(tickets); // Redraw list active state

  const t = tickets.find(ticket => ticket.id === id);
  if (!t) return;

  const placeholder = document.getElementById('ticket-placeholder-state');
  const detailView = document.getElementById('ticket-detail-view');
  
  // Mobile Toggling: only hide left pane list and show right pane on screens narrower than 1024px (mobile/tablet)
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

  // Render header
  const nameEl = document.getElementById('detail-user-name');
  const idEl = document.getElementById('detail-ticket-id');
  const boldTitleEl = document.getElementById('detail-ticket-title-bold');
  const avatarEl = document.getElementById('detail-user-avatar');
  const statusEl = document.getElementById('detail-status-badge');
  const priorityEl = document.getElementById('detail-priority-badge');

  if (nameEl) nameEl.textContent = t.user;
  if (idEl) idEl.textContent = `TKT-${t.id}`;
  if (boldTitleEl) boldTitleEl.textContent = t.title;

  if (avatarEl) {
    if (t.avatar) {
      avatarEl.innerHTML = `<img class="w-full h-full rounded-full object-cover" src="${t.avatar}">`;
    } else {
      avatarEl.innerHTML = `<div class="w-full h-full rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs dark:text-neutral-400 font-black">${t.user.charAt(0)}</div>`;
    }
  }

  // Status Badge classes: Open (emerald), Pending (gold/yellow), Closed (solid dark red)
  if (statusEl) {
    statusEl.textContent = t.status;
    statusEl.className = `px-2.5 py-1 text-[9px] font-black tracking-wider uppercase rounded-none ${
      t.status === 'Open' 
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-455 border border-emerald-200/20' 
        : t.status === 'Pending' 
          ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/20 dark:text-amber-500 border border-amber-200/20' 
          : 'bg-red-750 text-white dark:bg-red-800 dark:text-red-100 border border-red-850'
    }`;
  }

  // Priority Badge classes: High (emerald/primary), Medium (orange), Low (gray)
  if (priorityEl) {
    priorityEl.textContent = t.priority;
    priorityEl.className = `px-2.5 py-1 text-[9px] font-black tracking-wider uppercase rounded-none ${
      t.priority === 'High' 
        ? 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white border border-emerald-500' 
        : t.priority === 'Medium' 
          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200/20' 
          : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-300/30'
    }`;
  }

  // Render messages
  renderMessages(t.messages);
}

// Mobile back action: hide right detail pane, restore left list pane
function goBackToList() {
  activeTicketId = null;
  renderTicketCards(tickets);

  const paneLeft = document.getElementById('pane-left');
  const paneRight = document.getElementById('pane-right');
  const placeholder = document.getElementById('ticket-placeholder-state');
  const detailView = document.getElementById('ticket-detail-view');

  if (paneLeft) paneLeft.classList.remove('hidden');
  if (placeholder) placeholder.classList.remove('hidden');
  if (detailView) detailView.classList.add('hidden');

  if (paneRight) {
    // Only hide right pane on mobile view
    if (window.innerWidth < 1024) {
      paneRight.classList.remove('flex');
      paneRight.classList.add('hidden');
    }
  }
}

// Render message bubbles with custom pointers (tails)
function renderMessages(messages) {
  const container = document.getElementById('detail-messages-container');
  if (!container) return;

  container.innerHTML = '';
  messages.forEach(msg => {
    const wrapper = document.createElement('div');
    // Owner ("user") is aligned right; Admin ("support") is aligned left
    wrapper.className = `flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`;
    
    // Owner ("user") bubble points bottom-right (rounded-br-none, green)
    // Admin ("support") bubble points bottom-left (rounded-bl-none, gray)
    const bubbleStyle = msg.sender === 'user'
      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10 rounded-2xl rounded-br-none'
      : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-white rounded-2xl rounded-bl-none';

    wrapper.innerHTML = `
      <div class="max-w-[80%] p-3.5 text-xs leading-relaxed ${bubbleStyle}">
        <p class="font-bold">${msg.text}</p>
        <span class="block text-[8px] mt-1.5 text-right font-black ${
          msg.sender === 'user' ? 'text-emerald-250' : 'text-neutral-400 dark:text-neutral-500'
        }">${msg.time || 'Just now'}</span>
      </div>
    `;
    container.appendChild(wrapper);
  });

  // Auto scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// Handle reply form submissions
function handleReplySubmit(e) {
  e.preventDefault();
  const input = document.getElementById('reply-input');
  if (!input || !input.value.trim() || !activeTicketId) return;

  const t = tickets.find(ticket => ticket.id === activeTicketId);
  if (!t) return;

  // The cashier ("user") is typing replies to the admin
  t.messages.push({
    sender: 'user', 
    text: input.value.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  input.value = '';
  renderMessages(t.messages);
  renderTicketCards(tickets); // Update last message time in list
}

// Handle ticket list search and category filtering
function handleTicketSearch() {
  const searchInput = document.getElementById('ticket-search-input');
  const categoryFilter = document.getElementById('ticket-category-filter');
  
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCat = categoryFilter ? categoryFilter.value : 'All';

  const filtered = tickets.filter(t => {
    // Match search query against user and title (excluding category names)
    const matchesSearch = !query || 
      t.user.toLowerCase().includes(query) ||
      t.title.toLowerCase().includes(query);
      
    // Match category select filter
    const matchesCategory = selectedCat === 'All' || 
      t.categories.includes(selectedCat);

    return matchesSearch && matchesCategory;
  });

  renderTicketCards(filtered);
}

// Inject Support Ticket Drawer HTML (aligned top-14 to match navbar exactly, no gaps)
function injectTicketDrawerHTML() {
  if (document.getElementById('ticket-drawer')) return;

  const drawerHTML = `
    <!-- Ticket Drawer Backdrop -->
    <div id="ticket-drawer-backdrop" class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-[60] hidden transition-opacity opacity-0"></div>

    <!-- Ticket Drawer Component -->
    <div id="ticket-drawer"
      class="fixed inset-0 lg:inset-auto lg:top-0 lg:bottom-0 lg:right-0 z-[70] p-5 lg:p-6 overflow-y-auto transition-transform translate-x-full bg-white dark:bg-[#16171d] w-full lg:w-[420px] shadow-2xl flex flex-col font-sans"
      tabindex="-1">
      
      <!-- Header -->
      <div class="flex items-center pb-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <button type="button" id="btn-close-ticket-drawer"
          class="text-neutral-900 dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none cursor-pointer mr-3 shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h5 class="text-xl font-black text-neutral-900 dark:text-white tracking-tight flex-1 uppercase">Create Ticket</h5>
      </div>

      <!-- Drawer Form -->
      <form id="create-ticket-form" class="space-y-3 flex-1 flex flex-col">
        
        <!-- Ticket Title -->
        <div>
          <label for="input-ticket-title" class="block mb-1.5 text-[11px] font-black text-neutral-850 dark:text-neutral-300 uppercase tracking-wider">Ticket Title</label>
          <input type="text" id="input-ticket-title" required
            class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-none focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-bold"
            placeholder="What's the title of your help request?">
        </div>

        <!-- Categories Dropdown (Multi-Select) -->
        <div class="relative">
          <label class="block mb-1.5 text-[11px] font-black text-neutral-850 dark:text-neutral-300 uppercase tracking-wider">Category</label>
          <button id="dropdownCategoryButton" data-dropdown-toggle="dropdownCategoryMenu" data-dropdown-placement="bottom"
            class="inline-flex items-center justify-between text-left text-neutral-500 dark:text-neutral-350 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:ring-4 focus:ring-emerald-500/20 shadow-xs font-bold leading-5 rounded-none text-sm w-full p-3 focus:outline-none cursor-pointer" type="button">
            <div id="selected-categories-pills" class="flex flex-wrap gap-1.5 flex-1 min-w-0 pr-2">
              <span class="text-neutral-400">Select categories...</span>
            </div>
            <svg class="w-4 h-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m19 9-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div id="dropdownCategoryMenu" class="z-50 hidden absolute mt-1 bg-white dark:bg-[#16171d] border border-neutral-200 dark:border-neutral-800 rounded-none shadow-xl w-full p-2 max-h-72 flex flex-col">
            <!-- Search Inside Dropdown -->
            <div class="p-1.5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <label for="category-search" class="sr-only">Search</label>
              <input type="text" id="category-search"
                class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-xs rounded-none focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2 font-bold"
                placeholder="Search categories...">
            </div>
            
            <!-- Category Checkbox List -->
            <ul id="category-items-list" class="flex-1 p-1 text-xs text-neutral-700 dark:text-neutral-350 font-bold overflow-y-auto space-y-1 custom-scrollbar">
              ${availableCategories.map((cat, idx) => `
                <li class="w-full flex items-center p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                  <label for="cat-check-${idx}" class="w-full flex items-center justify-between cursor-pointer">
                    <span class="inline-flex items-center font-bold text-neutral-800 dark:text-neutral-200">
                      <span class="w-2.5 h-2.5 rounded-full ${cat.color.split(' ')[0]} me-2 shrink-0"></span>
                      ${cat.name}
                    </span>
                    <input id="cat-check-${idx}" type="checkbox" value="${cat.name}"
                      class="category-checkbox w-4 h-4 text-emerald-600 bg-neutral-100 border-neutral-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-neutral-800 dark:bg-neutral-900 dark:border-neutral-700 focus:ring-2 rounded-none cursor-pointer">
                  </label>
                </li>
              `).join('')}
            </ul>

            <!-- Apply Button inside Dropdown -->
            <div class="border-t border-neutral-100 dark:border-neutral-800 p-1.5 rounded-b-base shrink-0">
              <button id="btn-category-select-apply" type="button"
                class="w-full inline-flex items-center justify-center text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all focus:ring-4 focus:ring-emerald-500/20 font-black rounded-none text-[11px] py-2 focus:outline-none cursor-pointer">
                APPLY CATEGORIES
              </button>
            </div>
          </div>
        </div>

        <!-- Status & Priority Grid -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Status Select -->
          <div>
            <label for="select-ticket-status" class="block mb-1.5 text-[11px] font-black text-neutral-850 dark:text-neutral-300 uppercase tracking-wider">Ticket Status</label>
            <select id="select-ticket-status"
              class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-none focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-bold cursor-pointer">
              <option value="Open">🟢 Open</option>
              <option value="Pending">🟡 Pending</option>
              <option value="Closed">🔴 Closed</option>
            </select>
          </div>

          <!-- Priority Select -->
          <div>
            <label for="select-ticket-priority" class="block mb-1.5 text-[11px] font-black text-neutral-850 dark:text-neutral-300 uppercase tracking-wider">Priority</label>
            <select id="select-ticket-priority"
              class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-none focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-bold cursor-pointer">
              <option value="High">🟢 High</option>
              <option value="Medium">🟠 Medium</option>
              <option value="Low">⚫ Low</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="input-ticket-message" class="block mb-1.5 text-[11px] font-black text-neutral-850 dark:text-neutral-300 uppercase tracking-wider">Your Message</label>
          <textarea id="input-ticket-message" rows="4" required
            class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-none focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-bold"
            placeholder="Write details of the issue here..."></textarea>
        </div>

        <!-- Upload file section -->
        <div>
          <label class="block mb-1.5 text-[11px] font-black text-neutral-850 dark:text-neutral-300 uppercase tracking-wider">Upload file</label>
          <div class="flex items-center justify-center w-full">
            <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-24 border-2 border-neutral-200 dark:border-neutral-800 border-dashed rounded-none cursor-pointer bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div class="flex flex-col items-center justify-center pt-3 pb-3">
                <svg class="w-5 h-5 mb-1.5 text-neutral-500 dark:text-neutral-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v9m-5-5 5-5 5 5m-5 9h.01"/>
                </svg>
                <p class="mb-0.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">Add screenshot / file</p>
                <p class="text-[9px] text-neutral-500 dark:text-neutral-400 font-extrabold uppercase tracking-wide">Max of 5 files only</p>
              </div>
              <input id="dropzone-file" type="file" multiple class="hidden" />
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4 mt-auto shrink-0">
          <button type="submit" id="btn-submit-ticket"
            class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm rounded-none shadow-md transition-all cursor-pointer flex justify-center items-center focus:outline-none focus:ring-4 focus:ring-emerald-500/20 uppercase tracking-wider">
            Create Ticket
          </button>
        </div>

      </form>
    </div>
  `;

  // Parse HTML
  const template = document.createElement('template');
  template.innerHTML = drawerHTML;
  document.body.appendChild(template.content);
}

// Open off-canvas support ticket drawer
function openTicketDrawer() {
  const drawer = document.getElementById('ticket-drawer');
  const backdrop = document.getElementById('ticket-drawer-backdrop');
  const placeholderText = document.getElementById('ticket-placeholder-state');

  // Hide placeholder text and button in the middle right panel if active
  if (placeholderText) {
    placeholderText.classList.add('invisible', 'opacity-0');
  }

  if (drawer && backdrop) {
    backdrop.classList.remove('hidden');
    // Force reflow
    backdrop.offsetHeight;
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');

    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
  }
}

// Close off-canvas support ticket drawer
function closeTicketDrawer() {
  const drawer = document.getElementById('ticket-drawer');
  const backdrop = document.getElementById('ticket-drawer-backdrop');
  const placeholderText = document.getElementById('ticket-placeholder-state');

  // Show placeholder text and button again on close (unless a ticket detail is loaded)
  if (placeholderText && activeTicketId === null) {
    placeholderText.classList.remove('invisible', 'opacity-0');
  }

  if (drawer && backdrop) {
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');

    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
    }, 300);
  }

  // Clear inputs and selected tags on close
  resetDrawerForm();
}

// Reset fields in the drawer form
function resetDrawerForm() {
  const form = document.getElementById('create-ticket-form');
  if (form) form.reset();

  selectedCategories = [];
  updateCategoryDropdownButton();

  // Uncheck checkboxes
  const checkBoxes = document.querySelectorAll('.category-checkbox');
  checkBoxes.forEach(cb => { cb.checked = false; });
}

// Update the category dropdown button text with selected categories as tags
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
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wide ${info.color}">
        ${cat}
        <button type="button" class="btn-remove-tag cursor-pointer font-black text-neutral-500 hover:text-red-600 ml-0.5 focus:outline-none shrink-0" data-cat="${cat}">×</button>
      </span>
    `;
  }).join(' ');

  // Bind tag removal buttons
  const removeButtons = selectedContainer.querySelectorAll('.btn-remove-tag');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cat = btn.getAttribute('data-cat');
      selectedCategories = selectedCategories.filter(c => c !== cat);
      
      // Update checkbox states in menu
      const checkboxes = document.querySelectorAll('.category-checkbox');
      checkboxes.forEach(cb => {
        if (cb.value === cat) cb.checked = false;
      });
      
      updateCategoryDropdownButton();
    });
  });
}

// Bind custom drawer components and interactive elements
function bindDrawerEvents() {
  const closeBtn = document.getElementById('btn-close-ticket-drawer');
  const backdrop = document.getElementById('ticket-drawer-backdrop');
  const form = document.getElementById('create-ticket-form');

  if (closeBtn) closeBtn.addEventListener('click', closeTicketDrawer);
  if (backdrop) backdrop.addEventListener('click', closeTicketDrawer);

  // Setup Form Submission
  if (form) {
    form.addEventListener('submit', handleCreateTicketSubmit);
  }

  // Bind custom Category Search and Dropdown toggling logic
  const categoryBtn = document.getElementById('dropdownCategoryButton');
  const categoryMenu = document.getElementById('dropdownCategoryMenu');

  if (categoryBtn && categoryMenu) {
    categoryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      categoryMenu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!categoryMenu.contains(e.target) && e.target !== categoryBtn && !categoryBtn.contains(e.target)) {
        categoryMenu.classList.add('hidden');
      }
    });
  }

  // Category Checkbox Selection Update logic
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

  // Apply Categories button action
  const applyBtn = document.getElementById('btn-category-select-apply');
  if (applyBtn && categoryMenu) {
    applyBtn.addEventListener('click', () => {
      categoryMenu.classList.add('hidden');
    });
  }

  // Search inside category items list
  const categorySearch = document.getElementById('category-search');
  const categoryItems = document.querySelectorAll('#category-items-list li');

  if (categorySearch) {
    categorySearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      categoryItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(q)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  }
}

// Handle Form Submission to create a new Ticket mock object
function handleCreateTicketSubmit(e) {
  e.preventDefault();

  const titleInput = document.getElementById('input-ticket-title');
  const statusSelect = document.getElementById('select-ticket-status');
  const prioritySelect = document.getElementById('select-ticket-priority');
  const messageTextarea = document.getElementById('input-ticket-message');

  if (!titleInput || !messageTextarea) return;

  const newTicket = {
    id: tickets.length + 101, // Incremental IDs
    user: 'Self Agent (Support)',
    avatar: null,
    title: titleInput.value.trim(),
    categories: selectedCategories.length > 0 ? [...selectedCategories] : ['General Support'],
    status: statusSelect.value,
    priority: prioritySelect.value,
    messages: [
      { sender: 'user', text: messageTextarea.value.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]
  };

  // Prepend to ticket store
  tickets.unshift(newTicket);

  // Redraw support ticket list
  renderTicketCards(tickets);

  // Auto-select and display new ticket details
  selectTicket(newTicket.id);

  // Close create drawer
  closeTicketDrawer();

  // Show SweetAlert2 Success notification
  showSuccess('Support Ticket Created', `Ticket #${newTicket.id} has been logged in the support dashboard.`);
}
