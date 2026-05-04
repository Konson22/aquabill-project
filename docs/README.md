# AquaBill documentation index

Documentation for the **AquaBill Billing System** in support of **South Sudan Urban Water Corporation (SSUWC)** operations.

## Audience guide

| Document | Primary audience |
|----------|------------------|
| [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) | Management, donors (e.g. JICA), stakeholders |
| [USER_MANUAL.md](USER_MANUAL.md) | Day-to-day operational staff |
| [TRAINING_MANUAL.md](TRAINING_MANUAL.md) | Trainers and workshop participants |
| [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md) | Developers and IT |
| [DATABASE_DOCUMENTATION.md](DATABASE_DOCUMENTATION.md) | Developers and database administrators |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Mobile/API integrators |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Hosting and installation |
| [OPERATIONS_MAINTENANCE_GUIDE.md](OPERATIONS_MAINTENANCE_GUIDE.md) | SSUWC IT handover |
| [ADMIN_MANUAL.md](ADMIN_MANUAL.md) | System administrators |
| [REPORTS_ANALYTICS_GUIDE.md](REPORTS_ANALYTICS_GUIDE.md) | Management and reporting officers |
| [SECURITY_DOCUMENTATION.md](SECURITY_DOCUMENTATION.md) | IT, administrators, management |
| [CHANGELOG.md](CHANGELOG.md) | Project team releases |

## How these documents were produced

Content is derived from the **current repository** (routes, controllers, models, migrations, seeders, Inertia/React pages, and configuration). Sections marked **Needs confirmation** or **Partially implemented** flag gaps between documentation intent and code.

## Maintenance

Update this index when adding or renaming files. Keep `CHANGELOG.md` aligned with tagged releases.

---

## Summary of documentation package

The following files were created under `docs/`:

- `README.md` (this index)
- `SYSTEM_OVERVIEW.md` — Stakeholder-oriented product summary
- `USER_MANUAL.md` — End-user procedures with screenshot placeholders
- `TRAINING_MANUAL.md` — Workshop agenda, exercises, assessment
- `TECHNICAL_DOCUMENTATION.md` — Architecture, folders, services, known code gaps
- `DATABASE_DOCUMENTATION.md` — Tables, keys, ERD, schema notes
- `API_DOCUMENTATION.md` — Sanctum API endpoints and payloads
- `DEPLOYMENT_GUIDE.md` — Install, `.env`, migrations, web server
- `OPERATIONS_MAINTENANCE_GUIDE.md` — Backup, restore, updates
- `ADMIN_MANUAL.md` — Admin department tasks
- `REPORTS_ANALYTICS_GUIDE.md` — Revenue, water usage, training reports
- `SECURITY_DOCUMENTATION.md` — Auth, RBAC limits, API risks
- `CHANGELOG.md` — Template for releases

---

## Missing or unclear areas found in the codebase

| Topic | Finding |
|-------|---------|
| Fine-grained permissions | Seeded `permissions` are **not** enforced on web routes; **department** middleware is the main gate. |
| `RoleMiddleware` | References `user->role->code`; **User** has `roles()` many-to-many; middleware **unused** in routes. |
| API surface | `GET /api/test` is **public**; `apiResource('customers')` exposes CRUD but **only index** exists; readings **index** likely missing. |
| User `zone_id` | API login JSON includes `zone_id`; **users** table has **no** `zone_id` column in migrations. |
| Tariffs vs `BillService` | Default tariff query uses `is_default` / `status` missing from `tariffs` migration. |
| HR workflows | Attendance, leave, payroll pages are mostly **GET-only**; no matching POST/PATCH for approvals/generation in `web.php`. |
| Sidebar | Several links point to **`#`** (placeholder). |
| Spatie package | `spatie/laravel-permission` in composer but **not used** in app code (custom RBAC instead). |
| Duplicate migrations | Two `create_bills_table` paths in git — consolidate for clarity. |

---

## Suggested next steps for documentation quality

1. **Screenshots:** Replace placeholders after UI freeze; use a consistent training tenant DB.
2. **Single source for APP_NAME:** Set `APP_NAME=AquaBill` (or SSUWC official name) in production `.env` and reflect in printed docs.
3. **API revision:** After routes are fixed, regenerate API doc section with real OpenAPI or Scribe if adopted.
4. **Permission matrix:** When enforcement is implemented, add a table mapping roles → routes.
5. **ERD:** Refresh Mermaid diagram if schema changes (especially tariffs and users).
