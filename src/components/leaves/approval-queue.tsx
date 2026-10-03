import type { Leave, User } from "@prisma/client";
import { Check, X } from "lucide-react";
import { approveLeave, rejectLeave } from "@/app/(dashboard)/leaves/actions";
import { LEAVE_TYPE_LABELS, leaveDayCount } from "@/lib/leaves";
import { formatDateRange } from "@/lib/format";

type PendingLeave = Leave & { user: Pick<User, "name"> };

export function ApprovalQueue({ pending }: { pending: PendingLeave[] }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-ink-900">Pending approval</h2>
        <p className="text-xs text-ink-500">{pending.length} awaiting review</p>
      </div>

      {pending.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-500">Nothing pending — you&apos;re all caught up.</p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {pending.map((leave) => (
            <li key={leave.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900">
                  {leave.user.name}
                  <span className="ml-2 text-xs font-normal text-ink-500">
                    {LEAVE_TYPE_LABELS[leave.type]}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {formatDateRange(leave.startDate, leave.endDate)} &middot;{" "}
                  {leaveDayCount(leave.startDate, leave.endDate)} day(s)
                </p>
                <p className="mt-1 truncate text-xs text-ink-700">{leave.reason}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <form action={approveLeave.bind(null, leave.id)}>
                  <button
                    type="submit"
                    aria-label={`Approve ${leave.user.name}'s leave`}
                    className="flex h-8 items-center gap-1 rounded-md bg-success/10 px-2.5 text-xs font-medium text-success transition-colors hover:bg-success/20"
                  >
                    <Check size={14} strokeWidth={2} />
                    Approve
                  </button>
                </form>
                <form action={rejectLeave.bind(null, leave.id)}>
                  <button
                    type="submit"
                    aria-label={`Reject ${leave.user.name}'s leave`}
                    className="flex h-8 items-center gap-1 rounded-md bg-danger/10 px-2.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
                  >
                    <X size={14} strokeWidth={2} />
                    Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
