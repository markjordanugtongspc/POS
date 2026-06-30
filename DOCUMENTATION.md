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

**Version:** 10.2-alpha

&nbsp;

&nbsp;

&nbsp;

---

&nbsp;

---

# ONE-PAGE SUMMARY

&nbsp;

## Purpose

Jorgy POS is a simple sales system built for small retail stores and sari-sari stores.

It helps the owner and staff do daily tasks faster — like selling products, tracking stock, and viewing sales history — all in one screen.

No complicated setup. No paper records. Just open the browser and start selling.

&nbsp;

## Key Benefits

- **Fast checkout.** Process a sale in seconds. Search by product name or scan a barcode.
- **Know your stock.** See which products are low or out of stock right away.
- **Track every sale.** All transactions are saved with the date, cashier, and payment method.
- **Dark and light mode.** Works well in dim store environments too.
- **Works on any laptop or desktop.** No special device needed — just a browser.
- **Multi-staff support.** Each cashier has a login. The owner can see who sold what.
- **Free hosting.** The system runs on Vercel and Supabase — no monthly server cost to start.

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

1. Open your browser (Chrome or Edge works best).
2. Go to your store's link. Example: `https://jorgypos.vercel.app`
3. The login screen will appear.

> **Screenshot Placeholder — Login Screen**
> *(Insert screenshot of the login page here)*

&nbsp;

## Step 2 — Log In

You can log in with a **PIN** or a **Password**.

**Using PIN:**

1. On the login screen, click **"Use PIN"**.
2. A number pad will appear.
3. Enter your 4-digit PIN.
4. The system logs you in automatically when all 4 digits are entered.

**Using Password:**

1. Click **"Use Password"** instead.
2. Enter your username and password.
3. Click **Submit**.

> **Screenshot Placeholder — PIN Pad Screen**
> *(Insert screenshot of the PIN keypad)*

> **Screenshot Placeholder — Password Form**
> *(Insert screenshot of the username/password form)*

&nbsp;

## Step 3 — You Are In

After login, you go to the **Dashboard**.

You can see:

- Today's total sales
- Low stock alerts
- Staff list
- Weekly sales chart

> **Screenshot Placeholder — Dashboard**
> *(Insert screenshot of the dashboard overview)*

&nbsp;

## Step 4 — Make a Sale

1. Click **"New Sale"** on the dashboard, or click **POS** on the left sidebar.
2. Find the product by scrolling or typing the name.
3. Click the product to add it to the cart.
4. Adjust quantity if needed.
5. Click **"Checkout"**.
6. Choose the payment method: **Cash**, **G-Cash**, or **Card**.
7. Enter the amount received.
8. Click **"Confirm"**. The receipt is shown.

> **Screenshot Placeholder — POS Terminal Screen**
> *(Insert screenshot of the POS/cart page)*

&nbsp;

## Step 5 — Log Out

Click your profile icon or use the sidebar to sign out. Always log out when done.

&nbsp;

---

&nbsp;

---

# FULL USER GUIDE

&nbsp;

## Main Screen Overview

The screen has two main parts:

- **Left sidebar** — links to all pages (Dashboard, POS, Products, Transactions, Settings).
- **Main area** — this is where you do your work.

> **Screenshot Placeholder — Labeled Main Screen**
> *(Insert annotated screenshot showing sidebar and main content area with labels)*

&nbsp;

---

## Workflow 1 — Making a Sale

**Goal:** Process a customer purchase and get payment.

**Steps:**

1. Go to **POS** from the sidebar.
2. Find the product the customer wants. You can scroll or use the search bar.
3. Click the product card. It goes into the cart on the right side.
4. If the customer wants more than one, change the quantity in the cart.
5. Apply a discount if needed.
6. Click **"Checkout"**.
7. Choose how the customer will pay: Cash, G-Cash, or Card.
8. Type in the amount given. The system shows the change.
9. Click **"Confirm Payment"**.
10. A receipt appears. You can print it or close it.

**Expected Result:** The sale is saved. Stock count goes down by the amount sold.

**Troubleshooting:**
> If a product does not appear in the list, check if it was added in the **Products** section. It may also be **out of stock**.

> **Screenshot Placeholder — POS with Cart**
> *(Insert screenshot of POS terminal with an active cart)*

&nbsp;

---

## Workflow 2 — Processing a Return (Refund)

**Goal:** Give money back to a customer for a returned item.

**Steps:**

1. Go to **Transactions** from the sidebar.
2. Find the transaction you want to refund. You can search by date or transaction ID.
3. Click the transaction to see its details.
4. Click **"Refund"**.
5. A confirmation box will appear. Click **"Yes, Refund"**.
6. The transaction is marked as **Refunded**.

**Expected Result:** The transaction status changes to "Refunded". The record is saved.

**Troubleshooting:**
> Only completed transactions can be refunded. If the refund button is missing, the transaction may already be refunded.

> **Screenshot Placeholder — Refund Button on Transaction**
> *(Insert screenshot of a transaction record with the refund option visible)*

&nbsp;

---

## Workflow 3 — Adding a Product

**Goal:** Add a new item to the product list.

**Steps:**

