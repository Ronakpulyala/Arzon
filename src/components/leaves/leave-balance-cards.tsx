import type { Leave, LeaveType } from "@prisma/client";
import { LEAVE_ALLOTMENTS, LEAVE_TYPE_LABELS, usedDaysByType } from "@/lib/leaves";

export function LeaveBalanceCards({ leaves, year }: { leaves: Leave[]; year: number }) {
  const used = usedDaysByType(leaves, year);
  const pending = usedDaysByType(leaves, year, ["PENDING"]);
  const types = Object.keys(LEAVE_ALLOTMENTS) as LeaveType[];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {types.map((type) => {
        const allotment = LEAVE_ALLOTMENTS[type];
        const remaining = allotment === null ? null : Math.max(allotment - used[type], 0);
        const pct = allotment ? Math.min((used[type] / allotment) * 100, 100) : 0;

        return (
          <div key={type} className="rounded-lg border border-ink-100 bg-surface-card p-4 shadow-subtle transition-shadow hover:shadow-md">
            <p className="text-xs text-ink-500">{LEAVE_TYPE_LABELS[type]}</p>
            <p className="mt-1.5 font-display text-xl font-semibold text-ink-900">
              {remaining === null ? "—" : remaining}
              {remaining !== null && (
                <span className="ml-1 text-xs font-normal text-ink-500">/ {allotment} left</span>
              )}
            </p>
            {allotment !== null && (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
              </div>
            )}
            <p className="mt-1.5 text-[11px] text-ink-500">
              {used[type]} used
              {pending[type] > 0 && <span className="text-warn"> · {pending[type]} pending</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}
