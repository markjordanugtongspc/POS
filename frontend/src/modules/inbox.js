import Swal from 'sweetalert2';
import { showSuccess } from './modals.js';

// Mock notification database
let notifications = [
  {
    id: 1,
    user: 'Elvis Mathew',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    message: 'added a new product <span class="font-extrabold text-neutral-900 dark:text-white">Milo 24g</span>',
    time: 'Just Now',
    timestamp: Date.now(),
    read: false
  },
  {
    id: 2,
    user: 'Elizabeth Olsen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    message: 'added a new product category <span class="font-extrabold text-neutral-900 dark:text-white">Beverages</span>',
    time: '4 min ago',
    timestamp: Date.now() - 4 * 60000,
    read: false
  },
  {
    id: 3,
    user: 'William Smith',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    message: 'restocked <span class="font-extrabold text-neutral-900 dark:text-white">Pancit Canton</span>',
    time: '6 min ago',
    timestamp: Date.now() - 6 * 60000,
    read: true
  },
  {
    id: 4,
    user: 'Lesley Grauer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    message: 'has updated transaction <span class="font-extrabold text-neutral-900 dark:text-white">#TRX-0012</span>',
    time: '12 min ago',
    timestamp: Date.now() - 12 * 60000,
    read: false
  },
  {
    id: 5,
    user: 'Carl Evans',
    avatar: null, // Test default placeholder icon
    message: 'adjusted the stock for <span class="font-extrabold text-neutral-900 dark:text-white">Milo 24g</span>',
    time: '2 days ago',
    timestamp: Date.now() - 2 * 24 * 3600000,
    read: true
  },
  {
    id: 6,
    user: 'Minerva Rameriz',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
    message: 'accepted return <span class="font-extrabold text-neutral-900 dark:text-white">#RET-0001</span>',
    time: '1 month ago',
    timestamp: Date.now() - 30 * 24 * 3600000,
    read: true
  }
];

// Helper to generate more notifications dynamically for infinite scroll
function generateMockNotifications(startIndex, count) {
  const users = [
    { name: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces' },
    { name: 'Bruce Wayne', avatar: null },
    { name: 'Clark Kent', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
    { name: 'Diana Prince', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
    { name: 'Peter Parker', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' }
  ];

  const actions = [
    'restocked <span class="font-extrabold text-neutral-900 dark:text-white">Milo 24g</span> by 50 units',
    'updated price for <span class="font-extrabold text-neutral-900 dark:text-white">Pancit Canton</span>',
    'voided transaction <span class="font-extrabold text-neutral-900 dark:text-white">#TRX-8910</span>',
    'added new product category <span class="font-extrabold text-neutral-900 dark:text-white">Essentials</span>',
    'adjusted stock for <span class="font-extrabold text-neutral-900 dark:text-white">Canned Goods</span>',
    'created a new refund request for <span class="font-extrabold text-neutral-900 dark:text-white">#REF-4920</span>',
    'generated the daily sales report for yesterday'
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    const userIdx = (startIndex + i) % users.length;
    const actionIdx = (startIndex + i) % actions.length;
    const timeVal = startIndex + i + 1;
    result.push({
      id: startIndex + i + 1,
      user: users[userIdx].name,
      avatar: users[userIdx].avatar,
      message: actions[actionIdx],
      time: `${timeVal} days ago`,
      timestamp: Date.now() - timeVal * 24 * 3600000,
      read: Math.random() > 0.4
    });
  }
  return result;
}

// Generate a pool of 50 notifications total (6 initial + 44 generated)
const additionalPool = generateMockNotifications(7, 44);
notifications = [...notifications, ...additionalPool];

// State variables
let currentPage = 1;
const itemsPerPage = 6;
let isLoading = false;
let hasMore = true;

// DOM Elements
let container = null;
let trigger = null;
let markAllReadBtn = null;
let deleteAllBtn = null;

// Initialize Inbox module
export function initInbox() {
  container = document.getElementById('notifications-container');
  trigger = document.getElementById('infinite-scroll-trigger');
  markAllReadBtn = document.getElementById('mark-all-read-btn');
  deleteAllBtn = document.getElementById('delete-all-btn');

  if (!container) return; // Not on the inbox page

  // Bind Header Controls
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', handleMarkAllRead);
  }
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', handleDeleteAll);
  }

  // Initial Load
  loadPage(1, true);

  // Setup Infinite Scroll via IntersectionObserver
  if (trigger) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && hasMore) {
        loadMore();
      }
    }, {
      rootMargin: '100px'
    });
    observer.observe(trigger);
  }
}

