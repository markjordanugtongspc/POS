// ==========================================
// payroll.js - Staff Payroll Frontend Module
// ==========================================
import { fetchPayrollRecords, createPayrollRecord, markPayrollPaid, deletePayrollRecord } from '../../../backend/api/payroll.api.js';
import { fetchStaffsByRole } from '../../../backend/api/staffs.api.js';
import { getActiveBranchId } from '../../../backend/api/branches.api.js';
import { openDrawer, closeDrawer, bindDrawerTriggers } from './drawer.js';
import { showSuccess, showError } from './modals.js';
import { animateNumber } from './animations.js';
import Swal from 'sweetalert2';

// --- START initPayroll ---
export async function initPayroll() {
  const tableBody = document.getElementById('payroll-table-body');
  if (!tableBody) return; // Exit if not on the payroll page

  let payrollRecords = [];
  let staffs = [];
  let searchQuery = '';

  const storeId = parseInt(localStorage.getItem('store_id') || '1', 10);
  let branchId = getActiveBranchId();

  window.addEventListener('branch:changed', (e) => {
    branchId = e.detail?.branchId !== undefined ? e.detail.branchId : getActiveBranchId();
    loadData();
  });

  // Bind Drawer triggers
  bindDrawerTriggers('payroll-drawer');

  // Set default pay periods
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 5); // Saturday

  const startInput = document.getElementById('payroll-period-start');
  const endInput = document.getElementById('payroll-period-end');
  if (startInput) startInput.value = startOfWeek.toISOString().split('T')[0];
  if (endInput) endInput.value = endOfWeek.toISOString().split('T')[0];

  // Dynamic Net Pay Calculator in Drawer Form
  function recalculateNetPay() {
    const salaryType = document.getElementById('payroll-salary-type')?.value || 'daily';
    const baseRate = parseFloat(document.getElementById('payroll-base-rate')?.value) || 0;
    const days = parseFloat(document.getElementById('payroll-days-worked')?.value) || 1;
    const bonuses = parseFloat(document.getElementById('payroll-bonuses')?.value) || 0;
    const deductions = parseFloat(document.getElementById('payroll-deductions')?.value) || 0;

    let gross = baseRate;
    if (salaryType === 'daily' || salaryType === 'hourly') {
      gross = baseRate * days;
    }
    const net = Math.max(0, gross + bonuses - deductions);

    const netDisplay = document.getElementById('payroll-calculated-netpay');
    if (netDisplay) netDisplay.textContent = `₱${net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  ['payroll-salary-type', 'payroll-base-rate', 'payroll-days-worked', 'payroll-bonuses', 'payroll-deductions'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', recalculateNetPay);
    document.getElementById(id)?.addEventListener('change', recalculateNetPay);
  });

  // Load Staffs and Records
  async function loadData() {
    const [recordsRes, staffsRes] = await Promise.all([
      fetchPayrollRecords(storeId, branchId),
      fetchStaffsByRole(null, storeId)
    ]);

    if (recordsRes.success && recordsRes.data && recordsRes.data.length > 0) {
      payrollRecords = recordsRes.data;
    } else {
      // Sample mock records
      payrollRecords = [
        {
          id: 1,
          staff_name: 'Mark Jordan',
          role: 'owner',
          salary_type: 'monthly',
          base_rate: 15000.00,
          days_worked: 1.00,
          bonuses: 2000.00,
          deductions: 0.00,
          net_pay: 17000.00,
          status: 'paid',
          pay_period_start: startOfWeek.toISOString().split('T')[0],
          pay_period_end: endOfWeek.toISOString().split('T')[0],
          paid_at: new Date().toISOString()
        },
        {
          id: 2,
          staff_name: 'Elena Ramos',
          role: 'cashier',
          salary_type: 'daily',
          base_rate: 550.00,
          days_worked: 6.00,
          bonuses: 300.00,
          deductions: 100.00,
          net_pay: 3500.00,
          status: 'pending',
          pay_period_start: startOfWeek.toISOString().split('T')[0],
          pay_period_end: endOfWeek.toISOString().split('T')[0]
        }
      ];
    }

    if (staffsRes.success && staffsRes.data) {
      staffs = staffsRes.data;
    } else {
      staffs = [
        { id: 1, full_name: 'Mark Jordan', username: 'mark.jordan', role: 'owner' },
        { id: 2, full_name: 'Elena Ramos', username: 'elena.cashier', role: 'cashier' },
        { id: 3, full_name: 'Reynaldo Cruz', username: 'reynaldo.inv', role: 'inventory_manager' }
      ];
    }

    populateStaffDropdown();
    renderPayroll();
  }

  function populateStaffDropdown() {
    const select = document.getElementById('payroll-staff-select');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>-- Choose staff --</option>';
    staffs.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.full_name || s.username} (${s.role.toUpperCase()})`;
      opt.dataset.role = s.role;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      const selected = select.options[select.selectedIndex];
      const role = selected?.dataset?.role;
      const rateInput = document.getElementById('payroll-base-rate');
      if (rateInput && (!rateInput.value || rateInput.value === '0')) {
        if (role === 'owner') rateInput.value = '15000.00';
        else if (role === 'inventory_manager') rateInput.value = '600.00';
        else rateInput.value = '500.00';
        recalculateNetPay();
      }
    });
  }

  function renderPayroll() {
    // 1. Calculate KPIs
    let totalDisbursed = 0;
    let pendingPayables = 0;

    payrollRecords.forEach(p => {
      const net = parseFloat(p.net_pay) || 0;
      if (p.status === 'paid') totalDisbursed += net;
      else pendingPayables += net;
    });

    const disbursedEl = document.getElementById('kpi-total-disbursed');
    if (disbursedEl) {
      animateNumber(disbursedEl, 0, totalDisbursed, 1000, { prefix: '₱', decimals: 2 });
    }

    const pendingEl = document.getElementById('kpi-pending-payables');
    if (pendingEl) {
      animateNumber(pendingEl, 0, pendingPayables, 1000, { prefix: '₱', decimals: 2 });
    }

    const countEl = document.getElementById('kpi-staff-count');
    if (countEl) {
      animateNumber(countEl, 0, staffs.length, 1000, { decimals: 0 });
    }

    // 2. Filter records
    const filtered = payrollRecords.filter(p => {
      const q = searchQuery.toLowerCase();
      return p.staff_name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q);
    });

    // 3. Render Table rows
    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-5 py-8 text-center text-xs text-neutral-400">
            No payroll records found. Click "Process Payroll" to generate salary vouchers.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(p => {
      const isPaid = p.status === 'paid';
      const statusBadge = isPaid
        ? `<span class="px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded-full">Disbursed</span>`
        : `<span class="px-2.5 py-1 text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 rounded-full">Pending</span>`;

      const formattedRate = parseFloat(p.base_rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedDays = parseFloat(p.days_worked).toLocaleString('en-US');
      const formattedBonuses = parseFloat(p.bonuses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedDeductions = parseFloat(p.deductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedNetPay = parseFloat(p.net_pay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      return `
        <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
          <td class="px-5 py-4 font-extrabold text-neutral-900 dark:text-white">
            ${p.staff_name}
            ${p.pay_period_start ? `<span class="block text-[10px] text-neutral-400 font-normal mt-0.5">${p.pay_period_start} to ${p.pay_period_end}</span>` : ''}
          </td>
          <td class="px-5 py-4">
            <span class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">${p.role}</span>
          </td>
          <td class="px-5 py-4 font-mono">
            <span class="font-extrabold text-neutral-900 dark:text-white">₱${formattedRate}</span>
            <span class="text-neutral-400 text-xs font-sans">(${p.salary_type === 'daily' ? `${formattedDays} days` : (p.salary_type === 'hourly' ? `${formattedDays} hrs` : p.salary_type)})</span>
          </td>
          <td class="px-5 py-4">
            <span class="text-emerald-600 font-bold font-mono">+₱${formattedBonuses}</span>
            <span class="text-rose-500 font-bold font-mono ml-1.5">-₱${formattedDeductions}</span>
          </td>
          <td class="px-5 py-4 font-black font-mono text-sm text-neutral-900 dark:text-white">
            ₱${formattedNetPay}
          </td>
          <td class="px-5 py-4">
            ${statusBadge}
          </td>
          <td class="px-5 py-4 text-center">
            <div class="flex items-center justify-center gap-2">
              ${!isPaid ? `
                <button type="button" class="btn-pay-salary cursor-pointer px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition" data-id="${p.id}" data-name="${p.staff_name}" data-amount="${p.net_pay}">
                  Mark Paid
                </button>
              ` : `
                <button type="button" class="btn-print-voucher cursor-pointer px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-[11px] rounded-lg transition" data-id="${p.id}">
                  🖨 Voucher
                </button>
              `}
              <button type="button" class="btn-delete-payroll p-1 text-neutral-400 hover:text-red-500 rounded-lg cursor-pointer transition" data-id="${p.id}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Mark Paid Button
    tableBody.querySelectorAll('.btn-pay-salary').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const name = btn.dataset.name;
        const amount = parseFloat(btn.dataset.amount);
        confirmDisburseSalary(id, name, amount);
      });
    });

    // Bind Print Voucher Button
    tableBody.querySelectorAll('.btn-print-voucher').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const rec = payrollRecords.find(p => p.id === id);
        if (rec) printPayrollVoucher(rec);
      });
    });

    // Bind Delete Button
    tableBody.querySelectorAll('.btn-delete-payroll').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        confirmDeletePayroll(id);
      });
    });
  }

  function confirmDisburseSalary(id, name, amount) {
    Swal.fire({
      title: 'Disburse Salary?',
      text: `Confirm salary payment of ₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Mark as Paid',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'cursor-pointer px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl mr-2',
        cancelButton: 'cursor-pointer px-4 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 rounded-xl'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        await markPayrollPaid(id);
        const idx = payrollRecords.findIndex(p => p.id === id);
        if (idx !== -1) {
          payrollRecords[idx].status = 'paid';
          payrollRecords[idx].paid_at = new Date().toISOString();
        }
        renderPayroll();
        showSuccess('Disbursed', `Salary payment to ${name} marked as paid!`);
      }
    });
  }

  function printPayrollVoucher(rec) {
    const baseRate = parseFloat(rec.base_rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const bonuses = parseFloat(rec.bonuses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const deductions = parseFloat(rec.deductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const netPay = parseFloat(rec.net_pay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const days = parseFloat(rec.days_worked).toLocaleString('en-US');

    Swal.fire({
      title: 'Payroll Pay Slip',
      html: `
        <div class="text-left font-sans text-xs space-y-2.5 p-3 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900/50">
          <div class="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <span class="font-extrabold text-sm text-neutral-900 dark:text-white">${rec.staff_name}</span>
            <span class="font-black uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">${rec.role}</span>
          </div>
          <div class="flex justify-between text-neutral-500">
            <span>Period:</span>
            <span class="font-semibold text-neutral-800 dark:text-neutral-200">${rec.pay_period_start || '-'} to ${rec.pay_period_end || '-'}</span>
          </div>
          <div class="flex justify-between text-neutral-700 dark:text-neutral-300">
            <span>Rate (${days} ${rec.salary_type === 'hourly' ? 'hrs' : 'days'}):</span>
            <span class="font-mono font-bold">₱${baseRate}</span>
          </div>
          <div class="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Bonus / Incentives:</span>
            <span class="font-mono font-bold">+₱${bonuses}</span>
          </div>
          <div class="flex justify-between text-rose-500">
            <span>Deductions:</span>
            <span class="font-mono font-bold">-₱${deductions}</span>
          </div>
          <div class="flex justify-between text-sm font-black pt-2 border-t border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
            <span>Net Take-Home:</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-mono text-base">₱${netPay}</span>
          </div>
        </div>
      `,
      confirmButtonText: 'Close Voucher',
      customClass: {
        confirmButton: 'cursor-pointer px-5 py-2 text-xs font-bold text-white bg-neutral-900 dark:bg-neutral-700 rounded-xl'
      },
      buttonsStyling: false
    });
  }

  function confirmDeletePayroll(id) {
    Swal.fire({
      title: 'Delete Payroll Record?',
      text: 'Are you sure you want to delete this salary entry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'cursor-pointer px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl mr-2',
        cancelButton: 'cursor-pointer px-4 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 rounded-xl'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deletePayrollRecord(id);
        payrollRecords = payrollRecords.filter(p => p.id !== id);
        renderPayroll();
        showSuccess('Deleted', 'Record removed.');
      }
    });
  }

  // Bind Open Drawer
  const openAddBtn = document.getElementById('btn-open-add-payroll');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      openDrawer('payroll-drawer');
      recalculateNetPay();
    });
  }

  // Search input
  const searchInput = document.getElementById('search-payroll-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderPayroll();
    });
  }

  // Form submission
  const payrollForm = document.getElementById('payroll-form');
  if (payrollForm) {
    payrollForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const staffSelect = document.getElementById('payroll-staff-select');
      const staffId = staffSelect?.value ? parseInt(staffSelect.value, 10) : null;
      const selectedOption = staffSelect?.options[staffSelect.selectedIndex];
      const staffName = selectedOption ? selectedOption.textContent.split(' (')[0] : 'Staff';
      const role = selectedOption?.dataset?.role || 'staff';

      const salaryType = document.getElementById('payroll-salary-type')?.value || 'daily';
      const baseRate = parseFloat(document.getElementById('payroll-base-rate')?.value) || 0;
      const daysWorked = parseFloat(document.getElementById('payroll-days-worked')?.value) || 1;
      const bonuses = parseFloat(document.getElementById('payroll-bonuses')?.value) || 0;
      const deductions = parseFloat(document.getElementById('payroll-deductions')?.value) || 0;
      const payPeriodStart = document.getElementById('payroll-period-start')?.value || null;
      const payPeriodEnd = document.getElementById('payroll-period-end')?.value || null;
      const notes = document.getElementById('payroll-notes')?.value.trim();

      if (!staffId || baseRate <= 0) {
        showError('Invalid Form', 'Please select a staff member and enter a valid base rate.');
        return;
      }

      const res = await createPayrollRecord({
        storeId,
        branchId,
        staffId,
        staffName,
        role,
        salaryType,
        baseRate,
        daysWorked,
        bonuses,
        deductions,
        payPeriodStart,
        payPeriodEnd,
        notes
      });

      if (res.success && res.data) {
        payrollRecords.unshift(res.data);
      } else {
        // Local fallback
        let gross = baseRate;
        if (salaryType === 'daily' || salaryType === 'hourly') gross = baseRate * daysWorked;
        const net = Math.max(0, gross + bonuses - deductions);
        payrollRecords.unshift({
          id: Date.now(),
          staff_id: staffId,
          staff_name: staffName,
          role,
          salary_type: salaryType,
          base_rate: baseRate,
          days_worked: daysWorked,
          bonuses,
          deductions,
          net_pay: net,
          status: 'pending',
          pay_period_start: payPeriodStart,
          pay_period_end: payPeriodEnd,
          notes
        });
      }

      closeDrawer('payroll-drawer');
      renderPayroll();
      showSuccess('Created', `Payroll voucher for ${staffName} generated!`);
      payrollForm.reset();
    });
  }

  loadData();
}
// --- END initPayroll ---
