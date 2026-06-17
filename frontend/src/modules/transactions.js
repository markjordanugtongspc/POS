import { confirmRefund, showSuccess } from './modals.js';

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

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFiltersAndRender();
    });
  }

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
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery) ||
      t.cashier.toLowerCase().includes(searchQuery) ||
      t.paymentMethod.toLowerCase().includes(searchQuery) ||
      t.status.toLowerCase().includes(searchQuery);
    return matchesSearch;
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
