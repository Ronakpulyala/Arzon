"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatCurrency, monthLabel, type SalaryWithUser } from "@/lib/salary";
import { formatDate } from "@/lib/format";

export function SalaryLedger({ salaries }: { salaries: SalaryWithUser[] }) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...salaries]
      .filter((s) => !q || s.user.name.toLowerCase().includes(q))
      .sort((a, b) => b.year - a.year || b.month - a.month || a.user.name.localeCompare(b.user.name));
  }, [salaries, query]);

  const total = rows.reduce((s, r) => s + r.netPay, 0);

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink-900">Payroll history</h2>
          <p className="mt-0.5 text-xs text-ink-500">{formatCurrency(total)} across {rows.length} payout(s) shown</p>
        </div>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee"
            className="w-48 rounded-md border border-ink-100 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus-visible:border-amber-500"
          />
        </div>
      </div>

      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
              <th className="px-5 py-2.5 font-medium">Employee</th>
              <th className="px-5 py-2.5 font-medium">Month</th>
              <th className="px-5 py-2.5 font-medium">Base</th>
              <th className="px-5 py-2.5 font-medium">Commission</th>
              <th className="px-5 py-2.5 font-medium">Net pay</th>
              <th className="px-5 py-2.5 font-medium">Paid on</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-ink-500">
                  No payouts match.
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30">
                  <td className="px-5 py-3">
                    <p className="text-ink-900">{s.user.name}</p>
                    <p className="text-xs text-ink-500">{s.user.department ?? "—"}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-ink-700">{monthLabel(s.month - 1, s.year)}</td>
                  <td className="px-5 py-3 text-ink-700">{formatCurrency(s.basic)}</td>
                  <td className="px-5 py-3 text-ink-700">{formatCurrency(s.allowances + s.bonus)}</td>
                  <td className="px-5 py-3 font-medium text-success">{formatCurrency(s.netPay)}</td>
                  <td className="px-5 py-3 text-ink-700">
                    {s.paidOn ? formatDate(s.paidOn, { year: "numeric" }) : "Pending"}
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
