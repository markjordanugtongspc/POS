import './style.css';
import 'flowbite';
import 'sweetalert2/dist/sweetalert2.min.css';
import { initTheme, toggleTheme } from './modules/theme-toggle.js';
import { initSidebar } from './modules/sidebar.js';
import { initDrawer } from './modules/drawer.js';
import { initDashboardPagination, initLiveClock } from './modules/dashboard.js';
import { initTransactions } from './modules/transactions.js';
import { initProductsPage } from './modules/products.js';
import { initInbox } from './modules/inbox.js';
import { initTicket } from './modules/ticket.js';
import './modules/auth.js';

// Dynamic Sidebar HTML Injection
async function injectSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  try {
    const response = await fetch('/pages/components/sidebar.html');
    if (response.ok) {
      const html = await response.text();
      container.innerHTML = html;

      // Re-initialize Flowbite for newly injected elements
      if (typeof window.initFlowbite === 'function') {
        window.initFlowbite();
      }

      // Re-bind theme toggle listeners inside the injected container
      const themeToggleBtns = container.querySelectorAll('#theme-toggle');
      themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
      });

      initTheme();
      initSidebar(); // Initialize sidebar active states
    }
  } catch (error) {
    console.error('Failed to inject sidebar component:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  injectSidebar();
  
  // Only inject cart drawer if the page uses it (e.g. POS page)
  if (document.querySelector('[data-drawer-target="cart-drawer"]')) {
    initDrawer();
  }
  
  initDashboardPagination();
  initLiveClock();
  initTransactions();
  initProductsPage();
  initInbox();
  initTicket();
});
