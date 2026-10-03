import { Wallet, TrendingUp, CalendarClock } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { formatCurrency } from "@/lib/salary";
import type { Salary } from "@prisma/client";

export function SalarySummaryCards({
  salaries,
  projected
}: {
  salaries: Salary[];
  projected: { base: number; commission: number; total: number };
}) {
  const lastPaid = [...salaries].sort((a, b) => b.year - a.year || b.month - a.month)[0];
  const receivedYtd = salaries
    .filter((s) => s.year === new Date().getUTCFullYear())
    .reduce((sum, s) => sum + s.netPay, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Last received"
        value={lastPaid ? formatCurrency(lastPaid.netPay) : "—"}
        sub={
          lastPaid
            ? new Date(Date.UTC(lastPaid.year, lastPaid.month - 1, 1)).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
                timeZone: "UTC"
              })
            : "No payouts yet"
        }
        icon={Wallet}
        tone="positive"
      />
      <StatCard
        label="Received this year"
        value={formatCurrency(receivedYtd)}
        sub="Across all payouts"
        icon={CalendarClock}
      />
      <StatCard
        label="Estimated next payout"
        value={formatCurrency(projected.total)}
        sub={
          projected.commission > 0
            ? `Base ${formatCurrency(projected.base)} + ${formatCurrency(projected.commission)} commission`
            : "Base salary only so far"
        }
        icon={TrendingUp}
        tone="positive"
      />
    </div>
  );
}
