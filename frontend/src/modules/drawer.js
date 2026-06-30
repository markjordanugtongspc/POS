// ==========================================
// TOP: OFF-CANVAS CART DRAWER MODULE
// This module handles displaying and hiding the Cart Details
// drawer on smaller mobile and portrait screens.
// ==========================================

export function initDrawer() {
  injectDrawerHTML();

  const showBtn = document.querySelector('[data-drawer-show="cart-drawer"]');
  const hideBtn = document.querySelector('[data-drawer-hide="cart-drawer"]');
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');

  if (!drawer) return;

  const showDrawer = () => {
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    if (backdrop) {
      backdrop.classList.remove('hidden');
      // Force reflow
      backdrop.offsetHeight;
      backdrop.classList.remove('opacity-0');
      backdrop.classList.add('opacity-100');
    }
  };

  const hideDrawer = () => {
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');
    if (backdrop) {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0');
      setTimeout(() => {
        backdrop.classList.add('hidden');
      }, 300);
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

function injectDrawerHTML() {
  if (document.getElementById('cart-drawer')) return; // Already injected

  const drawerHTML = `  <!-- Cart Drawer Component (Visible on mobile/portrait screen toggle) -->
  <div id="cart-drawer"
    class="fixed top-16 bottom-0 right-0 z-[45] p-6 overflow-y-auto transition-transform translate-x-full bg-white dark:bg-[#16171d] w-full max-w-md border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col"
    tabindex="-1">
    <!-- Header inside Drawer -->
    <div class="flex justify-between items-center pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
      <div class="flex items-center gap-2">
        <h5 class="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Cart Details</h5>
        <span class="text-xs font-bold text-neutral-400">IV#13256234</span>
      </div>
      <button type="button" data-drawer-hide="cart-drawer" aria-controls="cart-drawer"
        class="text-neutral-500 hover:text-neutral-850 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg w-8 h-8 flex items-center justify-center transition-colors focus:outline-none cursor-pointer">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
            d="M6 18 17.94 6M18 18 6.06 6" />
        </svg>
        <span class="sr-only">Close menu</span>
      </button>
    </div>

    <!-- Scrollable Items Area inside Drawer -->
    <div class="flex-1 overflow-y-auto space-y-4 pr-1 -mr-1 custom-scrollbar">

      <!-- Cart Item 1 (Rice) -->
      <div
        class="flex gap-3 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all shadow-sm">
        <div
          class="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-850 shrink-0 border border-neutral-200/50 dark:border-neutral-800">
          <img src="https://placehold.co/100x100/transparent/9ca3af.png?text=Rice" alt="Rice"
            class="w-full h-full object-cover">
        </div>
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <!-- Name & Delete -->
          <div class="flex justify-between items-start gap-2">
            <h4 class="font-extrabold text-neutral-800 dark:text-neutral-100 text-sm truncate">Rice</h4>
            <div class="relative group inline-flex items-center justify-center">
              <button type="button"
                class="cursor-pointer text-red-500 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-transform shrink-0 p-0.5 focus:outline-none"
                aria-label="Delete item">
                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                </svg>
              </button>
              <!-- Tooltip -->
              <div class="absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                <span class="relative z-10 px-2.5 py-1.5 text-[10px] font-extrabold text-white bg-red-500 rounded-lg shadow-md whitespace-nowrap">Delete Item</span>
                <div class="w-2 h-2 -ml-1 rotate-45 bg-red-500"></div>
              </div>
            </div>
          </div>
          <!-- Category & Stock -->
          <div class="flex justify-between items-center text-xs">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30">Grocery</span>
            <span class="text-[11px] font-bold text-neutral-400 dark:text-neutral-500">150 Kg in Stock</span>
          </div>
          <!-- Quantity & Price -->
          <div class="flex justify-between items-center">
            <!-- Flowbite Quantity Changer -->
            <div
              class="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 shadow-sm">
              <div class="relative group inline-flex items-center justify-center">
                <button type="button"
                  class="w-6 h-6 rounded flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300 active:scale-90 transition-transform cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 18 2" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                      d="M1 1h16" />
                  </svg>
                </button>
                <!-- Tooltip for minus -->
                <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                  <span class="relative z-10 px-2 py-1 text-[9px] font-extrabold text-white bg-red-500 rounded shadow-md whitespace-nowrap">Remove</span>
                  <div class="w-2 h-2 -mt-1 rotate-45 bg-red-500"></div>
                </div>
              </div>
              <span class="w-6 text-center text-xs font-black text-neutral-800 dark:text-white">1</span>
              <div class="relative group inline-flex items-center justify-center">
                <button type="button"
                  class="w-6 h-6 rounded flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 active:scale-90 transition-transform cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                      d="M9 1v16M1 9h16" />
                  </svg>
                </button>
                <!-- Tooltip for plus -->
                <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                  <span class="relative z-10 px-2 py-1 text-[9px] font-extrabold text-white bg-emerald-500 rounded shadow-md whitespace-nowrap">Add</span>
                  <div class="w-2 h-2 -mt-1 rotate-45 bg-emerald-500"></div>
                </div>
              </div>
            </div>
            <!-- Price in Peso -->
            <span class="font-extrabold text-neutral-900 dark:text-white text-sm">₱40.00</span>
          </div>
        </div>
      </div>

      <!-- Cart Item 2 (Surf Cherry Blossom) -->
      <div
        class="flex gap-3 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all shadow-sm">
        <div
          class="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-850 shrink-0 border border-neutral-200/50 dark:border-neutral-800">
          <img src="https://placehold.co/100x100/transparent/9ca3af.png?text=Surf" alt="Surf Powder"
            class="w-full h-full object-cover">
        </div>
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <!-- Name & Delete -->
          <div class="flex justify-between items-start gap-2">
            <h4 class="font-extrabold text-neutral-800 dark:text-neutral-100 text-sm truncate">Surf Cherry Blossom</h4>
            <div class="relative group inline-flex items-center justify-center">
              <button type="button"
                class="cursor-pointer text-red-500 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-transform shrink-0 p-0.5 focus:outline-none"
                aria-label="Delete item">
                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                </svg>
              </button>
              <!-- Tooltip -->
              <div class="absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                <span class="relative z-10 px-2.5 py-1.5 text-[10px] font-extrabold text-white bg-red-500 rounded-lg shadow-md whitespace-nowrap">Delete Item</span>
                <div class="w-2 h-2 -ml-1 rotate-45 bg-red-500"></div>
              </div>
            </div>
          </div>
          <!-- Category & Stock -->
          <div class="flex justify-between items-center text-xs">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30">Household</span>
            <span class="text-[11px] font-bold text-neutral-400 dark:text-neutral-500">150 Pc in Stock</span>
          </div>
          <!-- Quantity & Price -->
          <div class="flex justify-between items-center">
            <!-- Flowbite Quantity Changer -->
            <div
              class="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 shadow-sm">
              <div class="relative group inline-flex items-center justify-center">
                <button type="button"
                  class="w-6 h-6 rounded flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300 active:scale-90 transition-transform cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 18 2" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                      d="M1 1h16" />
                  </svg>
                </button>
                <!-- Tooltip for minus -->
                <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                  <span class="relative z-10 px-2 py-1 text-[9px] font-extrabold text-white bg-red-500 rounded shadow-md whitespace-nowrap">Remove</span>
                  <div class="w-2 h-2 -mt-1 rotate-45 bg-red-500"></div>
                </div>
              </div>
              <span class="w-6 text-center text-xs font-black text-neutral-800 dark:text-white">1</span>
              <div class="relative group inline-flex items-center justify-center">
                <button type="button"
                  class="w-6 h-6 rounded flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 active:scale-90 transition-transform cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                      d="M9 1v16M1 9h16" />
                  </svg>
                </button>
                <!-- Tooltip for plus -->
                <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                  <span class="relative z-10 px-2 py-1 text-[9px] font-extrabold text-white bg-emerald-500 rounded shadow-md whitespace-nowrap">Add</span>
                  <div class="w-2 h-2 -mt-1 rotate-45 bg-emerald-500"></div>
                </div>
              </div>
            </div>
            <!-- Price in Peso -->
            <span class="font-extrabold text-neutral-900 dark:text-white text-sm">₱15.00</span>
          </div>
        </div>
      </div>

      <!-- Cart Item 3 (Lucky Me Canton) -->
      <div class="flex gap-3 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all shadow-sm">
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-850 shrink-0 border border-neutral-200/50 dark:border-neutral-800">
          <img src="https://placehold.co/100x100/transparent/9ca3af.png?text=Pancit" alt="Pancit Canton" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <!-- Name & Delete -->
          <div class="flex justify-between items-start gap-2">
            <h4 class="font-extrabold text-neutral-800 dark:text-neutral-100 text-sm truncate">Lucky Me Canton</h4>
            <div class="relative group inline-flex items-center justify-center">
              <button type="button" class="cursor-pointer text-red-500 hover:text-red-650 dark:hover:text-red-400 active:scale-95 transition-transform shrink-0 p-0.5 focus:outline-none" aria-label="Delete item">
                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                </svg>
              </button>
              <!-- Tooltip -->
              <div class="absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                <span class="relative z-10 px-2.5 py-1.5 text-[10px] font-extrabold text-white bg-red-500 rounded-lg shadow-md whitespace-nowrap">Delete Item</span>
                <div class="w-2 h-2 -ml-1 rotate-45 bg-red-500"></div>
              </div>
            </div>
          </div>
          <!-- Category & Stock -->
          <div class="flex justify-between items-center text-xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30">Noodles</span>
            <span class="text-[11px] font-bold text-neutral-400 dark:text-neutral-500">50 Pc in Stock</span>
          </div>
          <!-- Quantity & Price -->
          <div class="flex justify-between items-center">
            <!-- Flowbite Quantity Changer -->
            <div class="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 shadow-sm">
              <div class="relative group inline-flex items-center justify-center">
                <button type="button" class="w-6 h-6 rounded flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300 active:scale-90 transition-transform cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 18 2" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M1 1h16" />
                  </svg>
                </button>
                <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                  <span class="relative z-10 px-2 py-1 text-[9px] font-extrabold text-white bg-red-500 rounded shadow-md whitespace-nowrap">Remove</span>
                  <div class="w-2 h-2 -mt-1 rotate-45 bg-red-500"></div>
                </div>
              </div>
              <span class="w-6 text-center text-xs font-black text-neutral-800 dark:text-white">1</span>
              <div class="relative group inline-flex items-center justify-center">
                <button type="button" class="w-6 h-6 rounded flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 active:scale-90 transition-transform cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 1v16M1 9h16" />
                  </svg>
                </button>
                <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                  <span class="relative z-10 px-2 py-1 text-[9px] font-extrabold text-white bg-emerald-500 rounded shadow-md whitespace-nowrap">Add</span>
                  <div class="w-2 h-2 -mt-1 rotate-45 bg-emerald-500"></div>
                </div>
              </div>
            </div>
            <!-- Price in Peso -->
            <span class="font-extrabold text-neutral-900 dark:text-white text-sm">₱18.00</span>
          </div>
        </div>
      </div>

      <!-- Cart Item 4 (Milo 24g) -->
      <div
        class="flex gap-3 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all shadow-sm">
        <div
          class="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-850 shrink-0 border border-neutral-200/50 dark:border-neutral-800">
          <img src="https://placehold.co/100x100/transparent/9ca3af.png?text=Milo" alt="Milo 24g"
            class="w-full h-full object-cover">
        </div>
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <!-- Name & Delete -->
          <div class="flex justify-between items-start gap-2">
            <h4 class="font-extrabold text-neutral-800 dark:text-neutral-100 text-sm truncate">Milo 24g</h4>
            <div class="relative group inline-flex items-center justify-center">
              <button type="button"
                class="cursor-pointer text-red-500 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-transform shrink-0 p-0.5 focus:outline-none"
                aria-label="Delete item">
                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                </svg>
              </button>
              <!-- Tooltip -->
              <div class="absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                <span class="relative z-10 px-2.5 py-1.5 text-[10px] font-extrabold text-white bg-red-500 rounded-lg shadow-md whitespace-nowrap">Delete Item</span>
                <div class="w-2 h-2 -ml-1 rotate-45 bg-red-500"></div>
              </div>
            </div>
          </div>
          <!-- Category & Stock -->
          <div class="flex justify-between items-center text-xs">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">Beverage</span>
            <span class="text-[11px] font-bold text-neutral-400 dark:text-neutral-500">20 Pc in Stock</span>
          </div>
          <!-- Quantity & Price -->
          <div class="flex justify-between items-center">
            <!-- Flowbite Quantity Changer -->
            <div
              class="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 shadow-sm">
              <div class="relative group inline-flex items-center justify-center">
                <button type="button"
                  class="w-6 h-6 rounded flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300 active:scale-90 transition-transform cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 18 2" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                      d="M1 1h16" />
                  </svg>
                </button>
                <!-- Tooltip for minus -->
                <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                  <span class="relative z-10 px-2 py-1 text-[9px] font-extrabold text-white bg-red-500 rounded shadow-md whitespace-nowrap">Remove</span>
                  <div class="w-2 h-2 -mt-1 rotate-45 bg-red-500"></div>
                </div>
              </div>
              <span class="w-6 text-center text-xs font-black text-neutral-800 dark:text-white">2</span>
              <div class="relative group inline-flex items-center justify-center">
                <button type="button"
                  class="w-6 h-6 rounded flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 active:scale-90 transition-transform cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                      d="M9 1v16M1 9h16" />
                  </svg>
                </button>
                <!-- Tooltip for plus -->
                <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                  <span class="relative z-10 px-2 py-1 text-[9px] font-extrabold text-white bg-emerald-500 rounded shadow-md whitespace-nowrap">Add</span>
                  <div class="w-2 h-2 -mt-1 rotate-45 bg-emerald-500"></div>
                </div>
              </div>
            </div>
            <!-- Price in Peso -->
            <span class="font-extrabold text-neutral-900 dark:text-white text-sm">₱24.00</span>
          </div>
        </div>
      </div>

    </div> <!-- End Cart Items List in Drawer -->

    <!-- Checkout Summary Area inside Drawer -->
    <div class="mt-6 pt-6 border-t border-neutral-150 dark:border-neutral-800 space-y-3">
      <div class="flex justify-between items-center text-sm">
        <span class="font-extrabold text-neutral-600 dark:text-neutral-400 font-sans">SubTotal</span>
        <span class="font-extrabold text-neutral-850 dark:text-neutral-200">₱97.00</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="font-extrabold text-neutral-600 dark:text-neutral-400 font-sans">VAT(10%)</span>
        <span class="font-extrabold text-neutral-850 dark:text-neutral-200">₱9.70</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="font-extrabold text-neutral-600 dark:text-neutral-400 font-sans">Discount (10%)</span>
        <span class="font-extrabold text-red-500 dark:text-red-400">-₱9.70</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="font-extrabold text-neutral-600 dark:text-neutral-400 font-sans">Auto Round</span>
        <span class="font-extrabold text-neutral-850 dark:text-neutral-200">₱0.00</span>
      </div>

      <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex justify-between items-center">
        <span class="text-base font-extrabold text-neutral-900 dark:text-white font-sans">Total Payable</span>
        <span class="text-lg font-black text-neutral-900 dark:text-white">₱97.00</span>
      </div>

      <!-- Payment Options Wrapper (Drawer) -->
      <div class="pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
        <div class="flex justify-between items-center gap-1">
          <!-- Cash Radio Option -->
          <label class="flex items-center gap-2 cursor-pointer group">
            <input type="radio" name="payment_method_drawer" id="pay-cash-drawer" checked
              onclick="document.getElementById('ecash-providers-drawer').classList.add('hidden')" class="peer hidden" />
            <div
              class="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-700 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center transition-all shrink-0">
              <div class="w-1.5 h-1.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span
              class="text-sm font-extrabold text-neutral-500 dark:text-neutral-400 peer-checked:text-neutral-900 dark:peer-checked:text-white transition-colors group-hover:text-neutral-700 dark:group-hover:text-neutral-300 font-sans">Cash</span>
          </label>

          <!-- Card Radio Option -->
          <label class="flex items-center gap-2 cursor-pointer group">
            <input type="radio" name="payment_method_drawer" id="pay-card-drawer"
              onclick="document.getElementById('ecash-providers-drawer').classList.add('hidden')" class="peer hidden" />
            <div
              class="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-700 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center transition-all shrink-0">
              <div class="w-1.5 h-1.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span
              class="text-sm font-extrabold text-neutral-500 dark:text-neutral-400 peer-checked:text-neutral-900 dark:peer-checked:text-white transition-colors group-hover:text-neutral-700 dark:group-hover:text-neutral-300 font-sans">Card</span>
          </label>

          <!-- E-Cash Radio Option -->
          <label class="flex items-center gap-2 cursor-pointer group">
            <input type="radio" name="payment_method_drawer" id="pay-ecash-drawer"
              onclick="document.getElementById('ecash-providers-drawer').classList.remove('hidden')"
              class="peer hidden" />
            <div
              class="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-700 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center transition-all shrink-0">
              <div class="w-1.5 h-1.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span
              class="text-sm font-extrabold text-neutral-500 dark:text-neutral-400 peer-checked:text-neutral-900 dark:peer-checked:text-white transition-colors group-hover:text-neutral-700 dark:group-hover:text-neutral-300 font-sans">E-Cash</span>
          </label>
        </div>

        <!-- E-Cash Provider Selection List in Drawer -->
        <div id="ecash-providers-drawer"
          class="hidden mt-3 grid grid-cols-2 gap-2 animate-fade-in p-1 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <button type="button"
            class="w-full py-2 text-xs font-extrabold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#16171d] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-900/50 rounded-lg transition-all flex items-center justify-center gap-2 focus:outline-none shadow-sm cursor-pointer">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            QR PH
          </button>
          <button type="button"
            class="w-full py-2 text-xs font-extrabold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#16171d] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-900/50 rounded-lg transition-all flex items-center justify-center gap-2 focus:outline-none shadow-sm cursor-pointer">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            GCash
          </button>
          <button type="button"
            class="w-full py-2 text-xs font-extrabold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#16171d] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-900/50 rounded-lg transition-all flex items-center justify-center gap-2 focus:outline-none shadow-sm cursor-pointer">
            <span class="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            GoTyme
          </button>
          <button type="button"
            class="w-full py-2 text-xs font-extrabold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#16171d] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-900/50 rounded-lg transition-all flex items-center justify-center gap-2 focus:outline-none shadow-sm cursor-pointer">
            <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            Maya
          </button>
        </div>
      </div>
    </div>

    <!-- Checkout Button inside Drawer -->
    <div class="mt-6">
      <button
        class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold text-lg rounded-2xl shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex justify-center items-center gap-2 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 font-sans">
        Continue
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
            d="M19 12H5m14 0-4 4m4-4-4-4" />
        </svg>
      </button>
    </div>
  </div>
`;
  
  // Create a temporary container to parse the HTML string
  const template = document.createElement('template');
  template.innerHTML = drawerHTML;
  
  // We should insert it just before the drawer backdrop
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (backdrop && backdrop.parentNode) {
    backdrop.parentNode.insertBefore(template.content, backdrop);
  } else {
    document.body.appendChild(template.content);
  }
}

// ==========================================
// END: OFF-CANVAS CART DRAWER MODULE
// ==========================================
