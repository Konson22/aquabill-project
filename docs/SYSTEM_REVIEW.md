# AquaBill — system review (UI pages)

**Client-facing orientation** (what each area does in plain language): see [`SYSTEM_ORIENTATION.md`](./SYSTEM_ORIENTATION.md).

This document is a **high-level review of the Inertia/React application surface**: what each primary page is for, how it fits the domain, and typical access (many routes are further restricted by **department** middleware or policies).

Stack reference: **Laravel 12** backend, **Inertia.js v2** with **React 19**, pages under `resources/js/pages/`.

---

## 1. How navigation works

- After login, users land on **`/dashboard`**, which resolves to different **Inertia pages** depending on **department** (see `DashboardController`).
- The sidebar (`resources/js/components/app-sidebar.jsx`) is driven by `auth.user` and department name (plus a special-case admin email in code).
- **Not every user sees every page**; absence from the menu does not mean the route is absent—always enforce authorization on the server.

---

## 2. Authentication and guest flows

| Page (Inertia) | Route (typical) | Purpose |
|----------------|-----------------|--------|
| `auth/login` | `/login` | Sign in. |
| `auth/register` | `/register` | Self-registration (if enabled in your deployment). |
| `auth/forgot-password` | `/forgot-password` | Request password reset link. |
| `auth/reset-password` | `/reset-password` | Set a new password from token. |
| `auth/verify-email` | `/verify-email` | Email verification prompt. |
| `auth/confirm-password` | `/confirm-password` | Sensitive-action password confirmation. |

---

## 3. Dashboards and department home

| Page | Route | Purpose |
|------|-------|--------|
| `dashboard` | `/dashboard` | Default home: KPI-style overview for general roles. |
| `distribution/dashboard` | `/dashboard` | **Distribution** users: department-specific dashboard. |
| `admin/dashboard` | `/admin` | **Admin** department landing (administration hub). |
| `finance/dashboard` | `/finance` | **Finance** department landing. |
| `ledger/dashboard` | `/ledger` | **Ledger** department landing (billing operations context). |
| `customer-care/dashboard` | `/customer-care` | **Customer care** landing. |
| `hr/dashboard` | `/hr` | **HR** department landing. |
| `departments/workspace` | `/water-quality`, `/water-purification`, `/stores` | Lightweight **workspace** placeholder for departments that do not yet have a full module. |

---

## 4. Customers (accounts)

| Page | Route | Purpose |
|------|-------|--------|
| `customers/index` | `GET /customers` | Searchable list; tabs or filters for customer lifecycle. |
| `customers/create` | `GET /customers/create` | Create a new customer account. |
| `customers/show` | `GET /customers/{customer}` | **360° customer view**: profile, meters, readings, bills, payments, charges (tabs / embedded components). |
| `customers/edit` | `GET /customers/{customer}/edit` | Edit customer master data. |
| `customers/disconnection-status` | `GET /customers/{customer}/disconnection-status` | Disconnection workflow status for one customer. |
| `customers/print-notification` | `GET /customers/{customer}/print-notification` | Printable disconnection notification. |
| `customers/service-charges/create` | `GET /customers/{customer}/service-charges/create` | Issue a **service charge** in context of a customer. |

Supporting **tab/presentational** modules (not full routes): `customers/tabs/*`, `customers/components/*` (bills, readings, payments, disconnection UI, etc.).

---

## 5. Meters and meter readings

| Page | Route | Purpose |
|------|-------|--------|
| `meters/index` | `GET /meters` | Meter inventory and management (linkage to customers). |
| `readings/index` | `GET /readings` | Meter reading register; capture and review cycles. |
| `readings/show` | `GET /readings/{reading}` | Single reading detail. |
| `readings/edit` | `GET /readings/{reading}/edit` | Correct or adjust a reading (per your rules). |

---

## 6. Zones and tariffs (catalog)

| Page | Route | Purpose |
|------|-------|--------|
| `zones/index` | `GET /zones` | **Supply zones** list and create (modal/pattern in `zones/components/`). |
| `tariff/index` | `GET /tariffs` | **Tariffs** list and pricing catalog. |
| `tariff/show` | `GET /tariffs/{tariff}` | Tariff detail. |

---

## 7. Bills and printing

| Page | Route | Purpose |
|------|-------|--------|
| `bills/index` | `GET /bills` | **Billing hub**: list bills, status tabs, record payments (modal), print links. |
| `bills/show` | `GET /bills/{bill}` | Single bill detail. |
| `bills/overdue-bills` | `GET /bills/overdue-bills` | Focused overdue bill list/work queue. |
| `bills/bill-printing-list` | `GET /bills/printing-list` | Queue or selection for batch printing. |
| `bills/print-single` | `GET /bills/{bill}/print` | Print layout for one bill (often opened in a new window). |
| `bills/print-multiple` | `GET /bills/bulk-print` | Print layout for multiple bills. |

Exports (not full SPA pages): `GET /bills/export` returns a download; **payment POST** uses `bills.payments.store`.

---

## 8. Service charges

| Page | Route | Purpose |
|------|-------|--------|
| `service-charges/index` | `GET /service-charges` | All service charges listing and workflows. |
| `service-charges/show` | `GET /service-charges/{service_charge}` | One charge: detail, status, **confirm payment** (modal/component). |

---

## 9. Connection management and disconnections

| Page | Route | Purpose |
|------|-------|--------|
| `connection-management/index` | `GET /disconnections` | Operations view for **disconnections** / pipeline (uses panels under `admin/components/` where applicable). |

