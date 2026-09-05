import './style.css';
import 'flowbite';
import 'sweetalert2/dist/sweetalert2.min.css';
import { initTheme, toggleTheme } from './modules/theme-toggle.js';
import { initSidebar } from './modules/sidebar.js';
import { initDrawer } from './modules/drawer.js';
import { initDashboardPagination, initLiveClock, initDashboardTableSkeleton, initQuickActionsCarousel, initDashboardBranchFilter } from './modules/dashboard.js';
import { initTransactions } from './modules/transactions.js';
import { initProductsPage } from './modules/products.js';
import { initInbox } from './modules/inbox.js';
import { initTicket, initAdminTicket } from './modules/ticket.js';
import { initStaffs } from './modules/staffs.js';
import { initKnowledgePages } from './modules/docs.js';
import { initNumberCounters, highlightElementBorder } from './modules/animations.js';
import { initWeeklySalesChart } from './modules/charts.js';
import { initPOS } from './modules/pos.js';
import { initAdminDashboard } from './modules/admin-dashboard.js';
import { subscriptionManager } from './modules/permissions.js';
import { subscribeToStoreTier, subscribeToAnnouncements } from '../../backend/api/realtime.api.js';
import { initBranchesPage } from './modules/branches.js';
import { initSuppliers } from './modules/suppliers.js';
import { initUtang } from './modules/utang.js';
import { initPayroll } from './modules/payroll.js';
import { getActiveBranchName } from '../../backend/api/branches.api.js';
import './modules/auth.js';

// ==========================================
// START: Debugger Flow Tracer (Active in DEV mode, auto-stripped in PROD build)
// ==========================================
export function traceFlow(stepCode, description, details = {}) {
  const isDev = import.meta.env.DEV;
  if (!isDev) return;

  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.groupCollapsed(
    `%c[FLOW ${stepCode}]%c %c${description}%c @ ${timestamp}`,
    'background: #7c3aed; color: #ffffff; font-weight: 900; padding: 2px 6px;',
    '',
    'color: #10b981; font-weight: 800;',
    'color: #9ca3af; font-size: 10px;'
  );
  if (Object.keys(details).length > 0) {
    console.table(details);
  }
  console.trace('Execution Trace:');
  console.groupEnd();
}
// ==========================================
// END: Debugger Flow Tracer
// ==========================================

// ==========================================
// START: enforceRouteGuards
// Verifies authorization level: unauthenticated users cannot access dashboard and stay at login.
// ==========================================
function enforceRouteGuards() {
  const currentPath = window.location.pathname;
  const userRole = localStorage.getItem('user_role');
  const userPlan = localStorage.getItem('user_plan') || 'free';
  const isAuthPage = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/pages/') || currentPath.endsWith('/pages/index.html');

  traceFlow('1.0', 'Route & Security Guard Verification', {
    Path: currentPath,
    Role: userRole || 'Unauthenticated',
    PlanTier: userPlan,
    IsAuthPage: isAuthPage
  });

  // 1. If currently on Login / Auth Page:
  if (isAuthPage) {
    if (userRole === 'superadmin') {
      traceFlow('1.1', 'Already logged in as SuperAdmin - Redirecting to Admin Dashboard');
      window.location.href = '/pages/users/admin/dashboard/';
      return false;
    } else if (userRole) {
      traceFlow('1.1', 'Already logged in as Client - Redirecting to Client Dashboard');
      window.location.href = '/pages/users/client/dashboard/';
      return false;
    }
    return true; // Not logged in -> allowed to stay on login page
  }

  // 2. If attempting to access ANY protected route without logging in:
  if (!userRole) {
    console.warn('[Security Guard] Access denied. No active login session found. Redirecting to login page.');
    window.location.href = '/pages/index.html';
    return false;
  }

  // 3. Guard SuperAdmin routes: Only allow superadmin role
  if (currentPath.includes('/pages/users/admin/')) {
    if (userRole !== 'superadmin') {
      console.warn('[Security Guard] Unauthorized attempt to access admin portal. Redirecting to client dashboard.');
      window.location.href = '/pages/users/client/dashboard/';
      return false;
    }
  }

  return true;
}
// ==========================================
// END: enforceRouteGuards
// ==========================================

