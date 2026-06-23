// products.js - Products page management module
import { showSuccess, showError, confirmDeleteProduct, showAddProductModal, showEditProductModal } from './modals.js';
import Swal from 'sweetalert2';

// --- START initProductsPage ---
export function initProductsPage() {
  const tableBody = document.getElementById('products-table-body');
  if (!tableBody) return; // Exit if not on the products page

  // Sample Products Data
  let products = [
    { sku: "SKU001", name: "Milo 24g", category: "Beverage", brand: "Nestle", price: 12.00, qty: 5, createdBy: "Mark Jordan" },
    { sku: "SKU002", name: "Lucky Me Canton", category: "Noodles", brand: "Lucky Me", price: 18.00, qty: 0, createdBy: "Mark Jordan" },
    { sku: "SKU003", name: "Nescafe Classic Pack", category: "Beverage", brand: "Nescafe", price: 14.00, qty: 15, createdBy: "Mark Jordan" },
    { sku: "SKU004", name: "Surf Cherry Blossom", category: "Household", brand: "Unilever", price: 15.00, qty: 2, createdBy: "Mark Jordan" },
    { sku: "SKU005", name: "Premium Rice 1kg", category: "Grocery", brand: "Harvester", price: 40.00, qty: 150, createdBy: "Mark Jordan" },
    { sku: "SKU006", name: "Coca-Cola 1.5L", category: "Beverage", brand: "Coca-Cola", price: 65.00, qty: 48, createdBy: "Mark Jordan" },
    { sku: "SKU007", name: "Pringles Sour Cream 110g", category: "Snacks", brand: "Pringles", price: 85.00, qty: 25, createdBy: "Mark Jordan" },
    { sku: "SKU008", name: "SafeGuard White 130g", category: "Household", brand: "Procter & Gamble", price: 42.00, qty: 60, createdBy: "Admin" },
    { sku: "SKU009", name: "Colgate Great Flavor 150g", category: "Household", brand: "Colgate", price: 95.00, qty: 30, createdBy: "Admin" },
    { sku: "SKU010", name: "Knorr Liquid Seasoning 250ml", category: "Grocery", brand: "Unilever", price: 72.00, qty: 40, createdBy: "Mark Jordan" },
    { sku: "SKU011", name: "Kopiko Brown 3-in-1", category: "Beverage", brand: "Kopiko", price: 10.00, qty: 200, createdBy: "Admin" },
    { sku: "SKU012", name: "SkyFlakes Crackers", category: "Snacks", brand: "M.Y. San", price: 7.00, qty: 120, createdBy: "Mark Jordan" },
    { sku: "SKU013", name: "Selecta Ice Cream 1.3L", category: "Snacks", brand: "Selecta", price: 250.00, qty: 12, createdBy: "Mark Jordan" },
    { sku: "SKU014", name: "Century Tuna Hot & Spicy", category: "Grocery", brand: "Century Pacific", price: 38.00, qty: 85, createdBy: "Mark Jordan" },
    { sku: "SKU015", name: "San Miguel Pale Pilsen", category: "Beverage", brand: "San Miguel", price: 55.00, qty: 72, createdBy: "Admin" },
    { sku: "SKU016", name: "Ariel Sunrise Fresh 70g", category: "Household", brand: "Procter & Gamble", price: 16.00, qty: 90, createdBy: "Admin" },
    { sku: "SKU017", name: "Nissin Cup Noodles Seafood", category: "Noodles", brand: "Nissin", price: 22.00, qty: 110, createdBy: "Mark Jordan" },
    { sku: "SKU018", name: "Argentina Corned Beef 150g", category: "Grocery", brand: "Century Pacific", price: 40.00, qty: 95, createdBy: "Admin" },
    { sku: "SKU019", name: "Sunlight Liquid Soap 500ml", category: "Household", brand: "Unilever", price: 68.00, qty: 35, createdBy: "Mark Jordan" },
    { sku: "SKU020", name: "Hunts Tomato Sauce 250g", category: "Grocery", brand: "Hunts", price: 28.00, qty: 55, createdBy: "Admin" },
    { sku: "SKU021", name: "Pepsi Max 500ml", category: "Beverage", brand: "Pepsi", price: 25.00, qty: 65, createdBy: "Mark Jordan" },
    { sku: "SKU022", name: "Fita Crackers 10s", category: "Snacks", brand: "M.Y. San", price: 55.00, qty: 40, createdBy: "Admin" },
    { sku: "SKU023", name: "Joy Dishwashing Liquid 250ml", category: "Household", brand: "Procter & Gamble", price: 58.00, qty: 50, createdBy: "Mark Jordan" },
    { sku: "SKU024", name: "Silver Swan Soy Sauce 1L", category: "Grocery", brand: "NutriAsia", price: 45.00, qty: 30, createdBy: "Admin" },
    { sku: "SKU025", name: "UFC Banana Ketchup 320g", category: "Grocery", brand: "NutriAsia", price: 26.00, qty: 80, createdBy: "Mark Jordan" },
    { sku: "SKU026", name: "Datu Puti Vinegar 200ml", category: "Grocery", brand: "NutriAsia", price: 18.00, qty: 100, createdBy: "Mark Jordan" },
    { sku: "SKU027", name: "Datu Puti Soy Sauce 200ml", category: "Grocery", brand: "NutriAsia", price: 18.00, qty: 120, createdBy: "Mark Jordan" },
    { sku: "SKU028", name: "Bear Brand Powdered Milk 150g", category: "Beverage", brand: "Nestle", price: 55.00, qty: 45, createdBy: "Admin" },
    { sku: "SKU029", name: "Tang Orange Juice Powder", category: "Beverage", brand: "Mondelez", price: 20.00, qty: 150, createdBy: "Admin" },
    { sku: "SKU030", name: "Nido Fortified 370g", category: "Beverage", brand: "Nestle", price: 180.00, qty: 25, createdBy: "Mark Jordan" },
    { sku: "SKU031", name: "Oishi Prawn Crackers 60g", category: "Snacks", brand: "Oishi", price: 16.00, qty: 60, createdBy: "Mark Jordan" },
    { sku: "SKU032", name: "Piattos Cheese 85g", category: "Snacks", brand: "Jack 'n Jill", price: 34.00, qty: 80, createdBy: "Admin" },
    { sku: "SKU033", name: "Nova Country Cheddar 78g", category: "Snacks", brand: "Jack 'n Jill", price: 34.00, qty: 70, createdBy: "Mark Jordan" },
    { sku: "SKU034", name: "Chippy Barbecue 110g", category: "Snacks", brand: "Jack 'n Jill", price: 32.00, qty: 90, createdBy: "Admin" },
    { sku: "SKU035", name: "Fudgee Barr Chocolate 10s", category: "Snacks", brand: "Rebisco", price: 75.00, qty: 30, createdBy: "Mark Jordan" },
    { sku: "SKU036", name: "Rebisco Crackers 10s", category: "Snacks", brand: "Rebisco", price: 55.00, qty: 40, createdBy: "Admin" },
    { sku: "SKU037", name: "Hansel Mocha Sandwich 10s", category: "Snacks", brand: "Rebisco", price: 60.00, qty: 50, createdBy: "Mark Jordan" },
    { sku: "SKU038", name: "Sunsilk Pink Shampoo 180ml", category: "Household", brand: "Unilever", price: 120.00, qty: 25, createdBy: "Mark Jordan" },
    { sku: "SKU039", name: "Creamsilk Green Conditioner 180ml", category: "Household", brand: "Unilever", price: 125.00, qty: 20, createdBy: "Admin" },
    { sku: "SKU040", name: "Downy Sunrise Fresh 38ml", category: "Household", brand: "Procter & Gamble", price: 12.00, qty: 200, createdBy: "Admin" },
    { sku: "SKU041", name: "Breeze Detergent Powder 70g", category: "Household", brand: "Unilever", price: 18.00, qty: 150, createdBy: "Mark Jordan" },
    { sku: "SKU042", name: "Tide Bar 125g", category: "Household", brand: "Procter & Gamble", price: 15.00, qty: 180, createdBy: "Admin" },
    { sku: "SKU043", name: "Zonrox Bleach Regular 250ml", category: "Household", brand: "Green Cross", price: 22.00, qty: 60, createdBy: "Mark Jordan" },
    { sku: "SKU044", name: "Green Cross Alcohol 250ml", category: "Household", brand: "Green Cross", price: 50.00, qty: 80, createdBy: "Admin" },
    { sku: "SKU045", name: "Safeguard Pink 130g", category: "Household", brand: "Procter & Gamble", price: 42.00, qty: 55, createdBy: "Mark Jordan" },
    { sku: "SKU046", name: "Pancit Canton Sweet & Spicy", category: "Noodles", brand: "Lucky Me", price: 18.00, qty: 140, createdBy: "Admin" },
    { sku: "SKU047", name: "Pancit Canton Chilimansi", category: "Noodles", brand: "Lucky Me", price: 18.00, qty: 160, createdBy: "Mark Jordan" },
    { sku: "SKU048", name: "Lucky Me Beef Mami", category: "Noodles", brand: "Lucky Me", price: 15.00, qty: 220, createdBy: "Mark Jordan" },
    { sku: "SKU049", name: "Lucky Me Chicken Mami", category: "Noodles", brand: "Lucky Me", price: 15.00, qty: 190, createdBy: "Admin" },
    { sku: "SKU050", name: "Payless Pancit Canton Extra Hot", category: "Noodles", brand: "Universal Robina", price: 16.00, qty: 100, createdBy: "Mark Jordan" },
    { sku: "SKU051", name: "San Miguel Pale Pilsen 320ml", category: "Beverage", brand: "San Miguel", price: 48.00, qty: 96, createdBy: "Admin" },
    { sku: "SKU052", name: "Red Horse Extra Strong 500ml", category: "Beverage", brand: "San Miguel", price: 75.00, qty: 120, createdBy: "Mark Jordan" },
    { sku: "SKU053", name: "Gatorade Blue Bolt 500ml", category: "Beverage", brand: "PepsiCo", price: 38.00, qty: 64, createdBy: "Admin" },
    { sku: "SKU054", name: "C2 Green Tea Apple 500ml", category: "Beverage", brand: "Universal Robina", price: 20.00, qty: 150, createdBy: "Mark Jordan" },
    { sku: "SKU055", name: "Absolute Distilled Water 1L", category: "Beverage", brand: "Asia Brewery", price: 25.00, qty: 80, createdBy: "Admin" },
    { sku: "SKU056", name: "Fitbar Chocolate 22g", category: "Snacks", brand: "Kalbe", price: 24.00, qty: 110, createdBy: "Mark Jordan" },
    { sku: "SKU057", name: "Argentina Meat Loaf 150g", category: "Grocery", brand: "Century Pacific", price: 32.00, qty: 90, createdBy: "Admin" },
    { sku: "SKU058", name: "555 Sardines in Tomato Sauce", category: "Grocery", brand: "Century Pacific", price: 22.00, qty: 120, createdBy: "Mark Jordan" },
    { sku: "SKU059", name: "Spam Regular 340g", category: "Grocery", brand: "Hormel", price: 220.00, qty: 30, createdBy: "Admin" },
    { sku: "SKU060", name: "Libby's Vienna Sausage 130g", category: "Grocery", brand: "Libby's", price: 48.00, qty: 75, createdBy: "Mark Jordan" }
  ];

  // Selected row tracking
  let selectedSkus = new Set();

  // State Management
  let searchQuery = '';
  let selectedCategory = 'All';
  let selectedBrand = 'All';
  let categorySearchVal = '';
  let brandSearchVal = '';
  let sortField = 'sku';
  let sortDirection = 'asc'; // 'asc' or 'desc'
  let currentPage = 1;
  let entriesPerPage = 10;

  // DOM Elements
  const searchInput = document.getElementById('search-products');
  const categoryButtonsContainer = document.getElementById('category-buttons-container');
  const brandButtonsContainer = document.getElementById('brand-buttons-container');
  const entriesSelect = document.getElementById('entries-per-page');
  const checkAllCheckbox = document.getElementById('check-all-products');
  const paginationList = document.getElementById('products-pagination');
  const paginationStatus = document.getElementById('pagination-status');

  // Load Filters
  function populateFilters() {
    const allCategories = ['All', ...new Set(products.map(p => p.category))];
    const allBrands = ['All', ...new Set(products.map(p => p.brand))];

    // Filter categories and brands lists by their respective search terms
    const categories = allCategories.filter(cat => 
      cat.toLowerCase().includes(categorySearchVal.toLowerCase())
    );
    const brands = allBrands.filter(b => 
      b.toLowerCase().includes(brandSearchVal.toLowerCase())
    ).slice(0, 6);

    if (categoryButtonsContainer) {
      categoryButtonsContainer.innerHTML = categories.map(cat => {
        const isActive = cat === selectedCategory;
        const activeClass = isActive
          ? 'cursor-pointer px-3.5 py-1.5 text-xs font-extrabold text-yellow-600 dark:text-yellow-400 bg-yellow-100/60 dark:bg-yellow-900/30 border border-yellow-500 dark:border-yellow-500 transition flex items-center gap-1.5 rounded-none shadow-xs'
          : 'cursor-pointer px-3.5 py-1.5 text-xs font-bold text-yellow-700 dark:text-yellow-350 bg-yellow-50/15 hover:bg-yellow-50/30 dark:bg-neutral-800/20 dark:hover:bg-neutral-800/40 border border-yellow-200/40 dark:border-neutral-700/60 transition flex items-center gap-1.5 rounded-none';
        const checkmark = isActive
          ? `<svg class="w-3 h-3 text-yellow-500 dark:text-yellow-400 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`
          : '';
        return `
          <button type="button" class="filter-cat-btn ${activeClass}" data-value="${cat}">
            ${checkmark}
            <span>${cat}</span>
          </button>
        `;
      }).join('');

      document.querySelectorAll('.filter-cat-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          selectedCategory = el.dataset.value;
          currentPage = 1;
          populateFilters();
          renderTableWithSkeleton(500);
        });
      });
    }

    if (brandButtonsContainer) {
      brandButtonsContainer.innerHTML = brands.map(b => {
        const isActive = b === selectedBrand;
        const activeClass = isActive
          ? 'cursor-pointer px-3.5 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/30 border border-blue-500 dark:border-blue-500 transition flex items-center gap-1.5 rounded-none shadow-xs'
          : 'cursor-pointer px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-350 bg-blue-50/15 hover:bg-blue-50/30 dark:bg-neutral-800/20 dark:hover:bg-neutral-800/40 border border-blue-200/40 dark:border-neutral-700/60 transition flex items-center gap-1.5 rounded-none';
        const checkmark = isActive
          ? `<svg class="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`
          : '';
        return `
          <button type="button" class="filter-brand-btn ${activeClass}" data-value="${b}">
            ${checkmark}
            <span>${b}</span>
          </button>
        `;
      }).join('');

      document.querySelectorAll('.filter-brand-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          selectedBrand = el.dataset.value;
          currentPage = 1;
          populateFilters();
          renderTableWithSkeleton(500);
        });
      });
    }
  }

  // Generate Skeleton rows
  function renderSkeleton(rowsCount = 5) {
    tableBody.innerHTML = Array.from({ length: rowsCount }).map(() => `
      <tr class="animate-pulse bg-white dark:bg-[#1f2029] border-b border-neutral-100 dark:border-neutral-800/60">
        <td class="p-4"><div class="h-4 w-4 bg-neutral-200 dark:bg-neutral-800 rounded-sm"></div></td>
        <td class="px-6 py-4"><div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-16"></div></td>
        <td class="px-6 py-4"><div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-32"></div></td>
        <td class="px-6 py-4"><div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-20"></div></td>
        <td class="px-6 py-4"><div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-20"></div></td>
        <td class="px-6 py-4"><div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-16"></div></td>
        <td class="px-6 py-4"><div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-12"></div></td>
        <td class="px-6 py-4"><div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-24"></div></td>
        <td class="px-6 py-4 flex justify-center gap-3"><div class="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div></td>
      </tr>
    `).join('');
  }

  // Render active rows
  function renderTableRows() {
    // 1. Filter
    let filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
      return matchSearch && matchCat && matchBrand;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // 3. Paginate
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / entriesPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    // Update Pagination Status Label
    if (paginationStatus) {
      if (totalItems === 0) {
        paginationStatus.textContent = 'Showing 0-0 of 0 entries';
      } else {
        paginationStatus.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalItems} entries`;
      }
    }

    // Render Rows or No Results Found
    if (paginatedItems.length === 0) {
      tableBody.innerHTML = `
        <tr class="bg-white dark:bg-[#1f2029]">
          <td colspan="9" class="px-6 py-12 text-center text-sm font-semibold text-neutral-500">
            No products found matching your criteria.
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = paginatedItems.map((p, idx) => {
        const isChecked = selectedSkus.has(p.sku);
        const bgClass = idx % 2 === 1 ? 'bg-neutral-50/50 dark:bg-neutral-900/10' : 'bg-white dark:bg-[#1f2029]';
        return `
          <tr class="${bgClass} hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors border-b border-neutral-100 dark:border-neutral-800/60">
            <td class="p-4 w-12">
              <div class="flex items-center">
                <input type="checkbox" class="product-row-checkbox cursor-pointer w-4 h-4 border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-emerald-500 text-emerald-600" data-sku="${p.sku}" ${isChecked ? 'checked' : ''}>
              </div>
            </td>
            <td class="px-6 py-4 font-bold text-neutral-900 dark:text-white">${p.sku}</td>
            <td class="px-6 py-4 font-semibold text-neutral-800 dark:text-neutral-200 hover:text-emerald-500 bg-neutral-50/80 dark:bg-neutral-800/30 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                  <img src="https://placehold.co/100x100/transparent/9ca3af.png?text=${encodeURIComponent(p.name.split(' ')[0])}" alt="${p.name}" class="w-full h-full object-cover">
                </div>
                <span class="truncate max-w-[150px]">${p.name}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400">${p.category}</span>
            </td>
            <td class="px-6 py-4 font-medium hover:text-emerald-500 bg-neutral-50/80 dark:bg-neutral-800/30 transition-colors">${p.brand}</td>
            <td class="px-6 py-4 font-bold text-neutral-950 dark:text-white">₱${p.price.toFixed(2)}</td>
            <td class="px-6 py-4 font-bold ${p.qty === 0 ? 'text-red-500' : 'text-neutral-900 dark:text-white'}">${p.qty}</td>
            <td class="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50/80 dark:bg-neutral-800/30">${p.createdBy}</td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-3">
                
                <!-- View Detail Action -->
                <div class="relative group inline-flex items-center justify-center">
                  <button type="button" class="btn-view-product cursor-pointer text-emerald-600 hover:text-emerald-700 active:scale-90 transition-transform p-1 focus:outline-none" data-sku="${p.sku}">
                    <svg class="w-4.5 h-4.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-width="2.5" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
                      <path stroke="currentColor" stroke-width="2.5" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                  </button>
                  <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                    <span class="relative z-10 px-2 py-1.5 text-[9px] font-extrabold text-white bg-emerald-500 rounded shadow-md whitespace-nowrap">View Product</span>
                    <div class="w-2 h-2 -mt-1 rotate-45 bg-emerald-500"></div>
                  </div>
                </div>

                <!-- Edit Action -->
                <div class="relative group inline-flex items-center justify-center">
                  <button type="button" class="btn-edit-product cursor-pointer text-amber-500 hover:text-amber-600 active:scale-90 transition-transform p-1 focus:outline-none" data-sku="${p.sku}">
                    <svg class="w-4.5 h-4.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 1 1 2.853 2.853L13 18H10v-3L18.409 3.59Z"/>
                    </svg>
                  </button>
                  <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                    <span class="relative z-10 px-2 py-1.5 text-[9px] font-extrabold text-white bg-amber-500 rounded shadow-md whitespace-nowrap">Edit Product</span>
                    <div class="w-2 h-2 -mt-1 rotate-45 bg-amber-500"></div>
                  </div>
                </div>

                <!-- Delete Action -->
                <div class="relative group inline-flex items-center justify-center">
                  <button type="button" class="btn-delete-product cursor-pointer text-red-500 hover:text-red-600 active:scale-90 transition-transform p-1 focus:outline-none" data-sku="${p.sku}">
                    <svg class="w-4.5 h-4.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                    </svg>
                  </button>
                  <div class="absolute bottom-full mb-2 flex flex-col items-center opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99]">
                    <span class="relative z-10 px-2 py-1.5 text-[9px] font-extrabold text-white bg-red-500 rounded shadow-md whitespace-nowrap">Delete Product</span>
                    <div class="w-2 h-2 -mt-1 rotate-45 bg-red-500"></div>
                  </div>
                </div>

              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Bind row checkbox events
      document.querySelectorAll('.product-row-checkbox').forEach(el => {
        el.addEventListener('change', () => {
          const sku = el.dataset.sku;
          if (el.checked) {
            selectedSkus.add(sku);
          } else {
            selectedSkus.delete(sku);
          }
          updateHeaderCheckboxState(paginatedItems);
        });
      });

      // Bind action events
      document.querySelectorAll('.btn-view-product').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const p = products.find(prod => prod.sku === el.dataset.sku);
          if (p) {
            window.location.hash = p.sku.toLowerCase();
          }
        });
      });

      document.querySelectorAll('.btn-edit-product').forEach(el => {
        el.addEventListener('click', () => {
          const p = products.find(prod => prod.sku === el.dataset.sku);
          if (p) {
            showEditProductModal(p, (updated) => {
              const idx = products.findIndex(prod => prod.sku === p.sku);
              if (idx !== -1) {
                products[idx] = updated;
                showSuccess('Success', `Product ${updated.name} updated successfully!`);
                renderTableWithSkeleton(400);
              }
            });
          }
        });
      });

      document.querySelectorAll('.btn-delete-product').forEach(el => {
        el.addEventListener('click', () => {
          const p = products.find(prod => prod.sku === el.dataset.sku);
          if (p) {
            confirmDeleteProduct(p.name, () => {
              products = products.filter(prod => prod.sku !== p.sku);
              selectedSkus.delete(p.sku);
              showSuccess('Deleted', `Product ${p.name} deleted successfully!`);
              renderTableWithSkeleton(400);
            });
          }
        });
      });

      updateHeaderCheckboxState(paginatedItems);
    }

    renderPagination(totalPages);
  }

  // Render pagination navigation
  function renderPagination(totalPages) {
    if (!paginationList) return;

    let lis = [];

    // Previous Page Button
    lis.push(`
      <li>
        <a href="#" class="btn-page-prev flex items-center justify-center text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-s-xl w-9 h-9 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}" data-page="${currentPage - 1}">
          <svg class="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
          </svg>
        </a>
      </li>
    `);

    // Numbers & Jumper Input
    const jumpInputHTML = `
      <li class="flex items-center px-1">
        <input type="text" id="pagination-jump-input" class="cursor-pointer w-9 h-9 text-center bg-orange-50/30 dark:bg-orange-950/15 border border-orange-300 dark:border-orange-900/60 rounded-none text-xs text-orange-600 dark:text-orange-400 font-extrabold focus:ring-orange-500 focus:border-orange-500 placeholder-orange-500 dark:placeholder-orange-400 transition-colors" title="Jump to Page (Type page number & Enter)" placeholder="..." pattern="[0-9]*" inputmode="numeric">
      </li>
    `;

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        lis.push(renderPageNumber(i));
      }
    } else {
      if (currentPage <= 3) {
        // Show 1, 2, 3 ... totalPages
        for (let i = 1; i <= 3; i++) {
          lis.push(renderPageNumber(i));
        }
        lis.push(jumpInputHTML);
        lis.push(renderPageNumber(totalPages));
      } else {
        // Show ... currentPage-clamped to totalPages
        lis.push(jumpInputHTML);
        const start = Math.min(currentPage, totalPages - 2);
        for (let i = start; i <= totalPages; i++) {
          lis.push(renderPageNumber(i));
        }
      }
    }

    // Next Page Button
    lis.push(`
      <li>
        <a href="#" class="btn-page-next flex items-center justify-center text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-e-xl w-9 h-9 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}" data-page="${currentPage + 1}">
          <svg class="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
          </svg>
        </a>
      </li>
    `);

    paginationList.innerHTML = lis.join('');

    // Bind page change events
    document.querySelectorAll('.page-link-num').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = parseInt(el.dataset.page);
        renderTableWithSkeleton(300);
      });
    });

    document.querySelectorAll('.btn-page-prev, .btn-page-next').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(el.dataset.page);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          renderTableWithSkeleton(300);
        }
      });
    });

    // Inline input change
    const jumpInput = document.getElementById('pagination-jump-input');
    if (jumpInput) {
      const handleJump = () => {
        const val = parseInt(jumpInput.value);
        if (val && val >= 1 && val <= totalPages && val !== currentPage) {
          currentPage = val;
          renderTableWithSkeleton(300);
        }
      };
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleJump();
        }
      });
      jumpInput.addEventListener('change', handleJump);
    }
  }

  function renderPageNumber(page) {
    const isActive = page === currentPage;
    const activeClass = isActive
      ? 'z-10 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
      : 'text-neutral-500 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-white';
    return `
      <li>
        <a href="#" class="page-link-num flex items-center justify-center border font-medium text-sm w-9 h-9 focus:outline-none transition-colors cursor-pointer ${activeClass}" data-page="${page}">${page}</a>
      </li>
    `;
  }

  function updateHeaderCheckboxState(pageItems) {
    if (!checkAllCheckbox) return;

    if (pageItems.length === 0) {
      checkAllCheckbox.checked = false;
      return;
    }

    const allCheckedOnPage = pageItems.every(p => selectedSkus.has(p.sku));
    checkAllCheckbox.checked = allCheckedOnPage;
  }

  // Helper function to animate skeleton pulse state before loading actual contents
  function renderTableWithSkeleton(durationMs = 600) {
    renderSkeleton(entriesPerPage);
    setTimeout(() => {
      renderTableRows();
    }, durationMs);
  }

  // Bind all event listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderTableWithSkeleton(300);
    });
  }

  if (entriesSelect) {
    entriesSelect.addEventListener('change', (e) => {
      entriesPerPage = parseInt(e.target.value);
      currentPage = 1;
      renderTableWithSkeleton(400);
    });
  }

  if (checkAllCheckbox) {
    checkAllCheckbox.addEventListener('change', () => {
      let filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
        const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
        return matchSearch && matchCat && matchBrand;
      });

      const startIndex = (currentPage - 1) * entriesPerPage;
      const endIndex = Math.min(startIndex + entriesPerPage, filtered.length);
      const paginatedItems = filtered.slice(startIndex, endIndex);

      if (checkAllCheckbox.checked) {
        paginatedItems.forEach(p => selectedSkus.add(p.sku));
      } else {
        paginatedItems.forEach(p => selectedSkus.delete(p.sku));
      }

      renderTableRows();
    });
  }
  // Inline Detail / List View Toggles
  function showProductDetailInline(p) {
    try {
      const listSection = document.getElementById('product-list-view');
      const detailSection = document.getElementById('product-details-container');
      const headerTitle = document.getElementById('product-header-title');
      const headerDesc = document.getElementById('product-header-desc');
      const breadcrumbNav = document.getElementById('product-breadcrumb-nav');
      const headerActions = document.getElementById('product-header-actions');

      if (!listSection || !detailSection) return;

      // Populate data
      const imgEl = document.getElementById('detail-product-image');
      if (imgEl) imgEl.src = `https://placehold.co/400x400/transparent/9ca3af.png?text=${encodeURIComponent(p.name.split(' ')[0])}`;
      
      const nameTitleEl = document.getElementById('detail-product-name-title');
      if (nameTitleEl) nameTitleEl.textContent = p.name;
      
      const skuSubEl = document.getElementById('detail-product-sku-subtitle');
      if (skuSubEl) skuSubEl.textContent = p.sku;

      const tblNameEl = document.getElementById('detail-tbl-name');
      if (tblNameEl) tblNameEl.textContent = p.name;
      
      const tblCatEl = document.getElementById('detail-tbl-category');
      if (tblCatEl) tblCatEl.textContent = p.category;
      
      const tblBrandEl = document.getElementById('detail-tbl-brand');
      if (tblBrandEl) tblBrandEl.textContent = p.brand;
      
      const tblSkuEl = document.getElementById('detail-tbl-sku');
      if (tblSkuEl) tblSkuEl.textContent = p.sku;
      
      const tblQtyEl = document.getElementById('detail-tbl-qty');
      if (tblQtyEl) {
        tblQtyEl.textContent = p.qty;
        tblQtyEl.className = `px-6 py-3 font-bold ${p.qty === 0 ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`;
      }
      
      const tblPriceEl = document.getElementById('detail-tbl-price');
      if (tblPriceEl) tblPriceEl.textContent = `₱${p.price.toFixed(2)}`;
      
      const tblStatusEl = document.getElementById('detail-tbl-status');
      if (tblStatusEl) tblStatusEl.textContent = p.qty > 0 ? 'Active' : 'Out of Stock';
      
      const tblDescEl = document.getElementById('detail-tbl-desc');
      if (tblDescEl) tblDescEl.textContent = `Designed for professionals, it offers smooth multitasking and high-end graphics capability.`;

      // Set file metadata details (user requirements: filename and size)
      const filenameEl = document.getElementById('detail-product-filename');
      if (filenameEl) {
        filenameEl.textContent = `${p.name.toLowerCase().replace(/\s+/g, '')}.jpg`;
      }
      const filesizeEl = document.getElementById('detail-product-filesize');
      if (filesizeEl) {
        const sizeKb = Math.abs(p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 800) + 100;
        filesizeEl.textContent = `${sizeKb}kb`;
      }

      // Swap headers
      if (headerTitle) headerTitle.textContent = "Product Details";
      if (headerDesc) headerDesc.textContent = "Full details of a product";
      if (breadcrumbNav) breadcrumbNav.classList.remove('hidden');
      if (headerActions) headerActions.classList.add('hidden');

      // Toggle sections
      listSection.classList.add('hidden');
      detailSection.classList.remove('hidden');
    } catch (err) {
      console.error("Error in showProductDetailInline:", err);
    }
  }

  function showProductListInline() {
    const listSection = document.getElementById('product-list-view');
    const detailSection = document.getElementById('product-details-container');
    const headerTitle = document.getElementById('product-header-title');
    const headerDesc = document.getElementById('product-header-desc');
    const breadcrumbNav = document.getElementById('product-breadcrumb-nav');
    const headerActions = document.getElementById('product-header-actions');

    if (!listSection || !detailSection) return;

    // Reset headers
    if (headerTitle) headerTitle.textContent = "Product List";
    if (headerDesc) headerDesc.textContent = "Manage your products";
    if (breadcrumbNav) breadcrumbNav.classList.add('hidden');
    if (headerActions) headerActions.classList.remove('hidden');

    // Toggle sections
    detailSection.classList.add('hidden');
    listSection.classList.remove('hidden');
  }

  // Bind breadcrumbs events
  const breadcrumbProductsLink = document.getElementById('breadcrumb-products-link');
  if (breadcrumbProductsLink) {
    breadcrumbProductsLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '';
    });
  }

  // Product details navigation next/prev arrows
  const btnDetailPrev = document.getElementById('btn-detail-prev');
  const btnDetailNext = document.getElementById('btn-detail-next');

  function getActiveProductIndex() {
    const hash = window.location.hash.substring(1).toLowerCase().trim();
    if (!hash) return -1;
    return products.findIndex(p => p.sku.toLowerCase() === hash);
  }

  if (btnDetailPrev) {
    btnDetailPrev.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = getActiveProductIndex();
      if (idx !== -1) {
        const prevIdx = (idx - 1 + products.length) % products.length;
        const prevProd = products[prevIdx];
        window.location.hash = prevProd.sku.toLowerCase();
      }
    });
  }

  if (btnDetailNext) {
    btnDetailNext.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = getActiveProductIndex();
      if (idx !== -1) {
        const nextIdx = (idx + 1) % products.length;
        const nextProd = products[nextIdx];
        window.location.hash = nextProd.sku.toLowerCase();
      }
    });
  }

  const breadcrumbHomeLink = document.getElementById('breadcrumb-home-link');
  if (breadcrumbHomeLink) {
    breadcrumbHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '../../pages/dashboard/index.html';
    });
  }

  // Sorting header actions
  document.querySelectorAll('thead th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortDirection = 'asc';
      }
      renderTableWithSkeleton(400);
    });
  });

  // Top Action Buttons
  const btnAddProduct = document.getElementById('btn-add-product');
  if (btnAddProduct) {
    btnAddProduct.addEventListener('click', () => {
      showAddProductModal((newProduct) => {
        // Validate uniqueness of SKU
        const exists = products.some(p => p.sku.toLowerCase() === newProduct.sku.toLowerCase());
        if (exists) {
          showError('Duplicate SKU', `A product with SKU "${newProduct.sku}" already exists!`);
        } else {
          products.unshift(newProduct);
          showSuccess('Success', `Product ${newProduct.name} added successfully!`);
          renderTableWithSkeleton(500);
        }
      });
    });
  }

  const btnExportProducts = document.getElementById('btn-export-products');
  if (btnExportProducts) {
    btnExportProducts.addEventListener('click', () => {
      showSuccess('Success', 'Products database exported to CSV successfully!');
    });
  }

  // --- START bindFilterEvents ---
  function bindFilterEvents() {
    const triggerContainer = document.getElementById('filter-trigger-buttons');
    const catTrigger = document.getElementById('btn-filter-category-trigger');
    const brandTrigger = document.getElementById('btn-filter-brand-trigger');

    const catChoices = document.getElementById('category-inline-choices');
    const brandChoices = document.getElementById('brand-inline-choices');

    const catBack = document.getElementById('btn-category-back');
    const brandBack = document.getElementById('btn-brand-back');

    const catSearchToggle = document.getElementById('btn-category-search-toggle');
    const brandSearchToggle = document.getElementById('btn-brand-search-toggle');

    const catSearchInput = document.getElementById('category-search-input');
    const brandSearchInput = document.getElementById('brand-search-input');

    const catClear = document.getElementById('btn-category-clear');
    const brandClear = document.getElementById('btn-brand-clear');

    if (catTrigger && triggerContainer && catChoices) {
      catTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerContainer.classList.add('hidden');
        catChoices.classList.remove('hidden');
        requestAnimationFrame(() => {
          catChoices.classList.remove('opacity-0', '-translate-x-4');
          catChoices.classList.add('opacity-100', 'translate-x-0');
        });
      });
    }

    if (brandTrigger && triggerContainer && brandChoices) {
      brandTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerContainer.classList.add('hidden');
        brandChoices.classList.remove('hidden');
        requestAnimationFrame(() => {
          brandChoices.classList.remove('opacity-0', '-translate-x-4');
          brandChoices.classList.add('opacity-100', 'translate-x-0');
        });
      });
    }

    if (catBack && triggerContainer && catChoices) {
      catBack.addEventListener('click', (e) => {
        e.stopPropagation();
        catChoices.classList.add('opacity-0', '-translate-x-4');
        catChoices.classList.remove('opacity-100', 'translate-x-0');
        setTimeout(() => {
          catChoices.classList.add('hidden');
          triggerContainer.classList.remove('hidden');
        }, 300);
      });
    }

    if (brandBack && triggerContainer && brandChoices) {
      brandBack.addEventListener('click', (e) => {
        e.stopPropagation();
        brandChoices.classList.add('opacity-0', '-translate-x-4');
        brandChoices.classList.remove('opacity-100', 'translate-x-0');
        setTimeout(() => {
          brandChoices.classList.add('hidden');
          triggerContainer.classList.remove('hidden');
        }, 300);
      });
    }

    if (catSearchToggle && catSearchInput) {
      catSearchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        catSearchInput.classList.toggle('hidden');
        if (!catSearchInput.classList.contains('hidden')) {
          catSearchInput.focus();
        }
      });
    }

    if (brandSearchToggle && brandSearchInput) {
      brandSearchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        brandSearchInput.classList.toggle('hidden');
        if (!brandSearchInput.classList.contains('hidden')) {
          brandSearchInput.focus();
        }
      });
    }

    if (catSearchInput) {
      catSearchInput.addEventListener('input', (e) => {
        categorySearchVal = e.target.value.toLowerCase().trim();
        populateFilters();
      });
    }

    if (brandSearchInput) {
      brandSearchInput.addEventListener('input', (e) => {
        brandSearchVal = e.target.value.toLowerCase().trim();
        populateFilters();
      });
    }

    if (catClear) {
      catClear.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCategory = 'All';
        categorySearchVal = '';
        if (catSearchInput) {
          catSearchInput.value = '';
          catSearchInput.classList.add('hidden');
        }
        currentPage = 1;
        populateFilters();
        renderTableWithSkeleton(400);
      });
    }

    if (brandClear) {
      brandClear.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedBrand = 'All';
        brandSearchVal = '';
        if (brandSearchInput) {
          brandSearchInput.value = '';
          brandSearchInput.classList.add('hidden');
        }
        currentPage = 1;
        populateFilters();
        renderTableWithSkeleton(400);
      });
    }
    // Drag to scroll for brand buttons container
    let isDown = false;
    let startX;
    let scrollLeft;

    if (brandButtonsContainer) {
      brandButtonsContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        brandButtonsContainer.classList.replace('cursor-grab', 'cursor-grabbing');
        startX = e.pageX - brandButtonsContainer.offsetLeft;
        scrollLeft = brandButtonsContainer.scrollLeft;
      });
      brandButtonsContainer.addEventListener('mouseleave', () => {
        isDown = false;
        brandButtonsContainer.classList.replace('cursor-grabbing', 'cursor-grab');
      });
      brandButtonsContainer.addEventListener('mouseup', () => {
        isDown = false;
        brandButtonsContainer.classList.replace('cursor-grabbing', 'cursor-grab');
      });
      brandButtonsContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - brandButtonsContainer.offsetLeft;
        const walk = (x - startX) * 2;
        brandButtonsContainer.scrollLeft = scrollLeft - walk;
      });
    }
  }
  // --- END bindFilterEvents ---

  // Hash Routing Logic
  function handleRouting() {
    const hash = window.location.hash.substring(1).toLowerCase().trim();
    if (hash) {
      const p = products.find(prod => prod.sku.toLowerCase() === hash);
      if (p) {
        showProductDetailInline(p);
        return;
      }
    }
    showProductListInline();
    renderTableWithSkeleton(300);
  }

  window.addEventListener('hashchange', handleRouting);

  // Initial load
  bindFilterEvents();
  populateFilters();
  handleRouting();
}
// --- END initProductsPage ---
