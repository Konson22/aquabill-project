# AquaBill — API documentation

**Base URL:** `{APP_URL}/api` (example: `http://localhost/api`).  
**Authentication:** Laravel Sanctum **Bearer token** for protected routes (`Authorization: Bearer {token}`).

---

## Authentication flow

1. `POST /api/login` with credentials → receive `access_token`.
2. Send `Authorization: Bearer {access_token}` on subsequent requests.
3. `POST /api/logout` revokes tokens for the current user.

---

## Public routes

| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| POST | `/api/login` | `Api\AuthController@login` | Obtain token. |
| GET | `/api/test` | `Api\CustomerController@index` | **Runs customer index without auth** — remove or protect in production. |

---

## Protected routes (`auth:sanctum`)

All routes below require a valid Bearer token unless noted.

| Method | Path | Controller action | Notes |
|--------|------|-------------------|-------|
| POST | `/api/logout` | `AuthController@logout` | Deletes all tokens for user. |
| GET | `/api/user` | Closure | Returns authenticated `User` model as JSON. |
| GET/POST/… | `/api/customers` | `Api\CustomerController` | **`apiResource` registered** — **only `index` is implemented**. Expect **405/404** for `show`, `store`, `update`, `destroy`. |
| GET | `/api/readings` | `Api\ReadingController` | **May not exist** — controller defines **`store` only**. |
| POST | `/api/readings` | `ReadingController@store` | Create reading(s) + bill generation. |
| GET | `/api/service-charge-types` | Closure | `ServiceChargeType::all()` JSON. |

**Route name prefix:** `api.*` (e.g. `api.logout`).

---

## Login

**`POST /api/login`**

### Request body (JSON or form)

| Field | Rules |
|-------|--------|
| `name` | Required if `email` missing; must be **valid email string** (used as email for login). |
| `email` | Required if `name` missing; valid email. |
| `password` | Required. |

The handler uses `name` or `email` as the **email** for `Auth::attempt`.

### Success response (200)

```json
{
  "status": true,
  "user": {
    "name": "…",
    "id": 1,
    "department": { "id": 1, "name": "ledger", "…": "…" },
    "zone_id": null
  },
  "access_token": "1|…",
  "token_type": "Bearer"
}
```

> **`zone_id`:** Returned from `user` object; **no `zone_id` column** exists on `users` in migrations — value will be null unless the model/database is extended.

### Error response (401)

```json
{ "message": "Invalid credentials" }
```

---

## Logout

**`POST /api/logout`** (Bearer required)

### Success (200)

```json
{ "message": "Logged out" }
```

---

## Current user

**`GET /api/user`** (Bearer required)

Returns the **User** model JSON** (password hidden by model).

---

## Customers (index only)

**`GET /api/customers`** (Bearer required)

### Behaviour

- Eager loads `zone`, `tariff`, `meters.latestReading`, latest `bills`.
- If authenticated user has **`zone_id`**, filters customers to that zone; otherwise returns all.

### Response

JSON **array** of customer objects (custom format for “homes API” compatibility). Example shape:

```json
[
  {
    "customer_id": 1,
    "account_number": "…",
    "address": "…",
    "plot_number": "…",
    "customer_name": "…",
    "phone": "…",
    "meter": { "id": 1, "meter_number": "…", "status": "active" },
    "zone": "Zone A",
    "subzone": "HAI …",
    "tariff": {
      "name": "…",
      "price": 0.0,
      "fixed_charge": 0.0
    },
    "latest_reading": {
      "current_reading": 0.0,
      "reading_date": "2026-01-15"
    },
    "previous_balance": 0.0
  }
]
```

### Error (500)

```json
{ "message": "Failed to load data." }
```

> **Note:** `address` appears twice in the controller’s array (same key) — last value wins in PHP; integrators should treat as a single address field.

---

## Service charge types

**`GET /api/service-charge-types`** (Bearer required)

Returns all rows from `service_charge_types` as JSON (no pagination).

---

## Readings — create (batch)

**`POST /api/readings`** (Bearer required)  
**Handler:** `Api\ReadingController@store` — uses `BillService::generateForMeter` after each successful reading.

### Request shape

- Single object, **or** array of objects, **or** `readings` key containing either.
- Each item can use **`customer_id`** (required if no `meter_id`) or **`meter_id`**.

### Per-item validation

| Field | Rules |
|-------|--------|
| `customer_id` | `required_without:meter_id`, `nullable`, `exists:customers,id` |
| `meter_id` | `nullable`, `exists:meters,id` |
| `reading_date` | `required`, `date` |
| `current_reading` | `required`, `numeric`, `min:0` |
| `previous_reading` | `nullable`, `numeric`, `min:0` |
| `notes` | `nullable`, `string` |
| `image` | `nullable`, `string` (base64 `data:image/...`) or file upload |
| `bill_no` | `nullable`, `string`, `max:255`, **unique** on `bills.bill_no` |

### Business rules

- Resolves **meter** from `meter_id` or first meter of `customer_id`.
- **Rejects** if `current_reading` is not **greater** than the latest stored reading for that meter.
- Optional **image:** base64 written to `storage/app/public/readings/…` or uploaded file; path stored on reading.

### Success (201) — partial success possible

```json
{
  "message": "1 readings processed.",
  "success_count": 1,
  "error_count": 0,
  "results": [
    {
      "customer_id": 1,
      "reading_id": 10,
      "bill_number": "BILL-000042",
      "total": 12500.5,
      "index": 0
    }
  ],
  "errors": []
}
```

`bill_number` uses display format **`BILL-{id}`** (see controller); DB may store padded `bill_no` via model boot.

### Validation / processing failure

- If **all** items fail: HTTP **422** with `errors` array populated.
- If **mix**: HTTP **201** with both `results` and `errors`.

### Error item shape

```json
{
  "index": 0,
  "message": "…",
  "validation_errors": { "field": ["…"] }
}
```

---

## Error handling (general)

- **401** — missing/invalid token on protected routes.
- **403** — not used by these controllers directly (Sanctum returns 401 for unauthenticated).
- **404** — undefined methods on `apiResource` routes.
- **422** — validation failures (readings batch).
- **500** — customer index failure (logged server-side).

---

## Recommended improvements

- Remove or authenticate **`GET /api/test`**.
- Replace `apiResource` with **explicit** `Route::get` / `Route::post` to match implemented methods.
- Add `GET /api/readings` with pagination if mobile clients need history.
- Add `users.zone_id` (or remove from JSON) for zone scoping.
- Regenerate API tokens with **expiry** if policy requires (`config/sanctum.php` `expiration`).
