// ==========================================
// TOP: initSidebar
// Handles active state highlighting for sidebar links based on current URL path.
// ==========================================
export function initSidebar() {
  const sidebarContainer = document.getElementById('top-bar-sidebar');
  if (!sidebarContainer) return;

  const sidebarLinks = sidebarContainer.querySelectorAll('ul li a');
  const currentPath = window.location.pathname;
  const cleanPath = currentPath.replace('index.html', '').replace(/\/$/, '');
  const linkMatches = Array.from(sidebarLinks)
    .filter(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return false;

      const cleanHref = href.split('?')[0].split('#')[0].replace('index.html', '').replace(/\/$/, '');
      if (href.includes('#')) {
        const hrefHash = href.substring(href.indexOf('#'));
        const currentHash = window.location.hash || '#owner';
        return cleanPath === cleanHref && currentHash === hrefHash;
      }

      return cleanPath === cleanHref || (cleanPath.startsWith(`${cleanHref}/`) && cleanHref !== '');
    })
    .sort((a, b) => {
      const aHref = a.getAttribute('href').split('?')[0].split('#')[0].length;
      const bHref = b.getAttribute('href').split('?')[0].split('#')[0].length;
      return bHref - aHref;
    });
  const activeLink = linkMatches[0];

  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Skip empty or placeholder links
    if (!href || href === '#') return;

    const cleanHref = href.split('?')[0].split('#')[0].replace('index.html', '').replace(/\/$/, '');
    let isActive = link === activeLink;

    if (isActive) {
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

      // If this link is inside a dropdown, automatically expand the parent dropdown and style the connector line active
      const parentDropdown = link.closest('ul');
      if (parentDropdown && parentDropdown.id.startsWith('dropdown-')) {
        parentDropdown.classList.remove('hidden');
        link.classList.remove('before:bg-neutral-200', 'dark:before:bg-neutral-800');
        link.classList.add('before:bg-emerald-500', 'dark:before:bg-emerald-400');
      }
    } else if (href.includes('#') && cleanPath === cleanHref) {
      // For hash links that share the path but have a different hash, make sure they are NOT active
      link.classList.add('text-neutral-600', 'dark:text-neutral-300');
      link.classList.remove(
        'bg-emerald-50',
        'dark:bg-emerald-900/30',
        'text-emerald-700',
        'dark:text-emerald-400',
        'font-extrabold'
      );
      link.classList.add('before:bg-neutral-200', 'dark:before:bg-neutral-800');
      link.classList.remove('before:bg-emerald-500', 'dark:before:bg-emerald-400');
    }
  });

  // Call dropdown init to bind click events
  initSidebarDropdowns();
  initSidebarDrawer();
}
// ==========================================
// END: initSidebar
// ==========================================

// ==========================================
// TOP: initSidebarDropdowns
// Binds click handlers to dropdown toggle buttons to show/hide their menus.
// ==========================================
function initSidebarDropdowns() {
  const toggles = document.querySelectorAll('[data-collapse-toggle]');
  
  toggles.forEach(toggle => {
    const targetId = toggle.getAttribute('data-collapse-toggle');
    const targetMenu = document.getElementById(targetId);
    
    if (!targetMenu) return;

    // Handle toggle click to show/hide dropdown menu
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      targetMenu.classList.toggle('hidden');
    });
  });
}
// ==========================================
// END: initSidebarDropdowns
// ==========================================

// ==========================================
// TOP: initSidebarDrawer
// Binds click handlers to toggle the mobile drawer
// ==========================================
function initSidebarDrawer() {
  const toggleBtn = document.querySelector('[data-drawer-toggle="top-bar-sidebar"]');
  const sidebar = document.getElementById('top-bar-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('-translate-x-full');
    });

    // Optional: close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (!sidebar.classList.contains('-translate-x-full') && 
          !sidebar.contains(e.target) && 
          !toggleBtn.contains(e.target) &&
          window.innerWidth < 640) { // sm breakpoint
        sidebar.classList.add('-translate-x-full');
      }
    });
  }
}
// ==========================================
// END: initSidebarDrawer
// ==========================================
