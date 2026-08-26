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


// ==========================================
// START: initPOS
// Main entry point for POS module initialization
// ==========================================
export function initPOS() {
  const isPOSPage = document.getElementById('btn-pos-scan-desktop') || document.querySelector('[data-drawer-target="cart-drawer"]');
  if (!isPOSPage) return;

  // Instantiate OOP Barcode Scanner Modal Controller
  new BarcodeScannerModal();
}
// ==========================================
// END: initPOS
// ==========================================
