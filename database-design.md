You are a senior Laravel backend engineer.

Design a **Service Charges module** for a Water Billing System.

This module is ONLY for operational/service-related fees (e.g. reconnection, installation, inspection), separate from fines or penalties.

Generate:

- Laravel migrations
- Eloquent models
- Relationships
- Seeders (sample service charges)
- Constraints and indexes

Do NOT create frontend code.

---

# 🔷 1. SERVICE CHARGE TYPES

Create table: `service_charge_types`

Fields:

- id
- name (e.g. Reconnection Fee, Installation Fee)
- code (unique, e.g. RECON_FEE)
- amount (decimal 10,2) → fixed charge amount
- description (nullable)
- timestamps

Rules:

- Only fixed amounts (no percentage logic)
- Name must be clear and unique
- Code must be unique and used in logic

---

# 🔷 2. SERVICE CHARGES (APPLIED)

Create table: `service_charges`

Fields:

- id

- customer_id (FK → customers.id)

- bill_id (nullable FK → bills.id)

- service_charge_type_id (FK → service_charge_types.id)

- amount (decimal 10,2)

- issued_by (FK → users.id, nullable)

- issued_date (date)

- due_date (nullable)

- status (unpaid, paid) default unpaid

- notes (nullable)

- timestamps

---

# 🔷 3. RELATIONSHIPS

ServiceCharge:

- belongsTo Customer
- belongsTo Bill (nullable)
- belongsTo ServiceChargeType
- belongsTo User (issued_by)

ServiceChargeType:

- hasMany ServiceCharges

Customer:

- hasMany ServiceCharges

Bill:

- hasMany ServiceCharges

---

# 🔷 4. BUSINESS RULES

- Service charges can exist WITH or WITHOUT a bill
  (e.g. installation before first bill)
- Charges can later be attached to a bill
- Amount is copied from service_charge_types at time of creation (snapshot)
- Status must be tracked (unpaid/paid)
- Charges contribute to customer balance

---

# 🔷 5. SEEDERS

Create sample data:

- Installation Fee (50)
- Reconnection Fee (20)
- Meter Replacement Fee (25)
- Inspection Fee (15)

---

# 🔷 6. INDEXING

- service_charges.customer_id
- service_charges.bill_id
- service_charges.service_charge_type_id
- service_charge_types.code (unique)

---

# 🔷 7. OUTPUT REQUIREMENTS

Generate:

- Migrations
- Models with relationships
- Seeders
- Clean Laravel best practices

Ensure design is scalable and integrates with billing and payment modules.
