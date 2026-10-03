import type { Salary } from "@prisma/client";
import { formatCurrency, monthLabel } from "@/lib/salary";
import { formatDate } from "@/lib/format";

export function MySalaryTable({ salaries }: { salaries: Salary[] }) {
  const sorted = [...salaries].sort((a, b) => b.year - a.year || b.month - a.month);

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-ink-900">Payout history</h2>
      </div>

      {sorted.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-500">No payouts recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
                <th className="px-5 py-2.5 font-medium">Month</th>
                <th className="px-5 py-2.5 font-medium">Base</th>
                <th className="px-5 py-2.5 font-medium">Commission / bonus</th>
                <th className="px-5 py-2.5 font-medium">Deductions</th>
                <th className="px-5 py-2.5 font-medium">Net pay</th>
                <th className="px-5 py-2.5 font-medium">Paid on</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} className="border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-100/30">
                  <td className="px-5 py-3 text-ink-900">{monthLabel(s.month - 1, s.year)}</td>
                  <td className="px-5 py-3 text-ink-700">{formatCurrency(s.basic)}</td>
                  <td className="px-5 py-3 text-ink-700">{formatCurrency(s.allowances + s.bonus)}</td>
                  <td className="px-5 py-3 text-ink-700">
                    {s.deductions > 0 ? formatCurrency(s.deductions) : "—"}
                  </td>
                  <td className="px-5 py-3 font-medium text-success">{formatCurrency(s.netPay)}</td>
                  <td className="px-5 py-3 text-ink-700">
                    {s.paidOn ? formatDate(s.paidOn, { year: "numeric" }) : "Pending"}
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
