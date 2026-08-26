// ==========================================
// permissions.js - OOP Subscription & RBAC Enforcement Controller
// ==========================================

// --- START SubscriptionManager Class ---
export class SubscriptionManager {
  constructor() {
    this.planLimits = {
      free: {
        maxProducts: 10,
        canAccessTransactions: false,
        canAccessInventoryManagers: false,
        canAccessCashiers: false,
        canAddOwner: false, // 0 extra owners, 1 main only
        maxOwners: 1,
        maxInventoryManagers: 0,
        maxCashiers: 0,
        cameraScanner: true, // Basic for ALL
        exportReports: false // Disabled
      },
      starter: {
        maxProducts: 500,
        canAccessTransactions: true,
        canAccessInventoryManagers: true,
        canAccessCashiers: true,
        canAddOwner: true,
        maxOwners: 2, // Strictly capped at 2
        maxInventoryManagers: 2,
        maxCashiers: 4,
        cameraScanner: true,
        exportReports: true
      },
      pro: {
        maxProducts: Infinity,
        canAccessTransactions: true,
        canAccessInventoryManagers: true,
        canAccessCashiers: true,
        canAddOwner: true,
        maxOwners: 2, // Strictly capped at 2
        maxInventoryManagers: Infinity,
        maxCashiers: Infinity,
        cameraScanner: true,
        exportReports: true
      }
    };
  }

  // --- START getLimits ---
  getLimits(tier = 'free') {
    return this.planLimits[tier] || this.planLimits.free;
  }
  // --- END getLimits ---

  // --- START canAddProduct ---
  canAddProduct(currentProductCount, tier = 'free') {
    const limit = this.getLimits(tier).maxProducts;
    return currentProductCount < limit;
  }
  // --- END canAddProduct ---

  // --- START canAddStaff ---
  canAddStaff(role, currentCount, tier = 'free') {
    const limits = this.getLimits(tier);
    if (role === 'owner') return currentCount < limits.maxOwners;
    if (role === 'inventory_manager') return currentCount < limits.maxInventoryManagers;
    if (role === 'cashier') return currentCount < limits.maxCashiers;
    return false;
  }
  // --- END canAddStaff ---

  // --- START calculateExpirationDate ---
  calculateExpirationDate(startDate = new Date(), billingCycle = '30_days') {
    const date = new Date(startDate);
    switch (billingCycle) {
      case '15_days':
        date.setDate(date.getDate() + 15);
        break;
      case '30_days':
        date.setDate(date.getDate() + 30);
        break;
      case '3_months':
        date.setMonth(date.getMonth() + 3);
        break;
      case '6_months':
        date.setMonth(date.getMonth() + 6);
        break;
      case '1_year':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setDate(date.getDate() + 30);
    }
    return date.toISOString();
  }
  // --- END calculateExpirationDate ---

  // --- START isSubscriptionActive ---
  isSubscriptionActive(store) {
    if (!store) return false;
    if (store.plan_tier === 'free') return true; // Free tier never expires
    if (!store.is_paid) return false;

    // Check expiration date against current time
    if (store.subscription_expires_at) {
      const expiresAt = new Date(store.subscription_expires_at).getTime();
      return Date.now() <= expiresAt;
    }
    return true;
  }
  // --- END isSubscriptionActive ---

  // --- START dismissTierUpgradeModal ---
  dismissTierUpgradeModal() {
    const existing = document.getElementById('tier-upgrade-modal');
    if (existing) {
      existing.remove();
    }
  }
  // --- END dismissTierUpgradeModal ---

  // --- START showTierUpgradeModal ---
  showTierUpgradeModal(featureName = 'This feature') {
    this.dismissTierUpgradeModal();

    const modalHtml = `
      <div id="tier-upgrade-modal" tabindex="-1" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
        <div class="relative w-full max-w-md bg-white dark:bg-[#16171d] border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl text-center">
          <div class="w-12 h-12 rounded-none bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800/50">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h3 class="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-wider mb-2">Upgrade Required</h3>
          <p class="text-xs text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            <strong>${featureName}</strong> is restricted on the <strong>Free Plan</strong>. Please upgrade your store subscription to Starter or Pro to unlock access.
          </p>
          <div class="flex items-center justify-center gap-3">
            <button id="btn-upgrade-back-dashboard" type="button" class="cursor-pointer px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-black uppercase tracking-wider transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('btn-upgrade-back-dashboard')?.addEventListener('click', () => {
      window.location.href = '/pages/users/client/dashboard/';
    });
  }
  // --- END showTierUpgradeModal ---

  // --- START checkPageTierAccess ---
  checkPageTierAccess(storePlan = null) {
    const rawPlan = storePlan || localStorage.getItem('user_plan') || 'free';
    const isPaid = localStorage.getItem('store_paid') === 'true' || storePlan !== null;
    const effectivePlan = (rawPlan === 'free' || isPaid) ? rawPlan : 'free';
    const limits = this.getLimits(effectivePlan);

    const path = window.location.pathname;
    const hash = window.location.hash;

    // 1. Transactions Page Block
    if (path.includes('/transactions')) {
      if (!limits.canAccessTransactions) {
        this.showTierUpgradeModal('Transactions & Sales Ledger');
        return false;
      } else {
        this.dismissTierUpgradeModal();
      }
    }

    // 2. Staffs Page Sub-views Block
    if (path.includes('/staffs')) {
      if (hash === '#inventorym') {
        if (!limits.canAccessInventoryManagers) {
          this.showTierUpgradeModal('Inventory Managers Directory');
          return false;
        } else {
          this.dismissTierUpgradeModal();
        }
      }
      if (hash === '#cashiers') {
        if (!limits.canAccessCashiers) {
          this.showTierUpgradeModal('Cashiers Directory');
          return false;
        } else {
          this.dismissTierUpgradeModal();
        }
      }
    }

    this.dismissTierUpgradeModal();
    return true;
  }
  // --- END checkPageTierAccess ---
}
// --- END SubscriptionManager Class ---

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();
