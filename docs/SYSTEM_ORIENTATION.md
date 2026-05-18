# AquaBill — system orientation (for clients)

**Document purpose:** Help staff and managers understand **what each part of AquaBill is for**, **what you typically do there**, and **how major processes fit together**—without technical jargon.

**Audience:** Customer service, billing/cashiers, finance, field teams, supervisors, and executives who use or oversee the system.

**Technical reference** (routes, files, for IT): [`SYSTEM_REVIEW.md`](./SYSTEM_REVIEW.md)

**Export to Microsoft Word:** Open [`SYSTEM_ORIENTATION.html`](./SYSTEM_ORIENTATION.html) in Word, then use **File → Save As → Word Document (.docx)**. Short steps are also in [`HOW_TO_EXPORT_ORIENTATION_TO_WORD.md`](./HOW_TO_EXPORT_ORIENTATION_TO_WORD.md).

**Access:** **System administrators** create users, set each person’s **department**, maintain **system settings**, and assign **roles** (with **permissions**) so menus match the job. If a screen is missing from your menu, your access needs an admin change.

**Conventions in this guide**

- **Screen** = a page or main view in the application.
- **Typical tasks** = common day-to-day actions (not an exhaustive policy list).
- **Tips** = good practice; your local procedures may add stricter rules.

---

## Document control

| Item | Detail |
|------|--------|
| Product | AquaBill |
| Document type | Client system orientation |
| Maintainer | Update when new modules go live, menu names change, or major workflows change |

---

## 1. Administrator role, departments, and access

**Administrator role** — Staff with administrator access maintain **user accounts**, **system settings** (organisation-wide options and catalogues), **collection stations**, and **roles** that bundle **permissions**. There is **no self-registration**: logins are created and updated only through **Administration**.

**Departments and role access** — Each user belongs to a **department** (for example Finance, Ledger, Distribution, HR), which affects the default workspace and how work is grouped. **Role** and **permissions** then control **which screens and actions** that person can use—two colleagues in the same department can still have different menus if their roles differ. If a needed screen is missing, an administrator adjusts **department**, **role**, or **permissions**; staff should not share passwords to work around access limits.

---

## 2. Home and dashboards

After sign-in you usually land on a **dashboard**. Which dashboard you see depends on your **department** (for example Finance, Ledger, Admin, HR, Customer care, Distribution).

| Screen | Core functionality |
|--------|--------------------|
| **Main dashboard** | Overview of **key figures** and **shortcuts** for daily work (what appears depends on your role). |
| **Department home** | A **starting point** tailored to your team—often the same URL as the main dashboard but with content suited to Finance, Ledger, etc. |
| **Simple workspace** | Some teams have a **minimal home page** until more features are rolled out; it still confirms you are in the correct department. |

### Typical tasks

- Start each session from the dashboard to see reminders or summary numbers your organisation chose to display.
- Use sidebar links (left) to jump to your most-used areas.

### Tips

- If the dashboard looks empty, your role may be limited to a narrow set of tasks—that is normal for specialised accounts.

---

## 3. Customers (accounts)

Everything about **who is connected**, **where they are supplied**, and **their billing history** starts from the **customer** (account) record.

| Screen | Core functionality |
|--------|--------------------|
| **Customer list** | **Search** by name or account number; **open** a record; **start** a new customer. Lists often support filters or tabs (e.g. active vs inactive) depending on setup. |
| **New customer** | Capture a **new account**: identity, contact, address, **zone** (supply area), **tariff** (price scheme), and related setup (e.g. meter). |
| **Customer profile (detail)** | **Single place** for the full picture: personal details, **meters**, **readings**, **bills**, **payments**, **service charges**—often as **tabs** so you do not lose context. |
| **Edit customer** | Update **master data** (address, phone, status, etc.) when the customer’s situation changes. |
| **Disconnection status** | See where the customer stands in the **disconnection workflow** (notices sent, dates, next actions). |
| **Print disconnection notice** | Open a **print-friendly** notice for the customer; use the browser’s **Print** or **Save as PDF**. |
| **New service charge (from customer)** | Record a **one-off charge** (e.g. reconnection fee) **against this customer** without going through normal monthly billing. |

