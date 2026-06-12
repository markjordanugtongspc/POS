// ==========================================
// TOP: OFF-CANVAS CART DRAWER MODULE
// This module handles displaying and hiding the Cart Details
// drawer on smaller mobile and portrait screens.
// ==========================================

export function initDrawer() {
  const showBtn = document.querySelector('[data-drawer-show="cart-drawer"]');
  const hideBtn = document.querySelector('[data-drawer-hide="cart-drawer"]');
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');

  if (!drawer) return;

  const showDrawer = () => {
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    if (backdrop) {
      backdrop.classList.remove('hidden', 'opacity-0');
      backdrop.classList.add('block', 'opacity-100');
    }
  };

  const hideDrawer = () => {
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');
    if (backdrop) {
      backdrop.classList.remove('block', 'opacity-100');
      backdrop.classList.add('hidden', 'opacity-0');
    }
  };

  if (showBtn) {
    showBtn.addEventListener('click', showDrawer);
  }
  if (hideBtn) {
    hideBtn.addEventListener('click', hideDrawer);
  }
  if (backdrop) {
    backdrop.addEventListener('click', hideDrawer);
  }
}

// ==========================================
// END: OFF-CANVAS CART DRAWER MODULE
// ==========================================
