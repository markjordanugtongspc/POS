<style>
body { font-size: 15px; line-height: 1.5; font-family: "Segoe UI", sans-serif; }
h1 { font-size: 2em; margin-bottom: 0.5em; }
h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.4em; }
h3 { font-size: 1.2em; margin-top: 1.2em; }
p, li, td { font-size: 15px; line-height: 1.5; }
</style>

&nbsp;

&nbsp;

&nbsp;

# JORGY POS

## Point of Sale System

&nbsp;

**Prepared for:** Department of Labor and Employment (DOLE)

**Prepared by:** Mark Jordan Ugtong

**Email:** mark.jordan@jorgypos.com

**Phone:** *(To be filled)*

**Date:** June 23, 2026

**Version:** Alpha v0.1.95

&nbsp;

&nbsp;

&nbsp;

---

&nbsp;

---

# ONE-PAGE SUMMARY

&nbsp;

## Purpose

Jorgy POS is an advanced, accessible cloud point of sale and store management system built specifically for Filipino retail stores, minimarts, sari-sari stores, and multi-branch merchants.

It streamlines day-to-day retail operations — from lightning-fast barcode scanning and customer credit (Utang) ledger tracking to supplier contacts, staff payroll vouchers, multi-branch switching, and live profit analytics — all in one responsive browser application.

No complicated installation. No paper ledgers. Just open any browser on a PC, tablet, or mobile device and start selling.

&nbsp;

## Key Benefits

- **Fast & Flexible Checkout.** Process sales in seconds with USB/camera barcode scanner or instant product search. Supports Cash, Card, E-Cash (QR PH, GCash, Maya, GoTyme), and Customer Utang (Credit).
- **Customer Utang (Credit) Tracking.** Built-in credit ledger with HTML5 digital touchscreen/mouse signature pad, due date reminders, overdue customer indicators, and partial payment settlement drawers.
- **Suppliers Directory.** Complete vendor contact rolodex with one-tap calling (`tel:`) and instant emailing (`mailto:`) for quick inventory reorders.
- **Staff Payroll & Pay Slips.** Automated payroll processing with customizable salary rates (daily, monthly, hourly), working days, performance bonuses, deductions, and printable pay slip vouchers.
- **Multi-Branch Switching.** Manage multiple store branches or roadside food stalls from a single dashboard with live branch context switching and real-time inventory separation.
- **Live Stock & Low Inventory Alerts.** Real-time stock counts with automated low-stock and out-of-stock warning badges.
- **Audit Logs & Transaction History.** Full ledger recording cashier names, timestamps, itemized receipts, and one-click refund handling.
- **Universal Device Support & Dual Theme.** Granular Tailwind CSS v4 responsiveness across flip phones, smartphones, iPads, and desktops with native Dark & Light modes.
- **Zero Monthly Hosting Cost to Start.** Hosted on Vercel with database synchronization on Supabase's generous free cloud tier.

&nbsp;

## How to Get Help

If something is not working, contact the developer:

| | |
|---|---|
| **Name** | Mark Jordan Ugtong |
| **Email** | mark.jordan@jorgypos.com |
| **Phone** | *(To be filled)* |
| **Response Time** | Within 24 hours on weekdays |
| **Support Hours** | Monday - Saturday, 8:00 AM - 6:00 PM (PHT) |

&nbsp;

---

&nbsp;

---

# QUICK START GUIDE

*This section helps you get started in under 10 minutes.*

&nbsp;

## Step 1 — Open the System

1. Open your browser (Google Chrome or Microsoft Edge recommended).
2. Navigate to your store's URL. Example: `https://jorgypos.vercel.app`
3. The secure login screen will appear.

&nbsp;

## Step 2 — Log In

You can log in with a **PIN** or a **Password**.

**Using Quick PIN:**
1. On the login screen, select **"Use PIN"**.
2. Tap your 4-digit cashier PIN on the on-screen keypad.
3. The system verifies and opens your active branch dashboard automatically.

**Using Password:**
1. Click **"Use Password"**.
2. Enter your username/email and password.
3. Click **Submit**.

&nbsp;

## Step 3 — Navigation & Dashboard

After login, you land on the **Store Dashboard**.
You can immediately view:
- Today's Gross & Net Sales (with real-time counter animations)
- Active Branch Context Indicator
- Low Stock & Out-of-Stock inventory alerts
- Total outstanding Utang balance
- Weekly sales revenue charts and active staff status

&nbsp;

## Step 4 — Making a Sale (Cash, E-Cash, or Utang)

1. Click **"New Sale"** on the dashboard or select **POS** from the sidebar.
2. Select products by clicking, searching, or scanning barcodes.
3. Review items and quantities in the Cart.
4. Click **Checkout**.
5. Select the payment method: **Cash**, **Card**, **E-Cash**, or **Utang (Credit)**.
6. If Utang is selected, choose an existing customer or register a new customer on the spot.
7. Click **Confirm Payment**. An itemized receipt will be generated.

