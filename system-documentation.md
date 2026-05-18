# AquaBill — System Documentation

## Overview

AquaBill is an enterprise water-billing and utility-management system built for the South Sudan Urban Water Corporation (SSUWC). It handles the full lifecycle of water distribution: customer registration, meter management, reading capture, billing, payments, disconnections, tariff administration, service charges, geographic information (GIS), human-resource management, and staff training.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Laravel | 12 |
| PHP | | 8.2 |
| Frontend | React | 19 |
| SPA Bridge | Inertia.js | 2 |
| CSS Framework | Tailwind CSS | 4 |
| UI Components | Radix UI (shadcn/ui) | — |
| Charts | Recharts | 3.8 |
| Tables | TanStack React Table | 8 |
| Maps | Leaflet + React-Leaflet | 5 |
| Icons | Lucide React | — |
| Routing (JS) | Ziggy | 2 |
| Auth / Permissions | Spatie Laravel Permission | 6 |
| Excel Export | Maatwebsite/Excel | 3.1 |
| API Auth | Laravel Sanctum | 4 |
| Testing | Pest | 3 |
| Code Style | Laravel Pint | 1 |
| Build | Vite | 6 |

---

## Application Modules

### 1. Dashboard
Central overview of the system with key metrics.

### 2. Customer Management
- Customer registration and profile management
- Meter assignment and meter replacement
- Service charges per customer
- Disconnection/reconnection workflow (notify, disconnect, reconnect, cancel notice)
- Print disconnection notifications

### 3. Meter Management
- Meter CRUD (index, store, update)
- Meter replacement history
- Meter readings (index, store, show, edit, update, export)

### 4. Billing
- Automated bill generation from meter readings
- Bill listing with filters and export
- Individual bill print and bulk print
- Printing list and overdue bills view
- Bill payments (store on a per-bill basis)

### 5. Tariff Administration
- Tariff CRUD (index, show, store, update, destroy)
- Admin-only creation and modification

### 6. Service Charges
- Service charge types management (admin)
- Per-customer service charges
- Payment confirmation workflow

### 7. Zones
- Zone management for geographic organization of customers and infrastructure

### 8. GIS (Geographic Information System)
- GIS Dashboard
- Interactive map view
- Water point types and water points CRUD
- Pipes and valves CRUD
- API endpoints for map data

### 9. Finance Department

#### 9a. Finance Reports
- Financial reports listing
- Report export
- Monthly reports

#### 9b. Finance Dashboard
- Inertia page `finance/dashboard` with revenue, bill status, and chart summaries (`FinanceController`)

### 10. Human Resources (HR)
- HR Dashboard
- Department management
- Staff management (CRUD)
- Attendance tracking
- Leave management
- Payroll
- Staff documents
- HR Reports

### 11. Training Management
- Training programs CRUD
- Training participants (add, update, remove)
- Training documents upload
- Training reports

### 12. Reports
- Revenue reports with export
- Water usage reports

### 13. Admin
- User management (CRUD)
- Roles management
- Department listing
- System settings
- Service charge type configuration

---

## Permissions

`manage_users`, `create_bill`, `view_bill`, `record_payment`, `view_reports`, `handle_complaints`, `view_hr_dashboard`, `manage_departments`, `manage_staff`, `manage_attendance`, `manage_leave`, `approve_leave`, `manage_payroll`, `manage_staff_documents`, `view_hr_reports`, `view_training`, `manage_training_programs`, `manage_training_participants`, `manage_training_documents`, `view_training_reports`

---

## Department-Based Navigation

The sidebar dynamically renders based on the authenticated user's department:

| Department | Menu Items |
|-----------|------------|
| **System Admin** | Dashboard, Revenue, Water Usage, Customers, Meter Readings, Bills, Service Charges, Tariffs, Meters, Zones, GIS |
| **Admin** | Dashboard, Customers, Zones, GIS, Tariffs, Bills, Service Charges, System Logs, System Settings |
| **Finance** | Dashboard, Tariffs, Reports, Revenue, Bills, Service Charges |
| **Ledger** | Dashboard, Zones, GIS, Meters, Meter Readings, Billing Cycles |
| **HR** | Dashboard, HR Home, Departments, Staff, Attendance, Leave, Payroll, Documents, Training, Training Reports, Reports |
| **Customer Care** | Dashboard, Customers, Complaints, Tickets |
| **Distribution** | Dashboard, Zones, GIS |

---

## Seeders

Core demo and reference data are registered in `database/seeders/DatabaseSeeder.php` (departments, users, zones, tariffs, customers, GIS samples, and related seeders).

---

## Testing

Pest feature tests live under `tests/Feature/`. Finance UI and aggregates are covered in `tests/Feature/Finance/FinanceDashboardTest.php`.

---

## Route Structure

Finance routes are grouped under `/finance/*` with middleware: `auth`, `verified`, `department:finance`.

Key route patterns:

- `GET /finance` — Finance dashboard (`FinanceController@index`)
- `GET /finance/reports` — Redirects to `GET /reports/revenue` (unified revenue & collections report)
- `GET /finance/reports/export` — Finance collections CSV export (`FinanceReportService`)

---

## Currency

Default currency: **SSP** (South Sudanese Pound). All monetary columns use `decimal(18, 2)`.
