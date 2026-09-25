# Arzon Global — Admin Console

Internal admin panel for Arzon Global (edtech + sales): employee attendance,
leaves, salary/payroll, and sales reports.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — custom navy/amber design tokens in `tailwind.config.ts`
- **Prisma + PostgreSQL** — schema in `prisma/schema.prisma`
- **NextAuth.js** — credentials (email/password) login

## What's built so far (foundation)

- Project scaffold, Tailwind theme, fonts (Space Grotesk + Inter)
- Prisma schema covering `User`, `Attendance`, `Leave`, `Salary`, `SalesReport`
- NextAuth credentials login (`/login`) with JWT sessions + role on the session
- Protected dashboard shell: sidebar (role-aware nav) + topbar (live clock,
  profile, sign out) at `src/app/(dashboard)/layout.tsx`
- Dashboard overview page with placeholder stat cards
- Placeholder pages for every module so navigation is fully wired:
  Attendance, Leaves, Salary, Sales Reports, Employees (admin/HR), Reports (admin/HR)

- **Attendance** (`/attendance`) — done:
  - Check-in / check-out via server actions (`src/app/(dashboard)/attendance/actions.ts`),
    one `Attendance` row per user per day (`userId_date` unique constraint)
  - Auto status: `PRESENT` vs `LATE` based on a 10:15 AM cutoff
    (`LATE_CUTOFF_HOUR` / `LATE_CUTOFF_MINUTE` in `src/lib/attendance.ts`)
  - Personal monthly calendar with a color-coded dot per day, plus a
    present/late/absent/on-leave summary strip
  - Admin/HR-only team table showing everyone's check-in/out status for today
  - Not yet handled: automatically marking `ABSENT` for days with no check-in
    (needs a scheduled job / cron), and admin ability to manually edit a past
    day's record

## Not built yet (next steps, in suggested order)

1. **Leaves** — request form, balance tracking, approval workflow
2. **Sales Reports** — "add report" form for employees, pipeline table, filters
3. **Salary** — payroll table, payslip PDF, payment status
4. **Employees** — directory, add/edit, role assignment
5. **Reports** — charts (recharts is already installed) combining the above

## Getting started locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# then edit .env with your PostgreSQL connection string and a NEXTAUTH_SECRET
# generate a secret with: openssl rand -base64 32

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. Seed an admin user + 3 sample employees
npm run seed
# admin@arzonglobal.com / Arzon@123
# ananya.rao@arzonglobal.com, rahul.mehta@arzonglobal.com, priya.nair@arzonglobal.com / Employee@123

# 5. Run the dev server
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/login`. Sign in with the
seeded admin account, then change that password once you build the profile/
settings screen.

## Roles

`User.role` is one of `ADMIN`, `HR`, `EMPLOYEE`. The sidebar and route
`middleware.ts` are role-aware — `Employees` and `Reports` are hidden from
plain `EMPLOYEE` accounts. Extend the checks in `src/lib/nav.ts` and inside
each page/server action as new modules are added.

## Design notes

- Palette: deep navy (`navy-900` sidebar) + amber accent (active nav state,
  primary actions) — avoids the generic "AI dashboard" look (no purple
  gradients, no all-caps eyebrows, no uniform shadow-on-every-card).
- Active nav items get a thin amber left-edge indicator rather than a filled
  pill, echoing a ledger/attendance-sheet feel appropriate to HR + ops data.
