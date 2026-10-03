import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, IndianRupee, Percent, UserCheck } from "lucide-react";
import { clsx } from "clsx";
import { auth, canReview } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ReportBarChart } from "@/components/reports/report-bar-chart";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { STATUS_STYLES, statusCounts } from "@/lib/attendance";
import { LEAVE_TYPE_LABELS, countByType } from "@/lib/leaves";
import { formatCurrency, monthlyClosedRevenue, monthlyCollections } from "@/lib/sales";
import {
  PERIOD_LABELS,
  buildEmployeeRows,
  inRange,
  parsePeriod,
  periodRange,
  type Period
} from "@/lib/reports";
import type { AttendanceStatus, LeaveType } from "@prisma/client";

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  if (!session?.user || !canReview(session.user.role)) redirect("/dashboard");

  const { range } = await searchParams;
  const period = parsePeriod(range);
  const { start, end } = periodRange(period);

  const [users, reports, attendance, leaves] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, department: true }
    }),
    prisma.salesReport.findMany({ include: { payments: true } }),
    prisma.attendance.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.leave.findMany({ where: { startDate: { lte: end }, endDate: { gte: start } } })
  ]);

  const rows = buildEmployeeRows({ users, reports, attendance, leaves, start, end });

  const reportsInRange = reports.filter((r) => inRange(r.reportDate, start, end));
  const won = reportsInRange.filter((r) => r.status === "CLOSED_WON");
  const lost = reportsInRange.filter((r) => r.status === "CLOSED_LOST");
  const revenue = won.reduce((s, r) => s + r.dealValue, 0);
  const collected = reports
    .flatMap((r) => r.payments)
    .filter((p) => inRange(p.paidOn, start, end))
    .reduce((s, p) => s + p.amount, 0);
  const winRate = won.length + lost.length > 0 ? won.length / (won.length + lost.length) : null;

  const attCounts = statusCounts(attendance);
  const attended = attCounts.PRESENT + attCounts.LATE + attCounts.HALF_DAY;
  const recorded = attended + attCounts.ABSENT;

  const leaveCounts = countByType(leaves, start, end);

  const revenueTrend = monthlyClosedRevenue(reports, 6);
  const collectionTrend = monthlyCollections(
    reports.flatMap((r) => r.payments),
    6
  );
  const attendanceData = (Object.keys(attCounts) as AttendanceStatus[]).map((s) => ({
    label: STATUS_STYLES[s].label,
    value: attCounts[s]
  }));
  const leaveData = (Object.keys(leaveCounts) as LeaveType[]).map((t) => ({
    label: LEAVE_TYPE_LABELS[t].replace(" leave", ""),
    value: leaveCounts[t]
  }));

  const leaderboard = [...rows].sort((a, b) => b.wonValue - a.wonValue);
  const csvRows = leaderboard.map((r) => ({
    Employee: r.name,
    Department: r.department ?? "",
    Deals: r.deals,
    "Closed won": r.won,
    "Closed lost": r.lost,
    "Won value (INR)": r.wonValue,
    "Collected (INR)": r.collected,
    "Outstanding (INR)": r.outstanding,
    "Win rate": pct(r.winRate),
    "Days present": r.present,
    "Days late": r.late,
    "Days absent": r.absent,
    "Leave days": r.leaveDays,
    "Attendance rate": pct(r.attendanceRate)
  }));

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Sales, collections, attendance and leave performance across the team."
      />

      <div className="mb-6 inline-flex rounded-md border border-ink-100 bg-surface-card p-0.5">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <Link
            key={p}
            href={`?range=${p}`}
            className={clsx(
              "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
              p === period ? "bg-navy-900 text-white" : "text-ink-500 hover:text-ink-900"
            )}
          >
            {PERIOD_LABELS[p]}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Closed-won revenue"
          value={formatCurrency(revenue)}
          sub={`${won.length} deal(s) won`}
          icon={IndianRupee}
          tone="positive"
        />
        <StatCard
          label="Payments collected"
          value={formatCurrency(collected)}
          sub="Received in this period"
          icon={Award}
          tone="positive"
        />
        <StatCard
          label="Win rate"
          value={pct(winRate)}
          sub={`${won.length} won · ${lost.length} lost`}
          icon={Percent}
        />
        <StatCard
          label="Attendance rate"
          value={recorded > 0 ? pct(attended / recorded) : "—"}
          sub={`${attCounts.LATE} late · ${attCounts.ABSENT} absent`}
          icon={UserCheck}
          tone={recorded > 0 && attended / recorded < 0.85 ? "warn" : "neutral"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportBarChart
          title="Closed-won revenue"
          description="Deal value marked closed-won, last 6 months"
          data={revenueTrend}
          color="#16213E"
          valueType="currency"
        />
        <ReportBarChart
          title="Cash collected"
          description="Payments received, last 6 months"
          data={collectionTrend}
          color="#2F9E6E"
          valueType="currency"
        />
        <ReportBarChart
          title="Attendance breakdown"
          description={`Records logged · ${PERIOD_LABELS[period].toLowerCase()}`}
          data={attendanceData}
          color="#E8963C"
        />
        <ReportBarChart
          title="Leave requests by type"
          description={`Excludes cancelled · ${PERIOD_LABELS[period].toLowerCase()}`}
          data={leaveData}
          color="#3A4A73"
        />
      </div>

      <div className="mt-6 rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-display text-sm font-semibold text-ink-900">Employee performance</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Sales, collections, attendance and leave per person &middot; {PERIOD_LABELS[period].toLowerCase()}
            </p>
          </div>
          <ExportCsvButton rows={csvRows} filename={`arzon-performance-${period}.csv`} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
                <th className="px-5 py-2.5 font-medium">Employee</th>
                <th className="px-5 py-2.5 font-medium">Deals</th>
                <th className="px-5 py-2.5 font-medium">Won value</th>
                <th className="px-5 py-2.5 font-medium">Collected</th>
                <th className="px-5 py-2.5 font-medium">Outstanding</th>
                <th className="px-5 py-2.5 font-medium">Win rate</th>
                <th className="px-5 py-2.5 font-medium">Present</th>
                <th className="px-5 py-2.5 font-medium">Late</th>
                <th className="px-5 py-2.5 font-medium">Absent</th>
                <th className="px-5 py-2.5 font-medium">Leave days</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink-900">
                      {i === 0 && r.wonValue > 0 && <span className="mr-1.5 text-amber-500">★</span>}
                      {r.name}
                    </p>
                    <p className="text-xs text-ink-500">{r.department ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{r.deals}</td>
                  <td className="px-5 py-3 text-ink-900">{formatCurrency(r.wonValue)}</td>
                  <td className="px-5 py-3 text-success">{formatCurrency(r.collected)}</td>
                  <td className="px-5 py-3 text-ink-700">{r.outstanding > 0 ? formatCurrency(r.outstanding) : "—"}</td>
                  <td className="px-5 py-3 text-ink-700">{pct(r.winRate)}</td>
                  <td className="px-5 py-3 text-ink-700">{r.present}</td>
                  <td className="px-5 py-3 text-ink-700">{r.late}</td>
                  <td className="px-5 py-3 text-ink-700">{r.absent}</td>
                  <td className="px-5 py-3 text-ink-700">{r.leaveDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