// Load a specific page of notifications
async function loadPage(page, clearContainer = false) {
  if (isLoading) return;
  isLoading = true;

  // Render skeleton loading blocks
  showSkeletons(clearContainer);

  // Simulate networking delay (e.g. 800ms)
  await new Promise(resolve => setTimeout(resolve, 800));

  isLoading = false;

  // Remove skeleton loaders
  const skeletons = container.querySelectorAll('.skeleton-loader');
  skeletons.forEach(el => el.remove());

  // Get subset of notifications
  const startIdx = (page - 1) * itemsPerPage;
  const pageItems = notifications.slice(startIdx, startIdx + itemsPerPage);

  if (pageItems.length === 0) {
    hasMore = false;
    if (container.children.length === 0) {
      showEmptyState();
    }
    updateTriggerMessage('No more notifications.');
    return;
  }

  if (startIdx + pageItems.length >= notifications.length) {
    hasMore = false;
    updateTriggerMessage('No more notifications.');
  } else {
    updateTriggerMessage('<div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>');
  }

  // Render notifications
  pageItems.forEach(item => {
    const card = renderNotificationCard(item);
    container.appendChild(card);
  });

  // If the trigger is still visible on the screen after loading (e.g. large screen), 
  // we must manually load more because IntersectionObserver won't fire again automatically.
  if (hasMore && trigger) {
    const rect = trigger.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 100) {
      // Small delay to let DOM paint, then check and load
      setTimeout(() => {
        if (!isLoading) loadMore();
      }, 50);
    }
  }
}

// Load more data on scroll
function loadMore() {
  currentPage++;
  loadPage(currentPage, false);
}

// Render skeleton wrappers
function showSkeletons(clear) {
  if (clear) {
    container.innerHTML = '';
  }

  // Generate 4 skeletons
  for (let i = 0; i < 4; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-loader w-full p-4 bg-white dark:bg-[#1f2029] border border-neutral-200 dark:border-neutral-800 animate-pulse flex items-center justify-between rounded-none';
    skeleton.innerHTML = `
      <div class="flex items-center gap-3 w-full">
        <div class="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0"></div>
        <div class="w-full max-w-[70%]">
          <div class="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-48 mb-2"></div>
          <div class="h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-32"></div>
        </div>
      </div>
      <div class="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full w-12 shrink-0"></div>
    `;
    container.appendChild(skeleton);
  }
  updateTriggerMessage('Loading more...');
}

// Render a single notification card DOM element
function renderNotificationCard(item) {
  const card = document.createElement('div');
  // Styling according to instructions: square notification (rounded-none), empty space gap in between
  card.className = `group flex items-center justify-between p-4 bg-white dark:bg-[#1f2029] border ${item.read ? 'border-neutral-200 dark:border-neutral-800' : 'border-emerald-500/40 dark:border-emerald-500/40 border-l-4 border-l-emerald-500'} hover:shadow-md transition-all duration-300 rounded-none relative`;
  card.dataset.id = item.id;

  // Unread badge indicator wrapper
  const avatarHtml = item.avatar 
    ? `<img class="w-10 h-10 rounded-full object-cover shrink-0" src="${item.avatar}" alt="${item.user}">`
    : `
      <div class="relative w-10 h-10 overflow-hidden bg-neutral-200 dark:bg-neutral-800 rounded-full shrink-0">
          <svg class="absolute w-12 h-12 text-neutral-400 dark:text-neutral-500 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
      </div>
    `;

  card.innerHTML = `
    <div class="flex items-center gap-4 flex-1 pr-4">
      ${avatarHtml}
      <div class="flex-1 min-w-0">
        <p class="text-xs text-neutral-700 dark:text-neutral-350 leading-relaxed">
          <span class="font-extrabold text-neutral-900 dark:text-white mr-1">${item.user}</span>
          ${item.message}
        </p>
        <span class="text-[10px] text-neutral-400 dark:text-neutral-500 block mt-1 font-bold flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          ${item.time}
        </span>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <!-- Toggle Read Status Button -->
      <button class="toggle-read-btn cursor-pointer p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-emerald-600 transition" title="${item.read ? 'Mark as Unread' : 'Mark as Read'}">
        ${item.read ? `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ` : `
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.748-5.25Z" clip-rule="evenodd" />
          </svg>
        `}
      </button>
      <!-- Single Delete Button -->
      <button class="delete-single-btn cursor-pointer p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-600 transition" title="Delete notification">
        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
        </svg>
      </button>
    </div>
  `;

  // Bind actions
  card.querySelector('.toggle-read-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleReadStatus(item.id);
  });

  card.querySelector('.delete-single-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteSingleNotification(item.id);
  });

  return card;
}

