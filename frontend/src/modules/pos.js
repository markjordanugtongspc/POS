// ==========================================
// pos.js - Point of Sale (POS) Barcode Scanner & Camera Module
// Implementation using Object-Oriented Programming (OOP)
// ==========================================

// --- START BarcodeScannerModal Class ---
class BarcodeScannerModal {
  constructor() {
    this.stream = null;
    this.modalElement = null;
    this.aboutModalElement = null;
    this.videoElement = null;
    this.scanOutputElement = null;
    this.scanTriggerBtn = null;
    this.mobileScanTriggerBtn = null;
    this.closeBtn = null;
    this.infoBtn = null;
    this.gotItBtn = null;
    this.closeAboutBtn = null;
    this.torchBtn = null;
    this.isTorchOn = false;

    this._bindElements();
    this._attachEventListeners();
  }

  // --- START _bindElements ---
  _bindElements() {
    this.modalElement = document.getElementById('barcode-scanner-modal');
    this.aboutModalElement = document.getElementById('barcode-about-modal');
    this.videoElement = document.getElementById('barcode-scanner-video');
    this.scanOutputElement = document.getElementById('barcode-scan-output');
    this.scanTriggerBtn = document.getElementById('btn-pos-scan-desktop');
    this.mobileScanTriggerBtn = document.getElementById('btn-pos-scan-mobile');
    this.closeBtn = document.getElementById('btn-close-scanner-modal');
    this.infoBtn = document.getElementById('btn-scanner-info');
    this.gotItBtn = document.getElementById('btn-scanner-about-gotit');
    this.closeAboutBtn = document.getElementById('btn-close-about-modal');
    this.torchBtn = document.getElementById('btn-scanner-torch');
  }
  // --- END _bindElements ---

  // --- START _attachEventListeners ---
  _attachEventListeners() {
    // Desktop scan button click trigger
    if (this.scanTriggerBtn) {
      this.scanTriggerBtn.addEventListener('click', () => {
        this.openScanner();
      });
    }

    // Mobile scan button click trigger
    if (this.mobileScanTriggerBtn) {
      this.mobileScanTriggerBtn.addEventListener('click', () => {
        this.openScanner();
      });
    }

    // Close main scanner modal
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.closeScanner();
      });
    }

    // Info button click: shows the About popup
    if (this.infoBtn) {
      this.infoBtn.addEventListener('click', () => {
        this.showAboutModal();
      });
    }

    // "Got it" button inside About modal
    if (this.gotItBtn) {
      this.gotItBtn.addEventListener('click', () => {
        this.hideAboutModal();
      });
    }

    // Close X button inside About modal
    if (this.closeAboutBtn) {
      this.closeAboutBtn.addEventListener('click', () => {
        this.hideAboutModal();
      });
    }

    // Torch / Flashlight toggle button
    if (this.torchBtn) {
      this.torchBtn.addEventListener('click', () => {
        this.toggleTorch();
      });
    }

    // Close on clicking backdrop / background of main scanner modal
    if (this.modalElement) {
      this.modalElement.addEventListener('click', (e) => {
        if (e.target === this.modalElement) {
          this.closeScanner();
        }
      });
    }

    // Close on clicking backdrop / background of About modal
    if (this.aboutModalElement) {
      this.aboutModalElement.addEventListener('click', (e) => {
        if (e.target === this.aboutModalElement) {
          this.hideAboutModal();
        }
      });
    }

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.aboutModalElement && !this.aboutModalElement.classList.contains('hidden')) {
          this.hideAboutModal();
        } else if (this.modalElement && !this.modalElement.classList.contains('hidden')) {
          this.closeScanner();
        }
      }
    });
  }
  // --- END _attachEventListeners ---

  // --- START openScanner ---
  async openScanner() {
    if (!this.modalElement) return;

    // Reveal main scanner modal
    this.modalElement.classList.remove('hidden');
    this.modalElement.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    // Always show the About dialog initially as required
    this.showAboutModal();

    // Prompt user for camera permission via getUserMedia
    await this.startCamera();
  }
  // --- END openScanner ---

  // --- START closeScanner ---
  closeScanner() {
    if (!this.modalElement) return;

    this.stopCamera();

    this.modalElement.classList.add('hidden');
    this.modalElement.classList.remove('flex');
    this.hideAboutModal();
    document.body.classList.remove('overflow-hidden');
  }
  // --- END closeScanner ---

  // --- START startCamera ---
  async startCamera() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (this.videoElement) {
          this.videoElement.srcObject = this.stream;
          await this.videoElement.play();
          this.updateScanOutput("Camera active. Align barcode with detection box.");
        }
      } else {
        this.updateScanOutput("Camera media devices API not supported on this browser.");
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      this.updateScanOutput("Camera access prompt denied. Please allow camera permissions.");
    }
  }
  // --- END startCamera ---

  // --- START stopCamera ---
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.isTorchOn = false;
  }
  // --- END stopCamera ---

  // --- START showAboutModal ---
  showAboutModal() {
    if (this.aboutModalElement) {
      this.aboutModalElement.classList.remove('hidden');
      this.aboutModalElement.classList.add('flex');
    }
  }
  // --- END showAboutModal ---

  // --- START hideAboutModal ---
  hideAboutModal() {
    if (this.aboutModalElement) {
      this.aboutModalElement.classList.add('hidden');
      this.aboutModalElement.classList.remove('flex');
    }
  }
  // --- END hideAboutModal ---

  // --- START toggleTorch ---
  async toggleTorch() {
    if (!this.stream) return;
    const track = this.stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        this.isTorchOn = !this.isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: this.isTorchOn }]
        });
        if (this.torchBtn) {
          this.torchBtn.classList.toggle('text-amber-400', this.isTorchOn);
        }
      } else {
        this.updateScanOutput("Flashlight/Torch not supported by current video device.");
      }
    } catch (e) {
      console.warn("Could not toggle torch:", e);
    }
  }
  // --- END toggleTorch ---

  // --- START updateScanOutput ---
  updateScanOutput(text) {
    if (this.scanOutputElement) {
      this.scanOutputElement.textContent = text;
    }
  }
  // --- END updateScanOutput ---
}
// --- END BarcodeScannerModal Class ---

