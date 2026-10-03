"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusSelect } from "@/components/sales/status-select";
import { formatDate } from "@/lib/format";
import {
  SALES_STATUS_LABELS,
  formatCurrency,
  outstanding,
  totalCollected,
  type SalesReportWithPayments
} from "@/lib/sales";
import type { SalesStatus, User } from "@prisma/client";

type Row = SalesReportWithPayments & { user: Pick<User, "id" | "name"> };

export function TeamSalesTable({ reports }: { reports: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SalesStatus | "ALL">("ALL");
  const [employee, setEmployee] = useState("ALL");

  const employees = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach((r) => map.set(r.user.id, r.user.name));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [reports]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter(
      (r) =>
        (status === "ALL" || r.status === status) &&
        (employee === "ALL" || r.user.id === employee) &&
        (!q || r.clientName.toLowerCase().includes(q) || r.courseOrPlan.toLowerCase().includes(q))
    );
  }, [reports, query, status, employee]);

  const totals = rows.reduce(
    (acc, r) => ({
      value: acc.value + r.dealValue,
      collected: acc.collected + totalCollected(r),
      due: acc.due + outstanding(r)
    }),
    { value: 0, collected: 0, due: 0 }
  );

  const select =
    "rounded-md border border-ink-100 bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:border-amber-500";

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink-900">Team — all sales reports</h2>
          <p className="mt-0.5 text-xs text-ink-500">{rows.length} of {reports.length} deals shown</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search client or course"
              className="w-48 rounded-md border border-ink-100 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus-visible:border-amber-500"
            />
          </div>
          <select value={employee} onChange={(e) => setEmployee(e.target.value)} className={select}>
            <option value="ALL">All employees</option>
            {employees.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SalesStatus | "ALL")}
            className={select}
          >
            <option value="ALL">All stages</option>
            {(Object.keys(SALES_STATUS_LABELS) as SalesStatus[]).map((s) => (
              <option key={s} value={s}>
                {SALES_STATUS_LABELS[s]}
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
              <th className="px-5 py-2.5 font-medium">Client</th>
              <th className="px-5 py-2.5 font-medium">Date</th>
              <th className="px-5 py-2.5 font-medium">Deal value</th>
              <th className="px-5 py-2.5 font-medium">Collected</th>
              <th className="px-5 py-2.5 font-medium">Outstanding</th>
              <th className="px-5 py-2.5 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-sm text-ink-500">
                  No matching reports.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-5 py-3 text-ink-900">{r.user.name}</td>
                  <td className="px-5 py-3">
                    <p className="text-ink-900">{r.clientName}</p>
                    <p className="text-xs text-ink-500">{r.courseOrPlan}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-ink-700">
                    {formatDate(r.reportDate, { year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-ink-700">{formatCurrency(r.dealValue)}</td>
                  <td className="px-5 py-3 text-success">{formatCurrency(totalCollected(r))}</td>
                  <td className="px-5 py-3 text-ink-700">
                    {outstanding(r) > 0 ? formatCurrency(outstanding(r)) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusSelect reportId={r.id} status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-ink-100 bg-ink-100/30 text-xs font-medium text-ink-900">
                <td className="px-5 py-2.5" colSpan={3}>
                  Totals (filtered)
                </td>
                <td className="px-5 py-2.5">{formatCurrency(totals.value)}</td>
                <td className="px-5 py-2.5 text-success">{formatCurrency(totals.collected)}</td>
                <td className="px-5 py-2.5">{formatCurrency(totals.due)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
