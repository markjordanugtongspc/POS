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
  const clockText = document.getElementById('live-clock-text');
  if (!clockText) return;

  function updateClock() {
    // Format date and time for ASIA/MANILA GMT +08
    const options = {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    
    // Construct the string e.g. "Jun 11, 2026 10:30:05 AM"
    let dateStr = '';
    let timeStr = '';
    let ampmStr = '';
    
    parts.forEach(part => {
      if (part.type === 'month') dateStr += part.value;
      if (part.type === 'day') dateStr += ' ' + part.value;
      if (part.type === 'literal' && part.value === ', ') dateStr += ', ';
      if (part.type === 'year') dateStr += part.value;
      
      if (part.type === 'hour') timeStr += part.value;
      if (part.type === 'literal' && part.value === ':') timeStr += ':';
      if (part.type === 'minute') timeStr += part.value;
      if (part.type === 'second') timeStr += ':' + part.value;
      if (part.type === 'dayPeriod') ampmStr = part.value;
    });

    clockText.textContent = `${dateStr} ${timeStr} ${ampmStr}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}
/* =========================================
   END COMMENT: DASHBOARD LIVE CLOCK FUNCTION
   ========================================= */
