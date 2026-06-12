// ==========================================
// TOP: SIDEBAR ACTIVE STATE MODULE
// This module handles the global active state highlighting for the sidebar links.
// It checks the current URL path and applies primary color, bold text, and background
// to the matching sidebar link to indicate the active page.
// ==========================================

export function initSidebar() {
  const sidebarContainer = document.getElementById('top-bar-sidebar');
  if (!sidebarContainer) return;

  const sidebarLinks = sidebarContainer.querySelectorAll('ul li a');
  const currentPath = window.location.pathname;

  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Skip empty or placeholder links
    if (!href || href === '#') return;

    // Check if current path matches the link's href
    if (currentPath === href || currentPath.startsWith(href) && href !== '/') {
      // Add active classes for the rectangle background, bold text, and primary color
      link.classList.remove('text-neutral-600', 'dark:text-neutral-300');
      link.classList.add(
        'bg-emerald-50',
        'dark:bg-emerald-900/30',
        'text-emerald-700',
        'dark:text-emerald-400',
        'font-extrabold'
      );

      // Update the SVG icon color to match the primary active state
      const icon = link.querySelector('svg');
      if (icon) {
        icon.classList.remove('text-neutral-400', 'dark:text-neutral-500');
        icon.classList.add('text-emerald-600', 'dark:text-emerald-400');
      }
    }
  });
}

// ==========================================
// END: SIDEBAR ACTIVE STATE MODULE
// ==========================================