&nbsp;

---

&nbsp;

---

# FULL USER GUIDE

&nbsp;

## Main Screen Architecture

The screen is organized into high-efficiency zones:
- **Top Navigation Bar:** Displays the store name, active branch context chip, theme toggle (Dark/Light), and user profile menu.
- **Left Sidebar Navigation:** Instant access to all core modules (Dashboard, POS, Products, Transactions, Utang Ledger, Suppliers, Payroll, Branches, Settings, Support).
- **Off-Canvas Action Drawers:** Full-height right off-canvas drawers (`fixed inset-y-0 right-0 z-[60]`) for adding products, logging utang, editing suppliers, processing payroll, and viewing transaction receipts without losing page context.

&nbsp;

---

## Workflow 1 — Making a Sale at the POS

**Goal:** Process a customer purchase and receive payment.

**Steps:**
1. Go to **POS** from the sidebar.
2. Search for items or scan product barcodes using a USB scanner or mobile camera scanner.
3. Click items to append to the Cart.
4. Adjust quantities or remove items directly in the Cart.
5. Review Subtotal, VAT, Discounts, and Total Payable.
6. Select your payment method:
   - **Cash:** Use quick-preset peso bill buttons (₱100, ₱200, ₱500, ₱1,000) to calculate exact change due.
   - **E-Cash:** Choose between QR PH, GCash, Maya, or GoTyme.
   - **Card:** Process debit/credit card payments.
   - **Utang:** Charge the transaction to a customer's credit ledger.
7. Click **Continue / Confirm**. The receipt is displayed with print options.

&nbsp;

---

## Workflow 2 — Managing Customer Utang & Credit Ledger

**Goal:** Track customer store credit, view overdue balances, collect e-signatures, and record partial payments.

**Steps to Record New Utang:**
1. Go to **Utang** from the left navigation sidebar.
2. View key KPI summary cards: **Total Outstanding Utang** and **Overdue Customers**.
3. Click **"Add utang"** to open the off-canvas credit drawer.
4. Select an existing customer or choose **"Register new customer"**.
5. Input the customer name, phone number, and optional email.
6. Enter items/description taken (e.g., *2 Lucky Me, 1 Coke 1.5L*).
7. Enter the credit amount (₱), date added, and agreed repayment due date.
8. *(Optional)* Have the customer sign on the interactive **HTML5 E-Signature Pad** using touch or mouse.
9. Click **Add utang**. The ledger updates immediately.

**Steps to Record Payment / Settle Balance:**
1. In the Utang list, locate the customer record.
2. Click **"Record payment"**.
3. In the payment drawer, input the amount tendered (e.g., partial payment or full settlement).
4. Click **Submit Payment**. The remaining balance updates automatically.

&nbsp;

---

## Workflow 3 — Managing Suppliers Directory

**Goal:** Maintain vendor contact details and quickly reorder stock.

**Steps:**
1. Go to **Suppliers** from the sidebar.
2. View supplier contact cards showing supplier name, contact person, phone number, email, and supplied product categories.
3. Use quick-action buttons:
   - Click the **Phone icon** (`tel:`) to initiate an instant direct phone call.
   - Click the **Email icon** (`mailto:`) to launch an email composer for ordering.
4. To add or edit a supplier, click **"Add supplier"**, fill in vendor details in the off-canvas drawer, and click **Save supplier**.

&nbsp;

---

## Workflow 4 — Processing Staff Payroll & Printing Pay Slips

**Goal:** Calculate staff compensation, apply bonuses/deductions, and print pay slip vouchers.

**Steps:**
1. Go to **Staff Payroll** from the sidebar.
2. Review top KPIs: **Total Disbursed (Paid)**, **Pending Payables**, and **Active Staff Count**.
3. Click **"Process Payroll"** to open the payroll drawer.
4. Select the staff member and salary calculation basis (Daily Rate, Monthly Salary, or Hourly Wage).
5. Enter the agreed rate (e.g., `₱550.00`) and number of days/hours worked (e.g., `6 days`).
6. Enter any performance bonuses (e.g., `₱2,000.00`) or advances/deductions (e.g., `₱1,000.00`).
7. The system automatically computes the **Net Pay** with formatted thousand-comma numbers (e.g., `₱17,000.00`).
8. Select status (**Paid** or **Pending**) and click **Save Payroll Record**.
9. To issue a pay voucher, click **"Print Voucher"** on any payroll row to open a printable, professional pay slip.

&nbsp;

---

## Workflow 5 — Managing Branches & Switching Context

**Goal:** Manage multiple branch locations and switch the active store view.

