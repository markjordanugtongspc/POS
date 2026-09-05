// ==========================================
// payroll.api.js - Staff Payroll & Salary Vouchers API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchPayrollRecords ---
export async function fetchPayrollRecords(storeId = 1, branchId = null) {
  try {
    let query = supabase
      .from('payroll_records')
      .select('*, users:staff_id(id, full_name, username, role, email)')
      .order('created_at', { ascending: false });

    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[Payroll API Fetch Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchPayrollRecords ---

// --- START createPayrollRecord ---
export async function createPayrollRecord({
  storeId = 1,
  branchId = null,
  staffId = null,
  staffName,
  role,
  salaryType = 'daily',
  baseRate = 0.00,
  daysWorked = 1.00,
  bonuses = 0.00,
  deductions = 0.00,
  payPeriodStart = null,
  payPeriodEnd = null,
  notes = ''
}) {
  try {
    const parsedBase = parseFloat(baseRate) || 0.00;
    const parsedDays = parseFloat(daysWorked) || 1.00;
    const parsedBonuses = parseFloat(bonuses) || 0.00;
    const parsedDeductions = parseFloat(deductions) || 0.00;

    let grossPay = parsedBase;
    if (salaryType === 'daily' || salaryType === 'hourly') {
      grossPay = parsedBase * parsedDays;
    }
    const netPay = Math.max(0, grossPay + parsedBonuses - parsedDeductions);

    const payload = {
      store_id: storeId,
      branch_id: branchId,
      staff_id: staffId,
      staff_name: staffName.trim(),
      role: role.trim(),
      salary_type: salaryType,
      base_rate: parsedBase,
      days_worked: parsedDays,
      bonuses: parsedBonuses,
      deductions: parsedDeductions,
      net_pay: netPay,
      status: 'pending',
      pay_period_start: payPeriodStart || null,
      pay_period_end: payPeriodEnd || null,
      notes: notes.trim()
    };

    const { data, error } = await supabase
      .from('payroll_records')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Payroll API Create Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END createPayrollRecord ---

// --- START markPayrollPaid ---
export async function markPayrollPaid(payrollId) {
  try {
    const { data, error } = await supabase
      .from('payroll_records')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payrollId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Payroll API Mark Paid Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END markPayrollPaid ---

// --- START deletePayrollRecord ---
export async function deletePayrollRecord(payrollId) {
  try {
    const { error } = await supabase
      .from('payroll_records')
      .delete()
      .eq('id', payrollId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Payroll API Delete Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END deletePayrollRecord ---
