# AquaBill — Deployment guide

**Audience:** IT staff preparing SSUWC or staging servers.

---

## Server requirements

| Component | Suggested |
|-----------|-----------|
| PHP | 8.2+ (see `composer.json` `^8.2`) |
| Extensions | `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath` (as required by Laravel 12) |
| Web server | Nginx or Apache with `public/` as document root |
| Database | MySQL 8+ or MariaDB 10.4+ (production); SQLite acceptable for small trials only |
| Node.js | LTS (for `npm run build` on the server or in CI) |
| Composer | 2.x |

---

## Environment

1. Clone the repository to the application root.
2. Copy **`.env.example`** to **`.env`**.
3. Generate key: `php artisan key:generate`.

### Core `.env` variables

| Variable | Purpose |
|----------|---------|
| `APP_NAME` | Display name (set to AquaBill / SSUWC as desired). |
| `APP_ENV` | `production` in production. |
| `APP_DEBUG` | **`false`** in production. |
| `APP_URL` | Full base URL with scheme (`https://billing.ssuwc.example`). |
| `DB_*` | Connection for MySQL/MariaDB (`DB_CONNECTION=mysql`, host, port, database, username, password). |
| `SESSION_DRIVER` | Often `database` or `redis` for multi-server (matches codebase default suggestion). |
| `CACHE_STORE` | `database` or `redis`. |
| `QUEUE_CONNECTION` | `database` or `redis` if async jobs are used. |
| `MAIL_*` | For password reset and notifications. |
| `SANCTUM_STATEFUL_DOMAINS` | If using cookie-based SPA on a separate host; set for your domain. |

> The stock **`.env.example`** uses `DB_CONNECTION=sqlite` — **override for production**.

---

## Installation steps

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

For development (not production):

```bash
composer install
npm install
npm run dev
# or: composer run dev
```

---

## Database setup

```bash
php artisan migrate --force
php artisan db:seed --force
```

> Review `DatabaseSeeder` before production: it seeds **departments, permissions, roles, users (if seeder creates them), zones, tariffs, customers** — use only what is safe for the target environment.

---

## Storage and uploads

- **Public disk** used for reading images (`storage/app/public/readings`):
  ```bash
  php artisan storage:link
  ```
- Ensure `storage/` and `bootstrap/cache/` are **writable** by the PHP user.

---

## Web server

### Nginx (outline)

- Root: `{project}/public`
- `try_files $uri $uri/ /index.php?$query_string`
- Pass PHP to PHP-FPM (`fastcgi_pass`).
- Client body size adequate for image uploads on `/api/readings`.

### Apache

- `DocumentRoot` → `public`
- Allow `.htaccess` overrides if using Laravel’s default Apache config.

---

## Queue and scheduler

- **`routes/console.php`** contains only the sample `inspire` command — **no scheduled jobs** are defined in this repo snapshot.
- If you later add jobs, run a **queue worker**:
  ```bash
  php artisan queue:work
  ```
- If you add `Schedule::` entries in `bootstrap/app.php` or `routes/console.php`, add a **cron** entry:
  ```cron
  * * * * * cd /path-to-app && php artisan schedule:run >> /dev/null 2>&1
  ```

---

## HTTPS

- Terminate TLS at the load balancer or Nginx; set `APP_URL` to `https://`.

---

## Backup notes

- **Database:** nightly logical dump (mysqldump or managed backup).
- **Files:** include `storage/app` (uploaded documents and reading photos).
- **`.env`:** store secrets in a password manager; do not commit.

---

## Troubleshooting

| Symptom | Checks |
|---------|--------|
| 500 after deploy | `storage/logs/laravel.log`, `APP_DEBUG` temporarily true on staging only |
| Assets missing | Run `npm run build`; clear CDN cache |
| Vite manifest error | Run `npm run build` or `npm run dev` |
| API 401 | Token header, `personal_access_tokens` table migrated |
| Permission denied storage | `chmod` / ownership on `storage`, `bootstrap/cache` |

---

## Needs confirmation

- SSUWC **production hostnames** and **TLS certificates**.
- Whether **seeded users** are replaced by LDAP/SSO in future (not in current codebase).