**Steps:**
1. Go to **Branches** from the sidebar or click the **Branch Chip** in the top navbar.
2. View active branches, addresses, and business classifications (Sari-Sari Store, Convenience Store, Food Stall, Pharmacy, Boutique, etc.).
3. Click **"Switch to Branch"** to instantly filter all inventory, POS transactions, utang records, and sales reports to that specific branch.
4. To create a branch, click **"Add New Branch"**, specify the branch name, address, and business type, and save.

&nbsp;

---

## Workflow 6 — Managing Products & Barcode Scanning

**Goal:** Add, edit, and organize inventory items.

**Steps:**
1. Go to **Products** from the sidebar.
2. Click **"Add Product"** to open the product drawer.
3. Fill in product name, SKU/Barcode, category, brand, cost price, selling price, quantity, and optional image URL.
4. Use **"Scan Barcode"** to capture barcodes using your camera or USB scanner.
5. Click **Save Product**.

&nbsp;

---

## Workflow 7 — Handling Returns and Refunds

**Goal:** Issue a customer refund for returned goods.

**Steps:**
1. Go to **Transactions** from the sidebar.
2. Locate the transaction using search, date filters, or cashier filter.
3. Click on the transaction to open the receipt drawer.
4. Click **"Refund Transaction"** and confirm.
5. The transaction is marked as **Refunded**, and stock counts are automatically restored.

&nbsp;

---

# TECHNICAL SUMMARY

&nbsp;

## System Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Pure Vanilla JavaScript (ES Modules, closures, reactive event patterns) |
| **Styling & UI Engine** | Tailwind CSS v4.3+ utility architecture & Flowbite UI engine |
| **Bundler & Build Tool** | Vite with Rollup/Rolldown production packaging |
| **Automation Pipeline** | Automated semantic version incrementing on `npm run build` |
| **Database & Auth** | Supabase (PostgreSQL 15, Row-Level Security, Realtime websockets) |
| **Hosting & CDN** | Vercel Global Edge Network with SSL encryption |

&nbsp;

## Supabase Database Schema Overview

The database utilizes PostgreSQL tables with optimized indexing and foreign key constraints:

- `branches`: Multi-branch records with store ownership and business type classifications.
- `products`: Master product catalog with SKU, barcode, category, unit prices, and inventory counts.
- `transactions`: Completed and refunded sales orders with itemized JSON payloads and payment methods.
- `suppliers`: Supplier directory with contact numbers, emails, addresses, and product categories.
- `customers`: Customer registry linked to phone numbers and credit accounts.
- `utang_records`: Active and settled customer credit ledgers with item descriptions, due dates, and digital signature URLs.
- `utang_payments`: Ledger of partial and full utang settlements.
- `payroll_records`: Staff compensation ledger with rates, working days, bonuses, deductions, and payment status.
- `users`: Staff and administrator profiles with encrypted credentials and role-based permissions.
- `audit_logs`: Activity tracking logs for security and DOLE compliance.

&nbsp;

## Backup & Data Portability

- All data is persisted in real-time to Supabase cloud storage with automated multi-zone snapshots.
- Store owners can export complete transactional and product data as CSV spreadsheets anytime via **Settings > Data & Cache > Export Sales Report**.

&nbsp;

---

# PRICING & INCLUSIONS

&nbsp;

## Complete Package — ₱17,000 to ₱19,000

This represents the complete, ready-to-use Jorgy POS system — fully configured, integrated with cloud databases, tested across mobile and desktop devices, and backed by comprehensive documentation and training.

&nbsp;

### Feature Inclusions Matrix

| Module / Feature | Included |
|---|---|
| **POS Terminal** (Cart, Barcode Scanning, Bill Presets, Change Calculator) | Yes |
| **Multi-Payment Support** (Cash, Card, GCash, Maya, QR PH, GoTyme, Utang) | Yes |
| **Customer Utang Ledger** (Credit Tracking, HTML5 E-Signatures, Due Dates) | Yes |
| **Suppliers Directory** (Vendor Contacts, One-Tap Call & Email Reordering) | Yes |
| **Staff Payroll System** (Rate Computation, Deductions/Bonuses, Pay Slips) | Yes |
| **Multi-Branch Operations** (Branch Switching, Isolated Inventory & Ledgers) | Yes |
| **Product Inventory Management** (SKU, Categories, Stock Alerts, Restock) | Yes |
| **Transaction History & One-Click Refunds** | Yes |
| **Live Sales Dashboard & Numerical Counter Animations** | Yes |
| **Dual Theme Engine** (Native Dark & Light Mode) | Yes |
| **Multi-Staff Security** (PIN Keypad & Password Logins) | Yes |
| **Cloud Hosting on Vercel & Cloud Database on Supabase** (₱0/mo free tier) | Yes |
| **1-Hour Staff Onboarding Training & 1-Week Follow-up Support** | Yes |
| **Comprehensive System Documentation** | Yes |

&nbsp;

---

*Document prepared by Mark Jordan Ugtong — June 23, 2026*  
*Jorgy POS System — Version Alpha v0.1.95*
