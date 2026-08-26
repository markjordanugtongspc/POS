// animations.js - Handles numerical count-up animations and interactive transitions

// ==========================================
// START: formatCounterNumber
// Formats a raw number value into formatted string with commas, decimals, padding, prefix, and suffix.
// ==========================================
export function formatCounterNumber(value, options = {}) {
  const decimals = options.decimals !== undefined ? options.decimals : 0;
  const prefix = options.prefix || '';
  const suffix = options.suffix || '';
  const pad = options.pad || 0;

  // Split integer and decimal parts
  const fixedStr = value.toFixed(decimals);
  const [intPart, decPart] = fixedStr.split('.');

  // Format with thousand commas
  let formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  if (pad > 0 && !formattedInt.includes(',')) {
    formattedInt = formattedInt.padStart(pad, '0');
  }

  const formattedNum = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  return `${prefix}${formattedNum}${suffix}`;
}
// ==========================================
// END: formatCounterNumber
// ==========================================

// ==========================================
// START: animateNumber
// Smoothly animates an element from a start number to end number using requestAnimationFrame.
// ==========================================
export function animateNumber(element, start, end, duration = 1200, options = {}) {
  if (!element) return;

  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    const currentVal = start + (end - start) * easedProgress;
    element.textContent = formatCounterNumber(currentVal, options);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = formatCounterNumber(end, options);
    }
  }

  requestAnimationFrame(step);
}
// ==========================================
// END: animateNumber
// ==========================================

// ==========================================
// START: animateElementNumber
// Parses data attributes from a target DOM element and launches its numerical count animation.
// ==========================================
export function animateElementNumber(element) {
  if (!element || element.dataset.animated === 'true') return;

  const targetStr = element.getAttribute('data-target') || element.getAttribute('data-count');
  if (targetStr === null || targetStr === undefined) return;

  const target = parseFloat(targetStr);
  if (isNaN(target)) return;

  const prefix = element.getAttribute('data-prefix') || '';
  const suffix = element.getAttribute('data-suffix') || '';
  const decimals = element.hasAttribute('data-decimals') 
    ? parseInt(element.getAttribute('data-decimals'), 10) 
    : (targetStr.includes('.') ? targetStr.split('.')[1].length : 0);
  const duration = element.hasAttribute('data-duration') 
    ? parseInt(element.getAttribute('data-duration'), 10) 
    : 1200;
  const pad = element.hasAttribute('data-pad') 
    ? parseInt(element.getAttribute('data-pad'), 10) 
    : 0;

  const options = { prefix, suffix, decimals, pad };

  element.dataset.animated = 'true';
  animateNumber(element, 0, target, duration, options);
}
// ==========================================
// END: animateElementNumber
// ==========================================

// ==========================================
// START: initNumberCounters
// Automatically scans DOM for all [data-counter] elements and sets up animated counting.
// ==========================================
export function initNumberCounters() {
  const counterElements = document.querySelectorAll('[data-counter]');

  if (counterElements.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Only animate if element is currently visible (not hidden by parent or class)
          if (!el.classList.contains('hidden') && el.offsetParent !== null) {
            animateElementNumber(el);
            obs.unobserve(el);
          }
        }
      });
    }, { threshold: 0.1 });

    counterElements.forEach(el => {
      // If element is already visible and not hidden, observe or trigger
      if (!el.classList.contains('hidden')) {
        observer.observe(el);
      }
    });
  } else {
    // Fallback for environments without IntersectionObserver
    counterElements.forEach(el => {
      if (!el.classList.contains('hidden')) {
        animateElementNumber(el);
      }
    });
  }
}
// ==========================================
// START: initScannerLaserAnimation
// Manages and activates the smooth top-to-bottom looping laser scanning sweep animation for POS barcode scanners.
// ==========================================
export function initScannerLaserAnimation() {
  const laserElement = document.getElementById('barcode-scanner-laser');
  if (!laserElement) return;

  // Apply smooth continuous scanning sweep class
  if (!laserElement.classList.contains('animate-scanner-laser')) {
    laserElement.classList.add('animate-scanner-laser');
  }
}
// ==========================================
// END: initScannerLaserAnimation
// ==========================================

