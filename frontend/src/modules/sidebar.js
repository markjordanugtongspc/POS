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
      const isAdmin = window.location.pathname.includes('/pages/users/admin/');
      link.classList.remove('text-neutral-600', 'dark:text-neutral-300');
      
      if (isAdmin) {
        link.classList.add(
          'bg-rose-50',
          'dark:bg-rose-950/40',
          'text-rose-700',
          'dark:text-rose-300',
          'font-extrabold'
        );
        const icon = link.querySelector('svg');
        if (icon) {
          icon.classList.remove('text-neutral-400', 'dark:text-neutral-500');
          icon.classList.add('text-rose-600', 'dark:text-rose-400');
        }
      } else {
        link.classList.add(
          'bg-emerald-50',
          'dark:bg-emerald-900/30',
          'text-emerald-700',
          'dark:text-emerald-400',
          'font-extrabold'
        );
        const icon = link.querySelector('svg');
        if (icon) {
          icon.classList.remove('text-neutral-400', 'dark:text-neutral-500');
          icon.classList.add('text-emerald-600', 'dark:text-emerald-400');
        }
      }

      // If this link is inside a dropdown, automatically expand the parent dropdown and style the connector line active
      const parentDropdown = link.closest('ul');
      if (parentDropdown && parentDropdown.id.startsWith('dropdown-')) {
        parentDropdown.classList.remove('hidden');
        const parentBtn = document.querySelector(`[data-collapse-toggle="${parentDropdown.id}"]`);
        if (parentBtn) {
          const chevron = parentBtn.querySelector('svg:last-child');
          if (chevron) chevron.classList.add('rotate-180');
        }
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
// Binds click handlers to dropdown toggle buttons to show/hide their menus and flip chevron arrow.
// ==========================================
function initSidebarDropdowns() {
  const toggles = document.querySelectorAll('[data-collapse-toggle]');
  
  toggles.forEach(toggle => {
    const targetId = toggle.getAttribute('data-collapse-toggle');
    const targetMenu = document.getElementById(targetId);
    const chevron = toggle.querySelector('svg:last-child');
    
    if (!targetMenu) return;

    // Set initial arrow state if menu is already open
    if (!targetMenu.classList.contains('hidden') && chevron) {
      chevron.classList.add('rotate-180');
    }

    // Avoid duplicate event listener bindings
    if (toggle.dataset.bound === 'true') return;
    toggle.dataset.bound = 'true';

    // Handle toggle click to show/hide dropdown menu and flip arrow
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = targetMenu.classList.toggle('hidden');
      if (chevron) {
        if (isHidden) {
          chevron.classList.remove('rotate-180');
        } else {
          chevron.classList.add('rotate-180');
        }
      }
    });
  });
}
// ==========================================
// END: initSidebarDropdowns
// ==========================================

// ==========================================
// START: initSidebarDrawer
// Binds click handlers to toggle the mobile sidebar drawer from the right side of the screen, adjust tab protrusion, and manage backdrop blur.
// ==========================================
function initSidebarDrawer() {
  const toggleBtns = document.querySelectorAll('[data-drawer-toggle="top-bar-sidebar"]');
  const sidebar = document.getElementById('top-bar-sidebar');
  const backdrop = document.getElementById('sidebar-drawer-backdrop');
  if (!sidebar) return;

  const tabBtn = sidebar.querySelector('#sidebar-drawer-toggle-tab') || sidebar.querySelector('button[data-drawer-toggle="top-bar-sidebar"]');

  const updateBackdrop = (isOpen) => {
    if (!backdrop) return;
    if (isOpen && window.innerWidth < 640) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
    } else {
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
  };

  const updateTabPosition = (isOpen) => {
    if (!tabBtn) return;
    if (isOpen) {
      // 50/50 centered overlap when drawer is open
      tabBtn.classList.remove('-left-8', 'w-11', 'rounded-l-xl');
      tabBtn.classList.add('-left-5', 'w-10', 'rounded-full');
    } else {
      // 70% protruding handle tab when drawer is hiding offscreen
      tabBtn.classList.remove('-left-5', 'w-10', 'rounded-full');
      tabBtn.classList.add('-left-8', 'w-11', 'rounded-l-xl');
    }
    updateBackdrop(isOpen);
  };

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyClosed = sidebar.classList.contains('translate-x-full');
      sidebar.classList.toggle('translate-x-full');
      updateTabPosition(isCurrentlyClosed);
    });
  });

  // Close sidebar when clicking outside on mobile or on the blurred backdrop
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      if (!sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.add('translate-x-full');
        updateTabPosition(false);
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (!sidebar.classList.contains('translate-x-full') && 
        !sidebar.contains(e.target) && 
        !Array.from(toggleBtns).some(btn => btn.contains(e.target)) &&
        window.innerWidth < 640) { // sm breakpoint
      sidebar.classList.add('translate-x-full');
      updateTabPosition(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 640) {
      updateBackdrop(false);
    }
  });

  // Initialize correct state on page load
  updateTabPosition(!sidebar.classList.contains('translate-x-full'));

  // Handle User Profile Top Drawer
  initUserTopDrawer();
}

