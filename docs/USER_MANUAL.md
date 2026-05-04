# AquaBill — User manual (SSUWC)

**Audience:** End users (billing staff, cashiers, meter readers, customer care, HR assistants).  
**Note:** Your organisation assigns **department** and **role**; screens differ slightly. Screenshot placeholders are included where visuals help training.

---

## 1. Login and logout

1. Open the application URL provided by IT (for example `https://…`).
2. On the **Login** page, enter your **email** and **password**.

   [SCREENSHOT: Login page]

3. If your account requires it, complete **email verification** when prompted.
4. To **log out**, use the logout control in the application header/sidebar (same pattern as your organisation’s other internal tools).

**Forgot password:** Use **Forgot password** on the guest pages if enabled (`/forgot-password`).

---

## 2. Dashboard

After login, you are sent to `/dashboard`. The system **redirects** many users to a department home (Admin, Finance, Ledger, HR, Customer Care), depending on your profile.

[SCREENSHOT: Dashboard or department landing page]

If you land on a generic dashboard, use the **sidebar** to open your work area.

---

## 3. Customer management

**List customers:** **Customers** in the sidebar (if visible) → customer list. You can filter (e.g. by zone, where the page supports it).

**Create a customer:** **Customers** → create. Enter account details, zone, tariff, address, and other required fields.

[SCREENSHOT: Customer create form]

**View a customer:** Open a customer to see details, **meters**, **readings**, **bills**, **payments**, and **service charges** (where your role allows).

**Edit:** Use edit from the customer record when available.

**Disconnection / reconnection:** On the customer profile, use the disconnection workflow (notify, disconnect, reconnect) if your process allows it.

> **Partially implemented:** Some sidebar links (e.g. “Complaints”, “Tickets” for Customer Care) are placeholders and do not open features yet.

---

## 4. Meter readings

**List readings:** **Meter Readings** (Ledger/admin-style menus) → readings index.

**Record a reading:** Create a new reading with reading date, values, and notes as required. Readings are used to **generate bills** automatically.

**View reading:** Open a single reading record.

**Export:** Where **Export** is available (`readings/export`), use it to download data for audit or Excel work.

[SCREENSHOT: Readings list and new reading form]

---

## 5. Billing

**Bills list:** **Bills** → list of bills (status, balances).

**Bill detail:** Open a bill to see charges and **record a payment** (amount, date, method, reference).

[SCREENSHOT: Bill show page with payment form]

**Print:** Use **print** on a bill or **bulk print** / **printing list** where your menu includes these routes.

**Overdue:** Open **overdue bills** to focus on accounts in arrears (route: overdue bills index).

---

## 6. Payments

- **On a bill:** From the bill detail page, submit a **payment** (cash, bank, mobile money, or cheque with optional reference).
- **Service charges:** Open **Service charges**; confirm payment on a charge when the workflow requires it.

[SCREENSHOT: Payment recording on bill]

---

## 7. Reports

- **Revenue report:** Menu item **Revenue** or **Reports → revenue** — filter by date range and search; review summary, chart, and table.
- **Water usage report:** **Reports → water usage** — consumption totals, by zone, daily trend, top consumers.

[SCREENSHOT: Revenue report]

[SCREENSHOT: Water usage report]

---

## 8. HR module (HR department users)

**HR home:** Summaries for staff counts, leave, attendance, documents, payroll highlight, and training metrics.

[SCREENSHOT: HR dashboard]

**Departments (HR org units):** List and create **HR departments** (internal departments, not Laravel “departments” table — see technical doc).

**Staff:** List staff, **create** new staff, open **staff profile** (history panels for attendance, leave, training, payroll lines, documents).

---

## 9. Attendance

**Attendance** shows records for a selected **date** (read-only list in current implementation).

[SCREENSHOT: HR attendance page]

> **Partially implemented:** There are **no** web routes in the codebase for submitting new attendance rows from this screen; data may be loaded from the database only.

---

## 10. Leave

**Leave** shows **leave types** and the latest **leave requests** with a status filter.

[SCREENSHOT: HR leave page]

> **Partially implemented:** No web routes for creating or approving leave from the UI were found; approval fields exist in the database for future use.

---

## 11. Payroll

**Payroll** lists **payroll periods** (name, date range, status).

[SCREENSHOT: HR payroll periods]

> **Partially implemented:** The page explains that **generation flows** will attach later; no payroll generation buttons were found in routes.

---

## 12. Staff documents

**Documents** highlights **expiring** staff documents (next 30 days).

[SCREENSHOT: HR documents expiry list]

---

## 13. Training management

**Training programs:** List, create, edit, view programs; add **participants** and upload **documents** per program.

**Training reports:** Filtered list of programs with cost totals.

[SCREENSHOT: Training programs index]

[SCREENSHOT: Training program detail with participants]

---

## 14. Tariffs and zones (where visible)

- **Tariffs:** View tariffs; only **admin** department users can create/update/delete tariffs (per routes).
- **Zones:** Create/list zones where your menu includes **Zones**.

[SCREENSHOT: Tariffs]

---

## 15. Settings (your own account)

- **Profile:** `settings/profile` — update profile or delete account per policy.
- **Password:** `settings/password` — change password.
- **Appearance:** theme preference where enabled.

---

## Needs confirmation from SSUWC

- Which **registrations** are allowed on production (route exists; org policy may disable).
- Official **support channel** for locked accounts (not defined in code).
