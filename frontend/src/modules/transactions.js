import { confirmRefund, showSuccess } from './modals.js';
import DateRangePicker from 'flowbite-datepicker/DateRangePicker';

let selectedStartDate = null;
let selectedEndDate = null;
let selectedStartTime = null;
let selectedEndTime = null;
let selectedCashier = null;
let selectedPaymentMethod = null;
let selectedStatus = null;
let dateRangePickerInstance = null;

let transactions = [
  {
    id: "TXN-100293",
    dateTime: "2026-06-17T11:30:15.000Z",
    cashier: "Darling Ugtong",
    paymentMethod: "G-Cash",
    subtotal: 88.00,
    discount: 5.00,
    total: 83.00,
    status: "Completed",
    items: [
      { name: "Milo 24g", quantity: 5, price: 12.00 },
      { name: "Nescafe Classic Twin Pack", quantity: 2, price: 14.00 }
    ]
  },
  {
    id: "TXN-100292",
    dateTime: "2026-06-17T10:15:42.000Z",
    cashier: "Blessel Ugtong",
    paymentMethod: "Cash",
    subtotal: 72.00,
    discount: 0.00,
    total: 72.00,
    status: "Completed",
    items: [
      { name: "Lucky Me Pancit Canton", quantity: 3, price: 18.00 },
      { name: "Datu Puti Vinegar 200ml", quantity: 1, price: 18.00 }
    ]
  },
  {
    id: "TXN-100291",
    dateTime: "2026-06-16T16:45:00.000Z",
    cashier: "Mark Jordan",
    paymentMethod: "Card",
    subtotal: 150.00,
    discount: 15.00,
    total: 135.00,
    status: "Refunded",
    items: [
      { name: "Surf Powder Cherry Blossom", quantity: 10, price: 15.00 }
    ]
  },
  {
    id: "TXN-100290",
    dateTime: "2026-06-16T14:22:10.000Z",
    cashier: "Darling Ugtong",
    paymentMethod: "Cash",
    subtotal: 140.00,
    discount: 10.00,
    total: 130.00,
    status: "Completed",
    items: [
      { name: "Milo 24g", quantity: 4, price: 12.00 },
      { name: "Nescafe Classic Twin Pack", quantity: 4, price: 14.00 },
      { name: "Lucky Me Pancit Canton", quantity: 2, price: 18.00 }
    ]
  },
  {
    id: "TXN-100289",
    dateTime: "2026-06-16T09:05:33.000Z",
    cashier: "Blessel Ugtong",
    paymentMethod: "G-Cash",
    subtotal: 18.00,
    discount: 0.00,
    total: 18.00,
    status: "Completed",
    items: [
      { name: "Datu Puti Vinegar 200ml", quantity: 1, price: 18.00 }
    ]
  },
  {
    id: "TXN-100288",
    dateTime: "2026-06-15T19:12:00.000Z",
    cashier: "Mark Jordan",
    paymentMethod: "Cash",
    subtotal: 144.00,
    discount: 10.00,
    total: 134.00,
    status: "Completed",
    items: [
      { name: "Lucky Me Pancit Canton", quantity: 8, price: 18.00 }
    ]
  },
  {
    id: "TXN-100287",
    dateTime: "2026-06-15T11:30:00.000Z",
    cashier: "Darling Ugtong",
    paymentMethod: "Card",
    subtotal: 168.00,
    discount: 18.00,
    total: 150.00,
    status: "Completed",
    items: [
      { name: "Nescafe Classic Twin Pack", quantity: 12, price: 14.00 }
    ]
  },
  {
    id: "TXN-100286",
    dateTime: "2026-06-14T15:00:22.000Z",
    cashier: "Blessel Ugtong",
    paymentMethod: "G-Cash",
    subtotal: 90.00,
    discount: 5.00,
    total: 85.00,
    status: "Cancelled",
    items: [
      { name: "Surf Powder Cherry Blossom", quantity: 6, price: 15.00 }
    ]
  },
  {
    id: "TXN-100285",
    dateTime: "2026-06-14T10:12:00.000Z",
    cashier: "Darling Ugtong",
    paymentMethod: "Cash",
    subtotal: 120.00,
    discount: 0.00,
    total: 120.00,
    status: "Completed",
    items: [
      { name: "Milo 24g", quantity: 10, price: 12.00 }
    ]
  },
  {
    id: "TXN-100284",
    dateTime: "2026-06-13T17:40:11.000Z",
    cashier: "Mark Jordan",
    paymentMethod: "G-Cash",
    subtotal: 36.00,
    discount: 2.00,
    total: 34.00,
    status: "Completed",
    items: [
      { name: "Lucky Me Pancit Canton", quantity: 2, price: 18.00 }
    ]
  },
  {
    id: "TXN-100283",
    dateTime: "2026-06-13T13:20:55.000Z",
    cashier: "Blessel Ugtong",
    paymentMethod: "Cash",
    subtotal: 210.00,
    discount: 20.00,
    total: 190.00,
    status: "Completed",
    items: [
      { name: "Surf Powder Cherry Blossom", quantity: 14, price: 15.00 }
    ]
  },
  {
    id: "TXN-100282",
    dateTime: "2026-06-12T11:05:40.000Z",
    cashier: "Darling Ugtong",
    paymentMethod: "Card",
    subtotal: 84.00,
    discount: 5.00,
    total: 79.00,
    status: "Completed",
    items: [
      { name: "Nescafe Classic Twin Pack", quantity: 6, price: 14.00 }
    ]
  }
];

