"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Leave, LeaveStatus, User } from "@prisma/client";
import { LEAVE_STATUS_STYLES, LEAVE_TYPE_LABELS, leaveDayCount } from "@/lib/leaves";
import { formatDateRange } from "@/lib/format";
import { LeaveBadge } from "@/components/leaves/leave-badge";

type Row = Leave & { user: Pick<User, "name" | "department"> };

export function AllLeavesTable({ leaves }: { leaves: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeaveStatus | "ALL">("ALL");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leaves.filter(
      (l) =>
        (status === "ALL" || l.status === status) &&
        (!q || l.user.name.toLowerCase().includes(q) || l.reason.toLowerCase().includes(q))
    );
  }, [leaves, query, status]);

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-ink-900">All leave requests</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employee or reason"
              className="w-52 rounded-md border border-ink-100 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus-visible:border-amber-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeaveStatus | "ALL")}
            className="rounded-md border border-ink-100 bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:border-amber-500"
          >
            <option value="ALL">All statuses</option>
            {(Object.keys(LEAVE_STATUS_STYLES) as LeaveStatus[]).map((s) => (
              <option key={s} value={s}>
                {LEAVE_STATUS_STYLES[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
              <th className="px-5 py-2.5 font-medium">Employee</th>
              <th className="px-5 py-2.5 font-medium">Type</th>
              <th className="px-5 py-2.5 font-medium">Dates</th>
              <th className="px-5 py-2.5 font-medium">Days</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-ink-500">
                  No matching requests.
                </td>
              </tr>
            ) : (
              rows.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-5 py-3">
                    <p className="text-ink-900">{l.user.name}</p>
                    <p className="text-xs text-ink-500">{l.user.department ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{LEAVE_TYPE_LABELS[l.type]}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-ink-700">
                    {formatDateRange(l.startDate, l.endDate)}
                  </td>
                  <td className="px-5 py-3 text-ink-700">{leaveDayCount(l.startDate, l.endDate)}</td>
                  <td className="px-5 py-3">
                    <LeaveBadge status={l.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
