"use client";

import { useEffect, useState, useTransition } from "react";
import type { Attendance } from "@prisma/client";
import { Coffee, LogIn, LogOut, CheckCircle2, Play } from "lucide-react";
import { checkIn, checkOut, endBreak, startBreak } from "@/app/(dashboard)/attendance/actions";
import { formatTime } from "@/lib/format";
import { formatMinutes } from "@/lib/attendance";
import { AttendanceBadge } from "@/components/attendance/attendance-badge";

function useElapsedMinutes(since: Date | null) {
  const [minutes, setMinutes] = useState(0);
  useEffect(() => {
    if (!since) return;
    const tick = () => setMinutes(Math.max(Math.round((Date.now() - since.getTime()) / 60_000), 0));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [since]);
  return minutes;
}

export function CheckInCard({ today }: { today: Attendance | null }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasCheckedIn = Boolean(today?.loginAt);
  const hasCheckedOut = Boolean(today?.logoutAt);
  const onBreak = Boolean(today?.breakStartedAt);
  const elapsedBreak = useElapsedMinutes(today?.breakStartedAt ? new Date(today.breakStartedAt) : null);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink-900">Today</h2>
        {today && <AttendanceBadge status={today.status} />}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-ink-500">Checked in</p>
          <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-ink-900">
            {formatTime(today?.loginAt ?? null)}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Checked out</p>
          <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-ink-900">
            {formatTime(today?.logoutAt ?? null)}
          </p>
        </div>
      </div>

      {(onBreak || (today?.breakMinutes ?? 0) > 0) && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
          <Coffee size={12} strokeWidth={2} />
          {onBreak
            ? `On break · ${formatMinutes(elapsedBreak)} so far`
            : `${formatMinutes(today?.breakMinutes ?? 0)} on break today`}
        </p>
      )}

      <div className="mt-5 space-y-2">
        {!hasCheckedIn && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(checkIn)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 active:scale-[0.99] disabled:opacity-60"
          >
            <LogIn size={16} strokeWidth={1.8} />
            Check in
          </button>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(onBreak ? endBreak : startBreak)}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-ink-100 bg-white py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 active:scale-[0.99] disabled:opacity-60"
            >
              {onBreak ? <Play size={15} strokeWidth={2} /> : <Coffee size={15} strokeWidth={1.8} />}
              {onBreak ? "End break" : "Start break"}
            </button>
            <button
              type="button"
              disabled={pending || onBreak}
              title={onBreak ? "End your break first" : undefined}
              onClick={() => run(checkOut)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 py-2.5 text-sm font-medium text-navy-900 transition-colors hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50"
            >
              <LogOut size={16} strokeWidth={1.8} />
              Check out
            </button>
          </>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <div className="flex items-center justify-center gap-2 rounded-md bg-success/10 py-2.5 text-sm font-medium text-success">
            <CheckCircle2 size={16} strokeWidth={1.8} />
            Day complete &middot; {today?.hoursLogged ?? 0}h logged
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
