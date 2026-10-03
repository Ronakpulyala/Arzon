import type { Leave } from "@prisma/client";
import { X } from "lucide-react";
import { LEAVE_TYPE_LABELS, leaveDayCount } from "@/lib/leaves";
import { formatDateRange } from "@/lib/format";
import { LeaveBadge } from "@/components/leaves/leave-badge";
import { cancelLeave } from "@/app/(dashboard)/leaves/actions";

export function MyLeavesTable({ leaves }: { leaves: Leave[] }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-ink-900">Your requests</h2>
      </div>

      {leaves.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-500">No leave requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
                <th className="px-5 py-2.5 font-medium">Type</th>
                <th className="px-5 py-2.5 font-medium">Dates</th>
                <th className="px-5 py-2.5 font-medium">Days</th>
                <th className="px-5 py-2.5 font-medium">Reason</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-5 py-3 text-ink-900">{LEAVE_TYPE_LABELS[leave.type]}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-ink-700">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </td>
                  <td className="px-5 py-3 text-ink-700">
                    {leaveDayCount(leave.startDate, leave.endDate)}
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 text-ink-700" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="px-5 py-3">
                    <LeaveBadge status={leave.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {leave.status === "PENDING" && (
                      <form action={cancelLeave.bind(null, leave.id)}>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-xs text-ink-500 transition-colors hover:text-danger"
                        >
                          <X size={12} strokeWidth={2} />
                          Cancel
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
