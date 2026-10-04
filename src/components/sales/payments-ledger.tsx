"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { clsx } from "clsx";
import { formatDate } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_STYLES, PAYMENT_TYPE_TAGS, formatCurrency } from "@/lib/sales";
import type { PaymentMethod, PaymentStatus, PaymentType } from "@prisma/client";

export type LedgerRow = {
  id: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  paidOn: Date;
  reference: string | null;
  clientName: string;
  courseOrPlan: string;
  employeeId: string;
  employeeName: string;
};

export function PaymentsLedger({ payments }: { payments: LedgerRow[] }) {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "ALL">("ALL");
  const [status, setStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [employee, setEmployee] = useState("ALL");

  const employees = useMemo(() => {
    const map = new Map<string, string>();
    payments.forEach((p) => map.set(p.employeeId, p.employeeName));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [payments]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter(
      (p) =>
        (method === "ALL" || p.method === method) &&
        (status === "ALL" || p.status === status) &&
        (employee === "ALL" || p.employeeId === employee) &&
        (!q ||
          p.clientName.toLowerCase().includes(q) ||
          (p.reference ?? "").toLowerCase().includes(q))
    );
  }, [payments, query, method, status, employee]);

  const total = rows.filter((r) => r.status === "APPROVED").reduce((s, p) => s + p.amount, 0);
  const select =
    "rounded-md border border-ink-100 bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:border-amber-500";

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink-900">Payments ledger</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {formatCurrency(total)} approved across {rows.length} payment(s) shown
          </p>
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
              placeholder="Search client or reference"
              className="w-44 rounded-md border border-ink-100 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus-visible:border-amber-500"
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
            onChange={(e) => setStatus(e.target.value as PaymentStatus | "ALL")}
            className={select}
          >
            <option value="ALL">All statuses</option>
            {(Object.keys(PAYMENT_STATUS_STYLES) as PaymentStatus[]).map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_STYLES[s].label}
              </option>
            ))}
          </select>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod | "ALL")}
            className={select}
          >
            <option value="ALL">All methods</option>
            {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
              <th className="px-5 py-2.5 font-medium">Date</th>
              <th className="px-5 py-2.5 font-medium">Employee</th>
              <th className="px-5 py-2.5 font-medium">Client</th>
              <th className="px-5 py-2.5 font-medium">Type</th>
              <th className="px-5 py-2.5 font-medium">Method</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-sm text-ink-500">
                  No payments match.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-ink-700">
                    {formatDate(p.paidOn, { year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-ink-900">{p.employeeName}</td>
                  <td className="px-5 py-3">
                    <p className="text-ink-900">{p.clientName}</p>
                    <p className="text-xs text-ink-500">{p.courseOrPlan}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{PAYMENT_TYPE_TAGS[p.type]}</td>
                  <td className="px-5 py-3 text-ink-700">{PAYMENT_METHOD_LABELS[p.method]}</td>
                  <td className="px-5 py-3">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
                        PAYMENT_STATUS_STYLES[p.status].badge
                      )}
                    >
                      {PAYMENT_STATUS_STYLES[p.status].label}
                    </span>
                  </td>
                  <td
                    className={clsx(
                      "px-5 py-3 text-right font-medium",
                      p.status === "REJECTED" ? "text-ink-300 line-through" : "text-success"
                    )}
                  >
                    {formatCurrency(p.amount)}
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
