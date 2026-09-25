import type { Attendance } from "@prisma/client";
import { clsx } from "clsx";
import { buildMonthMatrix, isSameDate, STATUS_STYLES, todayDateOnly } from "@/lib/attendance";

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
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  const recordFor = (day: Date) => records.find((r) => isSameDate(new Date(r.date), day));

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink-900">{monthLabel}</h2>
        <div className="flex items-center gap-3">
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
              className={clsx(
                "aspect-square rounded-sm flex flex-col items-center justify-center gap-0.5 text-xs",
                isToday ? "border border-amber-500" : "border border-transparent",
                isFuture ? "text-ink-300" : "text-ink-700"
              )}
            >
              <span>{day.getDate()}</span>
              {record && !isFuture && (
                <span
                  className={clsx("h-1.5 w-1.5 rounded-full", STATUS_STYLES[record.status].dot)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
