import { Target, TrendingUp, Wallet, Clock } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { todayDateOnly } from "@/lib/attendance";
import {
  closedWonInMonth,
  collectedInMonth,
  formatCurrency,
  outstanding,
  type SalesReportWithPayments
} from "@/lib/sales";

export function SalesSummaryCards({
  reports,
  scope
}: {
  reports: SalesReportWithPayments[];
  scope: "team" | "you";
}) {
  const today = todayDateOnly();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();

  const pipeline = reports
    .filter((r) => r.status === "LEAD" || r.status === "IN_PROGRESS")
    .reduce((sum, r) => sum + r.dealValue, 0);
  const totalOutstanding = reports.reduce((sum, r) => sum + outstanding(r), 0);
  const who = scope === "team" ? "team" : "your";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Open pipeline" value={formatCurrency(pipeline)} sub="Leads + in progress" icon={Target} />
      <StatCard
        label="Closed won this month"
        value={formatCurrency(closedWonInMonth(reports, year, month))}
        sub={`Across ${who} deals`}
        icon={TrendingUp}
        tone="positive"
      />
      <StatCard
        label="Collected this month"
        value={formatCurrency(
          collectedInMonth(
            reports.flatMap((r) => r.payments),
            year,
            month
          )
        )}
        sub="Payments received"
        icon={Wallet}
        tone="positive"
      />
      <StatCard
        label="Outstanding balance"
        value={formatCurrency(totalOutstanding)}
        sub={totalOutstanding > 0 ? "On closed-won deals" : "Nothing pending"}
        icon={Clock}
        tone={totalOutstanding > 0 ? "warn" : "neutral"}
      />
    </div>
  );
}
