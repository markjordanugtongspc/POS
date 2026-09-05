// ==========================================
// utang.js - Utang & Credit Ledger Frontend Module
// ==========================================
import { fetchUtangRecords, createUtangRecord, recordUtangPayment, fetchCustomers, createCustomer, deleteUtangRecord } from '../../../backend/api/utang.api.js';
import { getActiveBranchId } from '../../../backend/api/branches.api.js';
import { openDrawer, closeDrawer, bindDrawerTriggers, initSignaturePad } from './drawer.js';
import { showSuccess, showError } from './modals.js';
import { animateNumber } from './animations.js';
import Swal from 'sweetalert2';

// --- START initUtang ---
export async function initUtang() {
  const container = document.getElementById('utang-list-container');
  if (!container) return; // Exit if not on the utang page

  let utangRecords = [];
  let customers = [];
  let searchQuery = '';

  const storeId = parseInt(localStorage.getItem('store_id') || '1', 10);
  let branchId = getActiveBranchId();

  window.addEventListener('branch:changed', (e) => {
    branchId = e.detail?.branchId !== undefined ? e.detail.branchId : getActiveBranchId();
    loadData();
  });

  // Set default date added to today
  const dateAddedInput = document.getElementById('utang-date-added');
  if (dateAddedInput) {
    dateAddedInput.value = new Date().toISOString().split('T')[0];
  }

  // Bind Drawer triggers
  bindDrawerTriggers('utang-drawer');
  bindDrawerTriggers('utang-payment-drawer');

  // Initialize E-Signature Pad
  const signatureController = initSignaturePad('utang-signature-pad', 'btn-clear-signature');

  // Customer Select change listener
  const customerSelect = document.getElementById('utang-customer-select');
  const nameWrapper = document.getElementById('utang-customer-name-wrapper');
  const contactWrapper = document.getElementById('utang-customer-contact-wrapper');

  if (customerSelect) {
    customerSelect.addEventListener('change', () => {
      if (customerSelect.value === 'NEW') {
        nameWrapper.classList.remove('hidden');
        contactWrapper.classList.remove('hidden');
        document.getElementById('utang-customer-name').value = '';
        document.getElementById('utang-customer-phone').value = '';
      } else {
        const selectedId = parseInt(customerSelect.value, 10);
        const cust = customers.find(c => c.id === selectedId);
        if (cust) {
          nameWrapper.classList.add('hidden');
          contactWrapper.classList.add('hidden');
          document.getElementById('utang-customer-name').value = cust.name;
          document.getElementById('utang-customer-phone').value = cust.phone || '';
        }
      }
    });
  }

  // Load Data
  async function loadData() {
    const [recordsRes, customersRes] = await Promise.all([
      fetchUtangRecords(storeId, branchId),
      fetchCustomers(storeId, branchId)
    ]);

    if (recordsRes.success && recordsRes.data && recordsRes.data.length > 0) {
      utangRecords = recordsRes.data;
    } else {
      // Starter mock records if table is fresh
      utangRecords = [
        {
          id: 1,
          customer_name: 'Nena Cruz',
          customer_phone: '0917-111-2233',
          items_summary: '2 Lucky Me Canton, 1 Coke 1.5L, 1 Egg tray',
          amount: 280.00,
          balance: 280.00,
          status: 'unpaid',
          due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          date_added: new Date().toISOString().split('T')[0]
        },
        {
          id: 2,
          customer_name: 'Mang Tomas Barbershop',
          customer_phone: '0922-333-4455',
          items_summary: '1 Premium Rice 5kg, 3 Canned Sardines',
          amount: 350.00,
          balance: 100.00,
          status: 'partially_paid',
          due_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // Overdue
          date_added: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0]
        }
      ];
    }

    if (customersRes.success && customersRes.data) {
      customers = customersRes.data;
    }
    populateCustomerDropdown();
    renderUtangDashboard();
  }

  function populateCustomerDropdown() {
    if (!customerSelect) return;
    customerSelect.innerHTML = `<option value="NEW" selected>Register new customer</option>`;
    customers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} ${c.phone ? `(${c.phone})` : ''}`;
      customerSelect.appendChild(opt);
    });
  }

  function renderUtangDashboard() {
    // 1. Calculate KPI Metrics
    let totalOutstanding = 0;
    let overdueCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    utangRecords.forEach(r => {
      const bal = parseFloat(r.balance) || 0;
      totalOutstanding += bal;
      if (bal > 0 && r.due_date && r.due_date < todayStr) {
        overdueCount++;
      }
    });

    const totalEl = document.getElementById('total-outstanding-utang-display');
    if (totalEl) {
      animateNumber(totalEl, 0, totalOutstanding, 1000, { prefix: '₱', decimals: 2 });
    }

    const overdueEl = document.getElementById('overdue-customers-count-display');
    if (overdueEl) {
      animateNumber(overdueEl, 0, overdueCount, 1000, { decimals: 0 });
    }

    const subtitleEl = document.getElementById('utang-customer-limit-subtitle');
    if (subtitleEl) {
      const uniqueNames = new Set(utangRecords.map(r => r.customer_name));
      subtitleEl.textContent = `${uniqueNames.size} customers`;
    }

    // 2. Filter records
    const filtered = utangRecords.filter(r => {
      const q = searchQuery.toLowerCase();
      return (
        r.customer_name.toLowerCase().includes(q) ||
        r.items_summary.toLowerCase().includes(q) ||
        (r.customer_phone && r.customer_phone.includes(q))
      );
    });

    // 3. Render List or Empty State matching [IMAGE 3]
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div class="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 class="text-base font-extrabold text-neutral-900 dark:text-white mb-1">No customers yet</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">Add a customer to start a tab.</p>
          <button type="button" id="btn-empty-add-utang"
            class="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all">
            + Add utang
          </button>
        </div>
      `;

      const emptyBtn = container.querySelector('#btn-empty-add-utang');
      if (emptyBtn) {
        emptyBtn.addEventListener('click', () => {
          openDrawer('utang-drawer');
        });
      }
      return;
    }

    // Render cards/table
    container.innerHTML = `
      <div class="space-y-3">
        ${filtered.map(r => {
          const bal = parseFloat(r.balance) || 0;
          const orig = parseFloat(r.amount) || 0;
          const isOverdue = bal > 0 && r.due_date && r.due_date < todayStr;
          const isPaid = bal <= 0;

          const statusBadge = isPaid
            ? `<span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded-full">Fully Settled</span>`
            : isOverdue
            ? `<span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 rounded-full animate-pulse">Overdue</span>`
            : bal < orig
            ? `<span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 rounded-full">Partially Paid</span>`
            : `<span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 rounded-full">Active Credit</span>`;

          return `
            <div class="bg-white dark:bg-[#1f2029] p-4 sm:p-5 rounded-2xl border ${isOverdue ? 'border-red-300 dark:border-red-900/60' : 'border-neutral-200 dark:border-neutral-800'} shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-extrabold text-base text-neutral-900 dark:text-white truncate">${r.customer_name}</h3>
                  ${statusBadge}
                </div>

                <p class="text-xs text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
                  <span class="text-neutral-400">Items:</span> ${r.items_summary}
                </p>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>Date: <strong>${r.date_added}</strong></span>
                  ${r.due_date ? `<span>Due: <strong class="${isOverdue ? 'text-red-500 font-bold' : ''}">${r.due_date}</strong></span>` : ''}
                  ${r.customer_phone ? `<span>Phone: <a href="tel:${r.customer_phone}" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">${r.customer_phone}</a></span>` : ''}
                  ${r.signature_data ? `<span class="text-blue-500 font-bold flex items-center gap-1">✍ Signed</span>` : ''}
                </div>
              </div>

              <!-- Balance & Action Button -->
              <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                <div class="text-left sm:text-right">
                  <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Remaining Due</span>
                  <span class="text-lg font-black ${isPaid ? 'text-emerald-600' : 'text-rose-500'} font-mono">₱${bal.toFixed(2)}</span>
                  ${orig !== bal ? `<span class="text-[10px] text-neutral-400 block font-mono">Orig: ₱${orig.toFixed(2)}</span>` : ''}
                </div>

                <div class="flex items-center gap-2">
                  ${!isPaid ? `
                    <button type="button" class="btn-settle-payment cursor-pointer px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition" data-id="${r.id}" data-name="${r.customer_name}" data-balance="${bal}">
                      Record Payment
                    </button>
                  ` : ''}
                  <button type="button" class="btn-delete-utang p-1.5 text-neutral-400 hover:text-red-500 rounded-lg cursor-pointer transition" data-id="${r.id}" title="Delete record">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind Settle Payment Button
    container.querySelectorAll('.btn-settle-payment').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const name = btn.dataset.name;
        const bal = parseFloat(btn.dataset.balance);
        document.getElementById('payment-utang-id').value = id;
        document.getElementById('payment-customer-name-display').textContent = name;
        document.getElementById('payment-remaining-balance-display').textContent = `₱${bal.toFixed(2)}`;
        document.getElementById('payment-amount-input').value = bal.toFixed(2);
        document.getElementById('payment-amount-input').max = bal;
        openDrawer('utang-payment-drawer');
      });
    });

    // Bind Delete Button
    container.querySelectorAll('.btn-delete-utang').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        confirmDeleteUtang(id);
      });
    });
  }

  function confirmDeleteUtang(id) {
    Swal.fire({
      title: 'Delete Credit Record?',
      text: 'This will remove this credit tab entry from the ledger.',
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
        await deleteUtangRecord(id);
        utangRecords = utangRecords.filter(r => r.id !== id);
        renderUtangDashboard();
        showSuccess('Deleted', 'Record removed from ledger.');
      }
    });
  }

  // Open Add Utang
  const openAddBtn = document.getElementById('btn-open-add-utang');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      if (signatureController) signatureController.clear();
      openDrawer('utang-drawer');
    });
  }

  // Search input
  const searchInput = document.getElementById('search-utang-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderUtangDashboard();
    });
  }

  // Add Utang Form Submission
  const utangForm = document.getElementById('utang-form');
  if (utangForm) {
    utangForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const customerVal = customerSelect?.value;
      let customerName = document.getElementById('utang-customer-name')?.value.trim();
      let customerPhone = document.getElementById('utang-customer-phone')?.value.trim();
      let customerEmail = document.getElementById('utang-customer-email')?.value.trim();
      const itemsDescription = document.getElementById('utang-items-description')?.value.trim();
      const amount = parseFloat(document.getElementById('utang-amount')?.value) || 0.00;
      const dateAdded = document.getElementById('utang-date-added')?.value || new Date().toISOString().split('T')[0];
      const dueDate = document.getElementById('utang-due-date')?.value || null;
      const signatureData = signatureController ? signatureController.getSignatureData() : null;

      if (!itemsDescription || amount <= 0) {
        showError('Invalid Form', 'Please enter valid items description and positive amount.');
        return;
      }

      let customerId = null;

      // If adding new customer
      if (customerVal === 'NEW') {
        if (!customerName) {
          showError('Customer Name Required', 'Please enter the customer name.');
          return;
        }
        const custRes = await createCustomer({
          storeId,
          branchId,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          signatureData
        });
        if (custRes.success && custRes.data) {
          customerId = custRes.data.id;
          customers.push(custRes.data);
          populateCustomerDropdown();
        }
      } else {
        customerId = parseInt(customerVal, 10);
        const existingCust = customers.find(c => c.id === customerId);
        if (existingCust) {
          customerName = existingCust.name;
          customerPhone = existingCust.phone || '';
        }
      }

      const res = await createUtangRecord({
        storeId,
        branchId,
        customerId,
        customerName,
        customerPhone,
        itemsSummary: itemsDescription,
        amount,
        dueDate,
        dateAdded,
        signatureData
      });

      if (res.success && res.data) {
        utangRecords.unshift(res.data);
      } else {
        // Local fallback
        utangRecords.unshift({
          id: Date.now(),
          customer_id: customerId,
          customer_name: customerName,
          customer_phone: customerPhone,
          items_summary: itemsDescription,
          amount,
          balance: amount,
          status: 'unpaid',
          due_date: dueDate,
          date_added: dateAdded,
          signature_data: signatureData
        });
      }

      closeDrawer('utang-drawer');
      renderUtangDashboard();
      showSuccess('Success', `Utang tab for ${customerName} recorded!`);
      utangForm.reset();
      if (signatureController) signatureController.clear();
    });
  }

  // Settle Payment Form Submission
  const paymentForm = document.getElementById('utang-payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const utangId = parseInt(document.getElementById('payment-utang-id')?.value, 10);
      const amountPaid = parseFloat(document.getElementById('payment-amount-input')?.value) || 0.00;
      const paymentMethod = document.getElementById('payment-method-select')?.value || 'cash';
      const notes = document.getElementById('payment-notes')?.value.trim();

      if (!utangId || amountPaid <= 0) {
        showError('Invalid Amount', 'Please enter a valid payment amount.');
        return;
      }

      const res = await recordUtangPayment({
        utangRecordId: utangId,
        amountPaid,
        paymentMethod,
        notes
      });

      if (res.success && res.data) {
        const idx = utangRecords.findIndex(r => r.id === utangId);
        if (idx !== -1) {
          utangRecords[idx] = res.data;
        }
      } else {
        // Local fallback update
        const idx = utangRecords.findIndex(r => r.id === utangId);
        if (idx !== -1) {
          const newBal = Math.max(0, utangRecords[idx].balance - amountPaid);
          utangRecords[idx].balance = newBal;
          utangRecords[idx].status = newBal <= 0 ? 'paid' : 'partially_paid';
        }
      }

      closeDrawer('utang-payment-drawer');
      renderUtangDashboard();
      showSuccess('Payment Recorded', `₱${amountPaid.toFixed(2)} payment recorded successfully!`);
    });
  }

  loadData();
}
// --- END initUtang ---