// --- START CashPaymentController Class ---
class CashPaymentController {
  constructor(totalAmount = 97.00) {
    this.totalAmount = totalAmount;
    this._bindElements();
    this._attachEventListeners();
  }

  _bindElements() {
    this.cashInputDesktop = document.getElementById('cash-amount-input');
    this.changeDisplayDesktop = document.getElementById('cash-change-display');
    this.quickCashButtonsDesktop = document.querySelectorAll('.btn-quick-cash');

    this.cashInputDrawer = document.getElementById('cash-amount-input-drawer');
    this.changeDisplayDrawer = document.getElementById('cash-change-display-drawer');
    this.quickCashButtonsDrawer = document.querySelectorAll('.btn-quick-cash-drawer');
  }

  _attachEventListeners() {
    // Desktop cash input listener
    if (this.cashInputDesktop) {
      this.cashInputDesktop.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 0;
        this._updateChange(val, this.changeDisplayDesktop);
        if (this.cashInputDrawer) {
          this.cashInputDrawer.value = e.target.value;
          this._updateChange(val, this.changeDisplayDrawer);
        }
      });
    }

    // Drawer cash input listener
    if (this.cashInputDrawer) {
      this.cashInputDrawer.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 0;
        this._updateChange(val, this.changeDisplayDrawer);
        if (this.cashInputDesktop) {
          this.cashInputDesktop.value = e.target.value;
          this._updateChange(val, this.changeDisplayDesktop);
        }
      });
    }

    // Desktop quick bill buttons
    this.quickCashButtonsDesktop.forEach((btn) => {
      btn.addEventListener('click', () => {
        const amount = parseFloat(btn.dataset.amount) || 0;
        if (this.cashInputDesktop) {
          this.cashInputDesktop.value = amount.toFixed(2);
          this._updateChange(amount, this.changeDisplayDesktop);
        }
        if (this.cashInputDrawer) {
          this.cashInputDrawer.value = amount.toFixed(2);
          this._updateChange(amount, this.changeDisplayDrawer);
        }
      });
    });

    // Drawer quick bill buttons
    this.quickCashButtonsDrawer.forEach((btn) => {
      btn.addEventListener('click', () => {
        const amount = parseFloat(btn.dataset.amount) || 0;
        if (this.cashInputDrawer) {
          this.cashInputDrawer.value = amount.toFixed(2);
          this._updateChange(amount, this.changeDisplayDrawer);
        }
        if (this.cashInputDesktop) {
          this.cashInputDesktop.value = amount.toFixed(2);
          this._updateChange(amount, this.changeDisplayDesktop);
        }
      });
    });
  }

  _updateChange(tendered, displayElement) {
    if (!displayElement) return;
    const change = tendered - this.totalAmount;
    if (change >= 0) {
      displayElement.textContent = `₱${change.toFixed(2)}`;
      displayElement.classList.remove('text-red-500', 'dark:text-red-400');
      displayElement.classList.add('text-emerald-700', 'dark:text-emerald-400');
    } else {
      displayElement.textContent = `-₱${Math.abs(change).toFixed(2)}`;
      displayElement.classList.remove('text-emerald-700', 'dark:text-emerald-400');
      displayElement.classList.add('text-red-500', 'dark:text-red-400');
    }
  }
}
// --- END CashPaymentController Class ---