// ==========================================
// START: createFloatingCursorPath
// Creates a glowing floating/jumping pointer cursor that glides along an arc pathway to a target element.
// ==========================================
export function createFloatingCursorPath(startElOrRect, targetEl, onArrive = null) {
  if (!targetEl) {
    if (onArrive) onArrive();
    return;
  }

  // Calculate start coordinates
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if (startElOrRect) {
    if (typeof startElOrRect.getBoundingClientRect === 'function') {
      const rect = startElOrRect.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else if (startElOrRect.x !== undefined && startElOrRect.y !== undefined) {
      startX = startElOrRect.x;
      startY = startElOrRect.y;
    }
  }

  // Calculate target coordinates
  const targetRect = targetEl.getBoundingClientRect();
  const targetX = targetRect.left + Math.min(30, targetRect.width / 4);
  const targetY = targetRect.top + targetRect.height / 2;

  // Create cursor container
  const cursorContainer = document.createElement('div');
  cursorContainer.className = 'fixed pointer-events-none z-[9999] transition-all ease-out';
  cursorContainer.style.left = `${startX}px`;
  cursorContainer.style.top = `${startY}px`;
  cursorContainer.style.transform = 'translate(-50%, -50%)';

  // SVG Cursor with glowing emerald styling & trail aura
  cursorContainer.innerHTML = `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
      <div class="absolute w-5 h-5 rounded-full bg-emerald-400/50 blur-[2px]"></div>
      <svg class="w-6 h-6 text-emerald-500 drop-shadow-[0_2px_8px_rgba(16,185,129,0.8)] -rotate-12 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2l16 11-7.5 1.5L8.5 22 4 2z"/>
      </svg>
    </div>
  `;

  document.body.appendChild(cursorContainer);

  // Spawn visual trail dots along the pathway
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    setTimeout(() => {
      const dot = document.createElement('div');
      dot.className = 'fixed pointer-events-none z-[9998] w-2 h-2 rounded-full bg-emerald-400/60 shadow-[0_0_6px_rgba(52,211,153,0.8)] transition-opacity duration-700';
      const progress = i / (steps + 1);
      const curX = startX + (targetX - startX) * progress;
      // Parabolic vertical arc lift
      const arcOffset = -Math.sin(progress * Math.PI) * 60;
      const curY = startY + (targetY - startY) * progress + arcOffset;

      dot.style.left = `${curX}px`;
      dot.style.top = `${curY}px`;
      dot.style.transform = 'translate(-50%, -50%) scale(0.8)';
      document.body.appendChild(dot);

      setTimeout(() => {
        dot.style.opacity = '0';
        dot.style.transform = 'translate(-50%, -50%) scale(0.2)';
        setTimeout(() => dot.remove(), 700);
      }, 500);
    }, i * 60);
  }

  // Animate cursor movement to target
  setTimeout(() => {
    cursorContainer.style.transition = 'all 600ms cubic-bezier(0.25, 1, 0.5, 1)';
    cursorContainer.style.left = `${targetX}px`;
    cursorContainer.style.top = `${targetY}px`;

    // Trigger arrival effects
    setTimeout(() => {
      // Tap / Click effect
      cursorContainer.style.transform = 'translate(-50%, -50%) scale(0.85)';
      
      // Ripple ring on target
      const ripple = document.createElement('div');
      ripple.className = 'fixed pointer-events-none z-[9998] w-10 h-10 rounded-full border-2 border-emerald-400 bg-emerald-400/20 animate-ping';
      ripple.style.left = `${targetX}px`;
      ripple.style.top = `${targetY}px`;
      ripple.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);

      setTimeout(() => {
        cursorContainer.style.opacity = '0';
        cursorContainer.style.transform = 'translate(-50%, -50%) scale(1.3)';
        setTimeout(() => cursorContainer.remove(), 400);

        if (onArrive) onArrive();
      }, 200);
    }, 620);
  }, 50);
}
// ==========================================
// END: createFloatingCursorPath
// ==========================================