// ==========================================
// START: initUserTopDrawer
// Manages the desktop user dropdown menu (>= sm) and mobile top drawer (< sm)
// ==========================================
function initUserTopDrawer() {
  const toggleBtn = document.getElementById('user-drawer-toggle-btn');
  const desktopDropdown = document.getElementById('desktop-user-dropdown');
  const closeBtn = document.getElementById('user-drawer-close-btn');
  const drawer = document.getElementById('drawer-top-user');
  const backdrop = document.getElementById('user-drawer-backdrop');
  const sidebarTab = document.getElementById('sidebar-drawer-toggle-tab');

  if (!toggleBtn) return;

  let isTransitioning = false;

  const isDesktop = () => window.innerWidth >= 640;

  const toggleDesktopDropdown = () => {
    if (!desktopDropdown) return;
    desktopDropdown.classList.toggle('hidden');
  };

  const closeDesktopDropdown = () => {
    if (desktopDropdown && !desktopDropdown.classList.contains('hidden')) {
      desktopDropdown.classList.add('hidden');
    }
  };

  const openDrawer = () => {
    if (!drawer || isTransitioning) return;
    isTransitioning = true;

    // Temporarily hide the sidebar drawer toggle tab
    if (sidebarTab) {
      sidebarTab.classList.add('opacity-0', 'pointer-events-none', 'scale-75');
    }

    drawer.classList.remove('hidden');
    if (backdrop) backdrop.classList.remove('hidden');

    // Force browser reflow to trigger transition
    void drawer.offsetHeight;

    drawer.classList.remove('-translate-y-full');
    drawer.classList.add('translate-y-0');

    if (backdrop) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
    }

    setTimeout(() => {
      isTransitioning = false;
    }, 300);
  };

  const closeDrawer = () => {
    if (!drawer || isTransitioning) return;
    isTransitioning = true;

    // Restore the sidebar drawer toggle tab
    if (sidebarTab) {
      sidebarTab.classList.remove('opacity-0', 'pointer-events-none', 'scale-75');
    }

    drawer.classList.remove('translate-y-0');
    drawer.classList.add('-translate-y-full');

    if (backdrop) {
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }

    setTimeout(() => {
      if (drawer.classList.contains('-translate-y-full')) {
        drawer.classList.add('hidden');
      }
      if (backdrop && backdrop.classList.contains('opacity-0')) {
        backdrop.classList.add('hidden');
      }
      isTransitioning = false;
    }, 300);
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isDesktop()) {
      closeDrawer();
      toggleDesktopDropdown();
    } else {
      closeDesktopDropdown();
      const isOpen = drawer && drawer.classList.contains('translate-y-0') && !drawer.classList.contains('hidden');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  document.addEventListener('click', (e) => {
    if (desktopDropdown && !desktopDropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeDesktopDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDesktopDropdown();
      if (drawer && drawer.classList.contains('translate-y-0')) {
        closeDrawer();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (isDesktop()) {
      closeDrawer();
    } else {
      closeDesktopDropdown();
    }
  });
}
// ==========================================
// END: initSidebarDrawer & initUserTopDrawer
// ==========================================
