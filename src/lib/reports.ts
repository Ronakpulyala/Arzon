import type { Attendance, Leave, SalesReport, SalesPayment } from "@prisma/client";
import { todayDateOnly } from "@/lib/attendance";
import { leaveDayCount } from "@/lib/leaves";

export type Period = "month" | "quarter" | "year";

export const PERIOD_LABELS: Record<Period, string> = {
  month: "This month",
  quarter: "Last 3 months",
  year: "This year"
};

export function parsePeriod(value?: string): Period {
  return value === "month" || value === "year" || value === "quarter" ? value : "quarter";
}

export function periodRange(period: Period): { start: Date; end: Date } {
  const today = todayDateOnly();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  if (period === "month") return { start: new Date(Date.UTC(y, m, 1)), end: today };
  if (period === "quarter") return { start: new Date(Date.UTC(y, m - 2, 1)), end: today };
  return { start: new Date(Date.UTC(y, 0, 1)), end: today };
}

export function inRange(d: Date | string, start: Date, end: Date): boolean {
  const t = new Date(d).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

/** Days of a leave that fall inside [start, end], inclusive. */
export function overlapDays(leave: Leave, start: Date, end: Date): number {
  const s = new Date(Math.max(new Date(leave.startDate).getTime(), start.getTime()));
  const e = new Date(Math.min(new Date(leave.endDate).getTime(), end.getTime()));
  return e < s ? 0 : leaveDayCount(s, e);
}

export type EmployeeRow = {
  id: string;
  name: string;
  department: string | null;
  deals: number;
  won: number;
  lost: number;
  wonValue: number;
  collected: number;
  outstanding: number;
  winRate: number | null;
  present: number;
  late: number;
  absent: number;
  leaveDays: number;
  attendanceRate: number | null;
};

export function buildEmployeeRows(input: {
  users: Array<{ id: string; name: string; department: string | null }>;
  reports: Array<SalesReport & { payments: SalesPayment[] }>;
  attendance: Attendance[];
  leaves: Leave[];
  start: Date;
  end: Date;
}): EmployeeRow[] {
  const { users, reports, attendance, leaves, start, end } = input;

  return users.map((u) => {
    const mine = reports.filter((r) => r.userId === u.id && inRange(r.reportDate, start, end));
    const won = mine.filter((r) => r.status === "CLOSED_WON");
    const lost = mine.filter((r) => r.status === "CLOSED_LOST");
    const collected = reports
      .filter((r) => r.userId === u.id)
      .flatMap((r) => r.payments)
      .filter((p) => inRange(p.paidOn, start, end))
      .reduce((s, p) => s + p.amount, 0);
    const outstanding = won.reduce(
      (s, r) => s + Math.max(r.dealValue - r.payments.reduce((x, p) => x + p.amount, 0), 0),
      0
    );

    const att = attendance.filter((a) => a.userId === u.id);
    const present = att.filter((a) => a.status === "PRESENT").length;
    const late = att.filter((a) => a.status === "LATE").length;
    const half = att.filter((a) => a.status === "HALF_DAY").length;
    const absent = att.filter((a) => a.status === "ABSENT").length;
    const recorded = present + late + half + absent;

    const leaveDays = leaves
      .filter((l) => l.userId === u.id && l.status === "APPROVED")
      .reduce((s, l) => s + overlapDays(l, start, end), 0);

    return {
      id: u.id,
      name: u.name,
      department: u.department,
      deals: mine.length,
      won: won.length,
      lost: lost.length,
      wonValue: won.reduce((s, r) => s + r.dealValue, 0),
      collected,
      outstanding,
      winRate: won.length + lost.length > 0 ? won.length / (won.length + lost.length) : null,
      present,
      late,
      absent,
      leaveDays,
      attendanceRate: recorded > 0 ? (present + late + half) / recorded : null
    };
  });
}
