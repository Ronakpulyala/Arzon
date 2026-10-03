"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { runPayroll } from "@/app/(dashboard)/salary/actions";
import { EditCompensationForm } from "@/components/salary/edit-compensation-form";
import { formatCurrency } from "@/lib/salary";
import type { SalesReport, User } from "@prisma/client";

type Row = Pick<User, "id" | "name" | "department" | "baseSalary" | "commissionRate"> & {
  reports: SalesReport[];
  lastPaidAmount: number | null;
  lastPaidLabel: string | null;
};

function commissionSoFar(reports: SalesReport[], rate: number): number {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const won = reports
    .filter((r) => r.status === "CLOSED_WON")
    .filter((r) => {
      const d = new Date(r.reportDate);
      return d >= start && d <= end;
    })
    .reduce((s, r) => s + r.dealValue, 0);
  return Math.round(won * rate);
}

export function PayrollTable({ employees }: { employees: Row[] }) {
  const [paying, setPaying] = useState<string | null>(null);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  async function pay(userId: string) {
    setPaying(userId);
    try {
      await runPayroll(userId);
      setPaidIds((prev) => new Set(prev).add(userId));
    } finally {
      setPaying(null);
    }
  }

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-ink-900">This month&apos;s payroll</h2>
        <p className="mt-0.5 text-xs text-ink-500">
          Commission is calculated from deals each employee has closed-won so far this month. Click a
          compensation value to edit it.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
              <th className="px-5 py-2.5 font-medium">Employee</th>
              <th className="px-5 py-2.5 font-medium">Compensation</th>
              <th className="px-5 py-2.5 font-medium">Commission so far</th>
              <th className="px-5 py-2.5 font-medium">Estimated payout</th>
              <th className="px-5 py-2.5 font-medium">Last paid</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const commission = commissionSoFar(emp.reports, emp.commissionRate);
              const estimate = emp.baseSalary + commission;
              const justPaid = paidIds.has(emp.id);

              return (
                <tr key={emp.id} className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink-900">{emp.name}</p>
                    <p className="text-xs text-ink-500">{emp.department ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3">
                    <EditCompensationForm
                      userId={emp.id}
                      baseSalary={emp.baseSalary}
                      commissionRate={emp.commissionRate}
                    />
                  </td>
                  <td className="px-5 py-3 text-ink-700">{formatCurrency(commission)}</td>
                  <td className="px-5 py-3 font-medium text-ink-900">{formatCurrency(estimate)}</td>
                  <td className="px-5 py-3 text-ink-700">
                    {emp.lastPaidAmount != null
                      ? `${formatCurrency(emp.lastPaidAmount)} · ${emp.lastPaidLabel}`
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => pay(emp.id)}
                      disabled={paying === emp.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-navy-900 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
                    >
                      <Banknote size={13} strokeWidth={2} />
                      {paying === emp.id ? "Paying..." : justPaid ? "Paid ✓ — re-run" : "Pay this month"}
                    </button>
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
