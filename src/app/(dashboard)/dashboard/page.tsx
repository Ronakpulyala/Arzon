import Link from "next/link";
import { CalendarDays, Clock, TrendingUp, Wallet, Users } from "lucide-react";
import { auth, canReview } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ReportBarChart } from "@/components/reports/report-bar-chart";
import { SalesBadge } from "@/components/sales/sales-badge";
import { todayDateOnly } from "@/lib/attendance";
import { LEAVE_TYPE_LABELS, leaveDayCount } from "@/lib/leaves";
import { formatDate, formatDateRange, formatTime } from "@/lib/format";
import {
  closedWonInMonth,
  collectedInMonth,
  formatCurrency,
  monthlyClosedRevenue
} from "@/lib/sales";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;
  const reviewer = canReview(user.role);

  const today = todayDateOnly();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const scope = reviewer ? {} : { userId: user.id };

  const [reports, pendingLeaves, todayRecords, activeUsers, myToday] = await Promise.all([
    prisma.salesReport.findMany({
      where: scope,
      orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
      include: { payments: true, user: { select: { name: true } } }
    }),
    prisma.leave.findMany({
      where: { ...scope, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true } } }
    }),
    reviewer
      ? prisma.attendance.count({ where: { date: today, loginAt: { not: null } } })
      : Promise.resolve(0),
    reviewer ? prisma.user.count({ where: { isActive: true } }) : Promise.resolve(0),
    prisma.attendance.findUnique({ where: { userId_date: { userId: user.id, date: today } } })
  ]);

  const wonThisMonth = closedWonInMonth(reports, year, month);
  const collectedThisMonth = collectedInMonth(
    reports.flatMap((r) => r.payments),
    year,
    month
  );

  const firstName = (user.name ?? "there").split(" ")[0];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={
          reviewer
            ? "Snapshot of attendance, leaves and sales across Arzon Global."
            : "Your attendance, leave requests and sales at a glance."
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reviewer ? (
          <StatCard
            label="Checked in today"
            value={`${todayRecords} / ${activeUsers}`}
            sub={activeUsers - todayRecords > 0 ? `${activeUsers - todayRecords} not in yet` : "Everyone is in"}
            icon={Users}
          />
        ) : (
          <StatCard
            label="Your attendance today"
            value={myToday?.loginAt ? formatTime(myToday.loginAt) : "Not in"}
            sub={
              myToday?.logoutAt
                ? `Checked out ${formatTime(myToday.logoutAt)}`
                : myToday?.loginAt
                  ? "Checked in"
                  : "Head to Attendance to check in"
            }
            icon={Clock}
            tone={myToday?.loginAt ? "positive" : "warn"}
          />
        )}
        <StatCard
          label={reviewer ? "Pending leave requests" : "Your pending leaves"}
          value={String(pendingLeaves.length)}
          sub={reviewer ? "Awaiting your review" : "Awaiting HR review"}
          icon={CalendarDays}
          tone={pendingLeaves.length > 0 ? "warn" : "neutral"}
        />
        <StatCard
          label="Closed won this month"
          value={formatCurrency(wonThisMonth)}
          sub={reviewer ? "Team-wide" : "Your deals"}
          icon={TrendingUp}
          tone="positive"
        />
        <StatCard
          label="Collected this month"
          value={formatCurrency(collectedThisMonth)}
          sub="Payments received"
          icon={Wallet}
          tone="positive"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReportBarChart
            title="Closed-won revenue"
            description={reviewer ? "Team, last 6 months" : "Your deals, last 6 months"}
            data={monthlyClosedRevenue(reports, 6)}
            valueType="currency"
          />
        </div>

        <div className="rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink-900">Leave requests</h2>
            <Link href="/leaves" className="text-xs text-amber-600 hover:underline">
              View all
            </Link>
          </div>
          <p className="mt-1 text-xs text-ink-500">{reviewer ? "Needs your review." : "Still pending."}</p>

          {pendingLeaves.length === 0 ? (
            <div className="mt-4 flex h-40 items-center justify-center rounded-md border border-dashed border-ink-100 text-sm text-ink-500">
              Nothing pending right now.
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100">
              {pendingLeaves.slice(0, 5).map((leave) => (
                <li key={leave.id} className="py-2.5 text-sm">
                  <p className="text-ink-900">
                    {reviewer ? leave.user.name : LEAVE_TYPE_LABELS[leave.type]}
                    {reviewer && (
                      <span className="text-xs text-ink-500"> · {LEAVE_TYPE_LABELS[leave.type]}</span>
                    )}
                  </p>
                  <p className="text-xs text-ink-500">
                    {formatDateRange(leave.startDate, leave.endDate)} ·{" "}
                    {leaveDayCount(leave.startDate, leave.endDate)} day(s)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold text-ink-900">Recent sales activity</h2>
            <p className="mt-1 text-xs text-ink-500">
              {reviewer ? "Latest deals logged by the team." : "Your latest deals."}
            </p>
          </div>
          <Link href="/sales-reports" className="text-xs text-amber-600 hover:underline">
            Open sales reports
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="mt-4 flex h-32 items-center justify-center rounded-md border border-dashed border-ink-100 text-sm text-ink-500">
            No sales logged yet.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {reports.slice(0, 6).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-900">
                    {r.clientName}
                    <span className="ml-2 text-xs text-ink-500">{r.courseOrPlan}</span>
                  </p>
                  <p className="text-xs text-ink-500">
                    {reviewer && `${r.user.name} · `}
                    {formatDate(r.reportDate, { year: "numeric" })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium text-ink-900">{formatCurrency(r.dealValue)}</span>
                  <SalesBadge status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
