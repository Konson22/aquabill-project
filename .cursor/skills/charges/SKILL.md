---
name: charges
description: >-
  Applies Aquabill user-facing terminology for non-water billing documents: prefer
  "service fee" and "charges" over "Invoices" in documentation, manuals, print layouts,
  and UI copy. Use when editing docs, labels, or meeting materials for SSUWC/Aquabill,
  or when the user mentions service fees, charges, or replacing invoice wording.
---

# Service fee & charges terminology

## Rule

In **user-facing text** (documentation, PDFs, help strings, meeting notes), use:

- **Service fee** — for the module area and documents that bill recurring or fixed charges (what staff may still call “invoices” in speech).
- **Charges** — when referring to line items, amounts, or “service fee & charges” breakdowns.

Avoid leading with **Invoices** in that context unless you are referring to the technical `Invoice` model, API, or database table.

## Code vs copy

- **Keep** existing Laravel/Inertia names when unchanged by a dedicated refactor: routes, controllers, models (`Invoice`), file names, and DB tables may still say `invoice`.
- **Change** labels, headings, manual text, and print templates to **service fee** / **charges** when the user asks for clearer business language.

## Quick replacements (docs & UI labels)

| Prefer | Avoid in user-facing copy |
|--------|---------------------------|
| Service fee (module) | Invoices (as the product name) |
| Service fee charges / line items | Invoice line items (in manuals) |
| Issue or print service fee documents | Generate invoices (in workflows) |

## When unsure

If the screen still shows “Invoices” in the sidebar from code, note the mismatch in a comment or follow-up task rather than inventing new route names in prose alone.