1. Go to **Products** from the sidebar.
2. Click the **"Add Product"** button at the top right.
3. The breadcrumb trail changes to show the "Add Product" form.
4. Fill in the product name, SKU, brand, category, buying price, selling price, and stock quantity.
5. Click **"Save"**.

**Expected Result:** The product appears in the product list table.

**Troubleshooting:**
> Make sure the SKU is unique. Two products cannot have the same SKU.

> **Screenshot Placeholder — Add Product Form**
> *(Insert screenshot of the add product form via breadcrumb)*

&nbsp;

---

## Workflow 4 — Viewing Product Details

**Goal:** Check the full info of one product.

**Steps:**

1. Go to **Products** from the sidebar.
2. Find the product in the table.
3. Click the product name or the **"View"** link on that row.
4. The breadcrumb changes and the full details appear below.

> **Screenshot Placeholder — Product Detail View**
> *(Insert screenshot of the inline product detail view)*

&nbsp;

---

## Workflow 5 — Checking Transactions and Reports

**Goal:** See past sales and filter by date, cashier, or payment method.

**Steps:**

1. Go to **Transactions** from the sidebar.
2. At the top, you will see total gross sales, discounts, refunds, and net sales.
3. Use the **filters** to narrow down what you want to see:
   - Pick a date range.
   - Pick a cashier name.
   - Pick a payment method (Cash, G-Cash, Card).
   - Pick a status (Completed, Refunded).
4. The table below updates to show only matching records.

**Expected Result:** You see a filtered list of sales. Each row shows the date, cashier, items, and total.

> **Screenshot Placeholder — Transactions with Filters**
> *(Insert screenshot of the transactions page with active filters)*

&nbsp;

---

## Workflow 6 — Managing Low Stock

**Goal:** Know which items are running out so you can reorder.

**Steps:**

1. Go to **Dashboard**.
2. Look at the **Low Stock Alert** table at the bottom.
3. Items with very low quantity show a yellow **"Low Stock"** badge.
4. Items with zero stock show a red **"Out of Stock"** badge.
5. Go to **Products** and update the quantity once you restock.

> **Screenshot Placeholder — Low Stock Alert Table**
> *(Insert screenshot of the low stock section on the dashboard)*

&nbsp;

---

## Workflow 7 — Changing Settings

**Goal:** Update store name, tax settings, or connect a receipt printer.

**Steps:**

1. Go to **Settings** from the sidebar.
2. Under **Store Information**, update your store name, address, contact number, and TIN.
3. Under **Tax & Pricing**, turn VAT or Senior/PWD discount on or off.
4. Under **Devices & Peripherals**, connect a receipt printer or barcode scanner.
5. Click **Save** on each section.

> **Screenshot Placeholder — Settings Page**
> *(Insert screenshot of the settings page)*

&nbsp;

---

## Workflow 8 — Switching Dark and Light Mode

**Goal:** Change how the screen looks.

**Steps:**

1. Look for the **theme toggle** button at the top right corner.
2. Click it to switch between Light and Dark mode.
3. The system saves your choice and remembers it next time.

&nbsp;

---

# TECHNICAL SUMMARY

&nbsp;

## System Requirements

You do not need to install anything. Just use a modern browser.

| What You Need | Details |
|---|---|
| **Browser** | Google Chrome (recommended), Microsoft Edge, or Firefox |
| **Internet** | Required for the online/hosted version |
| **Computer** | Any laptop or desktop made in the last 5 years |
| **Screen** | Minimum 13 inches recommended |
| **RAM** | 4 GB or more |
| **Printer** | USB or Bluetooth thermal receipt printer (optional) |
| **Barcode Scanner** | USB HID type (plug and play) |
| **Cash Drawer** | Connected to receipt printer via cable |

&nbsp;

## How the System is Hosted

Jorgy POS runs on two free cloud services:

| Service | What It Does |
|---|---|
| **Vercel** | Hosts the website so you can open it from any browser |
| **Supabase** | Stores all your data (products, transactions, users) online |

Both services have a **free tier**. You do not pay monthly to keep the site running as long as usage stays within the free limits. For a small retail store, the free plan is more than enough.

> **Note:** If the store grows and uses more data than the free limit, upgrading is an option. The cost is small — usually under ₱500/month.

&nbsp;

## Backup Instructions

Since data is stored in Supabase, it is automatically saved to the cloud.

For extra safety:

1. Go to **Settings > Data & Cache > Export Sales Report**.
2. Click **"Export CSV"**. This downloads all transactions to your computer.
3. Save the file in a safe folder like Google Drive or a USB drive.
4. Do this **at least once a week**.

&nbsp;

## Credentials and Security

| | |
|---|---|
| **Where passwords are stored** | Supabase (encrypted, not readable by anyone) |
| **How to reset a password** | Contact the developer. They can reset it from the admin panel. |
| **PIN login** | 4-digit PIN set per user during onboarding |
| **Session memory** | The system remembers your login method for 30 days using a cookie |

> **Tip:** Never share your PIN or password with someone you do not trust. Change it if you think someone else knows it.

&nbsp;

---

# SUPPORT AND MAINTENANCE

