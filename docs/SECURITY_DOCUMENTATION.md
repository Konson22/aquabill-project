# AquaBill — Security documentation

**Audience:** IT administrators and SSUWC management.

---

## Authentication

| Layer | Mechanism |
|-------|-----------|
| Web UI | Laravel session guard; login `POST /login`; logout `POST /logout`; **verified** middleware on main app group. |
| API | Laravel Sanctum **personal access tokens**; `POST /api/login` returns Bearer token. |

Passwords are **hashed** in the `User` model (`casts` password → `hashed`).

---

## Role-based access control (RBAC)

### Data model

- **Roles** belong to a **department** record (`roles.department_id`).
- **Users** attach to **roles** via `user_roles`.
- **Permissions** attach to **roles** via `role_permissions`.
- **PermissionSeeder** defines names such as `manage_users`, `view_bill`, `manage_training_programs`, etc.

### Enforcement in HTTP layer

- **Primary gate:** `CheckDepartment` middleware compares `auth.user()->department->name` to a literal (`admin`, `finance`, `hr`, …).
- **Permissions:** **Not checked** on web routes in the current `routes/web.php` review — seeds prepare for future policy/middleware.
- **RoleMiddleware:** Registered as `role` alias but **not applied** to routes; implementation references `$user->role->code` while `User` exposes **`roles()`** many-to-many — **do not use** until refactored.

**Implication:** Access control is **coarse** (department-based). User **roles** in the database do **not** automatically restrict actions at the HTTP layer today.

---

## Department isolation

Users only reach `/admin/*`, `/hr/*`, etc. if their **department name** matches. Cross-department URLs return **403** with message *Unauthorized access to this department dashboard.*

---

## API security

- Protected API routes use `auth:sanctum`.
- **Risk:** `GET /api/test` invokes customer listing **without** authentication — **remove or protect** before production.
- Tokens: stored in `personal_access_tokens`; logout deletes all tokens for the user.

---

## Data protection

- **Transport:** HTTPS recommended for all environments handling production data.
- **Storage:** Uploaded reading images and HR/training documents live under `storage/`; filesystem permissions should restrict OS-level access.
- **PII:** Customer and staff tables hold names, phones, addresses, bank details — treat DB backups as **sensitive**.

---

## Document and file access

- Files served via `Storage::disk('public')` and `storage:link` — web server must not expose `storage/app` directly without Laravel routing if additional auth is required for downloads (currently direct file paths may be guessable if URLs leak — **harden** if needed).

---

## Backup security

- Encrypt backup dumps at rest; restrict restore permissions to authorised DBAs.

---

## Recommended improvements

1. **Apply permission checks** (gates/policies) aligned with `PermissionSeeder` for bills, payments, HR mutations.
2. **Remove** hard-coded super-user email from `app-sidebar.jsx`.
3. **Fix or remove** `RoleMiddleware`; prefer Spatie or consistent custom logic — **note:** `spatie/laravel-permission` is in `composer.json` but **unused**; either integrate or remove dependency.
4. **Add `users.zone_id`** if API zone scoping is required, or stop returning it from `AuthController`.
5. **Secure `/api/test`**; trim `apiResource` routes to implemented actions.
6. **Rate limiting** on `POST /api/login` and reading endpoints (configure in `bootstrap/app.php` or route groups).
7. **Audit log** table for payment and tariff changes (not present — recommended for compliance).

---

## Password and account hygiene

- Enforce organisation password policy via Laravel `Password::defaults()` on admin user creation.
- Disable open **registration** on production if not required (`routes/auth.php`).
