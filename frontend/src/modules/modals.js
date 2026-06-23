// modals.js - SweetAlert2 utility module for standardized premium alerts
import Swal from 'sweetalert2';

/**
 * Show a success modal using SweetAlert2.
 * @param {string} title - Title of the modal.
 * @param {string} text - Body text of the modal.
 * @returns {Promise}
 */
export function showSuccess(title, text) {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'
  });
}

/**
 * Show an error modal using SweetAlert2.
 * @param {string} title - Title of the modal.
 * @param {string} text - Body text of the modal.
 * @returns {Promise}
 */
export function showError(title, text) {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'
  });
}

/**
 * Show a structured receipt detail view using SweetAlert2.
 * @param {Object} transaction - Transaction data object.
 * @returns {Promise}
 */
export function showReceiptDetail(transaction) {
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#16171d' : '#ffffff';
  const color = isDark ? '#f3f4f6' : '#1f2937';
  const border = isDark ? 'border-neutral-800' : 'border-neutral-200';

  // Format date/time
  const formattedDate = new Date(transaction.dateTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Generate items HTML list
  const itemsHtml = transaction.items.map(item => `
    <tr class="border-b ${border} text-xs font-semibold">
      <td class="py-2 text-left">${item.name} <span class="text-neutral-400">x${item.quantity}</span></td>
      <td class="py-2 text-right">₱${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const statusBadge = transaction.status === 'Completed'
    ? `<span class="px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-full">Completed</span>`
    : transaction.status === 'Refunded'
    ? `<span class="px-2 py-0.5 text-[10px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-full">Refunded</span>`
    : `<span class="px-2 py-0.5 text-[10px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/20 rounded-full">Cancelled</span>`;

  const html = `
    <div class="font-sans text-left text-neutral-800 dark:text-neutral-200 leading-normal">
      <div class="flex justify-between items-center pb-4 mb-4 border-b ${border}">
        <div>
          <h3 class="text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">Jorgy POS Receipt</h3>
          <p class="text-xs text-neutral-500 font-bold mt-1">${transaction.id}</p>
        </div>
        <div>
          ${statusBadge}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-xs font-semibold">
        <span class="text-neutral-500">Date & Time:</span>
        <span class="text-right text-neutral-900 dark:text-white">${formattedDate}</span>
        <span class="text-neutral-500">Cashier:</span>
        <span class="text-right text-neutral-900 dark:text-white">${transaction.cashier}</span>
        <span class="text-neutral-500">Payment Method:</span>
        <span class="text-right text-neutral-900 dark:text-white">${transaction.paymentMethod}</span>
      </div>

      <div class="mb-4">
        <table class="w-full">
          <thead>
            <tr class="border-b ${border} text-xs font-extrabold text-neutral-500 text-left">
              <th class="pb-2">Item</th>
              <th class="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div class="space-y-1.5 border-t ${border} pt-3 text-xs font-semibold">
        <div class="flex justify-between">
          <span class="text-neutral-500">Subtotal</span>
          <span class="text-neutral-900 dark:text-white">₱${transaction.subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-red-600 dark:text-red-400">
          <span>Discount</span>
          <span>-₱${transaction.discount.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-sm font-black pt-1 border-t border-dashed ${border}">
          <span class="text-neutral-900 dark:text-white">Total Amount</span>
          <span class="text-emerald-600 dark:text-emerald-400">₱${transaction.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  return Swal.fire({
    html: html,
    showConfirmButton: true,
    confirmButtonText: 'Close Receipt',
    confirmButtonColor: '#10b981',
    customClass: {
      confirmButton: 'cursor-pointer px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-none focus:outline-none transition w-full mt-4 text-center block'
    },
    buttonsStyling: false,
    background: bg,
    color: color
  });
}

/**
 * Show a confirmation dialog to refund a transaction.
 * @param {string} txnId - The transaction ID.
 * @param {Function} onConfirm - Callback if user confirms.
 */
export function confirmRefund(txnId, onConfirm) {
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#16171d' : '#ffffff';
  const color = isDark ? '#f3f4f6' : '#1f2937';

  return Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to refund/cancel transaction ${txnId}? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Refund It',
    cancelButtonText: 'No, Keep It',
    customClass: {
      confirmButton: 'cursor-pointer px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-none focus:outline-none transition mr-2',
      cancelButton: 'cursor-pointer px-4 py-2 text-sm font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-none focus:outline-none transition'
    },
    buttonsStyling: false,
    background: bg,
    color: color
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}



/**
 * Confirm delete of a product
 * @param {string} productName
 * @param {Function} onConfirm
 * @returns {Promise}
 */
export function confirmDeleteProduct(productName, onConfirm) {
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#1f2029' : '#ffffff';
  const color = isDark ? '#f3f4f6' : '#1f2937';

  return Swal.fire({
    title: 'Delete Product',
    text: `Are you sure you want to delete "${productName}"? This action is permanent.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'No, Cancel',
    customClass: {
      confirmButton: 'cursor-pointer px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl focus:outline-none transition mr-2',
      cancelButton: 'cursor-pointer px-4 py-2.5 text-sm font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-350 dark:hover:bg-neutral-700 rounded-xl focus:outline-none transition'
    },
    buttonsStyling: false,
    background: bg,
    color: color
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

/**
 * Show a form to add a product
 * @param {Function} onSave
 * @returns {Promise}
 */
export function showAddProductModal(onSave) {
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#1f2029' : '#ffffff';
  const color = isDark ? '#f3f4f6' : '#1f2937';
  const border = isDark ? 'border-neutral-800' : 'border-neutral-200';

  const html = `
    <div class="font-sans text-left text-neutral-800 dark:text-neutral-200 leading-normal">
      <div class="pb-3 mb-4 border-b ${border}">
        <h3 class="text-base font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">Add New Product</h3>
      </div>
      <form id="form-product-add" class="space-y-4 text-xs font-semibold" onsubmit="event.preventDefault();">
        <div>
          <label class="block text-neutral-500 mb-1">SKU *</label>
          <input type="text" id="swal-sku" required class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white" placeholder="e.g. SKU026">
        </div>
        <div>
          <label class="block text-neutral-500 mb-1">Product Name *</label>
          <input type="text" id="swal-name" required class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white" placeholder="e.g. Milo 24g">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-neutral-500 mb-1">Category *</label>
            <input type="text" id="swal-category" required class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white" placeholder="e.g. Beverage">
          </div>
          <div>
            <label class="block text-neutral-500 mb-1">Brand *</label>
            <input type="text" id="swal-brand" required class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white" placeholder="e.g. Nestle">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-neutral-500 mb-1">Price (₱) *</label>
            <input type="number" step="0.01" id="swal-price" required class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white" placeholder="e.g. 15.00">
          </div>
          <div>
            <label class="block text-neutral-500 mb-1">Quantity *</label>
            <input type="number" id="swal-qty" required class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white" placeholder="e.g. 100">
          </div>
        </div>
      </form>
    </div>
  `;

  return Swal.fire({
    html: html,
    showCancelButton: true,
    confirmButtonText: 'Save Product',
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'cursor-pointer px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl focus:outline-none transition mr-2',
      cancelButton: 'cursor-pointer px-4 py-2.5 text-sm font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-350 dark:hover:bg-neutral-700 rounded-xl focus:outline-none transition'
    },
    buttonsStyling: false,
    background: bg,
    color: color,
    preConfirm: () => {
      const sku = document.getElementById('swal-sku').value.trim();
      const name = document.getElementById('swal-name').value.trim();
      const category = document.getElementById('swal-category').value.trim();
      const brand = document.getElementById('swal-brand').value.trim();
      const price = parseFloat(document.getElementById('swal-price').value);
      const qty = parseInt(document.getElementById('swal-qty').value);

      if (!sku || !name || !category || !brand || isNaN(price) || isNaN(qty)) {
        Swal.showValidationMessage('Please fill out all required fields with valid values');
        return false;
      }
      return { sku, name, category, brand, price, qty, createdBy: 'Mark Jordan' };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      onSave(result.value);
    }
  });
}

/**
 * Show a form to edit a product
 * @param {Object} product
 * @param {Function} onSave
 * @returns {Promise}
 */
export function showEditProductModal(product, onSave) {
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#1f2029' : '#ffffff';
  const color = isDark ? '#f3f4f6' : '#1f2937';
  const border = isDark ? 'border-neutral-800' : 'border-neutral-200';

  const html = `
    <div class="font-sans text-left text-neutral-800 dark:text-neutral-200 leading-normal">
      <div class="pb-3 mb-4 border-b ${border}">
        <h3 class="text-base font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">Edit Product</h3>
      </div>
      <form id="form-product-edit" class="space-y-4 text-xs font-semibold" onsubmit="event.preventDefault();">
        <div>
          <label class="block text-neutral-500 mb-1">SKU (Read-only)</label>
          <input type="text" id="swal-sku" readonly value="${product.sku}" class="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 cursor-not-allowed">
        </div>
        <div>
          <label class="block text-neutral-500 mb-1">Product Name *</label>
          <input type="text" id="swal-name" required value="${product.name}" class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-neutral-500 mb-1">Category *</label>
            <input type="text" id="swal-category" required value="${product.category}" class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white">
          </div>
          <div>
            <label class="block text-neutral-500 mb-1">Brand *</label>
            <input type="text" id="swal-brand" required value="${product.brand}" class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-neutral-500 mb-1">Price (₱) *</label>
            <input type="number" step="0.01" id="swal-price" required value="${product.price}" class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white">
          </div>
          <div>
            <label class="block text-neutral-500 mb-1">Quantity *</label>
            <input type="number" id="swal-qty" required value="${product.qty}" class="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-neutral-950 dark:text-white">
          </div>
        </div>
      </form>
    </div>
  `;

  return Swal.fire({
    html: html,
    showCancelButton: true,
    confirmButtonText: 'Update Product',
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'cursor-pointer px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl focus:outline-none transition mr-2',
      cancelButton: 'cursor-pointer px-4 py-2.5 text-sm font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-350 dark:hover:bg-neutral-700 rounded-xl focus:outline-none transition'
    },
    buttonsStyling: false,
    background: bg,
    color: color,
    preConfirm: () => {
      const sku = document.getElementById('swal-sku').value.trim();
      const name = document.getElementById('swal-name').value.trim();
      const category = document.getElementById('swal-category').value.trim();
      const brand = document.getElementById('swal-brand').value.trim();
      const price = parseFloat(document.getElementById('swal-price').value);
      const qty = parseInt(document.getElementById('swal-qty').value);

      if (!sku || !name || !category || !brand || isNaN(price) || isNaN(qty)) {
        Swal.showValidationMessage('Please fill out all required fields with valid values');
        return false;
      }
      return { sku, name, category, brand, price, qty, createdBy: product.createdBy };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      onSave(result.value);
    }
  });
}
