# AquaBill — Administrator manual

**Audience:** System administrators (typically **admin** department users in this application).

**Access model today:** Most admin features are protected by **department** middleware (`user.department.name === 'admin'`) for specific routes, not by per-permission HTTP checks. Seeded **permissions** exist for future use — see [SECURITY_DOCUMENTATION.md](SECURITY_DOCUMENTATION.md).

---

## Managing users and roles

- Navigate to **`/admin/users`** (route name: `users.index` within admin group).
- **Create** users with name, email, password, optional **department**, and **roles** (pivot to `user_roles`).
- **Edit** and view user detail (including count of **meter readings** recorded for field staff).

[SCREENSHOT: Admin user list]

[SCREENSHOT: Create or edit user form]

- **Roles page:** `GET /admin/roles` renders Inertia `admin/roles/index` — static page shell; **confirm** whether role editing UI is complete in your build.

> **Needs confirmation:** Whether production disables **self-service registration** (`/register`).

---

## System settings

- **Settings index:** `GET /admin/settings` → `admin/setting/index` — placeholder hub.
- **Service charge types:** CRUD under **`/admin/settings/service-charges`** (`admin.service-charges.*`) — defines reusable fee types (name, code, amount).

[SCREENSHOT: Admin settings / service charge types]

---

## Departments (organizational)

There are two concepts:

1. **Application departments** (`departments` table): admin, finance, ledger, hr, customer_care — drive middleware and dashboards.
2. **HR organisational departments** (`hr_departments`): managed under **HR** at `/hr/departments` (not under `/admin/departments`).

**Route `GET /admin/departments`** currently renders `admin/index` (naming quirk in `routes/web.php`).

[SCREENSHOT: HR departments if admin needs to see HR org chart]

---

## Tariffs and zones

- **Tariffs:** `GET /tariffs` (index), `GET /tariffs/{id}` (show). **Create/update/delete** require **`department:admin`** middleware on `POST /tariffs`, `PUT/PATCH /tariffs/{tariff}`, `DELETE /tariffs/{tariff}`.
- **Zones:** `GET/POST /zones` — store new zones (metering areas).

[SCREENSHOT: Tariff management]

---

## HR settings (related)

HR departments, leave types, document types are seeded (`HrDepartmentSeeder`, `LeaveTypeSeeder`, `DocumentTypeSeeder`). **Runtime CRUD** for leave/document types is **not** exposed as dedicated admin routes in `web.php` — changes may require seed updates or future screens.

> **Partially implemented:** Central “HR settings” UI for leave types is **not** present as a dedicated admin module.

---

## Reports

- Administrators with menu access can open **Revenue** and **Water usage** reports like other departments — see [REPORTS_ANALYTICS_GUIDE.md](REPORTS_ANALYTICS_GUIDE.md).

---

## Exporting data

- **Meter readings export:** `GET /readings/export` — available when route is linked from UI (Meter Reading area).
- **Report tables:** UI pagination; **no dedicated CSV export** for revenue report was verified in controller output (Inertia props only). Add export in application code if required.

> **Recommended improvement:** Standard CSV/PDF export for finance sign-off.

---

## Audit and security checks

- Review **Sanctum tokens** in `personal_access_tokens` periodically for stale devices.
- Review **`storage/logs/laravel.log`** for failed API logins.
- Ensure **`GET /api/test`** is disabled in production (see API documentation).
- Confirm **HTTPS** and **secure cookies** in production.

Periodic tasks:

| Frequency | Task |
|-----------|------|
| Monthly | Review inactive users (`users.status`) |
| Quarterly | Permission/role alignment if UI for roles is added |
| After incidents | Rotate affected user passwords |

---

## Sidebar “super admin” behaviour

The React sidebar treats one hard-coded **email** as seeing all nav items. **Recommended:** Remove hard-coded email for production and rely on department + permissions.
