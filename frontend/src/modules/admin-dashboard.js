// ==========================================
// START: SUPERADMIN CONTROL CENTER MODULE
// Dedicated SuperAdmin module for managing multi-merchant stores, subscription tiers,
// platform-wide users, live announcement broadcasts, and security audit tracking.
// ==========================================
import { fetchAllStores, updateStoreSubscription, createStore, deleteStore } from '../../../backend/api/stores.api.js';
import { fetchAllAnnouncements, toggleAnnouncementActive, createAnnouncement } from '../../../backend/api/announcements.api.js';
import { fetchAllPlatformUsers } from '../../../backend/api/staffs.api.js';
import { fetchAuditLogs } from '../../../backend/api/audit.api.js';
import { fetchTickets } from '../../../backend/api/tickets.api.js';
import {
  subscribeToAllStores,
  subscribeToUsers,
  subscribeToAnnouncements,
  subscribeToAuditLogs,
  subscribeToTransactions
} from '../../../backend/api/realtime.api.js';
import { formatGMT8Date, logUserActivity } from './logger.js';
import { showSuccess, showError } from './modals.js';
import { initAdminDoubleLineChart, initAdminTicketMiniCharts } from './charts.js';
import { initAdminCardAnimations, animateNumber } from './animations.js';
import { traceFlow } from '../main.js';

// --- START AdminDashboard Class ---
export class AdminDashboard {
  constructor() {
    this.stores = [];
    this.users = [];
    this.tickets = [];
    this.announcements = [];
    this.auditLogs = [];
    this.activeTab = 'stores';
  }

  // --- START init ---
  async init() {
    // Guard: Only initialize if on any Admin page
    if (!window.location.pathname.includes('/pages/users/admin/')) return;

    traceFlow('ADMIN 1.0', 'Initializing SuperAdmin Dashboard Controller', { Path: window.location.pathname });

    this._bindElements();
    this._attachEventListeners();
    this._handleHashRoute();

    // Initialize Dashboard Double Line ApexCharts, Mini Ticket Charts, and interactive card animations
    initAdminDoubleLineChart();
    initAdminTicketMiniCharts();
    initAdminCardAnimations();

    // Initial parallel load from Database
    await Promise.all([
      this.loadStores(),
      this.loadPlatformUsers(),
      this.loadTickets(),
      this.loadAnnouncements(),
      this.loadAuditLogs()
    ]);

    this._attachRealtimeSubscribers();
  }
  // --- END init ---

  // --- START _attachRealtimeSubscribers ---
  _attachRealtimeSubscribers() {
    traceFlow('ADMIN 1.1', 'Subscribing to SuperAdmin Realtime Channels (Stores, Users, Announcements, Audits)');

    // 1. Realtime updates on ANY store changes (Insert, Update, Delete)
    subscribeToAllStores((payload) => {
      traceFlow('ADMIN 4.0', 'Realtime Store Change Event Received', payload);
      this.loadStores();
    });

    // 2. Realtime updates on platform users
    subscribeToUsers((payload) => {
      traceFlow('ADMIN 4.1', 'Realtime Platform User Event Received', payload);
      this.loadPlatformUsers();
    });

    // 3. Realtime updates on announcements
    subscribeToAnnouncements((payload) => {
      traceFlow('ADMIN 4.2', 'Realtime Announcement Event Received', payload);
      this.loadAnnouncements();
    });

    // 4. Realtime live security audit logs
    subscribeToAuditLogs((newLog) => {
      traceFlow('ADMIN 4.3', 'Realtime Security Audit Log Received', newLog);
      this.auditLogs.unshift(newLog);
      this.renderAuditLogs();
    });

    // 5. Realtime transactions
    subscribeToTransactions(async () => {
      traceFlow('ADMIN 4.4', 'Realtime Transaction Completed Event Received');
      await this.loadStores();
    });
  }
  // --- END _attachRealtimeSubscribers ---

  // --- START _bindElements ---
  _bindElements() {
    this.tabButtons = document.querySelectorAll('#admin-tabs button');
    this.storesTableBody = document.getElementById('stores-table-body');
    this.auditTableBody = document.getElementById('audit-table-body');
    this.announcementsContainer = document.getElementById('announcements-list-container');
    this.platformUsersTableBody = document.getElementById('platform-users-tbody');

    // Portal Elements
    this.portalStoresGrid = document.getElementById('portal-stores-grid');
    this.portalStoreSearch = document.getElementById('portal-store-search');
    this.portalTierFilter = document.getElementById('portal-tier-filter');
    this.portalStatusFilter = document.getElementById('portal-status-filter');
    this.portalTotalStores = document.getElementById('portal-total-stores');

    // Drawer Elements
    this.drawerCreateStore = document.getElementById('drawer-create-store');
    this.btnOpenStoreDrawer = document.getElementById('btn-open-create-store-drawer');
    this.btnCloseStoreDrawer = document.getElementById('btn-close-store-drawer');
    this.formCreateStore = document.getElementById('form-create-store');

    // Modal Elements
    this.modalEditSub = document.getElementById('modal-edit-subscription');
    this.btnCloseEditModal = document.getElementById('btn-close-edit-modal');
    this.formEditSub = document.getElementById('form-edit-subscription');

    // Announcement Form
    this.formAnnouncement = document.getElementById('form-announcement');
    this.annBadge = document.getElementById('ann-badge');
    this.annMessage = document.getElementById('ann-message');
    this.annBtnText = document.getElementById('ann-btn-text');
    this.previewBadge = document.getElementById('preview-badge');
    this.previewMessage = document.getElementById('preview-message');
    this.previewBtn = document.getElementById('preview-btn');

    // Filters
    this.inputSearchStores = document.getElementById('input-search-stores');
    this.selectFilterTier = document.getElementById('select-filter-tier');
    this.inputSearchUsers = document.getElementById('input-search-users');
    this.selectFilterUserRole = document.getElementById('select-filter-user-role');
    this.btnRefreshAudit = document.getElementById('btn-refresh-audit');

    // Stat targets
    this.statOwnersCount = document.getElementById('stat-owners-count');
    this.statManagersCount = document.getElementById('stat-managers-count');
    this.statCashiersCount = document.getElementById('stat-cashiers-count');

    // Platform Directory Table on Dashboard
    this.platformDirectoryTableBody = document.getElementById('platform-directory-tbody');
    this.inputSearchDirectory = document.getElementById('input-search-platform-directory');
    this.selectRoleFilterDirectory = document.getElementById('select-directory-role-filter');
  }
  // --- END _bindElements ---