import { fetchCustomers, createCustomer, createUtangRecord } from '../../../backend/api/utang.api.js';

// --- START UtangPOSController Class ---
class UtangPOSController {
  constructor() {
    this.storeId = parseInt(localStorage.getItem('user_store_id') || localStorage.getItem('store_id') || '1', 10);
    this.branchId = localStorage.getItem('user_branch_id') ? parseInt(localStorage.getItem('user_branch_id'), 10) : null;
    this.customerSelect = document.getElementById('pos-utang-customer-select');
    this.newCustomerFields = document.getElementById('pos-utang-new-customer-fields');
    this.nameInput = document.getElementById('pos-utang-customer-name');
    this.phoneInput = document.getElementById('pos-utang-customer-phone');
    this.dueDateInput = document.getElementById('pos-utang-due-date');
    this.checkoutButtons = document.querySelectorAll('.btn-pos-checkout, button:has(svg:last-child)');

    this._init();
  }

  async _init() {
    if (!this.customerSelect) return;
    await this.loadCustomers();

    this.customerSelect.addEventListener('change', (e) => {
      if (e.target.value === 'NEW') {
        if (this.newCustomerFields) this.newCustomerFields.classList.remove('hidden');
        if (this.nameInput) this.nameInput.value = '';
        if (this.phoneInput) this.phoneInput.value = '';
      } else {
        if (this.newCustomerFields) this.newCustomerFields.classList.add('hidden');
        const selectedOpt = e.target.selectedOptions[0];
        if (selectedOpt) {
          if (this.phoneInput) this.phoneInput.value = selectedOpt.dataset.phone || '';
        }
      }
    });

    this._bindCheckout();
  }

  async loadCustomers() {
    const res = await fetchCustomers(this.storeId, this.branchId);
    if (res.success && res.data.length > 0) {
      this.customerSelect.innerHTML = `<option value="NEW">Register new customer</option>` +
        res.data.map(c => `<option value="${c.id}" data-name="${c.name}" data-phone="${c.phone || ''}">${c.name} (${c.phone || 'No phone'}) - Current Utang: ₱${parseFloat(c.total_utang || 0).toFixed(2)}</option>`).join('');
    }
  }

  _bindCheckout() {
    // Find continue/checkout button
    const checkoutBtns = document.querySelectorAll('button:has(svg)');
    checkoutBtns.forEach(btn => {
      if (btn.textContent.includes('Continue')) {
        btn.addEventListener('click', () => this.handleCheckout());
      }
    });
  }

