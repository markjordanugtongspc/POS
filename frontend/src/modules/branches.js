// ==========================================
// branches.js - Multi-Branch Management & Switching Module
// ==========================================
import {
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getActiveBranchId,
  getActiveBranchName,
  setActiveBranch
} from '../../../backend/api/branches.api.js';
import { subscriptionManager } from './permissions.js';
import { showSuccess, showError } from './modals.js';

// Business Type Metadata helper
const BUSINESS_TYPES = {
  sari_sari_store: { label: 'Sari-Sari Store', icon: '🏪', color: 'emerald' },
  convenience_store: { label: 'Convenience Store', icon: '🛒', color: 'blue' },
  food_stall: { label: 'Roadside Food Stall', icon: '🍜', color: 'amber' },
  market_stall: { label: 'Market Stall', icon: '🥬', color: 'lime' },
  boutique_retail: { label: 'Boutique Retail', icon: '👗', color: 'purple' },
  pharmacy: { label: 'Pharmacy', icon: '💊', color: 'rose' },
  hardware: { label: 'Hardware & Supplies', icon: '🔧', color: 'orange' },
  other: { label: 'Custom Business', icon: '✨', color: 'cyan' }
};

function formatBusinessType(typeCode) {
  if (BUSINESS_TYPES[typeCode]) {
    return BUSINESS_TYPES[typeCode];
  }
  // If user entered a custom text directly as typeCode
  return { label: typeCode, icon: '✨', color: 'cyan' };
}

/**
 * Initialize Branch Management Page
 */
