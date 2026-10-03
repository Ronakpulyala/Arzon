"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Attendance, AttendanceStatus, User } from "@prisma/client";
import { formatTime } from "@/lib/format";
import { STATUS_STYLES } from "@/lib/attendance";
import { AttendanceBadge } from "@/components/attendance/attendance-badge";

type Row = Pick<User, "id" | "name" | "department" | "designation"> & { attendance: Attendance[] };
type Filter = AttendanceStatus | "ALL" | "NOT_IN";

export function TeamAttendanceTable({ employees }: { employees: Row[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      const today = e.attendance[0];
      const matchesQuery =
        !q || e.name.toLowerCase().includes(q) || (e.department ?? "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "ALL" || (filter === "NOT_IN" ? !today : today?.status === filter);
      return matchesQuery && matchesFilter;
    });
  }, [employees, query, filter]);

  const checkedIn = employees.filter((e) => e.attendance[0]?.loginAt).length;

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink-900">Team — today</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {checkedIn} of {employees.length} checked in
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or department"
              className="w-52 rounded-md border border-ink-100 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus-visible:border-amber-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="rounded-md border border-ink-100 bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:border-amber-500"
          >
            <option value="ALL">Everyone</option>
            <option value="NOT_IN">Not checked in</option>
            {(Object.keys(STATUS_STYLES) as AttendanceStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_STYLES[s].label}
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
              <th className="px-5 py-2.5 font-medium">Department</th>
              <th className="px-5 py-2.5 font-medium">Check-in</th>
              <th className="px-5 py-2.5 font-medium">Check-out</th>
              <th className="px-5 py-2.5 font-medium">Hours</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-ink-500">
                  No one matches that filter.
                </td>
              </tr>
            ) : (
              rows.map((emp) => {
                const today = emp.attendance[0] ?? null;
                return (
                  <tr
                    key={emp.id}
                    className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">{emp.name}</p>
                      <p className="text-xs text-ink-500">{emp.designation ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{emp.department ?? "—"}</td>
                    <td className="px-5 py-3 tabular-nums text-ink-700">
                      {formatTime(today?.loginAt ?? null)}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-ink-700">
                      {formatTime(today?.logoutAt ?? null)}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-ink-700">
                      {today?.hoursLogged != null ? `${today.hoursLogged}h` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {today ? (
                        <AttendanceBadge status={today.status} />
                      ) : (
                        <span className="text-xs text-ink-500">Not checked in</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
