# AquaBill — Training manual (workshop edition)

**Audience:** Trainers and workshop participants supporting SSUWC.  
**Companion:** [USER_MANUAL.md](USER_MANUAL.md) for step-by-step clicks.

---

## Training objectives

By the end of the workshop, participants should be able to:

1. Sign in and reach the correct **department** workspace.
2. Register or look up a **customer**, assign **zone** and **tariff**, and understand **meter** linkage.
3. Enter a **meter reading** and explain how a **bill** is created.
4. Record a **payment** on a bill and locate **overdue** accounts.
5. Run **revenue** and **water usage** reports with filters.
6. (HR track) Navigate **staff**, **training programs**, and read-only **attendance/leave/payroll** views.

---

## Suggested agenda (1–2 days)

| Session | Duration | Topics |
|---------|----------|--------|
| Opening | 30 min | SSUWC context, AquaBill scope, login |
| Core billing | 2–3 h | Customers, meters, readings, bills, payments |
| Charges & tariffs | 1 h | Service charges, tariff admin (admin users) |
| Reports | 1 h | Revenue, water usage |
| HR track | 2 h | HR dashboard, departments, staff, training |
| API overview (IT) | 45 min | Mobile login, readings API (optional module) |
| Wrap-up | 30 min | Assessment, Q&A, support paths |

---

## Module-by-module explanation

### Module A — Access and navigation

- **Department routing:** After login, users may be redirected to Admin, Finance, Ledger, HR, or Customer Care dashboards.
- **Sidebar:** Items depend on **department** (and a special-case admin email in code — trainers should use normal admin accounts for realistic demos).

**Exercise A1:** Log in as roles from two departments and compare visible menu items.

---

### Module B — Customers and meters

- Each **customer** has **account number**, **zone**, **tariff**, and address fields.
- **Meters** belong to customers; replacing a meter uses the dedicated action.

**Exercise B1:** Create a test customer (if allowed in training DB) and attach meter details.

**Scenario:** “New residential connection in Zone X” — capture plot, tariff, and phone.

---

### Module C — Readings and billing

- A **reading** stores previous/current values and consumption.
- **BillService** logic rolls prior unpaid balances into the new bill and marks older open bills **forwarded** when appropriate.

**Exercise C1:** Enter a reading higher than the previous; open the resulting bill.

> If bill generation fails with “No active tariff”, trainers should verify customer tariff assignment — see technical notes on default tariff query vs database.

---

### Module D — Payments and service charges

- Payments update **amount paid**, **balance**, and **status** (unpaid / partial / paid).
- **Service charges** are separate from consumption billing; types are maintained under admin **service charge types**.

**Exercise D1:** Record a partial payment, then complete the bill.

---

### Module E — Reports

- **Revenue:** ties to bill creation dates and paid charges in scope; explain filters.
- **Water usage:** ties bill **consumption** to zones and customers.

**Exercise E1:** Run revenue for last month; export or screenshot policy per SSUWC.

---

### Module F — HR and training

- **Staff** records are independent of Laravel **User** accounts (HR staff entity).
- **Training:** CRUD programs, enroll participants, attach files.

**Exercise F1:** Create a training program and enroll one staff member.

> **Partially implemented:** Attendance entry, leave approval, and payroll generation UIs are **not** wired to POST routes in the current repository — demo as “visibility only” unless IT adds workflows.

---

## Example scenarios (facilitator script)

| # | Scenario | Expected outcome |
|---|----------|------------------|
| 1 | Customer disputes balance | Show bill list, payment history, reading history on customer |
| 2 | Field team uploads reading via API | Token login, POST reading, verify bill in web UI |
| 3 | Month-end revenue | Revenue report with date range matching finance calendar |

---

## Assessment checklist

Use this checklist to confirm readiness (tick when satisfied):

- [ ] Can log in and find **Bills** and **Customers** without assistance.
- [ ] Can enter a reading and **find the new bill**.
- [ ] Can record a **payment** and interpret **status**.
- [ ] Can open **revenue report** and set **from/to** dates.
- [ ] (HR) Can create **staff** and open **staff profile**.
- [ ] (HR) Can create a **training program** and add a **participant**.
- [ ] Knows who to contact for **locked accounts** (SSUWC policy).

**Trainer notes:** Keep a **training database** separate from production; never train on live customer PII without authorisation.
