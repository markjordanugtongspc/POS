// ==========================================
// transactions.api.js - Transactions & Sales Ledger API
// ==========================================
import { supabase } from './client.api.js';

// --- START fetchTransactions ---
export async function fetchTransactions(storeId = null, branchId = null, limit = 100) {
  try {
    let query = supabase
      .from('transactions')
      .select('*, users(full_name, custom_staff_id)')
      .order('created_at', { ascending: false })
      .limit(limit);

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
    console.error('[Transactions API Error]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
// --- END fetchTransactions ---

// --- START createTransaction ---
export async function createTransaction({
  storeId = 1,
  branchId = null,
  cashierId,
  receiptNumber,
  customerName = 'Walk-in Customer',
  subtotal,
  discount = 0,
  tax = 0,
  totalAmount,
  paymentMethod = 'cash',
  amountPaid,
  changeGiven = 0,
  items = []
}) {
  try {
    // Standardize payment method check constraint ('cash', 'card', 'e-wallet', 'qr')
    const validMethod = ['cash', 'card', 'e-wallet', 'qr'].includes(paymentMethod.toLowerCase())
      ? paymentMethod.toLowerCase()
      : (paymentMethod.toLowerCase().includes('cash') ? 'cash' : 'e-wallet');

    const insertPayload = {
      store_id: storeId,
      cashier_id: cashierId,
      receipt_number: receiptNumber,
      customer_name: customerName,
      subtotal: subtotal,
      discount_amount: discount,
      tax_amount: tax,
      total_amount: totalAmount,
      payment_method: validMethod,
      amount_paid: amountPaid,
      change_amount: changeGiven,
      status: 'completed'
    };

    if (branchId) {
      insertPayload.branch_id = branchId;
    }

    const { data: trx, error: trxErr } = await supabase
      .from('transactions')
      .insert(insertPayload)
      .select()
      .single();

    if (trxErr) throw trxErr;

    // Insert line items
    if (items.length > 0) {
      const lineItems = items.map(item => ({
        transaction_id: trx.id,
        product_id: item.productId,
        product_name: item.name || 'Product',
        unit_price: item.price,
        qty: item.qty,
        subtotal: item.price * item.qty
      }));

      await supabase.from('transaction_items').insert(lineItems);
    }

    return { success: true, data: trx };
  } catch (err) {
    console.error('[Create Transaction Error]:', err);
    return { success: false, error: err.message };
  }
}
// --- END createTransaction ---