export async function initBranchesPage() {
  const branchesGrid = document.getElementById('branches-grid');
  if (!branchesGrid) return; // Exit if not on branches page

  let branches = [];
  const currentPlan = localStorage.getItem('user_plan') || 'free';
  const limits = subscriptionManager.getLimits(currentPlan);

  // Drawer Elements
  const drawer = document.getElementById('branch-drawer');
  const backdrop = document.getElementById('branch-drawer-backdrop');
  const btnAddBranch = document.getElementById('btn-add-branch');
  const btnCloseDrawer = document.getElementById('btn-branch-drawer-close');
  const btnCancelDrawer = document.getElementById('btn-cancel-branch');
  const formBranch = document.getElementById('form-branch');
  const drawerTitle = document.getElementById('branch-drawer-title');
  const branchIdInput = document.getElementById('branch-id-input');
  const inputBranchName = document.getElementById('input-branch-name');
  const selectBusinessType = document.getElementById('select-business-type');
  const customTypeContainer = document.getElementById('custom-type-container');
  const inputCustomBusinessType = document.getElementById('input-custom-business-type');
  const inputBranchAddress = document.getElementById('input-branch-address');
  const inputBranchActive = document.getElementById('input-branch-active');
  const drawerErrorMsg = document.getElementById('drawer-error-msg');

  // Toolbar Elements
  const searchInput = document.getElementById('branch-search-input');
  const typeFilter = document.getElementById('branch-type-filter');
  const btnAllBranches = document.getElementById('btn-all-branches-context');
  const currentBranchTitle = document.getElementById('current-active-branch-title');

  // --- Drawer Open / Close Functions ---
  const openDrawer = (isEdit = false, branchData = null) => {
    drawerErrorMsg?.classList.add('hidden');
    formBranch?.reset();

    if (isEdit && branchData) {
      if (drawerTitle) drawerTitle.innerHTML = `<span>Edit Branch: ${branchData.branch_name}</span>`;
      if (branchIdInput) branchIdInput.value = branchData.id;
      if (inputBranchName) inputBranchName.value = branchData.branch_name;
      if (inputBranchAddress) inputBranchAddress.value = branchData.address || '';
      if (inputBranchActive) inputBranchActive.checked = branchData.is_active;

      // Check if known type or custom
      if (BUSINESS_TYPES[branchData.business_type]) {
        if (selectBusinessType) selectBusinessType.value = branchData.business_type;
        customTypeContainer?.classList.add('hidden');
      } else {
        if (selectBusinessType) selectBusinessType.value = 'other';
        customTypeContainer?.classList.remove('hidden');
        if (inputCustomBusinessType) inputCustomBusinessType.value = branchData.business_type;
      }
    } else {
      if (drawerTitle) drawerTitle.innerHTML = `<span>Add New Branch</span>`;
      if (branchIdInput) branchIdInput.value = '';
      if (selectBusinessType) selectBusinessType.value = 'sari_sari_store';
      customTypeContainer?.classList.add('hidden');
      if (inputBranchActive) inputBranchActive.checked = true;
    }

    backdrop?.classList.remove('hidden', 'pointer-events-none');
    backdrop?.offsetHeight; // force reflow
    backdrop?.classList.remove('opacity-0');
    backdrop?.classList.add('opacity-100');
    drawer?.classList.remove('translate-x-full');
    drawer?.classList.add('translate-x-0');
  };

  const closeDrawer = () => {
    drawer?.classList.remove('translate-x-0');
    drawer?.classList.add('translate-x-full');
    backdrop?.classList.remove('opacity-100');
    backdrop?.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      backdrop?.classList.add('hidden');
    }, 300);
  };

  // Dismiss on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer?.classList.contains('translate-x-full')) {
      closeDrawer();
    }
  });

  btnAddBranch?.addEventListener('click', () => {
    // Check Subscription Limit for Branches
    if (!subscriptionManager.canAddBranch(branches.length, currentPlan)) {
      subscriptionManager.showTierUpgradeModal(`Branch Limit Reached (${limits.maxBranches} branches max for ${currentPlan.toUpperCase()})`);
      return;
    }
    openDrawer(false);
  });

  btnCloseDrawer?.addEventListener('click', closeDrawer);
  btnCancelDrawer?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  // Dynamic "Other" Custom Business Type toggle
  selectBusinessType?.addEventListener('change', (e) => {
    if (e.target.value === 'other') {
      customTypeContainer?.classList.remove('hidden');
      inputCustomBusinessType?.focus();
    } else {
      customTypeContainer?.classList.add('hidden');
    }
  });

  // Switch to All Branches (Global)
  btnAllBranches?.addEventListener('click', () => {
    setActiveBranch(null, 'All Branches (Global View)');
    updateActiveContextDisplay();
    renderCards();
    showSuccess('Context Switched', 'Viewing aggregate data across all branches.');
  });

  const updateActiveContextDisplay = () => {
    const activeId = getActiveBranchId();
    const activeName = getActiveBranchName();
    if (currentBranchTitle) {
      currentBranchTitle.textContent = activeId ? activeName : 'All Branches (Global View)';
    }

    // Update Topbar badge if present
    const topBarBranch = document.getElementById('nav-active-branch-name');
    if (topBarBranch) {
      topBarBranch.textContent = activeName;
    }
  };

  // --- Form Submit Handler ---
  formBranch?.addEventListener('submit', async (e) => {
    e.preventDefault();
    drawerErrorMsg?.classList.add('hidden');

    const branchName = inputBranchName?.value?.trim();
    if (!branchName) {
      if (drawerErrorMsg) {
        drawerErrorMsg.textContent = 'Please provide a valid branch name.';
        drawerErrorMsg.classList.remove('hidden');
      }
      return;
    }

    let businessType = selectBusinessType?.value;
    if (businessType === 'other') {
      const customVal = inputCustomBusinessType?.value?.trim();
      if (!customVal) {
        if (drawerErrorMsg) {
          drawerErrorMsg.textContent = 'Please specify your custom business type name.';
          drawerErrorMsg.classList.remove('hidden');
        }
        return;
      }
      businessType = customVal;
    }

    const address = inputBranchAddress?.value?.trim() || '';
    const isActive = inputBranchActive?.checked ?? true;
    const branchId = branchIdInput?.value ? parseInt(branchIdInput.value, 10) : null;

    const saveBtn = document.getElementById('btn-save-branch');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'SAVING...';
    }

    try {
      if (branchId) {
        // Update existing branch
        const res = await updateBranch(branchId, {
          branch_name: branchName,
          business_type: businessType,
          address: address,
          is_active: isActive
        });
        if (!res.success) throw new Error(res.error || 'Failed to update branch');
        showSuccess('Branch Updated', `Branch "${branchName}" has been updated.`);
      } else {
        // Create new branch
        const res = await createBranch({
          branchName,
          businessType,
          address
        });
        if (!res.success) throw new Error(res.error || 'Failed to create branch');
        showSuccess('Branch Created', `Branch "${branchName}" was created successfully.`);
      }

      closeDrawer();
      await loadBranches();
    } catch (err) {
      if (drawerErrorMsg) {
        drawerErrorMsg.textContent = err.message || 'Operation failed. Please try again.';
        drawerErrorMsg.classList.remove('hidden');
      }
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'SAVE BRANCH';
      }
    }
  });

  // --- Render Branch Cards ---
  const renderCards = () => {
    const searchTerm = searchInput?.value?.toLowerCase().trim() || '';
    const selectedType = typeFilter?.value || 'all';
    const activeId = getActiveBranchId();

    const filtered = branches.filter(b => {
      const matchesSearch = b.branch_name.toLowerCase().includes(searchTerm) ||
        (b.address && b.address.toLowerCase().includes(searchTerm));
      const matchesType = selectedType === 'all' || b.business_type === selectedType;
      return matchesSearch && matchesType;
    });

    if (filtered.length === 0) {
      branchesGrid.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white dark:bg-[#1f2029] border border-neutral-200 dark:border-neutral-800 p-8">
          <div class="w-12 h-12 rounded-none bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/></svg>
          </div>
          <h4 class="text-sm font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">No branches found</h4>
          <p class="text-xs text-neutral-500 mt-1">Try adjusting your search terms or create your first branch.</p>
        </div>
      `;
      return;
    }

    branchesGrid.innerHTML = filtered.map(b => {
      const typeMeta = formatBusinessType(b.business_type);
      const isCurrentActive = activeId === b.id;

      return `
        <div class="bg-white dark:bg-[#1f2029] border ${isCurrentActive ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-neutral-200 dark:border-neutral-800'} p-5 flex flex-col justify-between gap-4 transition-all">
          <div>
            <!-- Top Badges -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                <span>${typeMeta.icon}</span>
                <span>${typeMeta.label}</span>
              </span>

              <div class="flex items-center gap-2">
                ${isCurrentActive ? `
                  <span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white rounded-none">
                    Active Station
                  </span>
                ` : ''}
                <span class="px-2 py-0.5 text-[10px] font-bold ${b.is_active ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800' : 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800'}">
                  ${b.is_active ? 'Online' : 'Paused'}
                </span>
              </div>
            </div>

            <!-- Branch Name & Location -->
            <h3 class="text-base font-extrabold text-neutral-900 dark:text-white tracking-tight leading-snug">
              ${b.branch_name}
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-start gap-1.5 line-clamp-2">
              <svg class="w-3.5 h-3.5 shrink-0 text-neutral-400 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              <span>${b.address || 'No location set'}</span>
            </p>

            <!-- Metrics / Info Row -->
            <div class="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold">
              <span class="text-neutral-500 dark:text-neutral-400">Inventory Catalog:</span>
              <a href="/pages/users/client/products/?list" class="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                <span>${b.products_count} Products</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
              </a>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="space-y-2 pt-2">
            ${isCurrentActive ? `
              <button type="button" disabled
                class="w-full py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider border border-emerald-300 dark:border-emerald-800/60 cursor-default flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                Current Station Active
              </button>
            ` : `
              <button type="button" data-switch-id="${b.id}" data-switch-name="${b.branch_name}"
                class="btn-switch-branch cursor-pointer w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-98">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
                Switch to this Branch
              </button>
            `}

            <div class="grid grid-cols-2 gap-2">
              <button type="button" data-edit-id="${b.id}"
                class="btn-edit-branch cursor-pointer py-1.5 px-2 text-center text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition">
                Edit Details
              </button>
              <button type="button" data-delete-id="${b.id}" data-delete-name="${b.branch_name}"
                class="btn-delete-branch cursor-pointer py-1.5 px-2 text-center text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 transition">
                Remove
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind card action buttons
    document.querySelectorAll('.btn-switch-branch').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.switchId, 10);
        const name = btn.dataset.switchName;
        setActiveBranch(id, name);
        updateActiveContextDisplay();
        renderCards();
        showSuccess('Active Branch Changed', `Switched station context to: "${name}". POS and Inventory are now focused here.`);
      });
    });

    document.querySelectorAll('.btn-edit-branch').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.editId, 10);
        const branchData = branches.find(b => b.id === id);
        if (branchData) {
          openDrawer(true, branchData);
        }
      });
    });

    document.querySelectorAll('.btn-delete-branch').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.deleteId, 10);
        const name = btn.dataset.deleteName;

        if (confirm(`Are you sure you want to remove "${name}"? Existing transactions will retain record.`)) {
          const res = await deleteBranch(id);
          if (res.success) {
            showSuccess('Branch Removed', `Branch "${name}" has been removed.`);
            await loadBranches();
          } else {
            showError('Deletion Failed', res.error || 'Could not delete branch.');
          }
        }
      });
    });
  };

  // --- Load Branches from API ---
  const loadBranches = async () => {
    const res = await fetchBranches();
    if (res.success) {
      branches = res.data;

      // Update badge counts
      const badgeBranchCount = document.getElementById('badge-branch-count');
      if (badgeBranchCount) {
        badgeBranchCount.textContent = `${branches.length} ${branches.length === 1 ? 'Branch' : 'Branches'}`;
      }

      // Update tier limit banner
      const branchUsageText = document.getElementById('branch-usage-text');
      const tierLabel = document.getElementById('tier-name-label');
      if (branchUsageText) {
        branchUsageText.textContent = `${branches.length} of ${limits.maxBranches === Infinity ? 'Unlimited' : limits.maxBranches} Branches Active`;
      }
      if (tierLabel) {
        tierLabel.textContent = `${currentPlan} Plan`;
      }

      renderCards();
      updateActiveContextDisplay();
    } else {
      branchesGrid.innerHTML = `
        <div class="col-span-full py-8 text-center text-rose-500 font-bold text-xs">
          Failed to load branches: ${res.error}
        </div>
      `;
    }
  };

  // Search & Filter listeners
  searchInput?.addEventListener('input', renderCards);
  typeFilter?.addEventListener('change', renderCards);

  // Initial load
  await loadBranches();
}