// ==========================================
// START: syncClientSidebarAnnouncement
// Dynamically synchronizes active broadcast announcements in the client sidebar
// ==========================================
export async function syncClientSidebarAnnouncement() {
  const banner = document.getElementById('sidebar-announcement-card');
  if (!banner) return;

  try {
    const { fetchActiveAnnouncement } = await import('../../backend/api/announcements.api.js');
    const res = await fetchActiveAnnouncement();
    if (res.success && res.data && res.data.is_active) {
      banner.classList.remove('hidden');
      const badge = banner.querySelector('#sidebar-announcement-badge');
      const msg = banner.querySelector('#sidebar-announcement-message');
      const btn = banner.querySelector('#sidebar-announcement-btn');
      const dismissBtn = banner.querySelector('#btn-dismiss-sidebar-announcement');

      if (badge) badge.textContent = res.data.badge_text || 'Notice';
      if (msg) msg.textContent = res.data.message || '';
      if (btn) {
        btn.textContent = res.data.action_button_text || 'Dismiss';
        btn.onclick = () => {
          banner.classList.add('hidden');
        };
      }
      if (dismissBtn) {
        dismissBtn.onclick = () => {
          banner.classList.add('hidden');
        };
      }
    } else {
      banner.classList.add('hidden');
    }
  } catch (err) {
    console.error('Failed to sync client sidebar announcement:', err);
  }
}
// ==========================================
// END: syncClientSidebarAnnouncement
// ==========================================

