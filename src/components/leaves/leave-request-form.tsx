"use client";

import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { applyLeave } from "@/app/(dashboard)/leaves/actions";
import { useFormAction } from "@/lib/use-form-action";
import { LEAVE_TYPE_LABELS } from "@/lib/leaves";
import type { LeaveType } from "@prisma/client";

const field =
  "mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus-visible:border-amber-500";

export function LeaveRequestForm({ name }: { name: string }) {
  const { state, isPending, onSubmit } = useFormAction(applyLeave);
  const types = Object.keys(LEAVE_TYPE_LABELS) as LeaveType[];

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink-900">Request leave</h2>
        <span className="text-xs text-ink-500">
          Applying as <span className="font-medium text-ink-700">{name}</span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="type" className="block text-xs font-medium text-ink-700">
            Leave type
          </label>
          <select id="type" name="type" required defaultValue="" className={field}>
            <option value="" disabled>
              Select a type
            </option>
            {types.map((t) => (
              <option key={t} value={t}>
                {LEAVE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-xs font-medium text-ink-700">
            Start date
          </label>
          <input id="startDate" name="startDate" type="date" required className={field} />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-xs font-medium text-ink-700">
            End date
          </label>
          <input id="endDate" name="endDate" type="date" required className={field} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="reason" className="block text-xs font-medium text-ink-700">
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            required
            rows={3}
            placeholder="Briefly describe why you're requesting this leave"
            className={`${field} resize-none`}
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 size={13} strokeWidth={2} />
          Request submitted — HR will review it shortly.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 flex items-center justify-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
      >
        <CalendarPlus size={16} strokeWidth={1.8} />
        {isPending ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
