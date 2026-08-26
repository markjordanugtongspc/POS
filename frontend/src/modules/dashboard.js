import { highlightSidebarStaffsDropdown, createFloatingCursorPath } from './animations.js';
import { setPendingAction } from './client-storage.js';

/* =========================================
   START COMMENT: DASHBOARD PAGINATION FUNCTION
   This function handles the switching between 
   Page 1 (Low Stock Alerts) and Page 2 (User Directory)
   on the main dashboard view.
   ========================================= */

export function initDashboardPagination() {
  const page1 = document.getElementById('dashboard-page-1');
  const page2 = document.getElementById('dashboard-page-2');
  
  const prevBtns = document.querySelectorAll('.dashboard-prev-btn');
  const nextBtns = document.querySelectorAll('.dashboard-next-btn');

  if (!page1 || !page2) return;

  // Initialize view state
  let currentPage = 1;

  function updateView() {
    if (currentPage === 1) {
      // Show Page 1, Hide Page 2
      page1.classList.remove('hidden');
      page2.classList.add('hidden');
      
      // Update Button States
      prevBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
      });
      nextBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
      });
    } else {
      // Hide Page 1, Show Page 2
      page1.classList.add('hidden');
      page2.classList.remove('hidden');
      
      // Update Button States
      prevBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
      });
      nextBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
      });
    }
  }

  // Bind click events
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateView();
      }
    });
  });

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentPage < 2) {
        currentPage++;
        updateView();
      }
    });
  });

  // Set initial view
  updateView();
}

/* =========================================
   END COMMENT: DASHBOARD PAGINATION FUNCTION
   ========================================= */

/* =========================================
   START COMMENT: DASHBOARD LIVE CLOCK FUNCTION
   ========================================= */