### Typical tasks

- Search the customer list before creating a duplicate account.
- From the profile, drill into a bill or reading to answer a customer query on the phone.
- Update phone numbers and addresses when the customer moves within your supply area.

### Tips

- The **customer profile** is usually the fastest path to “why is my bill this amount?”—check readings, tariff, and bill history together.

---

## 4. Meters and meter readings

**Meters** and **meter readings** are related but different. A **meter** is the equipment (or its registry record): serial or meter number, type, and whether it is **assigned** to a customer account or **not assigned** (for example in stock, withdrawn, or awaiting installation). **Readings** are the periodic **index values** taken from a meter on specific dates; those values drive **consumption** and therefore **billing**. Use the meters area to manage the asset and its link to the customer; use the readings area to work with the numbers used on bills.

### 4.1 Meters (equipment and assignment)

The **Meters** screens maintain the meter **register**: create or look up meters, see whether each meter is **assigned to a customer** or **unassigned**, and update **status** (active, replaced, faulty, etc.) when your procedures allow. When a meter is assigned, readings for that meter normally feed that customer’s billing; when it is not assigned, the list still supports stock control, replacements, or linking the meter to an account later.

| Screen / focus | Core functionality |
|----------------|--------------------|
| **Meters** (list and detail) | List **water meters**: numbers or serials, type, and **assignment**—which customer the meter is linked to, or that it is **not assigned** yet. Manage **status** and, where supported, **replacement** history when one meter is swapped for another on the same account. |

### 4.2 Meter readings

Once a meter is **assigned** to a customer, staff (or authorised field users) record **readings**: the meter **index** on a **reading date**, sometimes with **notes** or a **photo** of the dial. The system derives **consumption** for the period (typically the increase in the index since the last accepted reading). Billing uses that consumption—not the raw index alone, except where the first reading on a new meter applies.

#### Where readings are collected

- **Web application (browser):** Office and call-centre staff use the AquaBill website—**readings list**, reading forms, and shortcuts (for example from a customer’s profile) to enter or review readings while signed in.
- **Mobile app (field):** Readers use your organisation’s **companion app**, which sends readings through the **readings API**. The app can send the same core fields (customer or meter, date, current index, optional previous index, notes) and may attach a **meter photo** or an optional **bill number** for printing workflows. Web and app follow the same validation and billing rules on the server.

#### How a bill is generated from a reading

When a new reading is saved, AquaBill can **automatically generate a bill** for that meter’s customer (your procedures may still require review or printing). The amounts come from the customer’s **tariff** and the reading:

- **Consumption** — Water used in the period, from the reading and the previous index (as stored on the reading or from history).
- **Usage charge** — **Consumption × price per unit** from the tariff on the **customer**. If none is set, the system may use your configured **default active tariff**.
- **Fixed charge** — The tariff’s **fixed charge** (flat amount defined for that price scheme), included in the bill total.
- **Previous balance** — Outstanding amounts on earlier **pending** or **partially paid** bills for the same customer can be added so the customer sees one total to pay.

The bill stores **snapshots** of **unit price** and **fixed charge** used at generation time, so later tariff edits do not silently change old bills.

| Screen | Core functionality |
|--------|--------------------|
| **Readings list** | Browse **meter readings** in date order; supports the **billing cycle** (readings drive consumption and therefore bills). |
| **Reading detail** | Inspect **one reading**: date, previous and current index, notes, optional image, and links to the meter/customer where configured. |
| **Edit reading** | **Correct** a wrong reading when your procedures allow (often restricted to supervisors or ledger staff). If a bill was already generated from that reading, amounts may be **recalculated** to stay consistent. |

### Typical tasks

- On the **meters** side: confirm a meter is **assigned** to the right customer before accepting readings or disputing a bill.
- On the **readings** side: find the latest reading before explaining consumption on a bill; if web and app both capture readings, follow one process so the same visit is not entered twice.
- When a customer questions a total, open the **bill** and confirm **tariff** (price per unit and fixed charge), **consumption**, and any **previous balance** line.
- Flag or correct erroneous readings according to your utility’s policy (paper trail may be required outside the system).

