# Arzon Global — Admin Console

Internal admin panel for Arzon Global (edtech + sales): attendance, leaves,
sales reports & payments, and team reporting.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind · Prisma + PostgreSQL (Supabase) ·
next-auth v4 (credentials, JWT) · recharts

## Modules

- **Dashboard** — live, role-aware: attendance today, pending leaves, sales closed / collected this
  month, revenue chart, recent deals.
- **Attendance** — check-in/out, break tracking (Start/End break with a live timer, break time deducted
  from hours logged, checkout blocked mid-break), PRESENT/LATE (10:15 cut-off), month-by-month calendar,
  searchable + CSV-exportable team table (Admin/HR).
- **Leaves** — request form with overlap + balance validation, cancel pending requests, balance bars,
  Admin/HR approval queue and full request history with filters.
- **Sales Reports** — employees log deals and submit payments against each one, tagged as
  **Pre-payment (advance)**, **Post-payment (final)**, or **Full payment** (the form smart-defaults:
  advance for the first payment on a deal, final for the next). Progress bar, over-claiming blocked.
  **Payments require Admin approval** before they count as collected — an Admin's own entries
  auto-approve. Admins get a "Payments awaiting approval" queue at the top of the page. Admin/HR also
  see every deal (filter by employee/stage, totals) and a full **payments ledger** with status and
  type columns/filters.
- **Reports** (Admin/HR) — period filter, KPIs, revenue / collections / attendance / leave charts,
  per-employee performance table, CSV export.
- **Salary** — every employee sees their payout history and an *estimated next payout*
  (base salary + commission on deals they've personally closed-won this month, calculated live from
  Sales Reports). Admin/HR get a "run this month's payroll" table per employee (one click computes and
  records base + commission) and a full payroll ledger.
- **Employees** (Admin only — hidden from HR) — create new employees (sets an initial password,
  role, department, base salary, commission %), edit anyone's compensation inline, deactivate/
  reactivate accounts, and see each employee's deals won + pending leaves this month at a glance.

## Setup

```bash
npm install
cp .env.example .env            # fill in DATABASE_URL, NEXTAUTH_SECRET
npx prisma migrate dev --name sales_payments_and_leave_cancel
npm run seed                    # users + demo sales, payments, leaves, attendance
npm run dev
```

Seeded logins: `admin@arzonglobal.com / Arzon@123` (ADMIN) ·
`hr@arzonglobal.com / Employee@123` (HR) ·
`ananya.rao@` / `rahul.mehta@` / `priya.nair@arzonglobal.com / Employee@123` (EMPLOYEE).
`npm run seed` is safe to re-run; set `SEED_DEMO=false` to skip demo data.

## UI

- Sidebar: every section the role can see is always listed (no icon-only collapse), with a live
  amber count badge on Leaves (pending requests) and Sales Reports (payments awaiting approval),
  amber-tinted hover with a slide + icon-color transition, and a persistent accent bar on the active
  item.
- Cards/tables share a consistent subtle shadow with a hover lift on stat cards, and a brief fade-in
  on page navigation (skipped automatically for users with reduced-motion enabled).

## Notes

- Dates are stored as UTC calendar dates and "today" is computed in `APP_TIMEZONE`
  (default Asia/Kolkata), so a check-in always lands on the day the employee sees.
- Commission is a flat % per employee (set on the Employees or Salary page), applied to CLOSED_WON
  deal value in the current calendar month. "Estimated next payout" recalculates live as deals close;
  it's finalized only when Admin/HR clicks "Pay this month" on the Salary page.
- Still to build: payslip PDFs, auto-marking ABSENT (needs a scheduled job), email notifications,
  editable leave allotments per employee.
