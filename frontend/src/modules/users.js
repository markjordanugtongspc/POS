import { initTheme, toggleTheme } from './theme-toggle.js';
import { initSidebar } from './sidebar.js';

export function initUsers() {
  const container = document.getElementById('users-content-container');
  if (!container) return; // We are not on the Users page

  // Initial load
  handleRoute();

  // Listen for hash changes (when user clicks sidebar links)
  window.addEventListener('hashchange', handleRoute);
}

async function handleRoute() {
  const container = document.getElementById('users-content-container');
  if (!container) return;

  // Determine component from hash, default to 'owner' if empty or invalid
  let component = window.location.hash.substring(1); // remove '#'
  const validComponents = ['owner', 'cashiers', 'inventorym'];
  
  if (!validComponents.includes(component)) {
    component = 'owner';
    // Update hash silently if it was empty/invalid
    history.replaceState(null, null, ' ' + window.location.pathname + '#owner');
  }

  // Clear container before fetch
  container.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  `;

  try {
    const response = await fetch(`/pages/components/users/${component}.html`);
    if (response.ok) {
      const html = await response.text();
      container.innerHTML = html;

      // Re-initialize flowbite tooltips/dropdowns in the newly injected content
      if (typeof window.initFlowbite === 'function') {
        window.initFlowbite();
      }

      // Re-bind theme toggles if any were in the new HTML (just in case)
      initTheme();

      // Update sidebar active states to reflect the new hash
      initSidebar();

      // Handle Skeleton Loading Toggle (Data Only)
      const skeletons = container.querySelectorAll('.skeleton-data');
      const actuals = container.querySelectorAll('.actual-data');
      if (skeletons.length > 0 && actuals.length > 0) {
        
        skeletons.forEach(el => {
          const color = el.dataset.color || 'bg-white/90';
          const size = el.dataset.size || 'w-2.5 h-2.5';
          const height = el.dataset.height || 'h-8';
          const extra = el.dataset.extra || 'mt-1';
          
          const dotsHTML = `
            <div class="flex space-x-1.5 items-center ${extra} ${height} loading-dots">
              <div class="${size} ${color} rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div class="${size} ${color} rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div class="${size} ${color} rounded-full animate-bounce"></div>
            </div>
          `;
          el.outerHTML = dotsHTML;
        });

        setTimeout(() => {
          const dots = container.querySelectorAll('.loading-dots');
          dots.forEach(el => el.remove());
          actuals.forEach(el => el.classList.remove('hidden'));
          
          // Re-trigger flowbite just in case there are dropdowns in the revealed content
          if (typeof window.initFlowbite === 'function') {
            window.initFlowbite();
          }
        }, 1200); // Simulate network delay
      }

    } else {
      throw new Error(`Component not found: ${component}`);
    }
  } catch (error) {
    console.error('Failed to load user component:', error);
    container.innerHTML = `
      <div class="text-center p-8">
        <h3 class="text-red-500 font-bold text-lg">Error loading component</h3>
        <p class="text-neutral-500 dark:text-neutral-400">${error.message}</p>
      </div>
    `;
  }
}