### Tips

- Accurate **reading dates** and **indexes** reduce billing disputes; keeping the customer on the correct **tariff** and meter **assignment** ensures usage and fixed charges match your rules.

---

## 5. Zones, tariffs, and service charges (reference data)

These areas hold **reference data** and **fee rules** that billing depends on: **zones** describe *where* supply happens geographically; **tariffs** describe *how much* to charge for **metered water** (price per unit and fixed charge per scheme). **Service charges** (§5.3) are different: they are **one-off fees** for specific events or services and are **not** calculated from the customer’s tariff the way a routine water bill is.

### 5.1 Zones

**Zones** are supply or administrative areas (neighbourhoods, districts, branches). Customers are linked to a zone so routing, reporting, maps, and sometimes billing stay aligned with geography.

| Screen | Core functionality |
|--------|--------------------|
| **Zones** | Define and maintain **supply areas**; align customers, operations, GIS, and reports with a consistent map of your network. |

### 5.2 Tariffs (pricing schemes)

A **tariff** is a named **pricing scheme**. In practice it means:

- It defines the **price per unit** of water (the usage rate) and the **fixed charge** (a flat amount per bill or period—your organisation decides how that is applied).
- Each **customer** is linked to one tariff; when a bill is generated, the system uses that tariff’s rates, or a configured **default** active tariff if none is assigned to the customer.
- Each bill stores a **snapshot** of the unit price and fixed charge at generation time, so old invoices stay interpretable even after you change a tariff for the future.

| Screen | Core functionality |
|--------|--------------------|
| **Tariffs** (list) | View all schemes; where your role allows, **create** or **edit** tariffs. |
| **Tariff detail** | See the **current** name, **price per unit**, and **fixed charge**, and the **Tariff history** table on the same page. |

#### Tariff history

Whenever an authorised user **updates** and saves a tariff, AquaBill records a **tariff history** row with the **previous** name, price per unit, and fixed charge (with date and, where recorded, who made the change). That gives supervisors and auditors a trail of **how rates evolved** without guessing from old bills alone. The **tariff detail** screen lists these rows—newest first—alongside the live numbers.

### Typical tasks

- Confirm a customer’s **zone** and **tariff** when investigating a high bill.
- Before a regulated price change, apply new values in the system, then use **tariff history** to document old versus new rates.
- Document tariff changes outside the system if your regulator requires an additional audit trail.

### Tips

- Changing a tariff affects **new** bills generated after the change; existing bills keep the amounts they were created with unless your team runs a controlled recalculation process.

### 5.3 Service charges (fees outside normal water bills)

A **routine bill** (section 6) is built from **meter readings** and the customer’s **tariff**. A **service charge** is a **separate fee record** for something that is not “this month’s water usage”—for example **reconnection**, **penalties**, **new connection** costs, or **administrative** handling. The customer can still receive normal water bills while also owing service charges; they are tracked in parallel so finance can report **usage revenue** separately from **fee income**.

Administrators define **service charge types** in the admin area (name, default amount, and similar)—in the same spirit as maintaining **tariffs**, but for **named products** rather than price-per-unit of water. When staff create a charge, they choose the correct **type** so reports by category stay trustworthy.

#### What you can do

- **Service charges list** — Browse every charge: which **customer** it belongs to, the **amount**, the **type**, and whether it is **unpaid**, **partially paid**, or **settled**. Search or filter depending on your role.
- **Service charge detail** — Open one charge for notes, dates, and status; when permitted, **confirm payment** (or update status) so the balance matches receipts—often using the same **collection station** conventions as bill payments.
- **From the customer profile** — Start a **new service charge** while viewing the customer so the fee is clearly tied to the right account.

#### Typical tasks

- After a field job (e.g. reconnection), raise the matching charge type and later confirm payment when the customer pays.
- When investigating “extra” amounts, compare **service charge detail** to **bill detail**—two different mechanisms in one system.

#### Tips

- Picking the wrong **charge type** makes fee reports misleading; if unsure, ask a supervisor which type your procedure requires.

