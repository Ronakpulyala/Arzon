import type { Attendance } from "@prisma/client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import {
  buildMonthMatrix,
  isSameDate,
  monthParam,
  STATUS_STYLES,
  todayDateOnly
} from "@/lib/attendance";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function AttendanceCalendar({
  year,
  month,
  records
}: {
  year: number;
  month: number; // 0-indexed
  records: Attendance[];
}) {
  const weeks = buildMonthMatrix(year, month);
  const today = todayDateOnly();

  const prev = new Date(Date.UTC(year, month - 1, 1));
  const next = new Date(Date.UTC(year, month + 1, 1));
  const isCurrentMonth = year === today.getUTCFullYear() && month === today.getUTCMonth();

  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });

  const recordFor = (day: Date) => records.find((r) => isSameDate(r.date, day));

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link
            href={`?month=${monthParam(prev.getUTCFullYear(), prev.getUTCMonth())}`}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100"
          >
            <ChevronLeft size={16} />
          </Link>
          <h2 className="min-w-32 text-center font-display text-sm font-semibold text-ink-900">
            {monthLabel}
          </h2>
          {isCurrentMonth ? (
            <span className="flex h-7 w-7 items-center justify-center text-ink-300">
              <ChevronRight size={16} />
            </span>
          ) : (
            <Link
              href={`?month=${monthParam(next.getUTCFullYear(), next.getUTCMonth())}`}
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100"
            >
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(STATUS_STYLES).map(([key, s]) => (
            <span key={key} className="flex items-center gap-1 text-[11px] text-ink-500">
              <span className={clsx("h-1.5 w-1.5 rounded-full", s.dot)} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-ink-500">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day, i) => {
          if (!day) return <div key={i} className="aspect-square" />;

          const record = recordFor(day);
          const isToday = isSameDate(day, today);
          const isFuture = day > today;

          return (
            <div
              key={i}
              title={record ? STATUS_STYLES[record.status].label : undefined}
              className={clsx(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-sm border text-xs transition-colors",
                isToday ? "border-amber-500 bg-amber-100/40" : "border-transparent hover:bg-ink-100/60",
                isFuture ? "text-ink-300" : "text-ink-700"
              )}
            >
              <span>{day.getUTCDate()}</span>
              {record && !isFuture && (
                <span className={clsx("h-1.5 w-1.5 rounded-full", STATUS_STYLES[record.status].dot)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
