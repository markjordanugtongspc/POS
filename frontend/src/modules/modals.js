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
 * @param {string} nextSku
 * @returns {Promise}
 */
export function showAddProductModal(onSave, nextSku = 'SKU011') {
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#16171d' : '#ffffff';
  const border = isDark ? 'border-neutral-800' : 'border-neutral-200';

  const html = `
    <div class="font-sans text-left text-neutral-800 dark:text-neutral-200 leading-normal">
      <div class="pb-3 mb-4 border-b ${border} flex items-center justify-between">
        <h3 class="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          <span>Add New Product</span>
        </h3>
        <span class="text-[10px] font-mono font-bold text-neutral-400">Inventory Management</span>
      </div>

      <form id="form-product-add" class="space-y-3.5 text-xs font-semibold" onsubmit="event.preventDefault();">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-600 dark:text-neutral-400 text-[11px] mb-1 font-bold">Auto SKU (System)</label>
            <input type="text" id="swal-sku" disabled value="${nextSku}" class="w-full h-10 px-3 py-2 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 cursor-not-allowed rounded-none">
          </div>
          <div>
            <label class="block text-neutral-600 dark:text-neutral-400 text-[11px] mb-1 font-bold">EAN-13 Barcode</label>
            <input type="text" id="swal-ean13" placeholder="4800361300018" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
        </div>

        <div>
          <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Product Name *</label>
          <input type="text" id="swal-name" required placeholder="e.g. Milo 24g" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Category *</label>
            <input type="text" id="swal-category" required placeholder="e.g. Beverage" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Brand *</label>
            <input type="text" id="swal-brand" required placeholder="e.g. Nestle" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Cost Price (₱)</label>
            <input type="number" step="0.01" id="swal-buying-price" placeholder="9.50" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Selling Price (₱) *</label>
            <input type="number" step="0.01" id="swal-price" required placeholder="12.00" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Stock Qty *</label>
            <input type="number" id="swal-qty" required placeholder="50" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
        </div>

        <div>
          <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Product Image</label>
          <input type="file" id="swal-image-file" accept="image/*" class="w-full h-10 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-none file:h-full file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:bg-neutral-100 file:dark:bg-neutral-800 file:text-neutral-700 file:dark:text-neutral-200 hover:file:bg-neutral-200 cursor-pointer">
        </div>

        <!-- Custom Horizontal Action Buttons: SAVE on LEFT, CANCEL on RIGHT -->
        <div class="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button type="button" id="custom-modal-save" class="w-full h-10 cursor-pointer font-black text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center rounded-none shadow-sm">
            SAVE PRODUCT
          </button>
          <button type="button" id="custom-modal-cancel" class="w-full h-10 cursor-pointer font-black text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-800 active:scale-95 transition-all flex items-center justify-center rounded-none">
            CANCEL
          </button>
        </div>
      </form>
    </div>
  `;

  return Swal.fire({
    html: html,
    showConfirmButton: false,
    showCancelButton: false,
    buttonsStyling: false,
    background: bg,
    didOpen: () => {
      const saveBtn = document.getElementById('custom-modal-save');
      const cancelBtn = document.getElementById('custom-modal-cancel');

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          Swal.close();
        });
      }

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const sku = document.getElementById('swal-sku')?.value.trim();
          const ean13 = document.getElementById('swal-ean13')?.value.trim();
          const name = document.getElementById('swal-name')?.value.trim();
          const category = document.getElementById('swal-category')?.value.trim();
          const brand = document.getElementById('swal-brand')?.value.trim();
          const buyingPrice = parseFloat(document.getElementById('swal-buying-price')?.value) || 0.00;
          const price = parseFloat(document.getElementById('swal-price')?.value);
          const qty = parseInt(document.getElementById('swal-qty')?.value, 10);
          const fileInput = document.getElementById('swal-image-file');
          const imageFile = fileInput?.files?.[0] || null;

          if (!sku || !name || !category || !brand || isNaN(price) || isNaN(qty)) {
            Swal.showValidationMessage('Please fill out all required fields with valid values');
            return;
          }

          Swal.close();
          onSave({ sku, barcodeEan13: ean13, name, category, brand, costPrice: buyingPrice, price, qty, imageFile, createdBy: 'Mark Jordan' });
        });
      }
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
  const bg = isDark ? '#16171d' : '#ffffff';
  const border = isDark ? 'border-neutral-800' : 'border-neutral-200';

  const html = `
    <div class="font-sans text-left text-neutral-800 dark:text-neutral-200 leading-normal">
      <div class="pb-3 mb-4 border-b ${border} flex items-center justify-between">
        <h3 class="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>
          <span>Edit Product</span>
        </h3>
        <span class="text-[10px] font-mono font-bold text-neutral-500">${product.sku}</span>
      </div>

      <form id="form-product-edit" class="space-y-3.5 text-xs font-semibold" onsubmit="event.preventDefault();">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-600 dark:text-neutral-400 text-[11px] mb-1 font-bold">SKU (Read-only)</label>
            <input type="text" id="swal-sku" readonly value="${product.sku}" class="w-full h-10 px-3 py-2 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-300 dark:border-neutral-700 cursor-not-allowed rounded-none">
          </div>
          <div>
            <label class="block text-neutral-600 dark:text-neutral-400 text-[11px] mb-1 font-bold">EAN-13 Barcode</label>
            <input type="text" id="swal-ean13" value="${product.barcode_ean13 || product.ean_13_barcode || ''}" placeholder="4800361300018" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
        </div>

        <div>
          <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Product Name *</label>
          <input type="text" id="swal-name" required value="${product.name}" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Category *</label>
            <input type="text" id="swal-category" required value="${product.category}" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Brand *</label>
            <input type="text" id="swal-brand" required value="${product.brand}" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Cost Price (₱)</label>
            <input type="number" step="0.01" id="swal-buying-price" value="${product.cost_price || product.buying_price || 0}" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Selling Price (₱) *</label>
            <input type="number" step="0.01" id="swal-price" required value="${product.price || product.selling_price}" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
          <div>
            <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Stock Qty *</label>
            <input type="number" id="swal-qty" required value="${product.qty}" class="w-full h-10 px-3 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
          </div>
        </div>

        <div>
          <label class="block text-neutral-700 dark:text-neutral-300 text-[11px] mb-1 font-bold">Product Image (Modify / Upload)</label>
          <div class="flex items-center gap-3">
            <input type="file" id="swal-image-file" accept="image/*" class="w-full h-10 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-none file:h-full file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:bg-neutral-100 file:dark:bg-neutral-800 file:text-neutral-700 file:dark:text-neutral-200 hover:file:bg-neutral-200 cursor-pointer">
          </div>
        </div>

        <!-- Custom Horizontal Action Buttons: UPDATE on LEFT, CANCEL on RIGHT -->
        <div class="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button type="button" id="custom-modal-update" class="w-full h-10 cursor-pointer font-black text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center rounded-none shadow-sm">
            UPDATE PRODUCT
          </button>
          <button type="button" id="custom-modal-edit-cancel" class="w-full h-10 cursor-pointer font-black text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-800 active:scale-95 transition-all flex items-center justify-center rounded-none">
            CANCEL
          </button>
        </div>
      </form>
    </div>
  `;

  return Swal.fire({
    html: html,
    showConfirmButton: false,
    showCancelButton: false,
    buttonsStyling: false,
    background: bg,
    didOpen: () => {
      const updateBtn = document.getElementById('custom-modal-update');
      const cancelBtn = document.getElementById('custom-modal-edit-cancel');

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          Swal.close();
        });
      }

      if (updateBtn) {
        updateBtn.addEventListener('click', () => {
          const sku = document.getElementById('swal-sku')?.value.trim();
          const ean13 = document.getElementById('swal-ean13')?.value.trim();
          const name = document.getElementById('swal-name')?.value.trim();
          const category = document.getElementById('swal-category')?.value.trim();
          const brand = document.getElementById('swal-brand')?.value.trim();
          const buyingPrice = parseFloat(document.getElementById('swal-buying-price')?.value) || 0.00;
          const price = parseFloat(document.getElementById('swal-price')?.value);
          const qty = parseInt(document.getElementById('swal-qty')?.value, 10);
          const fileInput = document.getElementById('swal-image-file');
          const imageFile = fileInput?.files?.[0] || null;

          if (!sku || !name || !category || !brand || isNaN(price) || isNaN(qty)) {
            Swal.showValidationMessage('Please fill out all required fields with valid values');
            return;
          }

          Swal.close();
          onSave({ sku, barcodeEan13: ean13, name, category, brand, costPrice: buyingPrice, price, qty, imageFile, createdBy: product.createdBy });
        });
      }
    }
  });
}