---

## 6. Bills and printing

The **bills** area is where you work with **invoices** for water usage: find them, understand what the customer owes, **record payments**, and produce **paper or PDF** copies. A bill ties together a **reading period**, **consumption**, **tariff-based charges**, and any **previous balance** that was rolled forward—see section 4 for how those amounts are built.

### What you can do in each place

| Screen | Core functionality |
|--------|--------------------|
| **Bills (main list)** | Central list of invoices. Filter by **status** (e.g. pending, partial, paid, overdue) for collections, cashiering, or audits. Open any row for detail, **record a payment** when money is received, and jump to **print** or **export** where your role allows. |
| **Bill detail** | One invoice end-to-end: line items and totals, **consumption**, **unit price** and **fixed charge** as stored on the bill, **due date**, **status**, and **payment history** (partial payments and who recorded them). |
| **Overdue bills** | Focused work queue for accounts **past the due date**—collections follow-up without scanning the full list. |
| **Printing list** | Prepare or select many bills for a **batch** (e.g. meter-reading round or postal run) before opening the print layout. |
| **Print one bill** | **Print-friendly** page for a **single** invoice; use browser **Print** or **Save as PDF**. |
| **Print several bills** | **Print-friendly** layout for **multiple** invoices—bulk mail, field agents, or counter handouts. |

### Payments and bill status

- **Full payment** — When the amount received covers the bill total, the bill moves to a **paid** (or equivalent) state so it no longer appears as money owed.
- **Partial payments** — A payment **less than** the remaining balance reduces what is owed but often leaves the bill **partial** until the rest is collected. Open **bill detail** for the **remainder** and the list of payments applied.
- **Recording payments** — Usually from the bill list or bill detail; your organisation may require a **collection station** and date for audit and revenue reports.

### Typical tasks

- Record a **cash** or **bank** payment against a bill when money is received.
- Print bills for a delivery round or for a customer who requests a paper copy.
- Use **overdue** filters or screens before a collection campaign.

### Tips

- **Partial payments** reduce the balance but may leave the bill in “partial” until fully settled—check **bill detail** for the remaining amount.

**Exports:** Some roles can **download** bill or reading data as a spreadsheet (Excel/CSV) from the relevant list—this may not open a separate “screen”; it downloads a file.

---

## 7. Disconnections and connection management

| Screen | Core functionality |
|--------|--------------------|
| **Disconnections / connection management** | Operational view of customers in the **disconnection pipeline**: who has been **notified**, who is **disconnected**, who is due for **reconnection**, etc. |

### Typical tasks

- Monitor the pipeline during a **collection campaign** or **arrears drive**.
- Coordinate with field teams when a **physical disconnection** is scheduled.

### Tips

Many steps (**send notice**, **cancel notice**, **disconnect**, **reconnect**) are **buttons or actions** on the **customer** or disconnection screens—not separate pages. Your administrator should document the **approved sequence** for your jurisdiction (legal notice periods, etc.).

---

## 8. Reports and analytics

Reports turn day-to-day entries in AquaBill—**bills**, **payments**, **readings**, and **service charges**—into **summaries** for finance, operations, and management. They differ in **grain**: **revenue and collections** is mainly **aggregated** by date ranges and filters; the **station payment log** is **line-by-line** for one collection desk when you need to match slips or tills.

| Screen | Core functionality |
|--------|--------------------|
| **Revenue and collections** | Broad **financial picture**: bill vs payment periods, **charts**, **overdue** snapshot, optional **collection station**, **stations list** with links, **CSV export**, **print**. The **Period summary** splits the bill-period slice into the categories below; **summary cards** also show counts of bills **paid**, **pending** (incl. partial), **forwarded**, and the **collection rate** as a KPI. |
| **Water usage** | **Consumption** over time and by area (e.g. by zone)—operations, **NRW** discussions, and planning without opening every customer. |
| **Station payment log** | Every **payment line** for **bills** and **service charges** for **one collection desk** at a time, with **date range** and **customer search**—**cashier reconciliation** and branch audits. |

### Revenue report: how amounts are categorised (Period summary)

