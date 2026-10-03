"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toggleActive } from "@/app/(dashboard)/employees/actions";
import { EditCompensationForm } from "@/components/salary/edit-compensation-form";
import { formatCurrency } from "@/lib/salary";
import { formatDate } from "@/lib/format";
import type { Role } from "@prisma/client";

export type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  designation: string | null;
  dateJoined: Date;
  isActive: boolean;
  baseSalary: number;
  commissionRate: number;
  dealsWonThisMonth: number;
  wonValueThisMonth: number;
  pendingLeaves: number;
};

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: "bg-navy-900/10 text-navy-800",
  HR: "bg-amber-100 text-amber-600",
  EMPLOYEE: "bg-ink-100 text-ink-700"
};

export function EmployeesTable({ employees, currentUserId }: { employees: EmployeeRow[]; currentUserId: string }) {
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter(
      (e) =>
        (showInactive || e.isActive) &&
        (!q ||
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.department ?? "").toLowerCase().includes(q))
    );
  }, [employees, query, showInactive]);

  async function toggle(id: string) {
    setPendingToggle(id);
    try {
      await toggleActive(id);
    } finally {
      setPendingToggle(null);
    }
  }

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink-900">Directory</h2>
          <p className="mt-0.5 text-xs text-ink-500">{rows.length} of {employees.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-ink-500">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="accent-amber-500"
            />
            Show inactive
          </label>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, department"
              className="w-56 rounded-md border border-ink-100 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus-visible:border-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
              <th className="px-5 py-2.5 font-medium">Employee</th>
              <th className="px-5 py-2.5 font-medium">Role</th>
              <th className="px-5 py-2.5 font-medium">Joined</th>
              <th className="px-5 py-2.5 font-medium">Compensation</th>
              <th className="px-5 py-2.5 font-medium">This month</th>
              <th className="px-5 py-2.5 font-medium">Pending leaves</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-sm text-ink-500">
                  No employees match.
                </td>
              </tr>
            ) : (
              rows.map((e) => (
                <tr
                  key={e.id}
                  className={`border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30 ${!e.isActive ? "opacity-50" : ""}`}
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink-900">{e.name}</p>
                    <p className="text-xs text-ink-500">
                      {e.email}
                      {e.department && ` · ${e.department}`}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[e.role]}`}>
                      {e.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-ink-700">
                    {formatDate(e.dateJoined, { year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <EditCompensationForm userId={e.id} baseSalary={e.baseSalary} commissionRate={e.commissionRate} />
                  </td>
                  <td className="px-5 py-3 text-ink-700">
                    {e.dealsWonThisMonth > 0 ? (
                      <>
                        {e.dealsWonThisMonth} won · {formatCurrency(e.wonValueThisMonth)}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-700">
                    {e.pendingLeaves > 0 ? (
                      <span className="text-warn">{e.pendingLeaves} pending</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {e.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => toggle(e.id)}
                        disabled={pendingToggle === e.id}
                        className={`text-xs font-medium transition-colors disabled:opacity-50 ${
                          e.isActive ? "text-danger hover:text-danger/80" : "text-success hover:text-success/80"
                        }`}
                      >
                        {pendingToggle === e.id ? "..." : e.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
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