&nbsp;

## Contact Details

| | |
|---|---|
| **Developer** | Mark Jordan Ugtong |
| **Email** | mark.jordan@jorgypos.com |
| **Phone** | *(To be filled)* |
| **Support Hours** | Monday - Saturday, 8:00 AM - 6:00 PM (Philippine Time) |
| **Response Time** | Within 24 hours on business days |

&nbsp;

## Training Plan

A hands-on training session is included in the package.

| Session | Format | Duration |
|---|---|---|
| **Onboarding Training** | In-person or video call | 1 hour |
| **Follow-up Check-in** | Phone or chat | 30 minutes (after 1 week) |

**What is covered in training:**

- How to log in and switch users
- How to make a sale and issue a receipt
- How to check and update stock
- How to view transaction history
- How to use the settings page

&nbsp;

## FAQ

**Q: I forgot my PIN. What do I do?**  
Contact the developer. They will reset it for you within the day.

**Q: A product is not showing in the POS. Why?**  
Check the Products page. The item may be out of stock or not yet added.

**Q: Can two cashiers use the system at the same time?**  
Yes. Each cashier logs in with their own account. They can both use it at the same time on separate devices.

**Q: What if the internet goes down?**  
The system needs an internet connection. If the internet is down, sales cannot be processed. Consider having a mobile data backup.

**Q: How do I add a new staff account?**  
Go to the Settings or User Management section. The admin can add new users there.

**Q: Can I use a barcode scanner?**  
Yes. Plug in a USB barcode scanner and it will work right away. No setup needed.

**Q: How do I refund a sale?**  
Go to Transactions, find the record, and click Refund. A confirmation will appear.

**Q: Is VAT included in the price?**  
You can turn VAT on or off in the Settings under Tax & Pricing.

**Q: Where is my data saved?**  
All data is saved in Supabase, a cloud database. It is safe and backed up automatically.

**Q: Can I use this on a tablet or phone?**  
The system works on tablets. Phone screens may be too small for the POS terminal view.

&nbsp;

---

# PRICING

&nbsp;

## Complete Package — ₱17,000 to ₱19,000

This is the total price for a working, ready-to-use Jorgy POS system — set up, tested, trained, and launched.

&nbsp;

### What is Included

| Item | Included |
|---|---|
| Full POS Terminal (sell products, cart, receipt) | Yes |
| Product Management (add, edit, view, brand) | Yes |
| Transaction History with Filters | Yes |
| Refund Processing | Yes |
| Dashboard with Sales Overview and Low Stock Alerts | Yes |
| Settings Page (store info, VAT, peripherals) | Yes |
| Dark and Light Mode | Yes |
| Multi-staff Login (PIN and Password) | Yes |
| Deployment on Vercel (free hosting) | Yes |
| Database on Supabase (free tier) | Yes |
| 1-hour Training Session | Yes |
| 1-week Follow-up Support | Yes |
| This Documentation | Yes |

&nbsp;

### Why This Price?

This is a **custom-built** system made specifically for your store. It is not a generic app from the internet.

Here is a breakdown of the work:

| Phase | Hours Spent |
|---|---|
| Design and layout | ~30 hours |
| Login and security | ~6 hours |
| Dashboard | ~10 hours |
| POS terminal | ~25 hours |
| Products module | ~30 hours |
| Transactions module | ~20 hours |
| Settings page | ~8 hours |
| Dark mode, sidebar, modals | ~10 hours |
| Testing and bug fixes | ~10 hours |
| **Total** | **~149 hours** |

This is roughly **4 weeks of development work**.

&nbsp;

### Per-Hour Rate

| Total Price | Total Hours | Per-Hour Rate |
|---|---|---|
| ₱17,000 | ~149 hrs | ≈ ₱114/hr |
| ₱19,000 | ~149 hrs | ≈ ₱128/hr |

> This is a heavily discounted rate. The standard rate for a custom web system in the Philippines is **₱300 – ₱500 per hour**. At market rate, this project would cost **₱44,700 – ₱74,500**.
>
> The ₱17,000 – ₱19,000 price is a **starter package** — ideal for a small store that wants a real system without a large upfront cost.

&nbsp;

### Hosting Cost — ₱0/month to Start

| Platform | Plan | Monthly Cost |
|---|---|---|
| **Vercel** | Hobby (Free) | ₱0 |
| **Supabase** | Free Tier | ₱0 |

No server rental. No subscription. The store owner does not pay anything to keep it online as long as usage stays within the free limits.

> If the store grows, upgrading is always available. Supabase Pro starts at around ₱1,400/month. Vercel Pro starts at around ₱1,100/month. But for a store with 6–8 staff, the free tier will last a long time.

&nbsp;

### Payment Terms

| Term | Details |
|---|---|
| **Down payment** | 50% upon agreement |
| **Final payment** | 50% upon handoff and training |
| **Revisions** | 2 rounds of minor revisions included |
| **Extra features** | Quoted separately at ₱400–₱500/hour |

&nbsp;

---

*Document prepared by Mark Jordan Ugtong — June 23, 2026*

*Jorgy POS System — Version 10.2-alpha*