For the bills in your selected **bill period** (and search), the **Period summary** groups figures for finance. **Previous balance** rolled into invoices is **not** split out here—the summary focuses on **water usage charges** and **fixed tariff** components; open **bill detail** for the full invoice total if arrears are large.

| Category (as shown) | Meaning |
|---------------------|---------|
| **Water revenue** | Sum of **usage-based** charges on bills in scope (consumption × unit price on each bill’s current charge). |
| **Fixed charges** | Sum of the **fixed tariff** component (**fixed charge** snapshot) on those bills. |
| **Total revenue** | **Water revenue + fixed charges** for bills in the period (the billed “core” used with collected / rate below; may differ from each bill’s grand total if **previous balance** was added). |
| **Collected** | Labeled **Collected** on screen: money **received** (payments on those bills, plus **paid service charges** matching the report filters where included). |
| **Collection rate** | **Percentage (%)**—collected compared to **total revenue** (water + fixed) for that summary, rounded for display. |
| **Outstanding** | Still **owed**: remaining balance on bills in scope, plus relevant **unpaid service charges** under the same filters. |

### Understanding “bill period” vs “payment period” (important)

These two filters answer **different questions** on purpose; mixing them up is the most common source of confusion on the revenue report.

- **Bill period** — “What did we **raise as invoices** (or date bills) in this window?” Tied to **bill dates** and the billing cycle, not necessarily when money arrived.
- **Payment period** — “What **money was recorded** in this window?” Tied to **payment dates** (and station filters when used).
- **Why both matter** — You can analyse **bills dated January–March** alongside **payments received in April**; finance sees lag between invoicing and collection, while customer care can explain balances from the same report.

**Example:** Management asks “how much did we bill last quarter?” versus “how much cash did we bank this month?”—set **bill period** for the first and **payment period** for the second.

### Typical tasks

- Finance: export **collections** for a month and reconcile with the bank.
- Supervisors: review **overdue** counts or charts before a collection meeting.
- Cashiers: open the **station payment log** for their desk for the day’s (or week’s) date range.

### Tips

- Use the **station** filter on the revenue report for **high-level** analytics limited to one desk; use the **station payment log** when you need **every payment line** for that desk.

---

## 9. GIS (maps and network assets)

For teams that maintain the **physical network** on a **map** and in an **asset register**.

| Screen | Core functionality |
|--------|--------------------|
| **GIS home** | Entry point to **maps** and **asset** lists. |
| **Map** | Explore the network **spatially** (zoom, pan, layers—depends on configuration). |
| **Zone boundaries** | **Draw or edit** the outline of **supply zones** so they match reality and support zone-based reporting. |
| **Water point types** | **Catalogue** of asset categories (e.g. hydrant, pump house). |
| **Water points** | Create and edit **point features** on the network. |
| **Pipes** | Create and edit **pipe** segments (connectivity, materials—field as implemented). |
| **Valves** | Create and edit **valve** assets. |

### Typical tasks

- Update the map after mains extension or valve replacement.
- Keep zone boundaries aligned with operational “areas” used in billing.

### Tips

- GIS data quality improves **every** downstream process that references zones or geography.

---

## 10. Administration (configuration)

Reserved for **administrators**. They **create and maintain users**, assign **departments**, open **system settings** (and related catalogues such as service charge types), define **collection stations**, and manage **roles** so **permissions** and menu access stay correct for each job.

| Screen | Core functionality |
|--------|--------------------|
| **Admin home** | Shortcuts to **users**, **stations**, **settings**, and other admin tools. |
| **Users** (list, create, show, edit) | List staff accounts; **create** logins with name, email, **department**, and **role** so **permissions** and menus match the job; **edit** users when access should change. |
| **User detail / edit** | View or **change** user details, **department**, or **role**-linked access. |
| **Collection stations** | Define **cash collection points** (desks, branches, kiosks) used when **recording payments** and in **reports**. |
| **System settings** | **Hub** linking to deeper tools (e.g. service charge **types**). |
| **Service charge types (admin)** | Define which **kinds** of service charges exist (labels, default amounts, etc.). |
| **Roles** | Manage **roles** that bundle **permissions**; users inherit access through the role assigned to them. |