export function initLiveClock() {
  const clockCards = document.querySelectorAll('.live-clock-card');
  if (!clockCards.length) return;

  function updateClock() {
    // Format date and time for ASIA/MANILA GMT +08
    const options = {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    
    let month = '', day = '', year = '';
    let hour = '', minute = '', second = '', ampm = '';
    
    parts.forEach(part => {
      if (part.type === 'month') month = part.value;
      if (part.type === 'day') day = part.value;
      if (part.type === 'year') year = part.value;
      if (part.type === 'hour') hour = part.value;
      if (part.type === 'minute') minute = part.value;
      if (part.type === 'second') second = part.value;
      if (part.type === 'dayPeriod') ampm = part.value.toUpperCase();
    });

    const dateFormatted = `${month} ${day}, ${year}`;
    const timeFormatted = `${hour}:${minute}:${second}`;

    clockCards.forEach(card => {
      const timeEl = card.querySelector('.live-clock-time');
      const dateEl = card.querySelector('.live-clock-date');
      const ampmEl = card.querySelector('.live-clock-ampm');

      if (timeEl) {
        // If there's no ampm badge on this card (mobile), append ampm to time
        timeEl.textContent = ampmEl ? timeFormatted : `${timeFormatted} ${ampm}`;
      }
      if (dateEl) dateEl.textContent = dateFormatted;
      if (ampmEl) ampmEl.textContent = ampm;
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
}
import { animateElementNumber } from './animations.js';

/* =========================================
   START COMMENT: DASHBOARD TABLE SKELETON LOADER
   Handles realistic skeleton loading on Low Stock Alert table
   and triggers counting animation for quantities and prices upon reveal.
   ========================================= */
export function initDashboardTableSkeleton() {
  const skeletonBody = document.getElementById('low-stock-skeleton-body');
  const actualBody = document.getElementById('low-stock-actual-body');

  if (!skeletonBody || !actualBody) return;

  setTimeout(() => {
    skeletonBody.remove();
    actualBody.classList.remove('hidden');

    // Trigger counting animation on all data-counter spans within actual body
    const counters = actualBody.querySelectorAll('[data-counter]');
    counters.forEach(counter => {
      animateElementNumber(counter);
    });
  }, 1000); // 1-second simulated network load
}
/* =========================================
   START COMMENT: DASHBOARD QUICK ACTIONS CAROUSEL
   Provides smooth touch swipe gestures with real-time finger drag physics
   and fluid sliding transitions between action slides with synchronized indicators.
   ========================================= */
export function initQuickActionsCarousel() {
  const carouselEl = document.getElementById('quick-actions-carousel');
  const trackEl = document.getElementById('quick-actions-track');
  if (!carouselEl || !trackEl) return;

  const indicators = carouselEl.querySelectorAll('[data-carousel-slide-to]');
  const totalSlides = 2;
  let currentIndex = 0;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;
  const threshold = 45; // drag threshold in px to snap

  function updateIndicators(index) {
    indicators.forEach((indicator, i) => {
      const active = i === index;
      indicator.setAttribute('aria-current', active ? 'true' : 'false');
      if (active) {
        indicator.className = 'w-6 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300';
      } else {
        indicator.className = 'w-2 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 transition-all duration-300';
      }
    });
  }

  function setSlide(index, animated = true) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    currentIndex = index;

    if (animated) {
      trackEl.classList.add('transition-transform', 'duration-300', 'ease-out');
    } else {
      trackEl.classList.remove('transition-transform', 'duration-300', 'ease-out');
    }

    currentTranslate = -currentIndex * 50; // 50% translation for 2 slides
    prevTranslate = currentTranslate;
    trackEl.style.transform = `translateX(${currentTranslate}%)`;
    updateIndicators(currentIndex);
  }

  // Click on indicators
  indicators.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const slideTo = parseInt(btn.getAttribute('data-carousel-slide-to'), 10);
      if (!isNaN(slideTo)) {
        setSlide(slideTo, true);
      }
    });
  });

  // Touch Drag / Gesture events
  trackEl.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    trackEl.classList.remove('transition-transform', 'duration-300', 'ease-out');
  }, { passive: true });

  trackEl.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    const containerWidth = carouselEl.offsetWidth || 300;
    const diffPercent = (diffX / containerWidth) * 50;
    
    // Add resistance when pulling past limits
    let translate = prevTranslate + diffPercent;
    if (translate > 0) {
      translate = translate * 0.25; // rubber-band left limit
    } else if (translate < -50) {
      translate = -50 + (translate + 50) * 0.25; // rubber-band right limit
    }

    trackEl.style.transform = `translateX(${translate}%)`;
  }, { passive: true });

  trackEl.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;

    if (diffX > threshold && currentIndex < totalSlides - 1) {
      // Swiped left -> Next
      setSlide(currentIndex + 1, true);
    } else if (diffX < -threshold && currentIndex > 0) {
      // Swiped right -> Prev
      setSlide(currentIndex - 1, true);
    } else {
      // Snap back to current
      setSlide(currentIndex, true);
    }
  }, { passive: true });

  // Initialize first slide
  setSlide(0, false);

  // ==========================================
  // START: Quick Action Button Listeners
  // Handles quick shortcuts from the dashboard carousel
  // ==========================================
  const manageUsersBtn = document.getElementById('quick-action-manage-users');
  if (manageUsersBtn) {
    manageUsersBtn.addEventListener('click', (e) => {
      e.preventDefault();
      highlightSidebarStaffsDropdown();
    });
  }

  const addProductBtn = document.getElementById('quick-action-add-product');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      setPendingAction('add-product');
    });
  }

  const brandingBtn = document.getElementById('quick-action-branding');
  if (brandingBtn) {
    brandingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const sidebarSettings = document.querySelector('a[href*="/settings/"]') || document.getElementById('sidebar-container');
      createFloatingCursorPath(brandingBtn, sidebarSettings, () => {
        if (sidebarSettings) {
          sidebarSettings.classList.add('bg-emerald-50/90', 'dark:bg-emerald-950/60', 'text-emerald-600', 'dark:text-emerald-400');
        }
        setTimeout(() => {
          window.location.href = '/pages/users/client/settings/?highlight=branding';
        }, 300);
      });
    });
  }
  // ==========================================
  // END: Quick Action Button Listeners
  // ==========================================
}
/* =========================================
   END COMMENT: DASHBOARD QUICK ACTIONS CAROUSEL
   ========================================= */