// ==========================================
// START: highlightSidebarStaffsDropdown
// Launches a jumping pathway cursor from Manage Users to Staffs, opens dropdown, and executes 1s-step sequence with 3s final pulse.
// ==========================================
export function highlightSidebarStaffsDropdown() {
  const dropdownMenu = document.getElementById('dropdown-staffs');
  const toggleBtn = document.querySelector('[data-collapse-toggle="dropdown-staffs"]');
  const manageUsersBtn = document.getElementById('quick-action-manage-users');

  if (!toggleBtn && !dropdownMenu) return;

  const targetHeader = toggleBtn || dropdownMenu.parentElement;

  // 1. Launch jumping pathway cursor from Manage Users button to Staffs button
  createFloatingCursorPath(manageUsersBtn, targetHeader, () => {
    if (!dropdownMenu) return;

    // 2. Open / expand dropdown if not already open
    if (dropdownMenu.classList.contains('hidden')) {
      if (toggleBtn) {
        toggleBtn.click();
      } else {
        dropdownMenu.classList.remove('hidden');
      }
    }

    // Highlight Staffs toggle button header
    if (toggleBtn) {
      toggleBtn.classList.add('bg-emerald-50/90', 'dark:bg-emerald-950/60', 'text-emerald-600', 'dark:text-emerald-400');
    }

    const items = dropdownMenu.querySelectorAll('li > a');
    if (items.length < 3) return;

    const highlightClasses = [
      'ring-2',
      'ring-emerald-500',
      'bg-emerald-50/90',
      'dark:bg-emerald-950/80',
      'text-emerald-700',
      'dark:text-emerald-300',
      'font-bold',
      'shadow-md',
      'scale-[1.02]',
      'transition-all',
      'duration-300'
    ];

    // Timeline execution with exact 1s steps:
    // T = 0ms: Dropdown opens, 1s delay
    // T = 1000ms: Owner highlights (1s)
    // T = 2000ms: Owner unhighlights, 1s gap
    // T = 3000ms: Inventory Manager highlights (1s)
    // T = 4000ms: Inventory Manager unhighlights, 1s gap
    // T = 5000ms: Cashier highlights (1s)
    // T = 6000ms: All 3 pulse together for 3 seconds (6000ms -> 9000ms)
    // T = 9000ms: Completely clean up and finish

    // Step 1: Owner (at 1000ms)
    setTimeout(() => {
      items[0].classList.add(...highlightClasses);

      setTimeout(() => {
        items[0].classList.remove(...highlightClasses);
      }, 1000);
    }, 1000);

    // Step 2: Inventory Manager (at 3000ms)
    setTimeout(() => {
      items[1].classList.add(...highlightClasses);

      setTimeout(() => {
        items[1].classList.remove(...highlightClasses);
      }, 1000);
    }, 3000);

    // Step 3: Cashier (at 5000ms)
    setTimeout(() => {
      items[2].classList.add(...highlightClasses);

      setTimeout(() => {
        items[2].classList.remove(...highlightClasses);
      }, 1000);
    }, 5000);

    // Step 4: 3-Second Synchronized Pulse on all 3 Staff roles (at 6000ms)
    setTimeout(() => {
      items.forEach(item => {
        item.classList.add(
          'ring-2',
          'ring-emerald-500',
          'bg-emerald-50/80',
          'dark:bg-emerald-950/70',
          'text-emerald-700',
          'dark:text-emerald-300',
          'animate-pulse'
        );
      });

      // Step 5: Completely gone after 3 seconds
      setTimeout(() => {
        items.forEach(item => {
          item.classList.remove(
            'ring-2',
            'ring-emerald-500',
            'bg-emerald-50/80',
            'dark:bg-emerald-950/70',
            'text-emerald-700',
            'dark:text-emerald-300',
            'animate-pulse'
          );
        });

        if (toggleBtn) {
          toggleBtn.classList.remove('bg-emerald-50/90', 'dark:bg-emerald-950/60', 'text-emerald-600', 'dark:text-emerald-400');
        }
      }, 3000);
    }, 6000);
  });
}
// ==========================================
// END: highlightSidebarStaffsDropdown
// ==========================================

// ==========================================
// START: highlightElementBorder
// Glides from sidebar settings to target element and highlights border with emerald glow and 3-second pulse.
// ==========================================
export function highlightElementBorder(elementOrSelector, duration = 3000) {
  const el = typeof elementOrSelector === 'string'
    ? document.querySelector(elementOrSelector)
    : elementOrSelector;

  if (!el) return;

  const sidebarSettingsLink = document.querySelector('a[href*="/settings/"]') || document.getElementById('sidebar-container');

  // Launch jumping pathway cursor from sidebar settings to the target card
  createFloatingCursorPath(sidebarSettingsLink, el, () => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const highlightClasses = [
      'ring-4',
      'ring-emerald-500',
      'border-emerald-500',
      'shadow-2xl',
      'shadow-emerald-500/30',
      'animate-pulse',
      'transition-all',
      'duration-500'
    ];

    el.classList.add(...highlightClasses);

    setTimeout(() => {
      el.classList.remove(...highlightClasses);
    }, duration);
  });
}
// ==========================================
// END: highlightElementBorder
// ==========================================

// ==========================================
// START: initAdminCardAnimations
// Binds smooth dynamic hover scaling, subtle numeric zoom, and border highlight animations to admin telemetry cards.
// ==========================================
export function initAdminCardAnimations() {
  const cards = document.querySelectorAll('.admin-stat-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const watermark = card.querySelector('.admin-card-watermark');
      if (watermark) {
        watermark.style.transform = 'scale(1.15) rotate(-4deg)';
      }
      const countEl = card.querySelector('.stat-count-value');
      if (countEl) {
        countEl.style.transform = 'scale(1.04)';
      }
    });

    card.addEventListener('mouseleave', () => {
      const watermark = card.querySelector('.admin-card-watermark');
      if (watermark) {
        watermark.style.transform = 'scale(1) rotate(0deg)';
      }
      const countEl = card.querySelector('.stat-count-value');
      if (countEl) {
        countEl.style.transform = 'scale(1)';
      }
    });
  });
}
// ==========================================
// END: initAdminCardAnimations
// ==========================================


