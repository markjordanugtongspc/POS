// ==========================================
// utang.api.js - Utang (Credit Tracking) & Customer Ledger API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchUtangRecords ---
/**
 * Fetches active/all credit records for a store and optional branch.
 */
export async function fetchUtangRecords(storeId = 1, branchId = null) {
  try {
    let query = supabase
      .from('utang_records')
      .select('*, customers(id, name, phone, email, address, signature_data)')
      .order('date_added', { ascending: false });

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
    console.error('[Utang API Fetch Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchUtangRecords ---

// --- START fetchCustomers ---
/**
 * Fetches all registered customers with credit accounts.
 */
export async function fetchCustomers(storeId = 1, branchId = null) {
  try {
    let query = supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

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
    console.error('[Customers API Fetch Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchCustomers ---

// --- START createCustomer ---
/**
 * Register a customer with phone and digital e-signature data.
 */
export async function createCustomer({
  storeId = 1,
  branchId = null,
  name,
  phone = '',
  email = '',
  address = '',
  signatureData = null
}) {
  try {
    const payload = {
      store_id: storeId,
      branch_id: branchId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      signature_data: signatureData,
      total_utang: 0.00
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Customer API Create Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END createCustomer ---

// --- START createUtangRecord ---
/**
 * Records a new credit tab entry (from Utang module or POS checkout).
 */
export async function createUtangRecord({
  storeId = 1,
  branchId = null,
  customerId = null,
  customerName,
  customerPhone = '',
  itemsSummary,
  amount,
  dueDate = null,
  dateAdded = new Date().toISOString().split('T')[0],
  transactionId = null,
  signatureData = null
}) {
  try {
    const parsedAmount = parseFloat(amount) || 0.00;
    const payload = {
      store_id: storeId,
      branch_id: branchId,
      customer_id: customerId,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      items_summary: itemsSummary.trim(),
      amount: parsedAmount,
      balance: parsedAmount,
      status: 'unpaid',
      due_date: dueDate || null,
      date_added: dateAdded,
      transaction_id: transactionId,
      signature_data: signatureData
    };

    const { data, error } = await supabase
      .from('utang_records')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Increment customer's total utang if customer_id is provided
    if (customerId) {
      try {
        const { data: cust } = await supabase.from('customers').select('total_utang').eq('id', customerId).single();
        if (cust) {
          const newTotal = (parseFloat(cust.total_utang) || 0) + parsedAmount;
          await supabase.from('customers').update({ total_utang: newTotal }).eq('id', customerId);
        }
      } catch (e) {
        console.warn('Customer total_utang update skipped:', e);
      }
    }

    return { success: true, data };
  } catch (err) {
    console.error('[Utang API Create Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END createUtangRecord ---

// --- START recordUtangPayment ---
/**
 * Records a partial or full payment settlement against a credit tab.
 */
export async function recordUtangPayment({
  utangRecordId,
  amountPaid,
  paymentMethod = 'cash',
  notes = ''
}) {
  try {
    const parsedPaid = parseFloat(amountPaid) || 0.00;

    // Fetch existing record
    const { data: record, error: fetchErr } = await supabase
      .from('utang_records')
      .select('*')
      .eq('id', utangRecordId)
      .single();

    if (fetchErr || !record) throw fetchErr || new Error('Utang record not found');

    const currentBalance = parseFloat(record.balance) || 0.00;
    const newBalance = Math.max(0, currentBalance - parsedPaid);
    const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

    // Insert payment history log
    await supabase.from('utang_payments').insert([{
      utang_record_id: utangRecordId,
      amount_paid: parsedPaid,
      payment_method: paymentMethod,
      notes: notes.trim()
    }]);

    // Update utang record balance and status
    const { data: updated, error: updateErr } = await supabase
      .from('utang_records')
      .update({
        balance: newBalance,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', utangRecordId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Update customer total_utang if customer_id exists
    if (record.customer_id) {
      try {
        const { data: cust } = await supabase.from('customers').select('total_utang').eq('id', record.customer_id).single();
        if (cust) {
          const newCustTotal = Math.max(0, (parseFloat(cust.total_utang) || 0) - parsedPaid);
          await supabase.from('customers').update({ total_utang: newCustTotal }).eq('id', record.customer_id);
        }
      } catch (e) {
        console.warn('Customer total_utang update skipped:', e);
      }
    }

    return { success: true, data: updated };
  } catch (err) {
    console.error('[Utang API Payment Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END recordUtangPayment ---

// --- START deleteUtangRecord ---
export async function deleteUtangRecord(utangRecordId) {
  try {
    const { error } = await supabase
      .from('utang_records')
      .delete()
      .eq('id', utangRecordId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Utang API Delete Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END deleteUtangRecord ---
