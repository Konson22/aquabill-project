# AquaBill — Reports & analytics guide

**Audience:** SSUWC management and reporting officers.

---

## Report inventory (from routes & controllers)

| Report | Route name | Controller | Page |
|--------|------------|------------|------|
| **Revenue** | `reports.revenue` | `ReportController@revenue` | `resources/js/pages/reports/revenue.jsx` |
| **Water usage** | `reports.water-usage` | `ReportController@waterUsage` | `resources/js/pages/reports/water-usage.jsx` |
| **Training (program costs)** | `hr.training.reports.index` | `TrainingReportController@index` | `resources/js/pages/hr/training/reports/index.jsx` |
| **HR summary (“reports”)** | `hr.reports.index` | `HRController@reports` | `resources/js/pages/hr/reports/index.jsx` (placeholder-style hub) |

---

## 1. Revenue report

**Purpose:** Understand billed amounts, money collected, outstanding balances, and payment activity over time for **bills** and **paid service charges**.

**Navigation:** Finance-focused menus include **Revenue**; route `/reports/revenue`.

### Filters (query parameters)

| Filter | Effect |
|--------|--------|
| `search` | Customer **name** or **account number** (partial match on related customer). |
| `from` | Include bills with `created_at` **date** ≥ `from`. |
| `to` | Include bills with `created_at` **date** ≤ `to`. |

Service charges in the revenue aggregation use **`issued_date`** for the same `from`/`to` range.

### Metrics shown (summary)

- **Total revenue** — sum of bill `current_charge` in scope.
- **Fixed charge revenue** — sum of bill `fixed_charge` (tariff fixed fee snapshot).
- **Total paid** — bill `amount_paid` sums **plus** sum of **paid** service charges in scope.
- **Total outstanding** — unpaid bill balances **plus** unpaid service charge amounts in scope.
- **Payments count** — bills with amount paid > 0 plus count of paid charges in scope.

### Visuals and table

- **Chart:** Daily combined bill charges + charge amounts per day in the chart window (defaults if no dates: last 30 days to today).
- **Table:** Paginated **recent bills** with reference `BILL-{zero-padded id}`.

### Export

- **No server-side CSV export** in `ReportController@revenue` — screen capture or future enhancement.

[SCREENSHOT: Revenue report with filters]

---

## 2. Water usage report

**Purpose:** Analyse **consumption** from bills over a period: totals, averages, zone comparison, daily trend, top customers.

**Route:** `/reports/water-usage`.

### Filters

| Filter | Effect |
|--------|--------|
| `from` | Bills `created_at` date ≥ `from` |
| `to` | Bills `created_at` date ≤ `to` |

### Outputs

- **Summary:** Total consumption, average per bill, bill count.
- **By zone:** Sum of `consumption` on bills linked to customers in each zone (`Zone::withSum`).
- **Daily trend:** Sum of `consumption` per calendar day in chart range.
- **Top consumers:** Top 10 customers by summed consumption.

[SCREENSHOT: Water usage report]

---

## 3. Training reports (HR)

**Purpose:** Filter training programs, show participant counts, and **total training cost** for the calendar year (service-calculated).

**Route:** `/hr/training/reports`.

### Filters

Per `TrainingReportController`: `search`, `status`, `date_from`, `date_to` (forwarded to `TrainingReportService::programsQuery`).

### Export

- Pagination only in current implementation.

[SCREENSHOT: HR training reports]

---

## 4. HR “Reports” page

**Route:** `/hr/reports` — Inertia `hr/reports/index`. **Confirm** in UI whether this is a static hub or links to other HR exports.

---

## How reports support decisions

| Decision | Report |
|----------|--------|
| Cash vs arrears | Revenue (paid vs outstanding) |
| Seasonal demand | Water usage daily trend |
| Zone investment | Water usage by zone |
| Training budget | Training reports (cost, filters) |

---

## Recommended improvements

- Add **CSV/Excel export** for revenue and water usage with filter reuse.
- Align date semantics if finance uses **billing period** rather than `created_at` (would require product decision and schema clarity).
