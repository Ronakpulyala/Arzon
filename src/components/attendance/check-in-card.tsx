import type { Attendance } from "@prisma/client";
import { LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { checkIn, checkOut } from "@/app/(dashboard)/attendance/actions";
import { formatTime } from "@/lib/attendance";
import { AttendanceBadge } from "@/components/attendance/attendance-badge";

export function CheckInCard({ today }: { today: Attendance | null }) {
  const hasCheckedIn = Boolean(today?.loginAt);
  const hasCheckedOut = Boolean(today?.logoutAt);

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink-900">Today</h2>
        {today && <AttendanceBadge status={today.status} />}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-ink-500">Checked in</p>
          <p className="mt-0.5 font-display text-lg font-semibold text-ink-900 tabular-nums">
            {formatTime(today?.loginAt ?? null)}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Checked out</p>
          <p className="mt-0.5 font-display text-lg font-semibold text-ink-900 tabular-nums">
            {formatTime(today?.logoutAt ?? null)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {!hasCheckedIn && (
          <form action={checkIn}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800"
            >
              <LogIn size={16} strokeWidth={1.8} />
              Check in
            </button>
          </form>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <form action={checkOut}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 py-2.5 text-sm font-medium text-navy-900 transition-colors hover:bg-amber-400"
            >
              <LogOut size={16} strokeWidth={1.8} />
              Check out
            </button>
          </form>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <div className="flex items-center justify-center gap-2 rounded-md bg-success/10 py-2.5 text-sm font-medium text-success">
            <CheckCircle2 size={16} strokeWidth={1.8} />
            Day complete &middot; {today?.hoursLogged ?? 0}h logged
          </div>
        )}
      </div>
    </div>
  );
}
