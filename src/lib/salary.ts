import type { Salary, SalesReport } from "@prisma/client";

export { formatCurrency } from "@/lib/format";

/** Commission earned on CLOSED_WON deals whose reportDate falls in [start, end]. */
export function commissionEarned(
  reports: SalesReport[],
  commissionRate: number,
  start: Date,
  end: Date
): number {
  const wonValue = reports
    .filter((r) => r.status === "CLOSED_WON")
    .filter((r) => {
      const d = new Date(r.reportDate);
      return d >= start && d <= end;
    })
    .reduce((sum, r) => sum + r.dealValue, 0);
  return Math.round(wonValue * commissionRate);
}

/**
 * Projected payout for next month's payroll run: base salary plus commission
 * on deals closed so far in the current month. This is an estimate shown to
 * the employee — it's only realized once Admin/HR actually runs payroll.
 */
export function projectedNextPayout(input: {
  baseSalary: number;
  commissionRate: number;
  reportsThisMonth: SalesReport[];
  monthStart: Date;
  monthEnd: Date;
}): { base: number; commission: number; total: number } {
  const commission = commissionEarned(
    input.reportsThisMonth,
    input.commissionRate,
    input.monthStart,
    input.monthEnd
  );
  return { base: input.baseSalary, commission, total: input.baseSalary + commission };
}

export function netPay(basic: number, allowances: number, bonus: number, deductions: number): number {
  return Math.max(basic + allowances + bonus - deductions, 0);
}

export function monthLabel(month: number, year: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}

export type SalaryWithUser = Salary & { user: { name: string; department: string | null } };