let filteredTransactions = [...transactions];
let currentPage = 1;
const itemsPerPage = 5;
let currentSort = 'latest'; // 'latest' or 'oldest' (Sort by Complete Date & Time)
let searchQuery = '';

export function initTransactions() {
  const container = document.getElementById('transactions-container');
  if (!container) return; // Only execute if on the transactions page

  bindEvents();
  initDateRangePicker();
  bindFilterMenuEvents();
  updateStats();
  applyFiltersAndRender();
}

function bindEvents() {
  const searchInput = document.getElementById('transactions-search');
  const sortSelect = document.getElementById('transactions-sort');
  const prevBtn = document.getElementById('transactions-prev');
  const nextBtn = document.getElementById('transactions-next');
  const tbody = document.getElementById('transactions-tbody');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Old sort select logic removed

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
  }

  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const txnId = target.getAttribute('data-id');
      const txn = transactions.find(t => t.id === txnId);

      if (!txn) return;

      if (action === 'view') {
        showReceiptDrawer(txn);
      } else if (action === 'refund') {
        if (txn.status !== 'Completed') {
          return; // Can only refund completed ones
        }
        confirmRefund(txnId, () => {
          txn.status = 'Refunded';
          showSuccess('Transaction Refunded', `Receipt ${txnId} has been successfully refunded.`);
          updateStats();
          applyFiltersAndRender();
        });
      }
    });
  }

  // Drawer event listeners
  const closeBtn = document.querySelector('[data-drawer-hide="receipt-drawer"]');
  const backdrop = document.getElementById('receipt-drawer-backdrop');
  const refundBtn = document.getElementById('receipt-drawer-refund-btn');

  const hideDrawer = () => {
    const drawer = document.getElementById('receipt-drawer');
    if (!drawer) return;
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');
    if (backdrop) {
      backdrop.classList.remove('block', 'opacity-100');
      backdrop.classList.add('hidden', 'opacity-0');
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', hideDrawer);
  if (backdrop) backdrop.addEventListener('click', hideDrawer);

  if (refundBtn) {
    refundBtn.addEventListener('click', () => {
      const txnId = refundBtn.getAttribute('data-id');
      const txn = transactions.find(t => t.id === txnId);
      if (!txn || txn.status !== 'Completed') return;

      confirmRefund(txnId, () => {
        txn.status = 'Refunded';
        showSuccess('Transaction Refunded', `Receipt ${txnId} has been successfully refunded.`);
        hideDrawer();
        updateStats();
        applyFiltersAndRender();
      });
    });
  }
}

function initDateRangePicker() {
  const dateRangePickerEl = document.getElementById('date-range-picker');
  if (dateRangePickerEl) {
    dateRangePickerInstance = new DateRangePicker(dateRangePickerEl, {
      format: 'yyyy-mm-dd',
      autohide: true,
      todayBtn: true,
      clearBtn: true
    });
  }
}

function bindFilterMenuEvents() {
  const filterBtn = document.getElementById('filter-menu-btn');
  const inlineChoices = document.getElementById('inline-filter-choices');
  const backBtn = document.getElementById('filter-back-btn');
  const clearBtn = document.getElementById('clear-filters-btn');

  if (!filterBtn || !inlineChoices) return;

  // Show inline choices and hide main filter button
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    filterBtn.classList.add('hidden');
    inlineChoices.classList.remove('hidden');
    // Trigger pop/slide transition from left
    requestAnimationFrame(() => {
      inlineChoices.classList.remove('opacity-0', '-translate-x-4');
      inlineChoices.classList.add('opacity-100', 'translate-x-0');
    });
  });

  // Back button to restore main filter button
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllL2Containers();
      inlineChoices.classList.add('opacity-0', '-translate-x-4');
      inlineChoices.classList.remove('opacity-100', 'translate-x-0');
      setTimeout(() => {
        inlineChoices.classList.add('hidden');
        filterBtn.classList.remove('hidden');
      }, 300);
    });
  }

  // Go to Level 2 inline containers
  const menuButtons = inlineChoices.querySelectorAll('button[data-menu]');
  menuButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuType = btn.getAttribute('data-menu');
      const targetL2 = document.getElementById(`inline-${menuType}-choices`);
      
      if (targetL2) {
        // Hide L1 choices
        inlineChoices.classList.add('opacity-0', '-translate-x-4');
        inlineChoices.classList.remove('opacity-100', 'translate-x-0');
        setTimeout(() => {
          inlineChoices.classList.add('hidden');
          // Show L2
          targetL2.classList.remove('hidden');
          requestAnimationFrame(() => {
            targetL2.classList.remove('opacity-0', '-translate-x-4');
            targetL2.classList.add('opacity-100', 'translate-x-0');
          });
        }, 300);
      }
    });
  });

  // Back from Level 2 to Level 1
  const backToL1Btns = document.querySelectorAll('button[data-back-to-l1]');
  backToL1Btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuType = btn.getAttribute('data-back-to-l1');
      const targetL2 = document.getElementById(`inline-${menuType}-choices`);

      if (targetL2) {
        targetL2.classList.add('opacity-0', '-translate-x-4');
        targetL2.classList.remove('opacity-100', 'translate-x-0');
        setTimeout(() => {
          targetL2.classList.add('hidden');
          // Show L1
          inlineChoices.classList.remove('hidden');
          requestAnimationFrame(() => {
            inlineChoices.classList.remove('opacity-0', '-translate-x-4');
            inlineChoices.classList.add('opacity-100', 'translate-x-0');
          });
        }, 300);
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    const filterContainer = document.getElementById('filter-dropdown-container');
    
    // Check if the click is inside a datepicker element generated by Flowbite
    if (e.target.closest('.datepicker')) return;

    if (filterContainer && !filterContainer.contains(e.target)) {
      // Check if filter bar is active
      const l1Active = !inlineChoices.classList.contains('hidden');
      const l2Active = Array.from(document.querySelectorAll('[id^="inline-"][id$="-choices"]'))
        .some(el => el.id !== 'inline-filter-choices' && !el.classList.contains('hidden'));

      if (l1Active || l2Active) {
        // Reset everything back to main button
        inlineChoices.classList.add('opacity-0', '-translate-x-4');
        inlineChoices.classList.remove('opacity-100', 'translate-x-0');
        inlineChoices.classList.add('hidden');

        closeAllL2Containers();
        filterBtn.classList.remove('hidden');
      }
    }
  });

  function closeAllL2Containers() {
    document.querySelectorAll('[id^="inline-"][id$="-choices"]').forEach(el => {
      if (el.id !== 'inline-filter-choices') {
        el.classList.add('hidden', 'opacity-0', '-translate-x-4');
        el.classList.remove('opacity-100', 'translate-x-0');
      }
    });
  }

  // Cashier selection
  const cashierBtns = document.querySelectorAll('#cashiers-list-container button[data-cashier]');
  cashierBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cashierName = btn.getAttribute('data-cashier');
      if (selectedCashier === cashierName) {
        selectedCashier = null; // Toggle off
      } else {
        selectedCashier = cashierName;
      }
      updateCheckmarks();
    });
  });

  // Payment method selection
  const paymethodBtns = document.querySelectorAll('#dropdown-payment button[data-paymethod]');
  paymethodBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const method = btn.getAttribute('data-paymethod');
      if (selectedPaymentMethod === method) {
        selectedPaymentMethod = null; // Toggle off
      } else {
        selectedPaymentMethod = method;
      }
      updateCheckmarks();
    });
  });

  // Sort selection
  const sortBtns = document.querySelectorAll('#dropdown-sort button[data-sortopt]');
  sortBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sortOpt = btn.getAttribute('data-sortopt');
      if (currentSort === sortOpt) {
        currentSort = 'latest'; // Default if toggled off
      } else {
        currentSort = sortOpt;
      }
      updateCheckmarks();
    });
  });

  // Status selection
  const statusBtns = document.querySelectorAll('#dropdown-status button[data-statusopt]');
  statusBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const statusVal = btn.getAttribute('data-statusopt');
      if (selectedStatus === statusVal) {
        selectedStatus = null; // Toggle off
      } else {
        selectedStatus = statusVal;
      }
      updateCheckmarks();
    });
  });

  // Apply button clicks in Level 2 containers
  const applyBtns = document.querySelectorAll('[id^="inline-"][id$="-choices"] .filter-apply-btn');
  applyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Update date range values
      const startDateInput = document.getElementById('datepicker-start');
      const endDateInput = document.getElementById('datepicker-end');
      selectedStartDate = startDateInput ? startDateInput.value : null;
      selectedEndDate = endDateInput ? endDateInput.value : null;

      // Update time range values
      const startTimeInput = document.getElementById('timepicker-start');
      const endTimeInput = document.getElementById('timepicker-end');
      selectedStartTime = startTimeInput ? startTimeInput.value : null;
      selectedEndTime = endTimeInput ? endTimeInput.value : null;

      // Return to main filter button state
      closeAllL2Containers();
      inlineChoices.classList.add('hidden', 'opacity-0', '-translate-x-4');
      inlineChoices.classList.remove('opacity-100', 'translate-x-0');
      filterBtn.classList.remove('hidden');

      currentPage = 1;
      applyFiltersAndRender();
      updateActiveFiltersCount();
    });
  });

  // Clear button click
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Reset variables
      selectedStartDate = null;
      selectedEndDate = null;
      selectedStartTime = null;
      selectedEndTime = null;
      selectedCashier = null;
      selectedPaymentMethod = null;
      selectedStatus = null;

      // Reset DOM inputs
      const startDateInput = document.getElementById('datepicker-start');
      const endDateInput = document.getElementById('datepicker-end');
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
      
      // Clear flowbite datepicker UI state if any
      if (dateRangePickerInstance) {
        if (dateRangePickerInstance.startpicker) dateRangePickerInstance.startpicker.setDate({ clear: true });
        if (dateRangePickerInstance.endpicker) dateRangePickerInstance.endpicker.setDate({ clear: true });
      }

      const startTimeInput = document.getElementById('timepicker-start');
      const endTimeInput = document.getElementById('timepicker-end');
      if (startTimeInput) startTimeInput.value = '';
      if (endTimeInput) endTimeInput.value = '';

      updateCheckmarks();
      updateActiveFiltersCount();
      
      // Return to main filter button state
      closeAllL2Containers();
      inlineChoices.classList.add('hidden', 'opacity-0', '-translate-x-4');
      inlineChoices.classList.remove('opacity-100', 'translate-x-0');
      filterBtn.classList.remove('hidden');

      currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Update checkmarks visibility based on selected filter state
  function updateCheckmarks() {
    // Cashiers list styling
    document.querySelectorAll('#cashiers-list-container button[data-cashier]').forEach(btn => {
      btn.className = "cursor-pointer px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition flex items-center gap-1.5 rounded-none";
    });
    document.querySelectorAll('#cashiers-list-container [id^="checkmark-"]').forEach(el => el.classList.add('hidden'));
    if (selectedCashier) {
      const formattedId = `checkmark-${selectedCashier.replace(/\s+/g, '-')}`;
      const activeEl = document.getElementById(formattedId);
      if (activeEl) activeEl.classList.remove('hidden');
      
      const activeBtn = document.querySelector(`#cashiers-list-container button[data-cashier="${selectedCashier}"]`);
      if (activeBtn) {
        activeBtn.className = "cursor-pointer px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-500 dark:border-emerald-500 transition flex items-center gap-1.5 rounded-none";
      }
    }

    // Payment method list styling
    document.querySelectorAll('#dropdown-payment button[data-paymethod]').forEach(btn => {
      btn.classList.remove('border-emerald-500', 'dark:border-emerald-500', 'border-purple-500', 'dark:border-purple-500', 'border-blue-500', 'dark:border-blue-500');
      btn.classList.add('border-neutral-200', 'dark:border-neutral-800');
    });
    document.querySelectorAll('#dropdown-payment [id^="checkmark-"]').forEach(el => el.classList.add('hidden'));
    if (selectedPaymentMethod) {
      const formattedMethod = selectedPaymentMethod.replace('-', '');
      const activeEl = document.getElementById(`checkmark-${formattedMethod}`);
      if (activeEl) activeEl.classList.remove('hidden');
      
      const activeBtn = document.querySelector(`#dropdown-payment button[data-paymethod="${selectedPaymentMethod}"]`);
      if (activeBtn) {
        activeBtn.classList.remove('border-neutral-200', 'dark:border-neutral-800');
        if (selectedPaymentMethod === 'Cash') {
          activeBtn.classList.add('border-emerald-500', 'dark:border-emerald-500');
        } else if (selectedPaymentMethod === 'Card') {
          activeBtn.classList.add('border-purple-500', 'dark:border-purple-500');
        } else if (selectedPaymentMethod === 'G-Cash') {
          activeBtn.classList.add('border-blue-500', 'dark:border-blue-500');
        }
      }
    }

    // Status list styling
    document.querySelectorAll('#dropdown-status button[data-statusopt]').forEach(btn => {
      btn.classList.remove('border-amber-500', 'dark:border-amber-500', 'border-emerald-500', 'dark:border-emerald-500', 'border-red-500', 'dark:border-red-500');
      btn.classList.add('border-neutral-200', 'dark:border-neutral-800');
    });
    document.querySelectorAll('#dropdown-status [id^="checkmark-"]').forEach(el => el.classList.add('hidden'));
    if (selectedStatus) {
      const activeEl = document.getElementById(`checkmark-${selectedStatus}`);
      if (activeEl) activeEl.classList.remove('hidden');
      
      const activeBtn = document.querySelector(`#dropdown-status button[data-statusopt="${selectedStatus}"]`);
      if (activeBtn) {
        activeBtn.classList.remove('border-neutral-200', 'dark:border-neutral-800');
        if (selectedStatus === 'Pending') {
          activeBtn.classList.add('border-amber-500', 'dark:border-amber-500');
        } else if (selectedStatus === 'Completed') {
          activeBtn.classList.add('border-emerald-500', 'dark:border-emerald-500');
        } else if (selectedStatus === 'Refunded') {
          activeBtn.classList.add('border-red-500', 'dark:border-red-500');
        }
      }
    }

    // Sort list styling
    document.querySelectorAll('#dropdown-sort button[data-sortopt]').forEach(btn => {
      btn.classList.remove('border-pink-500', 'dark:border-pink-500');
      btn.classList.add('border-neutral-200', 'dark:border-neutral-800');
    });
    document.querySelectorAll('#dropdown-sort [id^="checkmark-"]').forEach(el => el.classList.add('hidden'));
    if (currentSort) {
      const activeEl = document.getElementById(`checkmark-${currentSort}`);
      if (activeEl) activeEl.classList.remove('hidden');
      
      const activeBtn = document.querySelector(`#dropdown-sort button[data-sortopt="${currentSort}"]`);
      if (activeBtn) {
        activeBtn.classList.remove('border-neutral-200', 'dark:border-neutral-800');
        activeBtn.classList.add('border-pink-500', 'dark:border-pink-500');
      }
    }
  }

  // Update count badge on primary filter button
  function updateActiveFiltersCount() {
    const activeFiltersCountEl = document.getElementById('active-filters-count');
    if (!activeFiltersCountEl) return;

    let count = 0;
    if (selectedStartDate || selectedEndDate) count++;
    if (selectedStartTime || selectedEndTime) count++;
    if (selectedCashier) count++;
    if (selectedPaymentMethod) count++;
    if (selectedStatus) count++;

    if (count > 0) {
      activeFiltersCountEl.textContent = count;
      activeFiltersCountEl.classList.remove('hidden');
      activeFiltersCountEl.classList.add('inline-flex');
    } else {
      activeFiltersCountEl.classList.add('hidden');
      activeFiltersCountEl.classList.remove('inline-flex');
    }
  }
}

