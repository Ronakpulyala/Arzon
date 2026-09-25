import type { Attendance, User } from "@prisma/client";
import { formatTime } from "@/lib/attendance";
import { AttendanceBadge } from "@/components/attendance/attendance-badge";

type Row = User & { attendance: Attendance[] };

export function TeamAttendanceTable({ employees }: { employees: Row[] }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-ink-900">Team — today</h2>
        <p className="text-xs text-ink-500">{employees.length} employees</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
              <th className="px-5 py-2.5 font-medium">Employee</th>
              <th className="px-5 py-2.5 font-medium">Department</th>
              <th className="px-5 py-2.5 font-medium">Check-in</th>
              <th className="px-5 py-2.5 font-medium">Check-out</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const today = emp.attendance[0] ?? null;
              return (
                <tr key={emp.id} className="border-b border-ink-100 last:border-0">
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
                  <td className="px-5 py-3">
                    {today ? (
                      <AttendanceBadge status={today.status} />
                    ) : (
                      <span className="text-xs text-ink-500">Not checked in</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
