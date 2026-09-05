// modals.js - SweetAlert2 utility module for standardized premium alerts
import Swal from 'sweetalert2';
import { lookupBarcode } from '../../../backend/api/openfoodfacts.api.js';

/**
 * Audio feedback on successful scan
 */
function playScanBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // restricted audio context
  }
}

/**
 * Interactive Live Camera Barcode Scanner Modal with BarcodeDetector
 */
export function openBarcodeCameraScanner({ onDetected }) {
  const existing = document.getElementById('camera-barcode-modal');
  if (existing) existing.remove();

  const modalEl = document.createElement('div');
  modalEl.id = 'camera-barcode-modal';
  modalEl.className = 'fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4';
  modalEl.innerHTML = `
    <div class="relative w-full max-w-md bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden font-sans">
      <!-- Header -->
      <div class="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <h3 class="text-xs font-black uppercase tracking-wider text-white">Live Camera Barcode Scanner</h3>
        </div>
        <button type="button" id="btn-close-camera-scanner" class="cursor-pointer text-neutral-400 hover:text-white p-1 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Video Viewfinder Frame -->
      <div class="relative w-full h-72 bg-black overflow-hidden flex items-center justify-center">
        <video id="scanner-camera-video" autoplay playsinline muted class="w-full h-full object-cover"></video>

        <!-- Aiming Reticle -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
          <div class="relative w-full max-w-[280px] h-36 border-2 border-emerald-500/80 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
            <!-- Animated Scan Laser Line -->
            <div class="absolute left-1 right-1 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse"></div>
            <!-- Target corners -->
            <span class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></span>
            <span class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></span>
            <span class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></span>
            <span class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></span>
          </div>
        </div>

        <!-- Scanning Status Bar -->
        <div id="scanner-status-text" class="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-black/75 backdrop-blur-md rounded text-center text-[11px] font-semibold text-emerald-400">
          Point camera at product barcode
        </div>
      </div>

      <!-- Controls & Quick Presets -->
      <div class="p-4 bg-neutral-950/90 border-t border-neutral-800 space-y-3 text-xs">
        <div class="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>EAN-13, UPC-A, Code-128 auto-detected</span>
          <button type="button" id="btn-toggle-scanner-torch" class="cursor-pointer text-[10px] font-bold text-neutral-300 hover:text-amber-400 flex items-center gap-1 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"/></svg>
            <span>Torch</span>
          </button>
        </div>

        <!-- Sample Barcode Fast Injectors for testing/simulation -->
        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-1.5">Or test with demo barcode:</span>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" data-sample="0750515017429" class="btn-sample-code cursor-pointer px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-mono rounded transition">0750515017429 (Milo)</button>
            <button type="button" data-sample="4800016644808" class="btn-sample-code cursor-pointer px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-mono rounded transition">4800016644808 (Pancit)</button>
            <button type="button" data-sample="4800361300018" class="btn-sample-code cursor-pointer px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-mono rounded transition">4800361300018 (BearBrand)</button>
          </div>
        </div>

        <button type="button" id="btn-cancel-camera-modal" class="cursor-pointer w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider transition">
          Close Scanner
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  const video = modalEl.querySelector('#scanner-camera-video');
  const statusText = modalEl.querySelector('#scanner-status-text');
  const closeBtn = modalEl.querySelector('#btn-close-camera-scanner');
  const cancelBtn = modalEl.querySelector('#btn-cancel-camera-modal');
  const torchBtn = modalEl.querySelector('#btn-toggle-scanner-torch');
  let mediaStream = null;
  let isScanning = true;
  let rafId = null;
  let isTorchOn = false;

  const cleanup = () => {
    isScanning = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }
    modalEl.remove();
  };

  closeBtn?.addEventListener('click', cleanup);
  cancelBtn?.addEventListener('click', cleanup);

  // Quick sample barcodes
  modalEl.querySelectorAll('.btn-sample-code').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.sample;
      playScanBeep();
      cleanup();
      if (onDetected) onDetected(code);
    });
  });

  // Torch toggle
  torchBtn?.addEventListener('click', async () => {
    if (!mediaStream) return;
    const track = mediaStream.getVideoTracks()[0];
    if (!track) return;
    try {
      const caps = track.getCapabilities ? track.getCapabilities() : {};
      if (caps.torch) {
        isTorchOn = !isTorchOn;
        await track.applyConstraints({ advanced: [{ torch: isTorchOn }] });
        torchBtn.classList.toggle('text-amber-400', isTorchOn);
      } else {
        statusText.textContent = 'Torch not supported on this camera';
      }
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  });

  // Start Camera
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        if (video) {
          video.srcObject = mediaStream;
          await video.play();
        }

        // Check BarcodeDetector support
        if ('BarcodeDetector' in window) {
          try {
            const formats = await window.BarcodeDetector.getSupportedFormats();
            const detector = new window.BarcodeDetector({
              formats: formats.length > 0 ? formats : ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
            });

            const detect = async () => {
              if (!isScanning) return;
              try {
                if (video && video.readyState >= 2) {
                  const detected = await detector.detect(video);
                  if (detected && detected.length > 0) {
                    const rawVal = detected[0].rawValue;
                    if (rawVal) {
                      playScanBeep();
                      cleanup();
                      if (onDetected) onDetected(rawVal);
                      return;
                    }
                  }
                }
              } catch (err) {
                // frame detection pass
              }
              rafId = requestAnimationFrame(detect);
            };
            rafId = requestAnimationFrame(detect);
          } catch (detErr) {
            console.warn('BarcodeDetector init error:', detErr);
            statusText.textContent = 'Camera active. Point at barcode or click a demo preset.';
          }
        } else {
          statusText.textContent = 'Camera active. Click demo preset or enter barcode.';
        }
      } else {
        statusText.textContent = 'Camera not available on this device/browser.';
      }
    } catch (camErr) {
      console.warn('Camera access error:', camErr);
      statusText.textContent = 'Camera permission denied or camera not found.';
    }
  };

  startCamera();
}

/**
 * Helper to bind barcode auto-lookup functionality inside modals
 */
function setupBarcodeAutoFill({ inputId, btnId, iconBtnId, scanBtnId, statusId, spinnerId, searchIconId, nameId, brandId, categoryId }) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  const iconBtn = document.getElementById(iconBtnId);
  const scanBtn = scanBtnId ? document.getElementById(scanBtnId) : null;
  const status = document.getElementById(statusId);
  const spinner = document.getElementById(spinnerId);
  const searchIcon = document.getElementById(searchIconId);
  const nameInput = document.getElementById(nameId);
  const brandInput = document.getElementById(brandId);
  const categoryInput = document.getElementById(categoryId);

  const performLookup = async () => {
    const rawVal = input?.value?.trim();
    if (!rawVal) {
      if (status) {
        status.textContent = 'Please enter a barcode number first.';
        status.className = 'text-[10px] mt-1 font-medium text-amber-500 block';
      }
      return;
    }

    if (spinner && searchIcon) {
      spinner.classList.remove('hidden');
      searchIcon.classList.add('hidden');
    }
    if (status) {
      status.textContent = 'Looking up product via Open Food Facts...';
      status.className = 'text-[10px] mt-1 font-medium text-blue-500 dark:text-blue-400 block';
    }

    try {
      const result = await lookupBarcode(rawVal);
      if (result.found) {
        if (nameInput && result.name) {
          nameInput.value = result.name;
          nameInput.classList.add('ring-2', 'ring-emerald-500');
          setTimeout(() => nameInput.classList.remove('ring-2', 'ring-emerald-500'), 2000);
        }
        if (brandInput && result.brand) {
          brandInput.value = result.brand;
          brandInput.classList.add('ring-2', 'ring-emerald-500');
          setTimeout(() => brandInput.classList.remove('ring-2', 'ring-emerald-500'), 2000);
        }
        if (categoryInput && result.category) {
          categoryInput.value = result.category;
          categoryInput.classList.add('ring-2', 'ring-emerald-500');
          setTimeout(() => categoryInput.classList.remove('ring-2', 'ring-emerald-500'), 2000);
        }

        if (status) {
          status.textContent = `✓ Auto-filled: "${result.name || 'Product'}" (${result.brand || 'Brand'})`;
          status.className = 'text-[10px] mt-1 font-bold text-emerald-600 dark:text-emerald-400 block';
        }
      } else {
        if (status) {
          status.textContent = 'Barcode not found on Open Food Facts. You can fill details manually.';
          status.className = 'text-[10px] mt-1 font-medium text-amber-600 dark:text-amber-400 block';
        }
      }
    } catch (err) {
      if (status) {
        status.textContent = 'Lookup failed. Enter manually.';
        status.className = 'text-[10px] mt-1 font-medium text-rose-500 block';
      }
    } finally {
      if (spinner && searchIcon) {
        spinner.classList.add('hidden');
        searchIcon.classList.remove('hidden');
      }
    }
  };

  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      openBarcodeCameraScanner({
        onDetected: (scannedCode) => {
          if (input) {
            input.value = scannedCode;
            performLookup();
          }
        }
      });
    });
  }

  btn?.addEventListener('click', performLookup);
  iconBtn?.addEventListener('click', performLookup);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performLookup();
    }
  });
}


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
            <div class="flex items-center justify-between mb-1">
              <label class="block text-neutral-600 dark:text-neutral-400 text-[11px] font-bold">EAN-13 Barcode</label>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-ean13-scan" class="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer" title="Scan barcode using camera">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"/></svg>
                  <span>📷 Scan</span>
                </button>
                <button type="button" id="btn-ean13-lookup" class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
                  <span>Lookup</span>
                </button>
              </div>
            </div>
            <div class="relative flex items-center">
              <input type="text" id="swal-ean13" placeholder="e.g. 0750515017429" class="w-full h-10 px-3 py-2 pr-8 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
              <button type="button" id="btn-ean13-lookup-icon" title="Lookup barcode" class="absolute right-2 p-1 text-neutral-400 hover:text-emerald-600 transition-colors cursor-pointer">
                <svg id="icon-ean13-search" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
                <svg id="icon-ean13-spinner" class="w-4 h-4 animate-spin text-emerald-600 hidden" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
              </button>
            </div>
            <p id="ean13-lookup-status" class="text-[10px] mt-1 font-medium hidden"></p>
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
      // Bind Open Food Facts Auto-Fill
      setupBarcodeAutoFill({
        inputId: 'swal-ean13',
        btnId: 'btn-ean13-lookup',
        iconBtnId: 'btn-ean13-lookup-icon',
        scanBtnId: 'btn-ean13-scan',
        statusId: 'ean13-lookup-status',
        spinnerId: 'icon-ean13-spinner',
        searchIconId: 'icon-ean13-search',
        nameId: 'swal-name',
        brandId: 'swal-brand',
        categoryId: 'swal-category'
      });

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
            <div class="flex items-center justify-between mb-1">
              <label class="block text-neutral-600 dark:text-neutral-400 text-[11px] font-bold">EAN-13 Barcode</label>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-ean13-edit-scan" class="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer" title="Scan barcode using camera">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"/></svg>
                  <span>📷 Scan</span>
                </button>
                <button type="button" id="btn-ean13-edit-lookup" class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
                  <span>Lookup</span>
                </button>
              </div>
            </div>
            <div class="relative flex items-center">
              <input type="text" id="swal-ean13" value="${product.barcode_ean13 || product.ean_13_barcode || ''}" placeholder="4800361300018" class="w-full h-10 px-3 py-2 pr-8 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-none">
              <button type="button" id="btn-ean13-edit-lookup-icon" title="Lookup barcode" class="absolute right-2 p-1 text-neutral-400 hover:text-emerald-600 transition-colors cursor-pointer">
                <svg id="icon-ean13-edit-search" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
                <svg id="icon-ean13-edit-spinner" class="w-4 h-4 animate-spin text-emerald-600 hidden" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
              </button>
            </div>
            <p id="ean13-edit-lookup-status" class="text-[10px] mt-1 font-medium hidden"></p>
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
      // Bind Open Food Facts Auto-Fill for Edit
      setupBarcodeAutoFill({
        inputId: 'swal-ean13',
        btnId: 'btn-ean13-edit-lookup',
        iconBtnId: 'btn-ean13-edit-lookup-icon',
        scanBtnId: 'btn-ean13-edit-scan',
        statusId: 'ean13-edit-lookup-status',
        spinnerId: 'icon-ean13-edit-spinner',
        searchIconId: 'icon-ean13-edit-search',
        nameId: 'swal-name',
        brandId: 'swal-brand',
        categoryId: 'swal-category'
      });

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


