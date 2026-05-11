```text
Update the existing Laravel + React/Inertia SSUWC/AquaBill billing system by adding a complete Budget and Expense Management module under the Finance Department.

Budget structure must support:

Overall Budget
  → Department Budgets
      → Budget Items
          → Expenses

Create these tables:

1. budgets
- id
- budget_year
- budget_month nullable
- title
- total_amount
- currency
- status // draft, approved, active, closed
- approved_by nullable
- approved_at nullable
- remarks
- timestamps

2. department_budgets
- id
- budget_id
- department_id
- allocated_amount
- remarks
- timestamps

3. expense_categories
- id
- name
- description
- status // active, inactive
- timestamps

4. budget_items
- id
- department_budget_id
- category_id
- item_name
- description
- planned_amount
- timestamps

5. expenses
- id
- department_budget_id nullable
- budget_item_id nullable
- category_id
- expense_date
- description
- amount
- payment_method
- reference_no nullable
- vendor_name nullable
- requested_by
- approved_by nullable
- approved_at nullable
- status // pending, approved, rejected, over_budget_pending_approval, over_budget_approved, paid
- is_over_budget boolean default false
- over_budget_amount nullable
- over_budget_reason nullable
- over_budget_approved_by nullable
- over_budget_approved_at nullable
- attachment nullable
- remarks
- timestamps

Rules:
- Overall budget controls the institution’s full budget.
- Department budgets are allocations from the overall budget.
- Total department allocations must not exceed the overall budget.
- Budget items belong to department budgets.
- Expenses belong to department budgets and may optionally belong to budget items.
- Expenses must reduce available budget only when status is approved or paid.
- Remaining budget must be calculated from expenses, not manually entered.
- If expense exceeds remaining budget, mark it as over-budget.
- Over-budget expenses require special approval before payment.
- Only users with finance.approve_over_budget can approve over-budget expenses.
- Do not allow over-budget expenses to be marked as paid until over-budget approval is completed.

Create services:
1. BudgetCalculatorService
- calculate overall budget spent
- calculate overall budget remaining
- calculate department budget spent
- calculate department budget remaining
- calculate budget item spent
- calculate budget item remaining
- calculate budget utilization percentage
- detect over-budget items
- detect over-budget departments

2. ExpenseApprovalService
- submit expense
- approve expense
- reject expense
- mark expense as paid
- check if expense exceeds budget
- handle over-budget approval workflow

Create CRUD pages using React/Inertia:
- Overall Budgets
- Department Budgets
- Budget Items
- Expense Categories
- Expenses
- Expense Approvals
- Over-Budget Approvals

Create Finance Budget Dashboard showing:
- Total overall budget
- Total department allocations
- Total expenses
- Remaining overall budget
- Budget utilization percentage
- Pending expenses
- Approved expenses
- Paid expenses
- Rejected expenses
- Over-budget expenses
- Over-budget amount
- Departments close to budget limit
- Budget items exceeded

Add filters:
- year
- month
- department
- category
- budget status
- expense status
- vendor
- payment method
- over-budget only

Add exports:
- Excel
- PDF
- Print

Add permissions:
- finance.view_budget
- finance.manage_budget
- finance.create_expense
- finance.approve_expense
- finance.pay_expense
- finance.approve_over_budget
- finance.export_budget_reports

Add sidebar menu under Finance Department:
- Budget Dashboard
- Overall Budgets
- Department Budgets
- Budget Items
- Expenses
- Expense Approvals
- Over-Budget Approvals
- Expense Categories
- Budget Reports

Use Laravel best practices:
- migrations
- models
- relationships
- controllers
- form requests
- policies
- permissions
- services
- seeders
- validation
- clean React/Inertia UI
- responsive design

Add seeders for:
- common expense categories
- sample annual budget
- sample department budgets
- sample budget items
- sample expenses

Make the interface professional, clean, and suitable for SSUWC Finance Department.
```
