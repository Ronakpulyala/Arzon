import { AttendanceStatus } from "@prisma/client";

// Anyone logging in after this time is marked LATE.
export const LATE_CUTOFF_HOUR = 10;
export const LATE_CUTOFF_MINUTE = 15;

/** Today's date with the time zeroed out — matches the Prisma @db.Date column. */
export function todayDateOnly(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function determineStatus(loginAt: Date): AttendanceStatus {
  const cutoff = new Date(loginAt);
  cutoff.setHours(LATE_CUTOFF_HOUR, LATE_CUTOFF_MINUTE, 0, 0);
  return loginAt > cutoff ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
}

export function hoursBetween(start: Date, end: Date): number {
  return Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 100) / 100;
}

export function formatTime(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export const STATUS_STYLES: Record<
  AttendanceStatus,
  { label: string; dot: string; badge: string }
> = {
  PRESENT: {
    label: "Present",
    dot: "bg-success",
    badge: "bg-success/10 text-success"
  },
  LATE: {
    label: "Late",
    dot: "bg-warn",
    badge: "bg-warn/10 text-warn"
  },
  ABSENT: {
    label: "Absent",
    dot: "bg-danger",
    badge: "bg-danger/10 text-danger"
  },
  HALF_DAY: {
    label: "Half day",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-600"
  },
  ON_LEAVE: {
    label: "On leave",
    dot: "bg-navy-600",
    badge: "bg-navy-900/10 text-navy-800"
  }
};

/** Builds a Sun–Sat calendar grid (array of weeks) for the given month, with padding days as null. */
export function buildMonthMatrix(year: number, month: number): Array<Array<Date | null>> {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday

  const cells: Array<Date | null> = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
