// ==========================================
// suppliers.js - Suppliers Directory Frontend Module
// ==========================================
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../../backend/api/suppliers.api.js';
import { getActiveBranchId } from '../../../backend/api/branches.api.js';
import { openDrawer, closeDrawer, bindDrawerTriggers } from './drawer.js';
import { showSuccess, showError } from './modals.js';
import Swal from 'sweetalert2';

// --- START initSuppliers ---
export async function initSuppliers() {
  const container = document.getElementById('suppliers-list-container');
  if (!container) return; // Exit if not on the suppliers page

  let suppliers = [];
  let searchQuery = '';

  const storeId = parseInt(localStorage.getItem('store_id') || '1', 10);
  let branchId = getActiveBranchId();

  window.addEventListener('branch:changed', (e) => {
    branchId = e.detail?.branchId !== undefined ? e.detail.branchId : getActiveBranchId();
    loadSuppliers();
  });

  // Render initial skeleton loader
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      ${Array(3).fill(0).map(() => `
        <div class="bg-white dark:bg-[#1f2029] p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <div class="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div class="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div class="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
      `).join('')}
    </div>
  `;

  // Bind Drawer open/close triggers
  bindDrawerTriggers('supplier-drawer');

  // Load suppliers
  async function loadSuppliers() {
    const res = await fetchSuppliers(storeId, branchId);
    if (res.success && res.data && res.data.length > 0) {
      suppliers = res.data;
    } else {
      // Fallback sample suppliers for initial onboarding
      suppliers = [
        {
          id: 1,
          name: 'Coca-Cola Beverages Philippines',
          contact_person: 'Juan Dela Cruz',
          phone: '0917-123-4567',
          email: 'orders@coca-cola.com.ph',
          notes: 'Delivery every Tuesday and Friday morning. Minimum order 5 cases.'
        },
        {
          id: 2,
          name: 'Universal Robina Corp (URC)',
          contact_person: 'Maria Santos',
          phone: '0918-987-6543',
          email: 'distributor@urc.com.ph',
          notes: 'Snacks & C2 iced tea supply. Credit terms 15 days.'
        }
      ];
    }
    renderSuppliers();
  }

  // Render list or empty state matching [IMAGE 1]
  function renderSuppliers() {
    const filtered = suppliers.filter(s => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    });

    const subtitleEl = document.getElementById('supplier-count-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = `${filtered.length} suppliers`;
    }

    if (filtered.length === 0) {
      // Empty state matching [IMAGE 1]
      container.innerHTML = `
        <div class="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div class="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.215-9.106m-12.75 0h12.75m-12.75 0a1.125 1.125 0 0 0-1.125 1.125v6m13.875-7.125L17.25 4.5H6.75l-1.875 3.375" />
            </svg>
          </div>
          <h3 class="text-base font-extrabold text-neutral-900 dark:text-white mb-1">No suppliers yet</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">Add a supplier to keep their contact info handy.</p>
          <button type="button" id="btn-empty-add-supplier"
            class="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all">
            Add supplier
          </button>
        </div>
      `;

      const emptyBtn = container.querySelector('#btn-empty-add-supplier');
      if (emptyBtn) {
        emptyBtn.addEventListener('click', () => {
          resetSupplierForm();
          openDrawer('supplier-drawer');
        });
      }
      return;
    }

    // Grid of supplier cards
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${filtered.map(s => `
          <div class="bg-white dark:bg-[#1f2029] p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all group">
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-extrabold text-base text-neutral-900 dark:text-white">${s.name}</h3>
                <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button type="button" class="btn-edit-supplier p-1.5 text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition" data-id="${s.id}" title="Edit supplier">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>
                  </button>
                  <button type="button" class="btn-delete-supplier p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition" data-id="${s.id}" data-name="${s.name}" title="Delete supplier">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                  </button>
                </div>
              </div>

              ${s.contact_person ? `
                <div class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
                  <svg class="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
                  <span>${s.contact_person}</span>
                </div>
              ` : ''}

              ${s.phone ? `
                <div class="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
                  <a href="tel:${s.phone}" class="hover:underline">${s.phone}</a>
                </div>
              ` : ''}

              ${s.email ? `
                <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-2">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
                  <a href="mailto:${s.email}" class="hover:underline truncate">${s.email}</a>
                </div>
              ` : ''}

              ${s.notes ? `
                <div class="p-2.5 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mt-2">
                  ${s.notes}
                </div>
              ` : ''}
            </div>

            <!-- Card Bottom Call Button -->
            ${s.phone ? `
              <div class="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <a href="tel:${s.phone}" class="w-full py-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
                  <span>Call Supplier</span>
                </a>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    // Bind edit and delete handlers
    container.querySelectorAll('.btn-edit-supplier').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const s = suppliers.find(sup => sup.id === id);
        if (s) {
          populateEditSupplier(s);
          openDrawer('supplier-drawer');
        }
      });
    });

    container.querySelectorAll('.btn-delete-supplier').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const name = btn.dataset.name;
        confirmDeleteSupplier(id, name);
      });
    });
  }

  function resetSupplierForm() {
    document.getElementById('supplier-id').value = '';
    document.getElementById('supplier-name').value = '';
    document.getElementById('supplier-contact-person').value = '';
    document.getElementById('supplier-phone').value = '';
    document.getElementById('supplier-email').value = '';
    document.getElementById('supplier-notes').value = '';
    document.getElementById('supplier-drawer-title').textContent = 'Add supplier';
    document.getElementById('btn-submit-supplier').textContent = 'Add supplier';
  }

  function populateEditSupplier(s) {
    document.getElementById('supplier-id').value = s.id;
    document.getElementById('supplier-name').value = s.name || '';
    document.getElementById('supplier-contact-person').value = s.contact_person || '';
    document.getElementById('supplier-phone').value = s.phone || '';
    document.getElementById('supplier-email').value = s.email || '';
    document.getElementById('supplier-notes').value = s.notes || '';
    document.getElementById('supplier-drawer-title').textContent = 'Edit supplier';
    document.getElementById('btn-submit-supplier').textContent = 'Update supplier';
  }

  function confirmDeleteSupplier(id, name) {
    Swal.fire({
      title: 'Delete Supplier?',
      text: `Are you sure you want to remove "${name}" from your suppliers list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'cursor-pointer px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl mr-2',
        cancelButton: 'cursor-pointer px-4 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 rounded-xl'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteSupplier(id);
        suppliers = suppliers.filter(s => s.id !== id);
        renderSuppliers();
        showSuccess('Deleted', 'Supplier removed successfully.');
      }
    });
  }

  // Bind Open Add Supplier trigger
  const openAddBtn = document.getElementById('btn-open-add-supplier');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      resetSupplierForm();
      openDrawer('supplier-drawer');
    });
  }

  // Bind Search Input
  const searchInput = document.getElementById('search-suppliers-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderSuppliers();
    });
  }

  // Form Submission
  const form = document.getElementById('supplier-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('supplier-id').value;
      const name = document.getElementById('supplier-name').value.trim();
      const contactPerson = document.getElementById('supplier-contact-person').value.trim();
      const phone = document.getElementById('supplier-phone').value.trim();
      const email = document.getElementById('supplier-email').value.trim();
      const notes = document.getElementById('supplier-notes').value.trim();

      if (!name) {
        showError('Required Field', 'Please enter a supplier name.');
        return;
      }

      if (id) {
        // Update existing
        const res = await updateSupplier(parseInt(id, 10), {
          name,
          contact_person: contactPerson,
          phone,
          email,
          notes
        });
        if (res.success) {
          const idx = suppliers.findIndex(s => s.id === parseInt(id, 10));
          if (idx !== -1) {
            suppliers[idx] = { ...suppliers[idx], name, contact_person: contactPerson, phone, email, notes };
          }
          closeDrawer('supplier-drawer');
          renderSuppliers();
          showSuccess('Updated', `Supplier "${name}" updated successfully!`);
        }
      } else {
        // Create new
        const res = await createSupplier({
          storeId,
          branchId,
          name,
          contactPerson,
          phone,
          email,
          notes
        });
        if (res.success && res.data) {
          suppliers.unshift(res.data);
        } else {
          // Local fallback
          suppliers.unshift({
            id: Date.now(),
            name,
            contact_person: contactPerson,
            phone,
            email,
            notes
          });
        }
        closeDrawer('supplier-drawer');
        renderSuppliers();
        showSuccess('Added', `Supplier "${name}" registered successfully!`);
      }
    });
  }

  loadSuppliers();
}
// --- END initSuppliers ---
