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
// END: initNumberCounters
// ==========================================