Related **POST** routes (no dedicated page): notify, cancel notice, disconnect, reconnect on `customers/{customer}`.

---

## 10. Reports (cross-cutting analytics)

| Page | Route | Purpose |
|------|-------|--------|
| `reports/revenue` | `GET /reports/revenue` | **Primary revenue report**: bill-period summary table, payment-period finance KPIs, charts, overdue snapshot, collection filters (dates + station), stations list with deep links, CSV export via finance export route. |
| `reports/water-usage` | `GET /reports/water-usage` | Consumption and usage analytics by period/zone. |
| `reports/station-payment-report` | `GET /reports/station-payments` | **Per-station payment log**: paginated bill and service-charge payments for one collection desk, with date filters and customer search. |

**Redirects:** `GET /finance/reports` sends finance users to **`reports.revenue`** with query mapping (`pf_from` / `pf_to`).

**Components** (embedded, not routes): `reports/components/*` (charts, overdue list, revenue summary table, stations list, stat cards), `reports/Monthly-collection-summary.jsx` if used as a fragment.

**Exports:** `GET /reports/revenue/export` (Excel), `GET /finance/reports/export` (CSV collections).

---

## 11. GIS (network asset management)

| Page | Route | Purpose |
|------|-------|--------|
| `gis/dashboard` | `GET /gis` | GIS module home and entry points. |
| `gis/map` | `GET /gis/map` | Map-centric view. |
| `gis/zone-boundaries` | `GET /gis/zone-boundaries` | Draw or maintain **zone boundaries** (GeoJSON workflow). |
| `gis/water-point-types/*` | `/gis/water-point-types` | CRUD for **water point type** catalog. |
| `gis/water-points/*` | `/gis/water-points` | CRUD for **water points** on the network. |
| `gis/pipes/*` | `/gis/pipes` | CRUD for **pipes**. |
| `gis/valves/*` | `/gis/valves` | CRUD for **valves**. |

---

## 12. Admin (system configuration)

All under **`/admin`** with `department:admin` middleware unless noted.

| Page | Route | Purpose |
|------|-------|--------|
| `admin/dashboard` | `/admin` | Admin home (see §3). |
| `admin/users/index` | `GET /admin/users` | User list. |
| `admin/users/create` | `GET /admin/users/create` | Create staff user. |
| `admin/users/show` | `GET /admin/users/{user}` | User detail. |
| `admin/users/edit` | `GET /admin/users/{user}/edit` | Edit user. |
| `admin/stations/index` | `GET /admin/stations` | **Collection stations** CRUD (create modal). |
| `admin/setting/index` | `GET /admin/settings` | **Settings hub** (links to nested admin tools). |
| `admin/setting/service-charges` | `GET /admin/settings/service-charges` | **Service charge types** admin (resource). |
| `admin/roles/index` | `GET /admin/roles` | Role UI placeholder (closure route in `web.php`). |
| `admin/index` (legacy) | `GET /admin/departments` | Routed as departments index in routes file—verify in UI if still used. |

---

## 13. HR module

Under **`/hr`** with `department:hr` middleware.

| Page | Route | Purpose |
|------|-------|--------|
| `hr/departments/index` | `GET /hr/departments` | Departments directory. |
| `hr/staff/index` | `GET /hr/staff` | Staff listing. |
| `hr/staff/create` | `GET /hr/staff/create` | New staff record. |
| `hr/staff/show` | `GET /hr/staff/{staff}` | Staff profile. |
| `hr/attendance/index` | `GET /hr/attendance` | Attendance placeholder/workspace. |
| `hr/leave/index` | `GET /hr/leave` | Leave management placeholder. |
| `hr/payroll/index` | `GET /hr/payroll` | Payroll placeholder. |
| `hr/documents/index` | `GET /hr/documents` | HR documents. |
| `hr/reports/index` | `GET /hr/reports` | HR reports index. |
| `hr/training/programs/*` | `/hr/training/programs` | Training **programs** CRUD. |
| `hr/training/reports/index` | `GET /hr/training/reports` | Training reports. |

---

## 14. User settings (account)

From `routes/settings.php` (authenticated). Controllers render these Inertia names; ensure matching files exist under `resources/js/pages/settings/` (e.g. `profile.jsx`, `password.jsx`, `appearance.jsx`) so the Vite resolver can load them.

| Page (Inertia name) | Route | Purpose |
|---------------------|-------|--------|
| `settings/profile` | `GET /settings/profile` | View/update profile (`ProfileController`). |
| `settings/password` | `GET /settings/password` | Change password (`PasswordController`). |
| `settings/appearance` | `GET /settings/appearance` | Theme / appearance (`routes/settings.php` closure). |

---

## 15. Design notes for maintainers

- **Bill-period vs payment-period** on revenue: the UI separates **bill creation / reading cycle** metrics from **cash collection** metrics; filters must stay in sync with `ReportController` and `FinanceReportService`.
- **Station payments** report intentionally scopes to **one station** at a time (default first station) to match cashier desk workflows.
- **Print** routes (`bills/print-*`) are optimized for browser print, not for Inertia navigation history.
- When adding a page: register the route, return `Inertia::render('folder/file')` matching **`resources/js/pages/folder/file.jsx`**, and add navigation only where the role should discover it.

---

## 16. Document maintenance

- Update this file when you add or retire a **top-level Inertia page** or change the **primary purpose** of a module.
- Keep user-facing manuals separate; this file is a **developer/system orientation** map.

*Generated for the AquaBill project repository.*