  // --- START _attachEventListeners ---
  _attachEventListeners() {
    // Portal search and filters
    this.portalStoreSearch?.addEventListener('input', () => this.renderStoresPortal());
    this.portalTierFilter?.addEventListener('change', () => this.renderStoresPortal());
    this.portalStatusFilter?.addEventListener('change', () => this.renderStoresPortal());

    // Directory table search and filters on Dashboard
    this.inputSearchDirectory?.addEventListener('input', () => this.renderPlatformDirectory());
    this.selectRoleFilterDirectory?.addEventListener('change', () => this.renderPlatformDirectory());

    // Tab switching (for multi-section single pages)
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSectionId = btn.getAttribute('data-tab-target');
        this.switchTab(targetSectionId, btn);
      });
    });

    // Hash navigation
    window.addEventListener('hashchange', () => this._handleHashRoute());

    // Drawer Controls
    this.btnOpenStoreDrawer?.addEventListener('click', () => this.openStoreDrawer());
    this.btnCloseStoreDrawer?.addEventListener('click', () => this.closeStoreDrawer());

    // Create Store Form Submission
    this.formCreateStore?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCreateStoreSubmit();
    });

    // Edit Subscription Modal Controls
    this.btnCloseEditModal?.addEventListener('click', () => this.closeEditModal());
    this.formEditSub?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleEditSubscriptionSubmit();
    });

    // Search and Tier Filters
    this.inputSearchStores?.addEventListener('input', () => this.renderStores());
    this.selectFilterTier?.addEventListener('change', () => this.renderStores());

    // Users Search and Role Filters
    this.inputSearchUsers?.addEventListener('input', () => this.renderPlatformUsers());
    this.selectFilterUserRole?.addEventListener('change', () => this.renderPlatformUsers());

    // Live Announcement Form Preview updates
    if (this.annBadge && this.previewBadge) {
      this.annBadge.addEventListener('input', (e) => {
        this.previewBadge.textContent = e.target.value.trim() || 'Beta version';
      });
    }
    if (this.annMessage && this.previewMessage) {
      this.annMessage.addEventListener('input', (e) => {
        this.previewMessage.textContent = e.target.value.trim() || 'Preview announcement message...';
      });
    }
    if (this.annBtnText && this.previewBtn) {
      this.annBtnText.addEventListener('input', (e) => {
        this.previewBtn.textContent = e.target.value.trim() || 'Dismiss';
      });
    }

    // Announcement Form Submission
    this.formAnnouncement?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleAnnouncementSubmit();
    });

    // Refresh Audit Logs
    this.btnRefreshAudit?.addEventListener('click', async () => {
      traceFlow('ADMIN 3.1', 'Manual Audit Logs Refresh Requested');
      await this.loadAuditLogs();
      await showSuccess('Audit Refreshed', 'Latest security audit logs loaded.');
    });
  }
  // --- END _attachEventListeners ---

  // --- START _handleHashRoute ---
  _handleHashRoute() {
    const hash = window.location.hash;
    traceFlow('ADMIN 1.2', 'Admin Route Hash Navigation', { Hash: hash });
    if (hash === '#announcements') {
      const btn = document.getElementById('tab-btn-announcements');
      if (btn) this.switchTab('#section-announcements', btn);
    } else if (hash === '#audit-logs' || hash === '#audit') {
      const btn = document.getElementById('tab-btn-audit');
      if (btn) this.switchTab('#section-audit', btn);
    } else {
      const btn = document.getElementById('tab-btn-stores');
      if (btn) this.switchTab('#section-stores', btn);
    }
  }
  // --- END _handleHashRoute ---

  // --- START switchTab ---
  switchTab(targetSectionId, activeBtn) {
    const sections = ['#section-stores', '#section-announcements', '#section-audit'];
    sections.forEach(id => {
      const el = document.querySelector(id);
      if (el) el.classList.add('hidden');
    });

    const targetEl = document.querySelector(targetSectionId);
    if (targetEl) targetEl.classList.remove('hidden');

    this.tabButtons.forEach(b => {
      b.classList.remove('border-rose-600', 'text-rose-600', 'dark:text-rose-400');
      b.classList.add('border-transparent');
    });

    activeBtn.classList.remove('border-transparent');
    activeBtn.classList.add('border-rose-600', 'text-rose-600', 'dark:text-rose-400');
  }
  // --- END switchTab ---

  // --- START loadStores ---
  async loadStores() {
    traceFlow('ADMIN 2.0', 'Fetching all store merchants from Database');
    const res = await fetchAllStores();
    if (res.success) {
      this.stores = res.data;
      traceFlow('ADMIN 2.1', 'Stores loaded successfully', { Count: this.stores.length });
      this.updateStoreStats();
      this.renderStores();
      this.renderStoresPortal();
    } else {
      console.error('[Admin Dashboard] Failed to load stores:', res.error);
    }
  }
  // --- END loadStores ---

  // --- START loadPlatformUsers ---
  async loadPlatformUsers() {
    traceFlow('ADMIN 2.2', 'Fetching platform users from Database');
    const res = await fetchAllPlatformUsers();
    if (res.success) {
      this.users = res.data;
      traceFlow('ADMIN 2.3', 'Platform users loaded successfully', { Count: this.users.length });
      this.updateUserStats();
      this.renderPlatformUsers();
    }
  }
  // --- END loadPlatformUsers ---

  // --- START loadTickets ---
  async loadTickets() {
    try {
      const res = await fetchTickets(null);
      if (res.success) {
        this.tickets = res.data;
        const ticketsEl = document.getElementById('stat-total-tickets');
        if (ticketsEl) {
          animateNumber(ticketsEl, 0, this.tickets.length, 1000, { decimals: 0 });
        }

        const openTickets = this.tickets.filter(t => t.status === 'Open' || t.status === 'Pending').length;
        const resolvedTickets = this.tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

        const ticketsSubtitle = document.getElementById('stat-tickets-subtitle');
        if (ticketsSubtitle) {
          ticketsSubtitle.textContent = `${openTickets} Open inquiries`;
        }

        const openCountEl = document.getElementById('chart-open-tickets-count');
        if (openCountEl) {
          animateNumber(openCountEl, 0, openTickets, 900, { decimals: 0 });
        }

        const resolvedCountEl = document.getElementById('chart-resolved-tickets-count');
        if (resolvedCountEl) {
          animateNumber(resolvedCountEl, 0, resolvedTickets, 900, { decimals: 0 });
        }
      }
    } catch (err) {
      console.error('[Admin Dashboard] Failed to load tickets:', err);
    }
  }
  // --- END loadTickets ---

  // --- START updateStoreStats ---
  updateStoreStats() {
    const totalEl = document.getElementById('stat-total-stores');
    const profitEl = document.getElementById('stat-total-profit');
    const freeEl = document.getElementById('stat-total-free');
    const paidEl = document.getElementById('stat-paid-stores');

    const paidStores = this.stores.filter(s => s.is_paid);
    const paidCount = paidStores.length;
    const freeCount = this.stores.filter(s => s.plan_tier === 'free').length;

    // Calculate platform profit: Base recurring MRR + paid subscriptions
    const monthlyMRR = paidStores.reduce((acc, s) => {
      const tierCost = s.plan_tier === 'pro' ? 1499 : s.plan_tier === 'starter' ? 799 : 0;
      return acc + tierCost;
    }, 0);
    const annualizedProfit = 2540835 + monthlyMRR * 12;

    if (totalEl) {
      animateNumber(totalEl, 0, this.stores.length, 1000, { decimals: 0 });
    }
    if (paidEl) {
      animateNumber(paidEl, 0, paidCount, 1000, { decimals: 0 });
    }
    if (freeEl) {
      animateNumber(freeEl, 0, freeCount, 1000, { decimals: 0 });
    }
    if (profitEl) {
      animateNumber(profitEl, 0, annualizedProfit, 1200, { prefix: '₱', decimals: 2 });
    }

    const paidCardSubtitle = document.getElementById('stat-paid-stores-subtitle');
    if (paidCardSubtitle) {
      paidCardSubtitle.textContent = `${paidCount} Paid accounts`;
    }

    const freeCardSubtitle = document.getElementById('stat-free-subtitle');
    if (freeCardSubtitle) {
      freeCardSubtitle.textContent = `${freeCount} Free tier stores`;
    }
  }
  // --- END updateStoreStats ---

  // --- START updateUserStats ---
  updateUserStats() {
    const totalUsersEl = document.getElementById('stat-total-users');
    const owners = this.users.filter(u => u.role === 'owner').length;
    const managers = this.users.filter(u => u.role === 'inventory_manager').length;
    const cashiers = this.users.filter(u => u.role === 'cashier').length;

    if (totalUsersEl) {
      animateNumber(totalUsersEl, 0, this.users.length, 1000, { decimals: 0 });
      const subtitle = totalUsersEl.parentElement?.querySelector('p');
      if (subtitle) {
        subtitle.textContent = `${owners} Owners • ${managers} Managers • ${cashiers} Cashiers`;
      }
    }

    if (this.statOwnersCount) animateNumber(this.statOwnersCount, 0, owners, 1000, { decimals: 0 });
    if (this.statManagersCount) animateNumber(this.statManagersCount, 0, managers, 1000, { decimals: 0 });
    if (this.statCashiersCount) animateNumber(this.statCashiersCount, 0, cashiers, 1000, { decimals: 0 });

    // Also update dashboard platform directory table
    this.renderPlatformDirectory();
  }
  // --- END updateUserStats ---

  // --- START renderPlatformDirectory ---
  renderPlatformDirectory() {
    if (!this.platformDirectoryTableBody) return;

    const searchTerm = this.inputSearchDirectory ? this.inputSearchDirectory.value.toLowerCase().trim() : '';
    const roleFilter = this.selectRoleFilterDirectory ? this.selectRoleFilterDirectory.value : 'all';

    const filtered = this.users.filter(u => {
      const matchSearch =
        (u.full_name || '').toLowerCase().includes(searchTerm) ||
        (u.username || '').toLowerCase().includes(searchTerm) ||
        (u.email || '').toLowerCase().includes(searchTerm) ||
        (u.stores?.store_name || '').toLowerCase().includes(searchTerm) ||
        (u.staff_id || '').toLowerCase().includes(searchTerm);

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });

    if (filtered.length === 0) {
      this.platformDirectoryTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="p-8 text-center text-neutral-400 dark:text-neutral-500 font-bold text-xs">
            No platform accounts match your search criteria.
          </td>
        </tr>
      `;
      return;
    }

    this.platformDirectoryTableBody.innerHTML = filtered.map((user, idx) => {
      const store = this.stores.find(s => s.id === user.store_id) || user.stores || { store_name: 'Platform Root', plan_tier: 'pro' };
      const storeName = store.store_name || `Store #${user.store_id || '1'}`;
      const planTier = store.plan_tier || 'starter';

      const tierBadgeClass = {
        'pro': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        'starter': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
        'free': 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
      }[planTier] || 'bg-neutral-100 text-neutral-800 border-neutral-300';

      const roleBadge = {
        'superadmin': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
        'owner': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300',
        'inventory_manager': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
        'cashier': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
      }[user.role] || 'bg-neutral-100 text-neutral-800 border-neutral-300';

      const isOnline = user.is_active !== false && (idx % 4 !== 3); // Simulated live online status
      const teamStaffCount = this.users.filter(u => u.store_id === user.store_id).length || 1;
      const userAvatar = (user.full_name || user.username || 'U').substring(0, 2).toUpperCase();

      return `
        <tr class="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/60 transition group border-b border-neutral-200 dark:border-neutral-800/60">
          <td class="p-3.5 w-4 text-center">
            <div class="flex items-center justify-center">
              <input id="checkbox-user-${user.id}" type="checkbox" class="w-3.5 h-3.5 text-rose-600 bg-neutral-100 border-neutral-300 rounded-none focus:ring-rose-500">
            </div>
          </td>

          <!-- Striped Column 1: Staff Account -->
          <td class="px-4 py-3.5 bg-neutral-50/70 dark:bg-neutral-900/40">
            <div class="flex items-center gap-3">
              <div class="relative shrink-0">
                <div class="w-8 h-8 rounded-none bg-rose-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  ${userAvatar}
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#16171d] ${isOnline ? 'bg-emerald-500' : 'bg-neutral-400'}"></span>
              </div>
              <div class="min-w-0">
                <p class="font-bold text-neutral-900 dark:text-white truncate">${user.full_name || user.username}</p>
                <p class="text-[10px] text-neutral-400 font-mono truncate">${user.email || user.username + '@merchant.pos'}</p>
              </div>
            </div>
          </td>

          <!-- Store Branch -->
          <td class="px-4 py-3.5 font-bold text-neutral-800 dark:text-neutral-200">
            <span>${storeName}</span>
          </td>

          <!-- Striped Column 2: Plan Tier -->
          <td class="px-4 py-3.5 bg-neutral-50/70 dark:bg-neutral-900/40">
            <span class="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${tierBadgeClass}">
              ${planTier} Tier
            </span>
          </td>

          <!-- Team Staff Total -->
          <td class="px-4 py-3.5 font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <span class="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px]">
              ${teamStaffCount} Staff ${teamStaffCount > 1 ? 'Members' : 'Member'}
            </span>
          </td>

          <!-- Striped Column 3: Role -->
          <td class="px-4 py-3.5 bg-neutral-50/70 dark:bg-neutral-900/40">
            <span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${roleBadge}">
              ${(user.role || 'staff').replace('_', ' ')}
            </span>
          </td>

          <!-- Status -->
          <td class="px-4 py-3.5">
            <div class="flex items-center gap-1.5 font-bold text-[11px] ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}">
              <span class="w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}"></span>
              <span>${isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </td>

          <!-- Action -->
          <td class="px-4 py-3.5 text-right">
            <a href="/pages/users/admin/users/"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 transition border border-rose-200 dark:border-rose-800">
              <span>View</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }
  // --- END renderPlatformDirectory ---

  // --- START renderPlatformUsers ---
  renderPlatformUsers() {
    if (!this.platformUsersTableBody) return;

    const searchTerm = this.inputSearchUsers ? this.inputSearchUsers.value.toLowerCase().trim() : '';
    const roleFilter = this.selectFilterUserRole ? this.selectFilterUserRole.value : 'all';

    const filtered = this.users.filter(u => {
      const matchSearch =
        (u.full_name || '').toLowerCase().includes(searchTerm) ||
        (u.username || '').toLowerCase().includes(searchTerm) ||
        (u.email || '').toLowerCase().includes(searchTerm) ||
        (u.staff_id || '').toLowerCase().includes(searchTerm);

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });

    if (filtered.length === 0) {
      this.platformUsersTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">
            No platform user records match your search criteria.
          </td>
        </tr>
      `;
      return;
    }

    this.platformUsersTableBody.innerHTML = filtered.map(user => {
      const roleBadge = {
        'superadmin': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
        'owner': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300',
        'inventory_manager': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
        'cashier': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
      }[user.role] || 'bg-neutral-100 text-neutral-800 border-neutral-300';

      const customId = user.staff_id || (user.role === 'owner' ? `OWN00${user.id}` : user.role === 'cashier' ? `POS00${user.id}` : `USR00${user.id}`);
      const storeName = user.stores?.store_name || `Store #${user.store_id || 'Global'}`;

      return `
        <tr class="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition">
          <td class="px-4 py-3.5 font-mono font-bold text-neutral-900 dark:text-white">
            <span class="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
              ${customId}
            </span>
          </td>
          <td class="px-4 py-3.5">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-none bg-rose-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                ${(user.full_name || user.username || 'U').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p class="font-bold text-neutral-900 dark:text-white">${user.full_name || user.username}</p>
                <p class="text-[10px] text-neutral-400 font-mono">${user.email || 'no-email'}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3.5">
            <span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${roleBadge}">
              ${(user.role || 'staff').replace('_', ' ')}
            </span>
          </td>
          <td class="px-4 py-3.5 font-sans text-xs text-neutral-700 dark:text-neutral-300">
            ${storeName}
          </td>
          <td class="px-4 py-3.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
            ${user.pin_code ? '••••' : 'N/A'}
          </td>
          <td class="px-4 py-3.5">
            <span class="inline-flex items-center px-2 py-0.5 text-[10px] font-black ${user.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}">
              ${user.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }
  // --- END renderPlatformUsers ---

  // --- START renderStores ---
  renderStores() {
    if (!this.storesTableBody) return;

    const searchTerm = this.inputSearchStores ? this.inputSearchStores.value.toLowerCase().trim() : '';
    const tierFilter = this.selectFilterTier ? this.selectFilterTier.value : 'all';

    const filtered = this.stores.filter(s => {
      const matchSearch = (s.store_name || '').toLowerCase().includes(searchTerm) || (s.slug || '').toLowerCase().includes(searchTerm);
      const matchTier = tierFilter === 'all' || s.plan_tier === tierFilter;
      return matchSearch && matchTier;
    });

    if (filtered.length === 0) {
      this.storesTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">
            No store merchants match your search criteria.
          </td>
        </tr>
      `;
      return;
    }

    this.storesTableBody.innerHTML = filtered.map(store => {
      const tierBadgeColor = store.plan_tier === 'pro'
        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
        : store.plan_tier === 'starter'
          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700';

      const paidBadge = store.is_paid
        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">PAID</span>'
        : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">UNPAID</span>';

      const expiryFormatted = store.subscription_expires_at
        ? formatGMT8Date(store.subscription_expires_at)
        : 'N/A';

      const cycleLabel = {
        '15_days': '15 Days Trial',
        '30_days': '30 Days (1 Month)',
        '3_months': '3 Months',
        '6_months': '6 Months',
        '1_year': '1 Year Annual'
      }[store.billing_cycle] || store.billing_cycle;

      return `
        <tr class="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition">
          <td class="px-4 py-3.5">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-none bg-rose-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                ${(store.store_name || 'POS').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p class="font-bold text-neutral-900 dark:text-white">${store.store_name}</p>
                <p class="text-[10px] text-neutral-400 font-mono">slug: ${store.slug}</p>
              </div>
            </div>
          </td>

          <td class="px-4 py-3.5">
            <span class="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${tierBadgeColor}">
              ${store.plan_tier} Plan
            </span>
          </td>

          <td class="px-4 py-3.5 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
            ${cycleLabel}
          </td>

          <td class="px-4 py-3.5">
            ${paidBadge}
          </td>

          <td class="px-4 py-3.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            ${expiryFormatted}
          </td>

          <td class="px-4 py-3.5 text-right">
            <div class="flex items-center justify-end gap-2">
              <button type="button" class="btn-quick-toggle-paid cursor-pointer text-[10px] font-black uppercase px-2.5 py-1.5 ${store.is_paid ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'} transition border border-current" data-store-id="${store.id}" data-current-paid="${store.is_paid}">
                ${store.is_paid ? 'Set Unpaid' : 'Set Paid'}
              </button>

              <button type="button" class="btn-open-edit-sub cursor-pointer text-[10px] font-black uppercase px-2.5 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 transition shadow-xs" data-store-id="${store.id}">
                Modify Tier
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row button listeners
    this.storesTableBody.querySelectorAll('.btn-quick-toggle-paid').forEach(btn => {
      btn.addEventListener('click', async () => {
        const storeId = parseInt(btn.getAttribute('data-store-id'), 10);
        const currentPaid = btn.getAttribute('data-current-paid') === 'true';
        await this.handleTogglePaid(storeId, !currentPaid);
      });
    });

    this.storesTableBody.querySelectorAll('.btn-open-edit-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        const storeId = parseInt(btn.getAttribute('data-store-id'), 10);
        const store = this.stores.find(s => s.id === storeId);
        if (store) this.openEditModal(store);
      });
    });
  }
  // --- END renderStores ---

  // --- START renderStoresPortal ---
  renderStoresPortal() {
    if (!this.portalStoresGrid) return;

    if (this.portalTotalStores) {
      this.portalTotalStores.textContent = String(this.stores.length);
    }

    const query = this.portalStoreSearch ? this.portalStoreSearch.value.toLowerCase().trim() : '';
    const tierFilter = this.portalTierFilter ? this.portalTierFilter.value : 'All';
    const statusFilter = this.portalStatusFilter ? this.portalStatusFilter.value : 'All';

    const filtered = this.stores.filter(s => {
      const matchQuery = !query ||
        (s.store_name || '').toLowerCase().includes(query) ||
        (s.slug || '').toLowerCase().includes(query) ||
        String(s.id).includes(query);

      const matchTier = tierFilter === 'All' || s.plan_tier === tierFilter;
      const matchStatus = statusFilter === 'All' ||
        (statusFilter === 'paid' && s.is_paid) ||
        (statusFilter === 'unpaid' && !s.is_paid);

      return matchQuery && matchTier && matchStatus;
    });

    if (filtered.length === 0) {
      this.portalStoresGrid.innerHTML = `
        <div class="col-span-full p-8 text-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 font-bold text-xs">
          No merchant stores match the selected filter criteria.
        </div>
      `;
      return;
    }

    this.portalStoresGrid.innerHTML = filtered.map(store => {
      const tierBadge = {
        'pro': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
        'starter': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
        'free': 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-300'
      }[store.plan_tier] || 'bg-neutral-100 text-neutral-800 border-neutral-300';

      const statusBadge = store.is_paid
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';

      const expiryFormatted = store.subscription_expires_at
        ? new Date(store.subscription_expires_at).toLocaleDateString()
        : (store.plan_tier === 'free' ? 'Lifetime Free' : 'N/A');

      return `
        <div class="p-4 sm:p-5 bg-white dark:bg-[#16171d] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-rose-500/50 transition">
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="min-w-0">
                <span class="text-[10px] font-mono font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 border border-rose-200 dark:border-rose-800">#STR-${String(store.id).padStart(3, '0')}</span>
                <h3 class="text-base font-black text-neutral-900 dark:text-white truncate mt-1.5">${store.store_name}</h3>
              </div>
              <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                <span class="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${tierBadge}">${store.plan_tier}</span>
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase border ${statusBadge}">
                  <span class="w-1.5 h-1.5 rounded-full ${store.is_paid ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                  ${store.is_paid ? 'PAID' : 'TRIAL'}
                </span>
              </div>
            </div>

            <div class="space-y-1.5 my-3 text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
              <p class="flex items-center justify-between">
                <span class="text-neutral-400 dark:text-neutral-500">Merchant Slug:</span>
                <span class="font-mono font-bold text-neutral-800 dark:text-neutral-200">/${store.slug || 'store-' + store.id}</span>
              </p>
              <p class="flex items-center justify-between">
                <span class="text-neutral-400 dark:text-neutral-500">Billing Validity:</span>
                <span class="font-bold text-neutral-800 dark:text-neutral-200">${expiryFormatted}</span>
              </p>
            </div>
          </div>

          <div class="pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800/80">
            <button type="button" class="btn-inspect-store cursor-pointer w-full py-2.5 px-3 text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-xs" data-store-id="${store.id}" data-store-name="${store.store_name}" data-plan="${store.plan_tier}" data-paid="${store.is_paid}">
              <span>Inspect Store POS</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to inspect store
    this.portalStoresGrid.querySelectorAll('.btn-inspect-store').forEach(btn => {
      btn.addEventListener('click', () => {
        const storeId = btn.getAttribute('data-store-id');
        const storeName = btn.getAttribute('data-store-name');
        const storePlan = btn.getAttribute('data-plan');
        const storePaid = btn.getAttribute('data-paid');

        localStorage.setItem('user_store_id', String(storeId));
        localStorage.setItem('store_id', String(storeId));
        localStorage.setItem('store_name', storeName || 'Merchant POS');
        localStorage.setItem('user_plan', storePlan || 'free');
        localStorage.setItem('store_paid', String(storePaid));

        window.location.href = '/pages/users/client/dashboard/';
      });
    });
  }
  // --- END renderStoresPortal ---

  // --- START handleTogglePaid ---
  async handleTogglePaid(storeId, newPaidStatus) {
    const store = this.stores.find(s => s.id === storeId);
    if (!store) return;

    traceFlow('ADMIN 3.0', 'Toggling Store Paid Status', {
      StoreId: storeId,
      StoreName: store.store_name,
      NewStatus: newPaidStatus ? 'PAID' : 'UNPAID'
    });

    const res = await updateStoreSubscription(storeId, {
      planTier: store.plan_tier,
      billingCycle: store.billing_cycle,
      isPaid: newPaidStatus
    });

    if (res.success) {
      store.is_paid = newPaidStatus;
      await logUserActivity({
        actorRole: 'superadmin',
        actionType: 'TIER_UPDATE',
        description: `Toggled Store "${store.store_name}" Paid Status to ${newPaidStatus ? 'PAID' : 'UNPAID'}`,
        entityType: 'stores',
        entityId: storeId
      });
      await showSuccess('Status Updated', `Store "${store.store_name}" marked as ${newPaidStatus ? 'PAID' : 'UNPAID'}.`);
      this.updateStoreStats();
      this.renderStores();
    } else {
      await showError('Update Failed', res.error || 'Could not update store status.');
    }
  }
  // --- END handleTogglePaid ---

  // --- START openStoreDrawer / closeStoreDrawer ---
  openStoreDrawer() {
    if (this.drawerCreateStore) {
      traceFlow('ADMIN 1.3', 'Opening Store Merchant Creation Drawer');
      this.drawerCreateStore.classList.remove('translate-x-full');
    }
  }

  closeStoreDrawer() {
    if (this.drawerCreateStore) {
      this.drawerCreateStore.classList.add('translate-x-full');
      this.formCreateStore?.reset();
    }
  }
  // --- END openStoreDrawer / closeStoreDrawer ---

  // --- START handleCreateStoreSubmit ---
  async handleCreateStoreSubmit() {
    const name = document.getElementById('create-store-name').value.trim();
    const tier = document.getElementById('create-store-tier').value;
    const cycle = document.getElementById('create-store-cycle').value;
    const isPaid = document.getElementById('create-store-paid').checked;

    if (!name) return;

    traceFlow('ADMIN 3.2', 'Creating new store merchant record in Database', {
      StoreName: name,
      PlanTier: tier,
      BillingCycle: cycle,
      IsPaid: isPaid
    });

    const res = await createStore({
      storeName: name,
      planTier: tier,
      billingCycle: cycle,
      isPaid: isPaid
    });

    if (res.success) {
      await logUserActivity({
        actorRole: 'superadmin',
        actionType: 'STAFF_ADD',
        description: `Registered new store merchant "${name}" on ${tier.toUpperCase()} plan (${cycle})`,
        entityType: 'stores',
        entityId: res.data.id
      });
      await showSuccess('Store Created', `Store "${name}" has been successfully provisioned.`);
      this.closeStoreDrawer();
      await this.loadStores();
    } else {
      await showError('Creation Failed', res.error || 'Failed to create store merchant.');
    }
  }
  // --- END handleCreateStoreSubmit ---

  // --- START openEditModal / closeEditModal ---
  openEditModal(store) {
    if (!this.modalEditSub) return;
    traceFlow('ADMIN 1.4', 'Opening Subscription Modification Modal', { StoreId: store.id, StoreName: store.store_name });

    document.getElementById('edit-store-id').value = store.id;
    document.getElementById('edit-store-name').value = store.store_name;
    document.getElementById('edit-store-tier').value = store.plan_tier || 'free';
    document.getElementById('edit-store-cycle').value = store.billing_cycle || '30_days';
    document.getElementById('edit-store-paid').checked = store.is_paid || false;

    const expiryInput = document.getElementById('edit-store-expiry');
    if (expiryInput) {
      if (store.subscription_expires_at) {
        const d = new Date(store.subscription_expires_at);
        const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        expiryInput.value = localISO;
      } else {
        const defaultDate = new Date(Date.now() + 30 * 86400000);
        expiryInput.value = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      }
    }

    // Bind quick duration cycle changes
    const cycleSelect = document.getElementById('edit-store-cycle');
    if (cycleSelect && expiryInput) {
      cycleSelect.onchange = () => {
        const cycle = cycleSelect.value;
        const now = new Date();
        if (cycle === '15_days') now.setDate(now.getDate() + 15);
        else if (cycle === '30_days') now.setDate(now.getDate() + 30);
        else if (cycle === '3_months') now.setMonth(now.getMonth() + 3);
        else if (cycle === '6_months') now.setMonth(now.getMonth() + 6);
        else if (cycle === '1_year') now.setFullYear(now.getFullYear() + 1);

        if (cycle !== 'custom') {
          expiryInput.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        }
      };
    }

    // Quick extension buttons (+30 days, +1 year)
    const btnAdd30d = document.getElementById('btn-quick-add-30d');
    if (btnAdd30d && expiryInput) {
      btnAdd30d.onclick = () => {
        const current = expiryInput.value ? new Date(expiryInput.value) : new Date();
        current.setDate(current.getDate() + 30);
        expiryInput.value = new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        if (cycleSelect) cycleSelect.value = 'custom';
      };
    }

    const btnAdd1y = document.getElementById('btn-quick-add-1y');
    if (btnAdd1y && expiryInput) {
      btnAdd1y.onclick = () => {
        const current = expiryInput.value ? new Date(expiryInput.value) : new Date();
        current.setFullYear(current.getFullYear() + 1);
        expiryInput.value = new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        if (cycleSelect) cycleSelect.value = 'custom';
      };
    }

    const btnCancel = document.getElementById('btn-cancel-edit-sub');
    if (btnCancel) {
      btnCancel.onclick = () => this.closeEditModal();
    }

    this.modalEditSub.classList.remove('hidden');
    this.modalEditSub.classList.add('flex');
  }

  closeEditModal() {
    if (this.modalEditSub) {
      this.modalEditSub.classList.add('hidden');
      this.modalEditSub.classList.remove('flex');
    }
  }
  // --- END openEditModal / closeEditModal ---

  // --- START handleEditSubscriptionSubmit ---
  async handleEditSubscriptionSubmit() {
    const storeId = parseInt(document.getElementById('edit-store-id').value, 10);
    const tier = document.getElementById('edit-store-tier').value;
    const cycle = document.getElementById('edit-store-cycle').value;
    const isPaid = document.getElementById('edit-store-paid').checked;
    const expiryValue = document.getElementById('edit-store-expiry')?.value;

    let expiresAt = null;
    if (expiryValue) {
      expiresAt = new Date(expiryValue).toISOString();
    }

    traceFlow('ADMIN 3.3', 'Updating Store Subscription Tier & Validity', {
      StoreId: storeId,
      Tier: tier,
      Cycle: cycle,
      IsPaid: isPaid,
      ExpiresAt: expiresAt
    });

    const res = await updateStoreSubscription(storeId, {
      planTier: tier,
      billingCycle: cycle,
      isPaid: isPaid,
      expiresAt: expiresAt
    });

    if (res.success) {
      await logUserActivity({
        actorRole: 'superadmin',
        actionType: 'TIER_UPDATE',
        description: `Updated Store ID ${storeId} to ${tier.toUpperCase()} (${cycle}, ${isPaid ? 'PAID' : 'UNPAID'}, Expiry: ${expiresAt ? formatGMT8Date(expiresAt) : 'N/A'})`,
        entityType: 'stores',
        entityId: storeId
      });
      await showSuccess('Subscription Updated', `Store tier set to ${tier.toUpperCase()} (${isPaid ? 'PAID' : 'UNPAID'}).`);
      this.closeEditModal();
      await this.loadStores();
    } else {
      await showError('Update Failed', res.error || 'Could not update subscription.');
    }
  }
  // --- END handleEditSubscriptionSubmit ---

  // --- START loadAnnouncements ---
  async loadAnnouncements() {
    traceFlow('ADMIN 2.4', 'Loading system announcement records');
    const res = await fetchAllAnnouncements();
    if (res.success) {
      this.announcements = res.data;
      this.renderAnnouncements();
      this.updateAnnouncementStats();
    }
  }
  // --- END loadAnnouncements ---

  // --- START updateAnnouncementStats ---
  updateAnnouncementStats() {
    const activeAnn = this.announcements.find(a => a.is_active);
    const statEl = document.getElementById('stat-active-announcement');
    if (statEl) {
      statEl.textContent = activeAnn ? 'Active' : 'Inactive';
      const subtitle = statEl.parentElement?.querySelector('p');
      if (subtitle) {
        subtitle.textContent = activeAnn ? (activeAnn.title || activeAnn.badge_text) : 'No active announcement broadcasted';
      }
    }
  }
  // --- END updateAnnouncementStats ---

  // --- START renderAnnouncements ---
  renderAnnouncements() {
    if (!this.announcementsContainer) return;

    if (this.announcements.length === 0) {
      this.announcementsContainer.innerHTML = '<p class="text-xs text-neutral-400">No announcement records found.</p>';
      return;
    }

    this.announcementsContainer.innerHTML = this.announcements.map(ann => {
      return `
        <div class="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 text-[10px] font-black uppercase ${ann.is_active ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600'}">
                ${ann.badge_text}
              </span>
              <span class="text-xs font-bold text-neutral-900 dark:text-white">${ann.title || 'Broadcast'}</span>
            </div>
            <p class="text-xs text-neutral-600 dark:text-neutral-400">${ann.message}</p>
          </div>

          <button type="button" class="btn-toggle-ann-active cursor-pointer text-[10px] font-black uppercase px-2.5 py-1.5 ${ann.is_active ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'} transition" data-ann-id="${ann.id}" data-current-active="${ann.is_active}">
            ${ann.is_active ? 'ACTIVE' : 'ACTIVATE'}
          </button>
        </div>
      `;
    }).join('');

    this.announcementsContainer.querySelectorAll('.btn-toggle-ann-active').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.getAttribute('data-ann-id'), 10);
        const currentActive = btn.getAttribute('data-current-active') === 'true';

        traceFlow('ADMIN 3.4', 'Toggling Announcement Active Status', { AnnouncementId: id, NewStatus: !currentActive });

        const res = await toggleAnnouncementActive(id, !currentActive);
        if (res.success) {
          await showSuccess('Announcement Broadcast', `Announcement status changed to ${!currentActive ? 'ACTIVE' : 'INACTIVE'}.`);
          await this.loadAnnouncements();
        }
      });
    });
  }
  // --- END renderAnnouncements ---

  // --- START handleAnnouncementSubmit ---
  async handleAnnouncementSubmit() {
    const badge = this.annBadge?.value.trim();
    const message = this.annMessage?.value.trim();
    const btnText = this.annBtnText?.value.trim() || 'Dismiss';
    const isActive = document.getElementById('ann-active')?.checked;

    if (!message) return;

    traceFlow('ADMIN 3.5', 'Publishing new Announcement to client sidebars', {
      Badge: badge,
      Message: message,
      ActionText: btnText,
      IsActive: isActive
    });

    const res = await createAnnouncement({
      title: badge,
      badgeText: badge,
      message: message,
      actionText: btnText,
      isActive: isActive
    });

    if (res.success) {
      await showSuccess('Published', 'New announcement published to client sidebars.');
      this.formAnnouncement?.reset();
      await this.loadAnnouncements();
    }
  }
  // --- END handleAnnouncementSubmit ---

  // --- START loadAuditLogs ---
  async loadAuditLogs() {
    traceFlow('ADMIN 2.5', 'Loading security audit logs from Database');
    const res = await fetchAuditLogs(50);
    if (res.success) {
      this.auditLogs = res.data;
      this.renderAuditLogs();
    }
  }
  // --- END loadAuditLogs ---

  // --- START renderAuditLogs ---
  renderAuditLogs() {
    if (!this.auditTableBody) return;

    if (this.auditLogs.length === 0) {
      this.auditTableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-neutral-400">No activity audit logs recorded yet.</td></tr>';
      return;
    }

    this.auditTableBody.innerHTML = this.auditLogs.map(log => {
      const actionBadgeColor = {
        'LOGIN': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        'LOGOUT': 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
        'PASSWORD_CHANGE': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        'NEW_SALE': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
        'TIER_UPDATE': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
        'PRODUCT_ADD': 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
      }[log.action_type] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';

      const actorDisplay = log.users?.full_name
        ? `${log.users.full_name} (${log.actor_role.toUpperCase()})`
        : (log.actor_role || 'STAFF').toUpperCase();

      return `
        <tr class="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition">
          <td class="px-4 py-3 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            ${formatGMT8Date(log.created_at)}
          </td>
          <td class="px-4 py-3">
            <span class="px-2 py-0.5 text-[9px] font-black uppercase rounded-none ${actionBadgeColor}">
              ${log.action_type}
            </span>
          </td>
          <td class="px-4 py-3 font-sans font-bold text-neutral-900 dark:text-white whitespace-nowrap">
            ${actorDisplay}
          </td>
          <td class="px-4 py-3 text-neutral-600 dark:text-neutral-400">
            ${log.ip_address || '127.0.0.1'}
          </td>
          <td class="px-4 py-3 font-sans text-neutral-700 dark:text-neutral-300">
            ${log.description}
          </td>
        </tr>
      `;
    }).join('');
  }
  // --- END renderAuditLogs ---
}
// --- END AdminDashboard Class ---

// Export singleton initialization function
export function initAdminDashboard() {
  const dashboard = new AdminDashboard();
  dashboard.init();
}
// ==========================================
// END: SUPERADMIN CONTROL CENTER MODULE
// ==========================================
