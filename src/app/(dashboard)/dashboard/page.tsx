import { Users, Clock, CalendarDays, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

// Placeholder figures — wired to Prisma queries once Attendance/Leave/Sales
// modules are built out.
const stats = [
  {
    label: "Present today",
    value: "42 / 48",
    sub: "6 on leave",
    icon: Clock,
    tone: "neutral" as const
  },
  {
    label: "Pending leave requests",
    value: "5",
    sub: "2 awaiting > 3 days",
    icon: CalendarDays,
    tone: "warn" as const
  },
  {
    label: "Sales closed this month",
    value: "₹18.4L",
    sub: "+12% vs last month",
    icon: TrendingUp,
    tone: "positive" as const
  },
  {
    label: "Active employees",
    value: "48",
    sub: "3 new this quarter",
    icon: Users,
    tone: "neutral" as const
  }
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Overview"
        description="Snapshot of attendance, leaves, payroll and sales across Arzon Global."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-ink-100 bg-surface-card p-5">
          <h2 className="font-display text-sm font-semibold text-ink-900">
            Recent sales activity
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Latest entries logged by the sales team.
          </p>
          <div className="mt-4 flex h-40 items-center justify-center rounded-md border border-dashed border-ink-100 text-sm text-ink-500">
            Sales reports module builds next — this panel will list live entries.
          </div>
        </div>

        <div className="rounded-lg border border-ink-100 bg-surface-card p-5">
          <h2 className="font-display text-sm font-semibold text-ink-900">
            Leave requests
          </h2>
          <p className="mt-1 text-xs text-ink-500">Needs your review.</p>
          <div className="mt-4 flex h-40 items-center justify-center rounded-md border border-dashed border-ink-100 text-sm text-ink-500">
            Leaves module builds next.
          </div>
        </div>
      </div>
    </div>
  );
}