// Toggle notification read/unread status
function toggleReadStatus(id) {
  const item = notifications.find(n => n.id === id);
  if (!item) return;

  item.read = !item.read;

  // Refresh visual card
  const card = container.querySelector(`[data-id="${id}"]`);
  if (card) {
    const newCard = renderNotificationCard(item);
    card.replaceWith(newCard);
  }
}

// Delete single notification with SweetAlert2 confirm prompt
function deleteSingleNotification(id) {
  const isDark = document.documentElement.classList.contains('dark');
  Swal.fire({
    title: 'Delete Notification',
    text: 'Are you sure you want to delete this notification?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'cursor-pointer px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition mr-2',
      cancelButton: 'cursor-pointer px-4 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition'
    },
    buttonsStyling: false,
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#ffffff' : '#1f2937'
  }).then((result) => {
    if (result.isConfirmed) {
      notifications = notifications.filter(n => n.id !== id);
      const card = container.querySelector(`[data-id="${id}"]`);
      if (card) {
        card.classList.add('animate-fade-out');
        setTimeout(() => {
          card.remove();
          if (container.children.length === 0 && !hasMore) {
            showEmptyState();
          }
        }, 300);
      }
      showSuccess('Deleted!', 'Notification has been deleted successfully.');
    }
  });
}

// Mark all as read action
function handleMarkAllRead() {
  notifications.forEach(n => { n.read = true; });
  
  // Update all elements currently in DOM
  const cards = container.querySelectorAll('[data-id]');
  cards.forEach(card => {
    const id = parseInt(card.dataset.id);
    const item = notifications.find(n => n.id === id);
    if (item) {
      const newCard = renderNotificationCard(item);
      card.replaceWith(newCard);
    }
  });

  showSuccess('Marked All as Read', 'All notifications in the system are now marked as read.');
}

// Delete all action with SweetAlert2 confirmation
function handleDeleteAll() {
  const isDark = document.documentElement.classList.contains('dark');
  Swal.fire({
    title: 'Clear All Notifications',
    text: 'Are you sure you want to delete all notifications? This action is permanent.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete All',
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'cursor-pointer px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition mr-2',
      cancelButton: 'cursor-pointer px-4 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition'
    },
    buttonsStyling: false,
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#ffffff' : '#1f2937'
  }).then((result) => {
    if (result.isConfirmed) {
      notifications = [];
      container.innerHTML = '';
      hasMore = false;
      showEmptyState();
      updateTriggerMessage('No more notifications.');
      showSuccess('Cleared!', 'All notifications have been removed.');
    }
  });
}

// Show empty inbox state helper
function showEmptyState() {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 flex items-center justify-center mb-4">
        <svg class="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 13h3.439a.991.991 0 0 1 .908.6 3.978 3.978 0 0 0 7.306 0 .99.99 0 0 1 .908-.6H20M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M4 13l2-9h12l2 9M9 7h6m-7 3h8" />
        </svg>
      </div>
      <h3 class="text-sm font-black text-neutral-900 dark:text-white mb-1">Your inbox is empty</h3>
      <p class="text-xs text-neutral-500 dark:text-neutral-400">All caught up! Check back later for system alerts.</p>
    </div>
  `;
}

// Update scroll trigger message helper
function updateTriggerMessage(msg) {
  if (trigger) {
    trigger.innerHTML = `<span class="text-xs text-neutral-450 dark:text-neutral-500 font-bold">${msg}</span>`;
  }
}