function showReceiptDrawer(transaction) {
  const drawer = document.getElementById('receipt-drawer');
  const backdrop = document.getElementById('receipt-drawer-backdrop');
  const content = document.getElementById('receipt-drawer-content');
  const refundBtn = document.getElementById('receipt-drawer-refund-btn');

  if (!drawer || !content) return;

  // Format date/time
  const formattedDate = new Date(transaction.dateTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Generate items HTML
  const itemsHtml = transaction.items.map(item => `
    <div class="flex justify-between items-center mb-2">
      <div class="flex flex-col">
        <span class="text-sm font-black text-neutral-900 dark:text-white">${item.name}</span>
        <span class="text-xs font-bold text-neutral-500 dark:text-neutral-400">x${item.quantity}</span>
      </div>
      <span class="text-sm font-black text-neutral-900 dark:text-white">₱${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  const statusBadge = transaction.status === 'Completed'
    ? `<span class="px-2.5 py-1 text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-full">Completed</span>`
    : transaction.status === 'Refunded'
    ? `<span class="px-2.5 py-1 text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-full">Refunded</span>`
    : `<span class="px-2.5 py-1 text-xs font-black text-red-600 bg-red-50 dark:bg-red-950/20 rounded-full">Cancelled</span>`;

  content.innerHTML = `
    <div class="flex flex-col gap-6 font-sans">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-neutral-500 dark:text-neutral-400">${formattedDate}</span>
        ${statusBadge}
      </div>

      <div class="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-neutral-500 dark:text-neutral-400">Transaction ID</span>
          <span class="text-sm font-black text-neutral-900 dark:text-white">${transaction.id}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-neutral-500 dark:text-neutral-400">Cashier</span>
          <span class="text-sm font-black text-neutral-900 dark:text-white">${transaction.cashier}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-neutral-500 dark:text-neutral-400">Payment Method</span>
          <span class="text-sm font-black text-neutral-900 dark:text-white">${transaction.paymentMethod}</span>
        </div>
      </div>

      <div>
        <h4 class="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">Items Ordered</h4>
        <div class="flex flex-col border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
          ${itemsHtml}
        </div>
        
        <div class="flex flex-col gap-2 text-sm font-bold">
          <div class="flex justify-between text-neutral-500 dark:text-neutral-400">
            <span>Subtotal</span>
            <span class="text-neutral-900 dark:text-white">₱${transaction.subtotal.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-red-600 dark:text-red-400">
            <span>Discount</span>
            <span>-₱${transaction.discount.toFixed(2)}</span>
          </div>
          <div class="flex justify-between items-center mt-2 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <span class="text-base font-black text-neutral-900 dark:text-white">Total Amount</span>
            <span class="text-xl font-black text-emerald-600 dark:text-emerald-400">₱${transaction.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Update refund button state
  if (refundBtn) {
    if (transaction.status === 'Completed') {
      refundBtn.disabled = false;
      refundBtn.setAttribute('data-id', transaction.id);
      refundBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-neutral-100', 'dark:bg-neutral-800', 'text-neutral-400', 'dark:text-neutral-500');
      refundBtn.classList.add('bg-red-50', 'dark:bg-red-950/30', 'text-red-600', 'dark:text-red-400', 'hover:bg-red-100', 'dark:hover:bg-red-900/50');
    } else {
      refundBtn.disabled = true;
      refundBtn.removeAttribute('data-id');
      refundBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-neutral-100', 'dark:bg-neutral-800', 'text-neutral-400', 'dark:text-neutral-500');
      refundBtn.classList.remove('bg-red-50', 'dark:bg-red-950/30', 'text-red-600', 'dark:text-red-400', 'hover:bg-red-100', 'dark:hover:bg-red-900/50');
    }
  }

  // Show drawer
  drawer.classList.remove('translate-x-full');
  drawer.classList.add('translate-x-0');
  if (backdrop) {
    backdrop.classList.remove('hidden', 'opacity-0');
    backdrop.classList.add('block', 'opacity-100');
  }
}

function updateStats() {
  // Only completed transactions count toward active metrics
  const activeTxns = transactions.filter(t => t.status === 'Completed');
  
  const grossSales = activeTxns.reduce((sum, t) => sum + t.subtotal, 0);
  const totalDiscounts = activeTxns.reduce((sum, t) => sum + t.discount, 0);
  const netSales = activeTxns.reduce((sum, t) => sum + t.total, 0);
  const transactionsCount = activeTxns.length;

  const grossSalesEl = document.getElementById('gross-sales-value');
  const totalDiscountsEl = document.getElementById('total-discounts-value');
  const netSalesEl = document.getElementById('net-sales-value');
  const transactionsCountEl = document.getElementById('transactions-count-value');

  if (grossSalesEl) grossSalesEl.textContent = `₱${grossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (totalDiscountsEl) totalDiscountsEl.textContent = `₱${totalDiscounts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (netSalesEl) netSalesEl.textContent = `₱${netSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (transactionsCountEl) transactionsCountEl.textContent = transactionsCount.toLocaleString('en-US');
}

function applyFiltersAndRender() {
  // Filter
  filteredTransactions = transactions.filter(t => {
    // 1. Text Search Query
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery) ||
      t.cashier.toLowerCase().includes(searchQuery) ||
      t.paymentMethod.toLowerCase().includes(searchQuery) ||
      t.status.toLowerCase().includes(searchQuery);

    if (!matchesSearch) return false;

    // 2. Date Range
    const txnDate = new Date(t.dateTime);
    const txnDateOnly = new Date(txnDate.getFullYear(), txnDate.getMonth(), txnDate.getDate());

    if (selectedStartDate) {
      const start = new Date(selectedStartDate);
      const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      if (txnDateOnly < startOnly) return false;
    }
    if (selectedEndDate) {
      const end = new Date(selectedEndDate);
      const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      if (txnDateOnly > endOnly) return false;
    }

    // 3. Time Range
    if (selectedStartTime || selectedEndTime) {
      const hours = txnDate.getHours().toString().padStart(2, '0');
      const minutes = txnDate.getMinutes().toString().padStart(2, '0');
      const txnTimeStr = `${hours}:${minutes}`;

      if (selectedStartTime && txnTimeStr < selectedStartTime) return false;
      if (selectedEndTime && txnTimeStr > selectedEndTime) return false;
    }

    // 4. Cashier
    if (selectedCashier && t.cashier !== selectedCashier) {
      return false;
    }

    // 5. Payment Method
    if (selectedPaymentMethod && t.paymentMethod !== selectedPaymentMethod) {
      return false;
    }

    // 6. Status
    if (selectedStatus && t.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  // Sort by complete date and time
  filteredTransactions.sort((a, b) => {
    const timeA = new Date(a.dateTime).getTime();
    const timeB = new Date(b.dateTime).getTime();
    return currentSort === 'latest' ? timeB - timeA : timeA - timeB;
  });

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('transactions-tbody');
  const prevBtn = document.getElementById('transactions-prev');
  const nextBtn = document.getElementById('transactions-next');
  const rangeEl = document.getElementById('transactions-range');

  if (!tbody) return;

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const pageItems = filteredTransactions.slice(startIndex, endIndex);

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-10 text-center font-bold text-neutral-500 dark:text-neutral-400">
          No transactions found matching your criteria.
        </td>
      </tr>
    `;
    if (rangeEl) rangeEl.textContent = '0 - 0 of 0';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  tbody.innerHTML = pageItems.map(t => {
    const formattedDate = new Date(t.dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    let statusClass = '';
    if (t.status === 'Completed') {
      statusClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';
    } else if (t.status === 'Refunded') {
      statusClass = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20';
    } else {
      statusClass = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20';
    }

    let paymentClass = '';
    if (t.paymentMethod === 'Cash') {
      paymentClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';
    } else if (t.paymentMethod === 'G-Cash') {
      paymentClass = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20';
    } else if (t.paymentMethod === 'Card') {
      paymentClass = 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20';
    } else {
      paymentClass = 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/20';
    }

    const isRefundDisabled = t.status !== 'Completed';

    return `
      <tr class="bg-white dark:bg-[#16171d] hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition">
        <td class="px-6 py-4 font-black text-neutral-900 dark:text-white whitespace-nowrap text-center">
          ${t.id}
        </td>
        <td class="px-6 py-4 font-bold whitespace-nowrap text-center">
          ${formattedDate}
        </td>
        <td class="px-6 py-4 font-bold whitespace-nowrap text-center">
          ${t.cashier}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-black rounded-full ${paymentClass}">
            ${t.paymentMethod}
          </span>
        </td>
        <td class="px-6 py-4 font-black whitespace-nowrap text-neutral-900 dark:text-white text-center">
          ₱${t.total.toFixed(2)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-black rounded-full ${statusClass}">
            ${t.status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <div class="flex items-center justify-center gap-2">
            <button type="button" data-action="view" data-id="${t.id}" title="View Receipt"
              class="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition">
              <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
            </button>
            <button type="button" data-action="refund" data-id="${t.id}" title="Refund" ${isRefundDisabled ? 'disabled' : ''}
              class="inline-flex items-center justify-center w-8 h-8 rounded transition ${isRefundDisabled ? 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500' : 'cursor-pointer bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'}">
              <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9h13a5 5 0 0 1 0 10H11M3 9l4-4M3 9l4 4"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Update Pagination Controls
  if (rangeEl) {
    rangeEl.textContent = `${startIndex + 1} - ${endIndex} of ${totalItems}`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    if (currentPage === 1) {
      prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
      prevBtn.classList.remove('cursor-pointer');
    } else {
      prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      prevBtn.classList.add('cursor-pointer');
    }
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
    if (currentPage === totalPages) {
      nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
      nextBtn.classList.remove('cursor-pointer');
    } else {
      nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      nextBtn.classList.add('cursor-pointer');
    }
  }
}