  async handleCheckout() {
    const payUtangRadio = document.getElementById('pay-utang');
    const isUtang = payUtangRadio && payUtangRadio.checked;

    if (!isUtang) {
      // Regular Cash / Card / E-cash notification
      const activeMethod = document.querySelector('input[name="payment_method"]:checked')?.id || 'pay-cash';
      const methodName = activeMethod.replace('pay-', '').toUpperCase();
      this.showTransactionAlert(`Payment processed successfully via ${methodName}! (₱97.00)`);
      return;
    }

    // Process Utang Sale
    let customerId = null;
    let customerName = '';
    let customerPhone = '';
    const dueDate = this.dueDateInput?.value || null;

    if (this.customerSelect.value === 'NEW') {
      customerName = this.nameInput?.value.trim() || '';
      customerPhone = this.phoneInput?.value.trim() || '';
      if (!customerName) {
        alert('Please enter customer name for Utang (Credit) transaction.');
        if (this.nameInput) this.nameInput.focus();
        return;
      }
      // Create new customer account
      const custRes = await createCustomer({
        storeId: this.storeId,
        branchId: this.branchId,
        name: customerName,
        phone: customerPhone
      });
      if (custRes.success) {
        customerId = custRes.data.id;
      }
    } else {
      const selectedOpt = this.customerSelect.selectedOptions[0];
      customerId = parseInt(this.customerSelect.value, 10);
      customerName = selectedOpt?.dataset.name || 'Valued Customer';
      customerPhone = selectedOpt?.dataset.phone || '';
    }

    const itemsSummary = 'Rice (1x), Surf Cherry Blossom (1x), Lucky Me Canton (1x), Milo 24g (2x)';
    const totalAmount = 97.00;

    const res = await createUtangRecord({
      storeId: this.storeId,
      branchId: this.branchId,
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      itemsSummary: itemsSummary,
      amount: totalAmount,
      dueDate: dueDate
    });

    if (res.success) {
      this.showTransactionAlert(`Utang (Credit) transaction of ₱${totalAmount.toFixed(2)} recorded for ${customerName}!`, true);
      await this.loadCustomers();
      if (this.nameInput) this.nameInput.value = '';
      if (this.phoneInput) this.phoneInput.value = '';
      if (this.dueDateInput) this.dueDateInput.value = '';
    } else {
      alert('Error recording Utang transaction: ' + res.error);
    }
  }

  showTransactionAlert(message, isUtang = false) {
    const banner = document.createElement('div');
    banner.className = `fixed bottom-5 right-5 z-50 flex items-center p-4 mb-4 text-emerald-800 rounded-2xl bg-emerald-50 dark:bg-neutral-850 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-2xl transition-all duration-300 transform translate-y-0`;
    banner.innerHTML = `
      <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 text-emerald-500 bg-emerald-100 rounded-lg dark:bg-emerald-900/40 dark:text-emerald-300 mr-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      </div>
      <div class="text-xs font-bold mr-4">
        <div>${message}</div>
        ${isUtang ? `<a href="/pages/users/client/utang/" class="text-emerald-600 dark:text-emerald-300 underline font-black text-[11px] mt-1 inline-block">View in Utang & Credit Ledger →</a>` : ''}
      </div>
      <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-emerald-50 text-emerald-500 rounded-lg p-1.5 hover:bg-emerald-200 inline-flex items-center justify-center h-7 w-7 dark:bg-neutral-800 dark:text-emerald-400 dark:hover:bg-neutral-700 cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;

    document.body.appendChild(banner);
    banner.querySelector('button').addEventListener('click', () => banner.remove());
    setTimeout(() => {
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 300);
    }, 5000);
  }
}
// --- END UtangPOSController Class ---

// ==========================================
// START: initPOS
// Main entry point for POS module initialization
// ==========================================
export function initPOS() {
  const isPOSPage = document.getElementById('btn-pos-scan-desktop') || document.querySelector('[data-drawer-target="cart-drawer"]');
  if (!isPOSPage) return;

  // Instantiate OOP Barcode Scanner Modal Controller
  new BarcodeScannerModal();

  // Instantiate OOP Cash Payment & Tender Controller
  new CashPaymentController();

  // Instantiate OOP Utang (Credit) POS Controller
  new UtangPOSController();
}
// ==========================================
// END: initPOS
// ==========================================