### Typical tasks

- Onboard a new cashier: create user, confirm they can access bills and station reports.
- Add a new **branch desk** as a station before payments can be attributed there.

### Tips

- Restrict admin accounts to a **small** number of trusted people; changes here affect everyone.

---

## 11. Human resources (HR)

For **HR department** users.

| Screen | Core functionality |
|--------|--------------------|
| **HR home** | Entry to HR modules. |
| **Departments** | Internal **organisational units** directory. |
| **Staff list** | Browse **employees** or HR records. |
| **New staff** | Register a **new person**. |
| **Staff profile** | View one person’s **HR record**. |
| **Attendance / Leave / Payroll** | Workspaces for those processes—may be **placeholders** or full workflows depending on your deployment. |
| **HR documents** | Store or retrieve **HR files**. |
| **HR reports** | **Summaries** or listings for HR use. |
| **Training programs** | Create and manage **training courses** and participants (as implemented). |
| **Training reports** | Reporting on **training** completion or attendance. |

### Tips

- Keep HR data handling aligned with your **privacy** and **labour law** obligations outside the software.

---

## 12. Personal settings (your own account)

| Screen | Core functionality |
|--------|--------------------|
| **Profile** | Update **your** name, email, or other allowed personal fields. |
| **Password** | **Change** your login password (use a strong new password). |
| **Appearance** | Adjust **display** options (e.g. light/dark theme) if your build includes them. |

---

## 13. Common workflows (end to end)

### A. Monthly billing cycle (simplified)

1. **Readings** captured in the field or office → **readings list** checked for gaps or anomalies.  
2. Bills **generated** (process may be automatic or separate—ask your administrator).  
3. **Bills** list used for printing or digital delivery; **payments** recorded when customers pay.  
4. **Revenue** report used to review **billed vs collected** for management.

### B. Customer complaint: “My bill is too high”

1. Open **customer profile** → confirm **tariff** and **zone**.  
2. Review **readings** for the period → check for obvious entry errors.  
3. Open the **bill detail** → see how consumption and fixed charges combine.  
4. If a one-off fee applies, check **service charges**.

### C. Cashier end-of-day reconciliation

1. Set **payment dates** on the **revenue** report (or open **station payment log**).  
2. Select **your station** if payments are tagged by desk.  
3. Compare **payments in scope** with physical cash or card slips; export if needed.

### D. New connection

1. **New customer** (and meter) created with correct **zone** and **tariff**.  
2. Initial **reading** recorded when supply starts.  
3. First **bill** appears according to your billing calendar.

---

## 14. Quick glossary

| Term | Meaning in AquaBill |
|------|---------------------|
| **Customer / account** | A person or organisation **connected to the network** with a unique **account reference**. |
| **Meter reading** | Meter **index** on a **date**; difference between readings drives **consumption**. |
| **Bill** | An **invoice** for a period: usage charges, fixed charges, and any balances your rules carry forward. |
| **Payment** | Money **recorded** against a bill or service charge, with **date**, **method**, and often **collection station**. |
| **Partial payment** | A payment that **does not** fully clear the bill; a balance remains until further payments. |
| **Outstanding** | Amount still **owed** on bills or charges. |
| **Collection rate** | Indicator of how much of **billed** revenue has been **collected** in a given scope (definition depends on report filters). |
| **Service charge** | A **fee outside** normal monthly usage (e.g. reconnection). |
| **Tariff** | **Pricing scheme** (usage rate + fixed components) assigned to a customer. |
| **Zone** | **Supply or administrative area** used for routing, reporting, or billing. |
| **Station** | A **collection desk** or point where payments are taken—used for **reporting** and **audit**. |

---

## 15. Related documentation

- **Technical / IT orientation** (software structure, routes, files): `docs/SYSTEM_REVIEW.md`.
- **Save as Word:** `docs/HOW_TO_EXPORT_ORIENTATION_TO_WORD.md` and `docs/SYSTEM_ORIENTATION.html`.

---

*AquaBill client system orientation. Update when modules or menus change.*
