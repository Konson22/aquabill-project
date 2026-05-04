# AquaBill — Operations & maintenance guide

**Audience:** SSUWC IT team after handover.

---

## Daily operations

| Task | Action |
|------|--------|
| Verify application | Open `/up` (Laravel health route) or manual login check |
| Monitor errors | Review `storage/logs/laravel.log` (rotate via logrotate or hosting provider) |
| Queue workers | If queues enabled later, ensure **supervisor** or systemd keeps `queue:work` alive |

---

## User management

- **Web UI:** Admin department users access **`/admin/users`** for list/create/update/deactivate patterns implemented in `Admin\UserController`.
- **Roles:** Role assignments use **`user_roles`** pivot; seeds define finance/ledger/hr/customer_care role sets.
- **Password resets:** Users follow `/forgot-password` flow if mail is configured.

[SCREENSHOT: Admin users list]

---

## Backup procedure

1. **Database:** Scheduled dump (nightly minimum); retain per retention policy.
2. **Files:** Backup `storage/app` (includes `public` disk uploads under `storage/app/public`).
3. **Configuration:** Secure copy of `.env` (not in git).

---

## Restore procedure

1. Restore database dump to clean schema or `migrate:fresh` then restore data-only if appropriate.
2. Restore file backup into matching `storage/` paths.
3. Run `php artisan storage:link` if new server.
4. Clear caches:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

---

## Monitoring

- **HTTP:** uptime checks on `/` or `/login`.
- **Logs:** Watch for repeated `API login failed`, `Reading API` warnings, 500 spikes.
- **Disk:** `storage/logs` and uploaded readings grow over time.

---

## Troubleshooting common issues

| Issue | Likely cause |
|-------|----------------|
| Cannot log in | Wrong department seed, inactive user, mail verification pending |
| 403 on HR routes | User’s `departments.name` is not `hr` |
| Bills not generating | No unbilled reading; tariff missing on customer; see technical doc on default tariff query |
| API readings rejected | Current reading ≤ last reading |
| Duplicate bill number | Unique `bill_no` conflict — mobile app sent duplicate `bill_no` |

---

## Updating the system

1. Put site in maintenance if needed: `php artisan down` (with secret token in Laravel 12 style if configured).
2. Pull new code; run `composer install`, `npm ci`, `npm run build`.
3. Run `php artisan migrate --force`.
4. Clear caches (see restore section).
5. `php artisan up`.

Always take a **backup before migrations**.

---

## Managing uploaded files

- Reading photos: `storage/app/public/readings/` (served via `public/storage` symlink).
- Staff/training documents: paths stored in DB — deleting rows should be paired with **file deletion** if policy requires (implement carefully to avoid orphans).

---

## Security practices

- Enforce **HTTPS**; never run production with `APP_DEBUG=true`.
- Rotate Sanctum tokens if a device is lost (revoke via DB or user logout).
- Restrict **`/api/test`** if still present.
- Follow [SECURITY_DOCUMENTATION.md](SECURITY_DOCUMENTATION.md).

---

## Handover checklist

- [ ] `.env` documented and secured
- [ ] Database backups tested restore once
- [ ] Admin account ownership transferred
- [ ] SSL certificate renewal owner assigned
- [ ] Log location and retention agreed
- [ ] Incident escalation path defined (SSUWC internal)
