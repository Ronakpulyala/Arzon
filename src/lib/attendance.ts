import { AttendanceStatus, type Attendance } from "@prisma/client";
import { APP_TIMEZONE } from "@/lib/format";

// Anyone checking in after this time (business timezone) is marked LATE.
export const LATE_CUTOFF_HOUR = 10;
export const LATE_CUTOFF_MINUTE = 15;

function partsInTz(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month) - 1,
    day: Number(p.day),
    hour: Number(p.hour) % 24,
    minute: Number(p.minute)
  };
}

/**
 * Today's calendar date in the business timezone, as UTC midnight.
 * Prisma @db.Date columns are read/written as UTC dates, so using UTC midnight
 * keeps the stored day identical to the day the employee actually sees.
 * (The previous local-midnight version stored yesterday's date for users east of UTC.)
 */
export function todayDateOnly(): Date {
  const { year, month, day } = partsInTz(new Date());
  return new Date(Date.UTC(year, month, day));
}

export function isSameDate(a: Date, b: Date): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getUTCFullYear() === y.getUTCFullYear() &&
    x.getUTCMonth() === y.getUTCMonth() &&
    x.getUTCDate() === y.getUTCDate()
  );
}

export function determineStatus(loginAt: Date): AttendanceStatus {
  const { hour, minute } = partsInTz(loginAt);
  const minutes = hour * 60 + minute;
  return minutes > LATE_CUTOFF_HOUR * 60 + LATE_CUTOFF_MINUTE
    ? AttendanceStatus.LATE
    : AttendanceStatus.PRESENT;
}

export function hoursBetween(start: Date, end: Date, breakMinutes = 0): number {
  const raw = (end.getTime() - start.getTime()) / 3_600_000 - breakMinutes / 60;
  return Math.max(Math.round(raw * 100) / 100, 0);
}

export function formatMinutes(mins: number): string {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const STATUS_STYLES: Record<
  AttendanceStatus,
  { label: string; dot: string; badge: string }
> = {
  PRESENT: { label: "Present", dot: "bg-success", badge: "bg-success/10 text-success" },
  LATE: { label: "Late", dot: "bg-warn", badge: "bg-warn/10 text-warn" },
  ABSENT: { label: "Absent", dot: "bg-danger", badge: "bg-danger/10 text-danger" },
  HALF_DAY: { label: "Half day", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-600" },
  ON_LEAVE: { label: "On leave", dot: "bg-navy-600", badge: "bg-navy-900/10 text-navy-800" }
};

export function statusCounts(records: Attendance[]): Record<AttendanceStatus, number> {
  const counts: Record<AttendanceStatus, number> = {
    PRESENT: 0,
    LATE: 0,
    ABSENT: 0,
    HALF_DAY: 0,
    ON_LEAVE: 0
  };
  for (const r of records) counts[r.status]++;
  return counts;
}

/** Sun–Sat calendar grid for a month (UTC dates), padding days as null. */
export function buildMonthMatrix(year: number, month: number): Array<Array<Date | null>> {
  const startWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: Array<Date | null> = [
    ...Array<null>(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(Date.UTC(year, month, i + 1)))
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Parse "?month=2026-09" (defaults to the current month in the business timezone). */
export function parseMonthParam(value?: string): { year: number; month: number } {
  const match = value?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    if (month >= 0 && month <= 11) return { year, month };
  }
  const t = todayDateOnly();
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() };
}

export function monthRange(year: number, month: number) {
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 0))
  };
}

export function monthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}