// ==========================================
// START: syncCurrentStoreSession
// Dynamically fetches the latest subscription status directly from the Database
// ==========================================
export async function syncCurrentStoreSession() {
  const userRole = localStorage.getItem('user_role');
  if (userRole === 'superadmin') {
    // SuperAdmin has full administrative access while inspecting client stores
    subscriptionManager.dismissTierUpgradeModal();
    return;
  }

  const storeId = parseInt(localStorage.getItem('user_store_id') || localStorage.getItem('store_id') || '1', 10);
  try {
    const { supabase } = await import('../../backend/api/client.api.js');
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .maybeSingle();

    if (!error && store) {
      traceFlow('1.2', 'Synchronized live store session from Database', {
        StoreId: store.id,
        Plan: store.plan_tier,
        IsPaid: store.is_paid
      });

      const oldPlan = localStorage.getItem('user_plan');
      const oldPaid = localStorage.getItem('store_paid');

      localStorage.setItem('user_plan', store.plan_tier || 'free');
      localStorage.setItem('store_paid', String(store.is_paid));
      localStorage.setItem('store_id', String(store.id));
      localStorage.setItem('user_store_id', String(store.id));

      if (window.location.pathname.includes('/pages/users/client/')) {
        const allowed = subscriptionManager.checkPageTierAccess(store.plan_tier || 'free');
        if (allowed) {
          subscriptionManager.dismissTierUpgradeModal();
          // If status changed from unpaid to paid, trigger live re-render
          if (oldPaid !== String(store.is_paid) || oldPlan !== store.plan_tier) {
            if (window.location.pathname.includes('/transactions')) {
              initTransactions();
            } else if (window.location.pathname.includes('/staffs')) {
              initStaffs();
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to sync live store session:', err);
  }
}
// ==========================================
// END: syncCurrentStoreSession
// ==========================================

// ==========================================
// START: injectSidebar
// Dynamically fetches and inserts the sidebar navigation component (Admin or Client) into placeholder containers.
// ==========================================
async function injectSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const isAdminPath = window.location.pathname.includes('/pages/users/admin/');
  const sidebarUrl = isAdminPath
    ? '/pages/users/admin/components/sidebar.html'
    : '/pages/users/client/components/sidebar.html';

  traceFlow('2.0', 'Injecting Navigation Sidebar', { TargetUrl: sidebarUrl, IsAdmin: isAdminPath });

  try {
    const response = await fetch(sidebarUrl);
    if (response.ok) {
      const html = await response.text();
      container.innerHTML = html;

      // Re-initialize Flowbite for newly injected elements
      if (typeof window.initFlowbite === 'function') {
        window.initFlowbite();
      }

      // Re-bind theme toggle listeners inside the injected container
      const themeToggleBtns = container.querySelectorAll('#theme-toggle');
      themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
      });

      initTheme();
      initSidebar(); // Initialize sidebar active states

      // If client view, dynamically fetch and render the active announcement and SuperAdmin inspector banner
      if (!isAdminPath) {
        syncClientSidebarAnnouncement();

        const userRole = localStorage.getItem('user_role');
        const inspectorBanner = container.querySelector('#admin-inspector-banner');
        if (inspectorBanner) {
          if (userRole === 'superadmin') {
            inspectorBanner.classList.remove('hidden');
            const storeNameEl = inspectorBanner.querySelector('#admin-inspector-store-name');
            const currentStoreName = localStorage.getItem('store_name') || `Store #${localStorage.getItem('user_store_id') || '1'}`;
            if (storeNameEl) storeNameEl.textContent = `Merchant: ${currentStoreName}`;
          } else {
            inspectorBanner.classList.add('hidden');
          }
        }

        const topBarBranch = container.querySelector('#nav-active-branch-name');
        if (topBarBranch) {
          topBarBranch.textContent = getActiveBranchName();
        }
      }
    }
  } catch (error) {
    console.error('Failed to inject sidebar component:', error);
  }
}
// ==========================================
// END: injectSidebar
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  traceFlow('0.1', 'DOM Content Loaded - Initiating Application Bootstrap');

  // Enforce security and tier route guards
  if (!enforceRouteGuards()) return;

  injectSidebar();

  // Initial page tier check (does not block initialization)
  const initialPlan = localStorage.getItem('user_plan') || 'free';
  if (window.location.pathname.includes('/pages/users/client/')) {
    subscriptionManager.checkPageTierAccess(initialPlan);
  }

  // Listen for hash navigation tier checks on Client Staff views
  window.addEventListener('hashchange', () => {
    const userPlan = localStorage.getItem('user_plan') || 'free';
    traceFlow('1.1', 'Hash Navigation Change Detected', { NewHash: window.location.hash, Plan: userPlan });
    if (window.location.pathname.includes('/pages/users/client/')) {
      subscriptionManager.checkPageTierAccess(userPlan);
    }
  });

  // Initialize Admin Dashboard if on SuperAdmin page
  if (window.location.pathname.includes('/pages/users/admin/')) {
    traceFlow('3.0', 'Bootstrapping SuperAdmin Control Center Module');
    initAdminDashboard();
    initAdminTicket();
    initLiveClock();
    return;
  }

  // Only inject cart drawer if the page uses it (e.g. POS page)
  if (document.querySelector('[data-drawer-target="cart-drawer"]')) {
    traceFlow('3.1', 'Initializing POS Cart Off-Canvas Drawer');
    initDrawer();
  }

  // Initialize dynamic staffs SPA routing if on the Staffs page
  if (document.getElementById('staffs-content-container') || document.getElementById('users-content-container')) {
    traceFlow('3.2', 'Initializing Staffs SPA Router');
    initStaffs();
  }

  traceFlow('3.3', 'Initializing Client Core Modules (Dashboard, Products, POS, Transactions, Support)');
  initDashboardPagination();
  initDashboardBranchFilter();
  initDashboardTableSkeleton();
  initQuickActionsCarousel();
  initWeeklySalesChart();
  initLiveClock();
  initTransactions();
  initProductsPage();
  initInbox();
  initTicket();
  initKnowledgePages();
  initNumberCounters();
  initPOS();
  initBranchesPage();
  initSuppliers();
  initUtang();
  initPayroll();

  // Reactive listener for active branch switches
  window.addEventListener('branch:changed', (e) => {
    const topBarBranch = document.getElementById('nav-active-branch-name');
    if (topBarBranch) {
      topBarBranch.textContent = e.detail?.branchName || 'All Branches';
    }
  });

  // ==========================================
  // START: Realtime Subscriptions
  // Synchronize store tier, paid status, and announcements across client and admin
  // ==========================================
  const currentStoreId = parseInt(localStorage.getItem('user_store_id') || localStorage.getItem('store_id') || '1', 10);

  traceFlow('4.0', 'Attaching Realtime Channels', {
    StoreId: currentStoreId,
    ListeningTables: ['stores', 'announcements', 'transactions', 'products']
  });

  // Query live store status on boot asynchronously
  syncCurrentStoreSession();

  subscribeToStoreTier(currentStoreId, (updatedStore) => {
    traceFlow('4.1', 'Realtime Store Tier & Subscription Change Received', {
      StoreName: updatedStore.store_name,
      NewTier: updatedStore.plan_tier,
      IsPaid: updatedStore.is_paid,
      ExpiresAt: updatedStore.subscription_expires_at
    });

    const prevTier = localStorage.getItem('user_plan');
    const prevPaid = localStorage.getItem('store_paid');

    localStorage.setItem('user_plan', updatedStore.plan_tier || 'free');
    localStorage.setItem('store_paid', String(updatedStore.is_paid));
    localStorage.setItem('store_id', String(updatedStore.id));
    localStorage.setItem('user_store_id', String(updatedStore.id));

    // Re-evaluate client permissions in real-time
    if (window.location.pathname.includes('/pages/users/client/')) {
      const allowed = subscriptionManager.checkPageTierAccess(updatedStore.plan_tier || 'free');
      if (allowed) {
        subscriptionManager.dismissTierUpgradeModal();
        // Trigger live re-render without forcing user to manually reload
        if (window.location.pathname.includes('/transactions')) {
          initTransactions();
        } else if (window.location.pathname.includes('/staffs')) {
          initStaffs();
        } else if (prevTier !== updatedStore.plan_tier || prevPaid !== String(updatedStore.is_paid)) {
          window.location.reload();
        }
      }
    }
  });

  subscribeToAnnouncements(async (payload) => {
    traceFlow('4.2', 'Realtime Announcement Change Received', payload);
    syncClientSidebarAnnouncement();
  });
  // ==========================================
  // END: Realtime Subscriptions
  // ==========================================
});





